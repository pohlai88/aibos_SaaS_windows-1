'use client';

import React, { useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { createPortal } from 'react-dom';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

// ==================== TYPES ====================

interface ModalContextType {
  openModal: (id: string, content: ReactNode, options?: ModalOptions) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  isModalOpen: (id: string) => boolean;
}

interface ModalOptions {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  centered?: boolean;
  backdrop?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  className?: string;
  onClose?: () => void;
}

interface ModalState {
  id: string;
  content: ReactNode;
  options: ModalOptions;
  isOpen: boolean;
}

// ==================== MODAL CONTEXT ====================

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

// ==================== MODAL PROVIDER ====================

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { can, getConfig, isEnabled, health, loading: manifestLoading, error: manifestError } = useManifestor();
  const moduleConfig = useModuleConfig('ui');
  const isModuleEnabled = useModuleEnabled('ui');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('ui', 'view', currentUser);
  const canInteract = usePermission('ui', 'interact', currentUser);

  // Get configuration from manifest
  const modalConfig = moduleConfig.components?.Modal;
  const animations = moduleConfig.animations;

  const [modals, setModals] = useState<ModalState[]>([]);

  const openModal = (id: string, content: ReactNode, options: ModalOptions = {}) => {
    // ==================== MANIFESTOR PERMISSION CHECKS ====================
    if (manifestLoading) return;
    if (manifestError) return;
    if (!isModuleEnabled) return;
    if (!canView) return;

    // Get manifest-driven defaults
    const manifestDefaults = {
      size: modalConfig?.sizes?.[0] || 'md',
      closable: modalConfig?.features?.closeOnEscape !== false,
      closeOnBackdrop: modalConfig?.features?.closeOnOverlayClick !== false,
      closeOnEscape: modalConfig?.features?.closeOnEscape !== false,
      showCloseButton: true,
      centered: modalConfig?.features?.centered !== false,
      backdrop: modalConfig?.features?.backdrop !== false,
      draggable: modalConfig?.features?.draggable || false,
      resizable: modalConfig?.features?.resizable || false,
    };

    const defaultOptions: ModalOptions = {
      ...manifestDefaults,
      ...options
    };

    setModals(prev => {
      const existing = prev.find(m => m.id === id);
      if (existing) {
        return prev.map(m => m.id === id ? { ...m, content, options: defaultOptions, isOpen: true } : m);
      }
      return [...prev, { id, content, options: defaultOptions, isOpen: true }];
    });
  };

  const closeModal = (id: string) => {
    setModals(prev => prev.map(m => m.id === id ? { ...m, isOpen: false } : m));

    // Call onClose callback
    const modal = modals.find(m => m.id === id);
    if (modal?.options.onClose) {
      modal.options.onClose();
    }
  };

  const closeAllModals = () => {
    setModals(prev => prev.map(m => ({ ...m, isOpen: false })));
  };

  const isModalOpen = (id: string) => {
    return modals.some(m => m.id === id && m.isOpen);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const openModal = modals.find(m => m.isOpen && m.options.closeOnEscape);
        if (openModal && canInteract) {
          closeModal(openModal.id);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modals]);

  const contextValue: ModalContextType = {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen
  };

  // ==================== MANIFESTOR RENDER LOGIC ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-20" />;
  }

  if (manifestError) {
    return <div className="text-red-600">Modal Error</div>;
  }

  if (!isModuleEnabled) {
    return <>{children}</>;
  }

  if (!canView) {
    return <>{children}</>;
  }

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <ModalPortal modals={modals} onClose={closeModal} />
    </ModalContext.Provider>
  );
};

// ==================== MODAL PORTAL ====================

const ModalPortal: React.FC<{
  modals: ModalState[];
  onClose: (id: string) => void;
}> = ({ modals, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="modal-portal">
      {modals.map(modal => (
        <ModalComponent
          key={modal.id}
          modal={modal}
          onClose={() => onClose(modal.id)}
        />
      ))}
    </div>,
    document.body
  );
};

// ==================== MODAL COMPONENT ====================

const ModalComponent: React.FC<{
  modal: ModalState;
  onClose: () => void;
}> = ({ modal, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && modal.options.closeOnBackdrop) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (!modal.options.closable) return;

    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const getSizeClasses = () => {
    switch (modal.options.size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-md';
    }
  };

  return (
    <AnimatePresence>
      {modal.isOpen && !isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            modal.options.backdrop ? 'bg-black/50 backdrop-blur-sm' : ''
          }`}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 ${getSizeClasses()} w-full ${modal.options.className || ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {modal.options.showCloseButton && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {modal.content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==================== MODAL HOOKS ====================

export const useModalState = (id: string) => {
  const { openModal, closeModal, isModalOpen } = useModal();

  return {
    isOpen: isModalOpen(id),
    open: (content: ReactNode, options?: ModalOptions) => openModal(id, content, options),
    close: () => closeModal(id)
  };
};

// ==================== MODAL COMPONENTS ====================

export const ConfirmModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '🔴',
          button: 'bg-red-500 hover:bg-red-600',
          text: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          icon: '🟡',
          button: 'bg-yellow-500 hover:bg-yellow-600',
          text: 'text-yellow-600 dark:text-yellow-400'
        };
      default:
        return {
          icon: 'ℹ️',
          button: 'bg-blue-500 hover:bg-blue-600',
          text: 'text-blue-600 dark:text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{styles.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${styles.button}`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export const AlertModal: React.FC<{
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}> = ({ title, message, type = 'info', onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', color: 'text-green-600 dark:text-green-400' };
      case 'error':
        return { icon: '❌', color: 'text-red-600 dark:text-red-400' };
      case 'warning':
        return { icon: '⚠️', color: 'text-yellow-600 dark:text-yellow-400' };
      default:
        return { icon: 'ℹ️', color: 'text-blue-600 dark:text-blue-400' };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="text-center">
      <div className="text-4xl mb-4">{styles.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {message}
      </p>
      <button
        onClick={onClose}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        OK
      </button>
    </div>
  );
};

// ==================== MODAL UTILITIES ====================

// Note: These functions should be used within React components or custom hooks
// They violate the rules of hooks when called outside of React context
// Use the useModal hook directly in your components instead

export const createConfirmModal = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel: () => void,
  options?: Partial<{
    type: 'danger' | 'warning' | 'info';
    confirmText: string;
    cancelText: string;
  }>
) => (
  <ConfirmModal
    title={title}
    message={message}
    onConfirm={onConfirm}
    onCancel={onCancel}
    {...options}
  />
);

export const createAlertModal = (
  title: string,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  onClose: () => void
) => (
  <AlertModal
    title={title}
    message={message}
    type={type}
    onClose={onClose}
  />
);
