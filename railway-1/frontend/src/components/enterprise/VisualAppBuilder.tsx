'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface AppComponent {
  id: string;
  type: 'button' | 'input' | 'card' | 'grid' | 'chart' | 'form' | 'table';
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, any>;
  children?: AppComponent[];
}

interface AppManifest {
  name: string;
  version: string;
  description: string;
  components: AppComponent[];
  events: string[];
  entities: string[];
  permissions: string[];
}

interface VisualAppBuilderProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableRealtime?: boolean;
}

// Simple SelfHealingProvider component
const SelfHealingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const VisualAppBuilder: React.FC<VisualAppBuilderProps> = ({
  tenantId,
  userId,
  enableAI = true,
  enableRealtime = true
}) => {
  const [components, setComponents] = useState<AppComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<AppComponent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appManifest, setAppManifest] = useState<AppManifest | null>(null);

  // Initialize
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Component palette
  const componentPalette = [
    { type: 'button', label: 'Button', icon: '🔘', defaultProps: { text: 'Click Me', variant: 'primary' } },
    { type: 'input', label: 'Input Field', icon: '📝', defaultProps: { placeholder: 'Enter text...', type: 'text' } },
    { type: 'card', label: 'Card', icon: '🃏', defaultProps: { title: 'Card Title', content: 'Card content...' } },
    { type: 'grid', label: 'Data Grid', icon: '📊', defaultProps: { columns: 3, rows: 5 } },
    { type: 'chart', label: 'Chart', icon: '📈', defaultProps: { type: 'line', data: [] } },
    { type: 'form', label: 'Form', icon: '📋', defaultProps: { fields: [] } },
    { type: 'table', label: 'Table', icon: '📋', defaultProps: { columns: [], data: [] } }
  ];

  // Add component to canvas
  const addComponent = useCallback((componentType: string) => {
    const paletteItem = componentPalette.find(item => item.type === componentType);
    if (!paletteItem) return;

    const newComponent: AppComponent = {
      id: `component-${Date.now()}`,
      type: componentType as any,
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      props: { ...paletteItem.defaultProps }
    };

    setComponents(prev => [...prev, newComponent]);
  }, [componentPalette]);

  // Update component
  const updateComponent = useCallback((id: string, updates: Partial<AppComponent>) => {
    setComponents(prev => prev.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  }, []);

  // Delete component
  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
  }, []);

  // Generate app manifest
  const generateManifest = useCallback(async () => {
    const manifest: AppManifest = {
      name: 'Visual App',
      version: '1.0.0',
      description: 'App created with Visual App Builder',
      components: components,
      events: [],
      entities: [],
      permissions: []
    };

    setAppManifest(manifest);
    return manifest;
  }, [components]);

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData('componentType', componentType);
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const componentType = e.dataTransfer.getData('componentType');
    if (componentType) {
      addComponent(componentType);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Visual App Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <SelfHealingProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Component Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Components</h2>
          <div className="space-y-2">
            {componentPalette.map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
                className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl mr-3">{item.icon}</span>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>

          {/* AI Assistant */}
          {enableAI && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">AI Assistant</h3>
              <p className="text-xs text-blue-700 mb-3">
                Ask me to help you build your app!
              </p>
              <button
                onClick={() => addComponent('button')}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Add Sample Component
              </button>
            </div>
          )}

          {/* App Actions */}
          <div className="mt-6 space-y-2">
            <button
              onClick={generateManifest}
              className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
            >
              Generate Manifest
            </button>
            <button
              onClick={() => setComponents([])}
              className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Visual App Builder</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {components.length} components
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                  Preview App
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                  Deploy App
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div
            className="flex-1 p-4 overflow-auto"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 min-h-full relative">
              {components.map((component) => (
                <div
                  key={component.id}
                  className={`absolute border-2 cursor-move ${
                    selectedComponent?.id === component.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  style={{
                    left: component.position.x,
                    top: component.position.y,
                    width: component.size.width,
                    height: component.size.height
                  }}
                  onClick={() => setSelectedComponent(component)}
                >
                  <div className="p-2 text-xs text-gray-600">
                    {component.type}: {component.props.text || component.props.placeholder || component.type}
                  </div>

                  {/* Component Controls */}
                  {selectedComponent?.id === component.id && (
                    <div className="absolute -top-8 left-0 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComponent(component.id);
                          setSelectedComponent(null);
                        }}
                        className="text-red-400 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {components.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <p className="text-lg font-medium">Drag components here to build your app</p>
                    <p className="text-sm">Start with a button or input field</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedComponent && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Type
                </label>
                <input
                  type="text"
                  value={selectedComponent.type}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position X
                </label>
                <input
                  type="number"
                  value={selectedComponent.position.x}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    position: { ...selectedComponent.position, x: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position Y
                </label>
                <input
                  type="number"
                  value={selectedComponent.position.y}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    position: { ...selectedComponent.position, y: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={selectedComponent.size.width}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    size: { ...selectedComponent.size, width: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={selectedComponent.size.height}
                  onChange={(e) => updateComponent(selectedComponent.id, {
                    size: { ...selectedComponent.size, height: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              {/* Dynamic Properties */}
              {Object.entries(selectedComponent.props).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => updateComponent(selectedComponent.id, {
                      props: { ...selectedComponent.props, [key]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insight Panel */}
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Debug Info</h4>
          <div className="text-xs text-gray-600">
            <p>Components: {components.length}</p>
            <p>Selected: {selectedComponent?.id || 'None'}</p>
            <p>AI Enabled: {enableAI ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </SelfHealingProvider>
  );
};

export default VisualAppBuilder;
