import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
  sm: 'h-8 w-8',
        md: 'h-10 w-10',
  lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
      variant: {
        default: 'bg-gray-100',
  primary: 'bg-blue-100',
        secondary: 'bg-gray-200',
  success: 'bg-green-100',
        warning: 'bg-yellow-100',
  error: 'bg-red-100',
      },
    },
    defaultVariants: {
      size: 'md',
  variant: 'default',
    },
  }
);

const fallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full font-medium text-gray-600',
  {
    variants: {
      size: {
        xs: 'text-xs',
  sm: 'text-sm',
        md: 'text-sm',
  lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
      variant: {
        default: 'bg-gray-100 text-gray-600',
  primary: 'bg-blue-100 text-blue-600',
        secondary: 'bg-gray-200 text-gray-600',
  success: 'bg-green-100 text-green-600',
        warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
      },
    },
    defaultVariants: {
      size: 'md',
  variant: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  loading?: boolean;
  onError?: () => void
}

const statusColors = {
  online: 'bg-green-400',
  offline: 'bg-gray-400',
  away: 'bg-yellow-400',
  busy: 'bg-red-400',
};

const statusSizes = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-4 w-4',
  '2xl': 'h-5 w-5',
};

const AvatarComponent: React.FC<AvatarProps> = ({
  className,
  size,
  variant,
  src,
  alt,
  fallback,
  status,
  loading = false,
  onError,
  children,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
    if (onError) {
      onError()
}
    auditLog('avatar_image_error', {
      component: 'Avatar',
      src,
      alt,
    })
};

  const handleImageLoad = () => {
    setImageLoaded(true);
    auditLog('avatar_image_load', {
      component: 'Avatar',
      src,
      alt,
    })
};

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
};

  const displayFallback = fallback || (alt ? getInitials(alt) : '?');

  return (
    <div
      className={cn(avatarVariants({ size, variant }), className)}
      {...props}
    >
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'aspect-square h-full w-full object-cover',
            loading && 'animate-pulse'
          )}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {(!src || imageError) && (
        <div className={cn(fallbackVariants({ size, variant }))}>
          {displayFallback}
        </div>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}

      {children}
    </div>
  )
};

export const Avatar = withCompliance(withPerformance(AvatarComponent));

export default Avatar;
