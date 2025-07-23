import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { auditLog } from '../../utils/auditLogger';

// GPU Grid types
export interface GPUGridConfig {
  maxRows: number;
  maxColumns: number;
  rowHeight: number;
  columnWidth: number;
  fps: number;
  virtualization: boolean;
  enableWebGL: boolean;
  enableAuditLogging: boolean;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted'
}

export interface GPUGridData {
  id: string;
  [key: string]: any
}

export interface GPUGridColumn {
  key: string;
  title: string;
  width: number;
  sortable: boolean;
  filterable: boolean;
  type: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  renderer?: (value: any,
  row: GPUGridData) => React.ReactNode
}

// WebGL shader for GPU rendering
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;

  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_texCoord = a_texCoord
}
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform float u_opacity;
  varying vec2 v_texCoord;

  void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    gl_FragColor = vec4(color.rgb, color.a * u_opacity)
}
`;

// GPU-accelerated data grid component
export const GPUAcceleratedGrid: React.FC<{
  data: GPUGridData[];
  columns: GPUGridColumn[];
  config?: Partial<GPUGridConfig>;
  onRowClick?: (row: GPUGridData) => void;
  onSort?: (column: string,
  direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void
}> = ({
  data,
  columns,
  config = {},
  onRowClick,
  onSort,
  onFilter
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);

  const [isWebGLSupported, setIsWebGLSupported] = useState(false);
  const [renderStats, setRenderStats] = useState({
    fps: 0,
  renderedRows: 0,
    totalRows: 0,
  renderTime: 0
  });
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [visibleRange, setVisibleRange] = useState({ start: 0,
  end: 100 });

  // Default configuration
  const defaultConfig: GPUGridConfig = {
    maxRows: 1_000_000,
  maxColumns: 100,
    rowHeight: 40,
  columnWidth: 150,
    fps: 60,
  virtualization: true,
    enableWebGL: true,
  enableAuditLogging: true,
    dataClassification: 'internal'
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Initialize WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, falling back to canvas rendering');
      return false
}

    glRef.current = gl;

    // Create shader program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      console.error('Failed to create shaders');
      return false
}

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      console.error('Failed to create program');
      return false
}

    programRef.current = program;

    // Set up viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return true
}, []);

  // Create shader helper
  const createShader = (gl: WebGLRenderingContext,
  type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null
}

    return shader
};

  // Create program helper
  const createProgram = (gl: WebGLRenderingContext,
  vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null
}

    return program
};

  // Render data using WebGL
  const renderWithWebGL = useCallback((data: GPUGridData[], columns: GPUGridColumn[]) => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !canvas) return;

    const startTime = performance.now();

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use shader program
    gl.useProgram(program);

    // Set up uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Create texture from data
    const textureData = createTextureData(data, columns);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Draw grid
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      1, 1,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Update render stats
    setRenderStats({
      fps: Math.round(1000 / renderTime),
      renderedRows: data.length,
      totalRows: data.length,
      renderTime
    });

    // Audit logging
    if (finalConfig.enableAuditLogging) {
      auditLog('gpu_grid_rendered', {
        renderedRows: data.length,
        totalColumns: columns.length,
        renderTime,
        fps: Math.round(1000 / renderTime),
        dataClassification: finalConfig.dataClassification,
        timestamp: new Date().toISOString()
      })
}
  }, [finalConfig.enableAuditLogging, finalConfig.dataClassification]);

  // Create texture data from grid data
  const createTextureData = (data: GPUGridData[], columns: GPUGridColumn[]) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = columns.length * finalConfig.columnWidth;
    canvas.height = data.length * finalConfig.rowHeight;

    // Draw grid data
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#000000';

    data.forEach((row, rowIndex) => {
      columns.forEach((column, colIndex) => {
        const x = colIndex * finalConfig.columnWidth;
        const y = rowIndex * finalConfig.rowHeight;
        const value = row[column.key];

        // Draw cell background
        ctx.fillStyle = rowIndex % 2 === 0 ? '#f8f9fa' : '#ffffff';
        ctx.fillRect(x, y, finalConfig.columnWidth, finalConfig.rowHeight);

        // Draw cell border
        ctx.strokeStyle = '#dee2e6';
        ctx.strokeRect(x, y, finalConfig.columnWidth, finalConfig.rowHeight);

        // Draw cell content
        ctx.fillStyle = '#000000';
        ctx.fillText(String(value || ''), x + 5, y + 20)
})
});

    return canvas
};

  // Fallback canvas rendering
  const renderWithCanvas = useCallback((data: GPUGridData[], columns: GPUGridColumn[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate visible range for virtualization
    const visibleData = finalConfig.virtualization
      ? data.slice(visibleRange.start, visibleRange.end)
      : data;

    // Draw grid
    ctx.font = '14px Arial';
    ctx.textBaseline = 'middle';

    visibleData.forEach((row, rowIndex) => {
      const actualRowIndex = finalConfig.virtualization ? visibleRange.start + rowIndex : rowIndex;

      columns.forEach((column, colIndex) => {
        const x = colIndex * finalConfig.columnWidth;
        const y = rowIndex * finalConfig.rowHeight;
        const value = row[column.key];

        // Draw cell background
        ctx.fillStyle = actualRowIndex % 2 === 0 ? '#f8f9fa' : '#ffffff';
        ctx.fillRect(x, y, finalConfig.columnWidth, finalConfig.rowHeight);

        // Draw cell border
        ctx.strokeStyle = '#dee2e6';
        ctx.strokeRect(x, y, finalConfig.columnWidth, finalConfig.rowHeight);

        // Draw cell content
        if (column.renderer) {
          // Custom renderer
          const tempDiv = document.createElement('div');
          ReactDOM.render(column.renderer(value, row), tempDiv);
          // Note: This is simplified - in production you'd need proper React rendering
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillText(String(value || ''), x + 5, y + finalConfig.rowHeight / 2)
}
      })
});

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Update render stats
    setRenderStats({
      fps: Math.round(1000 / renderTime),
      renderedRows: visibleData.length,
      totalRows: data.length,
      renderTime
    });

    // Audit logging
    if (finalConfig.enableAuditLogging) {
      auditLog('canvas_grid_rendered', {
        renderedRows: visibleData.length,
        totalRows: data.length,
        totalColumns: columns.length,
        renderTime,
        fps: Math.round(1000 / renderTime),
        virtualization: finalConfig.virtualization,
        dataClassification: finalConfig.dataClassification,
        timestamp: new Date().toISOString()
      })
}
  }, [finalConfig.virtualization, finalConfig.enableAuditLogging, finalConfig.dataClassification, visibleRange]);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);

    if (onSort) {
      onSort(columnKey, newDirection)
}

    if (finalConfig.enableAuditLogging) {
      auditLog('grid_sort_changed', {
        column: columnKey,
  direction: newDirection,
        timestamp: new Date().toISOString()
      })
}
  }, [sortColumn, sortDirection, onSort, finalConfig.enableAuditLogging]);

  // Handle filtering
  const handleFilter = useCallback((columnKey: string,
  value: any) => {
    const newFilters = { ...filters, [columnKey]: value };
    setFilters(newFilters);

    if (onFilter) {
      onFilter(newFilters)
}

    if (finalConfig.enableAuditLogging) {
      auditLog('grid_filter_changed', {
        column: columnKey,
        value,
        timestamp: new Date().toISOString()
      })
}
  }, [filters, onFilter, finalConfig.enableAuditLogging]);

  // Handle row click
  const handleRowClick = useCallback((row: GPUGridData) => {
    if (onRowClick) {
      onRowClick(row)
}

    if (finalConfig.enableAuditLogging) {
      auditLog('grid_row_clicked', {
        rowId: row.id,
        timestamp: new Date().toISOString()
      })
}
  }, [onRowClick, finalConfig.enableAuditLogging]);

  // Initialize WebGL on mount
  useEffect(() => {
    if (finalConfig.enableWebGL) {
      setIsWebGLSupported(initWebGL())
}
  }, [finalConfig.enableWebGL, initWebGL]);

  // Render grid
  useEffect(() => {
    if (isWebGLSupported && finalConfig.enableWebGL) {
      renderWithWebGL(data, columns)
} else {
      renderWithCanvas(data, columns)
}
  }, [data, columns, isWebGLSupported, finalConfig.enableWebGL, renderWithWebGL, renderWithCanvas]);

  // Calculate canvas size
  const canvasWidth = columns.length * finalConfig.columnWidth;
  const canvasHeight = finalConfig.virtualization
    ? Math.min(100, data.length) * finalConfig.rowHeight
    : data.length * finalConfig.rowHeight;

  return (
    <div className="gpu-accelerated-grid">
      {/* Header */}
      <div className="grid-header">
        <div className="grid-stats">
          <span>FPS: {renderStats.fps}</span>
          <span>Rows: {renderStats.renderedRows}/{renderStats.totalRows}</span>
          <span>Render: {renderStats.renderTime.toFixed(2)}ms</span>
          <span>Mode: {isWebGLSupported ? 'WebGL' : 'Canvas'}</span>
        </div>

        {/* Column headers */}
        <div className="column-headers">
          {columns.map((column, index) => (
            <div
              key={column.key}
              className="column-header"
              style={{ width: finalConfig.columnWidth }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <span>{column.title}</span>
              {column.sortable && sortColumn === column.key && (
                <span className="sort-indicator">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid canvas */}
      <div className="grid-container">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="grid-canvas"
          onClick={(e) => {
            if (onRowClick) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const colIndex = Math.floor(x / finalConfig.columnWidth);
              const rowIndex = Math.floor(y / finalConfig.rowHeight);
              const actualRowIndex = finalConfig.virtualization ? visibleRange.start + rowIndex : rowIndex;

              if (data[actualRowIndex]) {
                handleRowClick(data[actualRowIndex])
}
            }
          }}
        />
      </div>

      {/* Filters */}
      {columns.some(col => col.filterable) && (
        <div className="grid-filters">
          {columns.map(column =>
            column.filterable ? (
              <div key={column.key} className="filter-input">
                <input
                  type="text"
                  placeholder={`Filter ${column.title}...`}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilter(column.key, e.target.value)}
                />
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
};

// HOC to add GPU acceleration to any data grid
export const withGPUAcceleration = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    enableWebGL?: boolean;
    maxRows?: number;
    virtualization?: boolean
}
) => {
  const GPUAcceleratedComponent: React.FC<P> = (props) => {
    return (
      <GPUAcceleratedGrid
        {...props as any}
        config={{
          enableWebGL: options.enableWebGL ?? true,
          maxRows: options.maxRows ?? 1_000_000,
          virtualization: options.virtualization ?? true
        }}
      />
    )
};

  GPUAcceleratedComponent.displayName = `withGPUAcceleration(${Component.displayName || Component.name})`;
  return GPUAcceleratedComponent
};
