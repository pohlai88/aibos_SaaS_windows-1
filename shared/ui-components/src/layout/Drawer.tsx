import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, ChevronLeft, ChevronRight, Phone, Monitor, Tablet } from 'lucide-react';
import type { ReactNode } from 'react';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';
import {
 ChevronLeft,
 ChevronRight,
 PanelLeft,
 PanelRight,
 Settings,
 Phone,
 Monitor,
 Tablet,
 X
} from 'lucide-react';
import { createPortal } from 'react-dom';
const drawerVariants = cva(;
 'fixed top-0 left-0 h-full bg-background border-r border-border shadow-lg transition-all duration-300 ease-in-out z-40',
 {
 variants: {
 variant: {
 default: 'bg-background',
 elevated: 'bg-background shadow-2xl',
 glass: 'bg-background/80 backdrop-blur-md border-r/50',
 dark: 'bg-gray-900 text-white border-gray-700'
 },
 size: {
 sm: 'w-64',
 md: 'w-80',
 lg: 'w-96',
 xl: 'w-[28rem]',
 full: 'w-full'
 },
 position: {
 left: 'left-0',
 right: 'right-0 left-auto'
 },
 behavior: {
 overlay: 'transform -translate-x-full data-[state=open]:translate-x-0',
 push: 'transform -translate-x-full data-[state=open]:translate-x-0',
 slide: 'transform -translate-x-full data-[state=open]:translate-x-0'
 }
 },
 defaultVariants: {
 variant: 'default',
 size: 'md',
 position: 'left',
 behavior: 'overlay'
 }
 },
);
const _overlayVariants = cva(;
 'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-30',
 {
 variants: {
 visible: {
 true: 'opacity-100',
 false: 'opacity-0 pointer-events-none'
 }
 },
 defaultVariants: {
 visible: false
 }
 },
);
export interface DrawerProps extends VariantProps<typeof drawerVariants> {
 isOpen: boolean;
 onClose: () => void;
 children: ReactNode;
 title?: string;
 subtitle?: string;
 header?: ReactNode;
 footer?: ReactNode;
 className?: string;
 contentClassName?: string;
 headerClassName?: string;
 footerClassName?: string;
 showOverlay?: boolean;
 closeOnOverlayClick?: boolean;
 closeOnEscape?: boolean;
 preventScroll?: boolean;
 resizable?: boolean;
 minWidth?: number;
 maxWidth?: number;
 defaultWidth?: number;
 collapsible?: boolean;
 collapsedWidth?: number;
 onResize?: (width: number) => void;
 onCollapse?: (collapsed: boolean) => void;
 responsive?: boolean;
 breakpoints?: {
 sm?: number;
 md?: number;
 lg?: number;
 xl?: number;
 };
 aiFeatures?: {
 autoCollapse?: boolean;
 contextAware?: boolean;
 smartResize?: boolean;
 usageOptimization?: boolean;
 };
}
export const Drawer: React.FC<DrawerProps> = ({
 isOpen,
 onClose,
 children,
 title,
 subtitle,
 header,
 footer,
 className,
 contentClassName,
 headerClassName,
 footerClassName,
 showOverlay = true,
 closeOnOverlayClick = true,
 closeOnEscape = true,
 preventScroll = true,
 resizable = false,
 minWidth = 240,
 maxWidth = 600,
 defaultWidth = 320,
 collapsible = false,
 collapsedWidth = 64,
 onResize,
 onCollapse,
 responsive = true,
 breakpoints = { sm: 240, md: 320, lg: 400, xl: 480 },
 aiFeatures = {},
 variant = 'default',
 size = 'md',
 position = 'left',
 behavior = 'overlay'
}) => {
 const [isResizing, setIsResizing] = useState<boolean>(false);
 const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
 const [currentWidth, setCurrentWidth] = useState(defaultWidth);
 const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
 const drawerRef = useRef<HTMLDivElement>(null);
 const _resizeHandleRef = useRef<HTMLDivElement>(null);
 const startXRef = useRef<number>(0);
 const startWidthRef = useRef<number>(0);
 // AI-powered responsive behavior
 useEffect(() => {
 const updateScreenSize = () => {;
 const width = (window as any).innerWidth;
 if (width < 640) setScreenSize('sm');
 else if (width < 768) setScreenSize('md');
 else if (width < 1024) setScreenSize('lg');
 else setScreenSize('xl');
 };
 updateScreenSize();
 (window as any).addEventListener('resize', updateScreenSize);
 return () => (window as any).removeEventListener('resize', updateScreenSize);
 }, []);
 // AI-powered auto-collapse for mobile
 useEffect(() => {
 if (aiFeatures.autoCollapse && screenSize === 'sm' && !isCollapsed) {
 setIsCollapsed(true);
 onCollapse?.(true);
 }
 }, [screenSize, aiFeatures.autoCollapse, isCollapsed, onCollapse]);
 // AI-powered smart resize based on content
 useEffect(() => {
 if (aiFeatures.smartResize && drawerRef.current) {
 const content = drawerRef.current.querySelector('[data-drawer-content]');
 if (content) {
 const _contentWidth = content.scrollWidth;
 const optimalWidth = Math.min(Math.max(contentWidth + 40, minWidth), maxWidth);
 setCurrentWidth(optimalWidth);
 onResize?.(optimalWidth);
 }
 }
 }, [children, aiFeatures.smartResize, minWidth, maxWidth, onResize]);
 // Prevent body scroll
 useEffect(() => {
 if (isOpen && preventScroll) {
 (document as any).body.style.overflow = 'hidden';
 return () => {;
 (document as any).body.style.overflow = '';
 };
 }
 }, [isOpen, preventScroll]);
 // Keyboard handling
 useEffect(() => {
 const handleEscape = (event: KeyboardEvent) => {;
 if (event.key === 'Escape' && closeOnEscape) {
 onClose();
 }
 };
 if (isOpen) {
 (document as any).addEventListener('keydown', handleEscape);
 return () => (document as any).removeEventListener('keydown', handleEscape);
 }
 }, [isOpen, closeOnEscape, onClose]);
 // Resize handling
 const _handleResizeStart = useCallback(;
 (event: React.MouseEvent) => {
 if (!resizable) return;
 setIsResizing(true);
 startXRef.current = event.clientX;
 startWidthRef.current = currentWidth;
 (document as any).addEventListener('mousemove', handleResizeMove);
 (document as any).addEventListener('mouseup', handleResizeEnd);
 },
 [resizable, currentWidth],
 );
 const handleResizeMove = useCallback(;
 (event: MouseEvent) => {
 if (!isResizing) return;
 const deltaX = event.clientX - startXRef.current;
 const newWidth =;
 position === 'left' ? startWidthRef.current + deltaX : startWidthRef.current - deltaX;
 const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
 setCurrentWidth(clampedWidth);
 onResize?.(clampedWidth);
 },
 [isResizing, position, minWidth, maxWidth, onResize],
 );
 const handleResizeEnd = useCallback(() => {;
 setIsResizing(false);
 (document as any).removeEventListener('mousemove', handleResizeMove);
 (document as any).removeEventListener('mouseup', handleResizeEnd);
 }, [handleResizeMove]);
 const _handleCollapse = useCallback(() => {;
 const newCollapsed = !isCollapsed;
 setIsCollapsed(newCollapsed);
 onCollapse?.(newCollapsed);
 }, [isCollapsed, onCollapse]);
 const _handleOverlayClick = useCallback(;
 (event: React.MouseEvent) => {
 if (event.target === event.currentTarget && closeOnOverlayClick) {
 onClose();
 }
 },
 [closeOnOverlayClick, onClose],
 );
 const _effectiveWidth = isCollapsed ? collapsedWidth : currentWidth;
 const _responsiveWidth = responsive ? breakpoints[screenSize] || currentWidth : currentWidth;
 const _drawerContent = (;
 <>
 {/* Overlay */}
 {showOverlay && (
 <div
 className={cn(overlayVariants({ visible: isOpen }))}
 onClick={handleOverlayClick}
 aria-hidden="true"
 />
 )}
 {/* Drawer */}
 <div
 ref={drawerRef}
 className={cn(drawerVariants({ variant, size, position, behavior }), className)}
 style={{
 width: responsive ? responsiveWidth : effectiveWidth,
 transform: isOpen
 ? 'translateX(0)'
 : position === 'left'
 ? 'translateX(-100%)'
 : 'translateX(100%)'
 }}
 data-state={isOpen ? 'open' : 'closed'}
 role="dialog"
 aria-modal="true"
 aria-labelledby={title ? 'drawer-title' : undefined}
 >
 {/* Header */}
 {(title || header || collapsible) && (
 <div
 className={cn(
 'flex items-center justify-between p-4 border-b border-border',
 headerClassName,
 )}
 >
 <div className="flex items-center gap-3 min-w-0 flex-1">
 {header ? (
 header
 ) : (
 <>
 {title && (
 <div className="min-w-0 flex-1">
 <h2 id="drawer-title" className="text-lg font-semibold truncate">
 {title}
 </h2>
 {subtitle && (
 <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
 )}
 </div>
 )}
 </>
 )}
 </div>
 <div className="flex items-center gap-2">
 {collapsible && (
 <Button
 variant="ghost"
 size="icon-sm"
 onClick={handleCollapse}
 aria-label={isCollapsed ? 'Expand drawer' : 'Collapse drawer'}
 >
 {isCollapsed ? (
 <PanelRight className="h-4 w-4" />
 ) : (
 <PanelLeft className="h-4 w-4" />
 )}
 </Button>
 )}
 <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close drawer">
 <X className="h-4 w-4" />
 </Button>
 </div>
 </div>
 )}
 {/* Content */}
 <div className={cn('flex-1 overflow-y-auto', contentClassName)} data-drawer-content>
 {children}
 </div>
 {/* Footer */}
 {footer && (
 <div className={cn('p-4 border-t border-border', footerClassName)}>{footer}</div>
 )}
 {/* Resize Handle */}
 {resizable && !isCollapsed && (
 <div
 ref={resizeHandleRef}
 className={cn(
 'absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors',
 position === 'left' ? '-right-0.5' : '-left-0.5',
 )}
 onMouseDown={handleResizeStart}
 aria-label="Resize drawer"
 />
 )}
 {/* AI Features Indicator */}
 {aiFeatures.contextAware && (
 <div className="absolute bottom-4 right-4">
 <div className="flex items-center gap-1 text-xs text-muted-foreground">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 AI Active
 </div>
 </div>
 )}
 </div>
 </>
 );
 return typeof window !== 'undefined' ? createPortal(drawerContent, (document as any).body) : null;
};
// AI-Powered Drawer Hook
export const _useAIDrawer = (
 options: {
 autoCollapse?: boolean;
 contextAware?: boolean;
 smartResize?: boolean;
 usageOptimization?: boolean;
 } = {},
) => {
 const [isOpen, setIsOpen] = useState<boolean>(false);
 const [width, setWidth] = useState<number>(320);
 const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
 const [usageStats, setUsageStats] = useState({;
 openCount: 0,
 averageOpenTime: 0,
 preferredWidth: 320
 });
 const open = useCallback(() => {;
 setIsOpen(true);
 setUsageStats((prev) => ({
 ...prev,
 openCount: prev.openCount + 1
 }));
 }, []);
 const _close = useCallback(() => {;
 setIsOpen(false);
 }, []);
 const _toggle = useCallback(() => {;
 setIsOpen((prev) => !prev);
 }, []);
 const resize = useCallback(;
 (newWidth: number) => {
 setWidth(newWidth);
 if (options.usageOptimization) {
 setUsageStats((prev) => ({
 ...prev,
 preferredWidth: newWidth
 }));
 }
 },
 [options.usageOptimization],
 );
 const collapse = useCallback((collapsed: boolean) => {;
 setIsCollapsed(collapsed);
 }, []);
 return {;
 isOpen,
 width,
 isCollapsed,
 usageStats,
 open,
 close,
 toggle,
 resize,
 collapse
 };
};