/**
 * Enterprise Sidebar Component
 * ISO27001, GDPR, SOC2, HIPAA compliant sidebar with navigation
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../../primitives/Button/Button';
import type { DataClassification } from '../../types';

// ============================================================================
// SIDEBAR VARIANTS
// ============================================================================

const sidebarVariants = cva(
  'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
  {
    variants: {
      size: {
        sm: 'w-48',
  md: 'w-64',
        lg: 'w-80',
      },
      collapsed: {
        true: 'w-16',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// ============================================================================
// SIDEBAR PROPS
// ============================================================================

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  children: React.ReactNode;
  dataClassification?: DataClassification;
  auditId?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void
}

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      size,
      collapsed,
      children,
      dataClassification = 'public',
      auditId,
      collapsible = false,
      defaultCollapsed = false,
      onCollapseChange,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const currentCollapsed = collapsed ?? isCollapsed;

    const handleToggleCollapse = () => {
      const newCollapsed = !currentCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapseChange?.(newCollapsed)
};

    // Audit logging
    React.useEffect(() => {
      if (dataClassification === 'sensitive' && auditId) {
        console.log(`[AUDIT] Sidebar rendered: ${auditId} - ${dataClassification}`)
}
    }, [dataClassification, auditId]);

    return (
      <div
        className={cn(
          sidebarVariants({ size, collapsed: currentCollapsed }),
          className
        )}
        ref={ref}
        data-classification={dataClassification}
        data-audit-id={auditId}
        data-collapsed={currentCollapsed}
        {...props}
      >
        {collapsible && (
          <div className="flex justify-end p-2 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              aria-label={currentCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {currentCollapsed ? '→' : '←'}
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    )
}
);

Sidebar.displayName = 'Sidebar';

// ============================================================================
// SIDEBAR ITEM PROPS
// ============================================================================

export interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  dataClassification?: DataClassification;
  auditId?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode
}

// ============================================================================
// SIDEBAR ITEM COMPONENT
// ============================================================================

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  active = false,
  disabled = false,
  onClick,
  className,
  dataClassification = 'public',
  auditId,
  badge,
  children,
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
}
  };

  const content = (
    <div
      className={cn(
        'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
      data-classification={dataClassification}
      data-audit-id={auditId}
      data-active={active}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {icon && (
        <span className="mr-3 flex-shrink-0">
          {icon}
        </span>
      )}

      <span className="flex-1 truncate">
        {label}
      </span>

      {badge && (
        <span className="ml-2">
          {badge}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
}

  return content
};

// ============================================================================
// SIDEBAR SECTION PROPS
// ============================================================================

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  dataClassification?: DataClassification;
  auditId?: string
}

// ============================================================================
// SIDEBAR SECTION COMPONENT
// ============================================================================

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  className,
  dataClassification = 'public',
  auditId,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
};

  return (
    <div
      className={cn('border-b border-gray-200 last:border-b-0', className)}
      data-classification={dataClassification}
      data-audit-id={auditId}
      {...props}
    >
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2',
          collapsible && 'cursor-pointer hover:bg-gray-50'
        )}
        onClick={collapsible ? handleToggle : undefined}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>

        {collapsible && (
          <span className="text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="pb-2">
          {children}
        </div>
      )}
    </div>
  )
};

// ============================================================================
// SIDEBAR HEADER COMPONENT
// ============================================================================

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  dataClassification?: DataClassification;
  auditId?: string
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  title,
  subtitle,
  logo,
  className,
  dataClassification = 'public',
  auditId,
  ...props
}) => {
  return (
    <div
      className={cn('px-4 py-6 border-b border-gray-200', className)}
      data-classification={dataClassification}
      data-audit-id={auditId}
      {...props}
    >
      <div className="flex items-center">
        {logo && (
          <div className="mr-3">
            {logo}
          </div>
        )}

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
};

// ============================================================================
// SIDEBAR FOOTER COMPONENT
// ============================================================================

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  dataClassification?: DataClassification;
  auditId?: string
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className,
  dataClassification = 'public',
  auditId,
  ...props
}) => {
  return (
    <div
      className={cn('p-4 border-t border-gray-200', className)}
      data-classification={dataClassification}
      data-audit-id={auditId}
      {...props}
    >
      {children}
    </div>
  )
};

export { sidebarVariants };
export default Sidebar;
