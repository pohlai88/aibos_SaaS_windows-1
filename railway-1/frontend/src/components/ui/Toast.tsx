'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== TYPES ====================
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

// ==================== CONTEXT ====================
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// ==================== PROVIDER ====================
interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// ==================== TOAST COMPONENT ====================
interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          border: 'border-green-600',
          icon: '✅',
          progress: 'bg-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-600',
          icon: '❌',
          progress: 'bg-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-600',
          icon: '⚠️',
          progress: 'bg-yellow-400'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-600',
          icon: 'ℹ️',
          progress: 'bg-blue-400'
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <motion.div
      className={`${styles.bg} ${styles.border} text-white rounded-lg shadow-lg border overflow-hidden min-w-[320px] max-w-[420px]`}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className={`h-1 ${styles.progress}`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-xl flex-shrink-0">{styles.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="text-sm underline hover:no-underline mt-2 transition-all"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== TOAST CONTAINER ====================
const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ==================== CONVENIENCE HOOKS ====================
export const useToastActions = () => {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string) =>
      showToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      showToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      showToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      showToast({ type: 'info', title, message }),
    showToast
  };
};

export default ToastProvider;
