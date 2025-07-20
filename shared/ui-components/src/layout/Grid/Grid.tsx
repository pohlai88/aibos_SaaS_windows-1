/**
 * Enterprise Grid Component
 * ISO27001, GDPR, SOC2, HIPAA compliant grid with responsive design
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import type { DataClassification } from '../../types';

// ============================================================================
// GRID VARIANTS
// ============================================================================

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
  2: 'grid-cols-2',
        3: 'grid-cols-3',
  4: 'grid-cols-4',
        5: 'grid-cols-5',
  6: 'grid-cols-6',
        12: 'grid-cols-12',
      },
      gap: {
        none: 'gap-0',
  sm: 'gap-2',
        md: 'gap-4',
  lg: 'gap-6',
        xl: 'gap-8',
      },
      responsive: {
        true: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
      },
    },
    defaultVariants: {
      cols: 1,
  gap: 'md',
    },
  }
);

// ============================================================================
// GRID PROPS
// ============================================================================

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  children: React.ReactNode;
  dataClassification?: DataClassification;
  auditId?: string;
  autoFit?: boolean;
  autoFill?: boolean;
  minWidth?: string;
  maxWidth?: string
}

// ============================================================================
// GRID COMPONENT
// ============================================================================

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols,
      gap,
      responsive,
      children,
      dataClassification = 'public',
      auditId,
      autoFit = false,
      autoFill = false,
      minWidth = '200px',
      maxWidth = '1fr',
      ...props
    },
    ref
  ) => {
    // Audit logging
    React.useEffect(() => {
      if (dataClassification === 'sensitive' && auditId) {
        console.log(`[AUDIT] Grid rendered: ${auditId} - ${dataClassification}`)
}
    }, [dataClassification, auditId]);

    // Auto-fit/fill styles
    const autoStyles = autoFit || autoFill ? {
      gridTemplateColumns: `${autoFit ? 'repeat(auto-fit' : 'repeat(auto-fill'}, minmax(${minWidth}, ${maxWidth}))`,
    } : {};

    return (
      <div
        className={cn(
          gridVariants({ cols, gap, responsive }),
          className
        )}
        ref={ref}
        data-classification={dataClassification}
        data-audit-id={auditId}
        style={autoStyles}
        {...props}
      >
        {children}
      </div>
    )
}
);

Grid.displayName = 'Grid';

// ============================================================================
// GRID ITEM COMPONENT
// ============================================================================

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  span?: number;
  start?: number;
  end?: number;
  dataClassification?: DataClassification;
  auditId?: string
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span,
  start,
  end,
  className,
  dataClassification = 'public',
  auditId,
  ...props
}) => {
  const spanClasses = span ? `col-span-${span}` : '';
  const startClasses = start ? `col-start-${start}` : '';
  const endClasses = end ? `col-end-${end}` : '';

  return (
    <div
      className={cn(spanClasses, startClasses, endClasses, className)}
      data-classification={dataClassification}
      data-audit-id={auditId}
      {...props}
    >
      {children}
    </div>
  )
};

// ============================================================================
// RESPONSIVE GRID COMPONENT
// ============================================================================

export interface ResponsiveGridProps extends Omit<GridProps, 'cols' | 'responsive'> {
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number
}
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  breakpoints = { sm: 2,
  md: 3, lg: 4,
  xl: 6 },
  className,
  ...props
}) => {
  const responsiveClasses = Object.entries(breakpoints)
    .map(([breakpoint, cols]) => `${breakpoint}:grid-cols-${cols}`)
    .join(' ');

  return (
    <Grid
      className={cn('grid-cols-1', responsiveClasses, className)}
      {...props}
    />
  )
};

// ============================================================================
// VIRTUALIZED GRID COMPONENT
// ============================================================================

export interface VirtualizedGridProps<T> extends Omit<GridProps, 'children'> {
  items: T[];
  renderItem: (item: T,
  index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight = 200,
  containerHeight = 600,
  overscan = 5,
  ...props
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
};

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight,
  overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight,
  position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          <Grid {...props}>
            {visibleItems.map((item, index) => (
              <GridItem key={startIndex + index}>
                {renderItem(item, startIndex + index)}
              </GridItem>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  )
}

export { gridVariants };
export default Grid;
