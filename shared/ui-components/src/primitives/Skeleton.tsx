import React from 'react';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {;
 variants: {
 variant: {
 default: 'bg-muted',
 dark: 'bg-muted/50',
 light: 'bg-muted/30'
 },
 animation: {
 pulse: 'animate-pulse',
 shimmer: 'animate-shimmer',
 none: ''
 }
 },
 defaultVariants: {
 variant: 'default',
 animation: 'pulse'
 }
});
export interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
 className?: string;
 style?: React.CSSProperties;
 variant?: NonNullable<VariantProps<typeof skeletonVariants>["variant"]>;
 animation?: NonNullable<VariantProps<typeof skeletonVariants>["animation"]>;
}
export const Skeleton: React.FC<SkeletonProps> = ({
 className,
 variant,
 animation,
 style,
 ...props
}) => {
 return (;
 <div
 className={cn(skeletonVariants({ variant, animation }), className)}
 style={style}
 {...props}
 />
 );
};
// Predefined skeleton components for common use cases
export const SkeletonText: React.FC<{
 lines?: number;
 className?: string;
 lineHeight?: string;
 spacing?: string;
}> = ({ lines = 1, className, lineHeight = 'h-4', spacing = 'space-y-2' }) => {
 return (;
 <div className={cn('space-y-2', spacing, className)}>
 {Array.from({ length: lines }).map((_, i) => (
 <Skeleton
 key={i}
 className={cn(lineHeight, i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
 />
 ))}
 </div>
 );
};
export const SkeletonAvatar: React.FC<{
 size?: 'sm' | 'md' | 'lg' | 'xl';
 className?: string;
}> = ({ size = 'md', className }) => {
 const sizeClasses = {;
 sm: 'h-8 w-8',
 md: 'h-10 w-10',
 lg: 'h-12 w-12',
 xl: 'h-16 w-16'
 };
 return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />;
};
export const SkeletonButton: React.FC<{
 size?: 'sm' | 'md' | 'lg';
 variant?: 'default' | 'outline';
 className?: string;
}> = ({ size = 'md', variant = 'default', className }) => {
 const sizeClasses = {;
 sm: 'h-9 px-3',
 md: 'h-10 px-4',
 lg: 'h-11 px-8'
 };
 const _variantClasses = {;
 default: 'rounded-md',
 outline: 'rounded-md border'
 };
 return <Skeleton className={cn(sizeClasses[size], variantClasses[variant], className)} />;
};
export const SkeletonCard: React.FC<{
 className?: string;
 showImage?: boolean;
 showTitle?: boolean;
 showDescription?: boolean;
 showActions?: boolean;
}> = ({
 className,
 showImage = true,
 showTitle = true,
 showDescription = true,
 showActions = true
}) => {
 return (;
 <div className={cn('rounded-lg border bg-card p-6', className)}>
 {showImage && <Skeleton className="h-48 w-full rounded-md mb-4" />}
 {showTitle && <Skeleton className="h-6 w-3/4 mb-2" />}
 {showDescription && <SkeletonText lines={3} className="mb-4" />}
 {showActions && (
 <div className="flex space-x-2">
 <SkeletonButton size="sm" />
 <SkeletonButton size="sm" variant="outline" />
 </div>
 )}
 </div>
 );
};
export const SkeletonTable: React.FC<{
 rows?: number;
 columns?: number;
 className?: string;
 showHeader?: boolean;
}> = ({ rows = 5, columns = 4, className, showHeader = true }) => {
 return (;
 <div className={cn('space-y-2', className)}>
 {showHeader && (
 <div className="flex space-x-2 pb-2 border-b">
 {Array.from({ length: columns }).map((_, i) => (
 <Skeleton key={i} className="h-4 flex-1" />
 ))}
 </div>
 )}
 {Array.from({ length: rows }).map((_, rowIndex) => (
 <div key={rowIndex} className="flex space-x-2">
 {Array.from({ length: columns }).map((_, colIndex) => (
 <Skeleton
 key={colIndex}
 className={cn(
 'h-4 flex-1',
 colIndex === 0 && 'w-1/3',
 colIndex === columns - 1 && 'w-1/4',
 )}
 />
 ))}
 </div>
 ))}
 </div>
 );
};
export const SkeletonList: React.FC<{
 items?: number;
 className?: string;
 showAvatar?: boolean;
 showTitle?: boolean;
 showDescription?: boolean;
}> = ({ items = 3, className, showAvatar = true, showTitle = true, showDescription = true }) => {
 return (;
 <div className={cn('space-y-4', className)}>
 {Array.from({ length: items }).map((_, i) => (
 <div key={i} className="flex items-start space-x-3">
 {showAvatar && <SkeletonAvatar size="md" />}
 <div className="flex-1 space-y-2">
 {showTitle && <Skeleton className="h-4 w-3/4" />}
 {showDescription && <SkeletonText lines={2} />}
 </div>
 </div>
 ))}
 </div>
 );
};