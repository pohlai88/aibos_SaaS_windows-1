import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Button } from '../primitives/Button';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=move]:transition-none data-[swipe=cancel]:translate-x-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive border-destructive bg-destructive text-destructive-foreground',
        success:
          'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  duration?: number;
  onDismiss?: () => void;
  loading?: boolean;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem: React.FC<ToastProps> = ({
  id,
  variant = 'default',
  title,
  description,
  action,
  duration = 5000,
  onDismiss,
  loading = false,
}) => {
  const { removeToast } = useToast();
  const Icon = loading ? icons.loading : icons[variant || 'default'];

  React.useEffect(() => {
    if (duration > 0 && !loading) {
      const timer = setTimeout(() => {
        removeToast(id);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, loading, onDismiss, removeToast]);

  return (
    <div
      className={cn(toastVariants({ variant }), 'max-w-sm')}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start space-x-3">
        <Icon
          className={cn(
            'h-5 w-5 flex-shrink-0',
            loading && 'animate-spin',
            variant === 'success' && 'text-green-600',
            variant === 'warning' && 'text-yellow-600',
            variant === 'info' && 'text-blue-600',
            variant === 'destructive' && 'text-red-600',
          )}
        />
        <div className="flex-1 space-y-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => {
          removeToast(id);
          onDismiss?.();
        }}
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      aria-live="assertive"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>,
    document.body,
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Convenience functions for common toast types
export const toast = {
  success: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { addToast } = useToast();
    return addToast({ title, description, variant: 'success', ...options });
  },
  error: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { addToast } = useToast();
    return addToast({ title, description, variant: 'destructive', ...options });
  },
  warning: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { addToast } = useToast();
    return addToast({ title, description, variant: 'warning', ...options });
  },
  info: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { addToast } = useToast();
    return addToast({ title, description, variant: 'info', ...options });
  },
  loading: (title: string, description?: string, options?: Partial<ToastProps>) => {
    const { addToast } = useToast();
    return addToast({ title, description, loading: true, duration: 0, ...options });
  },
};
