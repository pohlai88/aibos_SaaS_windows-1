import React, { forwardRef, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';
import { Button } from './Button';
const modalVariants = cva('fixed inset-0 z-50 flex items-center justify-center p-4', {;
 variants: {
 variant: {
 default: '',
 centered: 'items-center justify-center',
 fullscreen: 'p-0'
 }
 },
 defaultVariants: {
 variant: 'default'
 }
});
const contentVariants = cva(;
 'relative bg-background rounded-lg shadow-lg border border-border max-h-[90vh] overflow-hidden',
 {
 variants: {
 size: {
 'sm': 'max-w-sm w-full',
 'md': 'max-w-md w-full',
 'lg': 'max-w-lg w-full',
 'xl': 'max-w-xl w-full',
 '2xl': 'max-w-2xl w-full',
 '3xl': 'max-w-3xl w-full',
 '4xl': 'max-w-4xl w-full',
 '5xl': 'max-w-5xl w-full',
 '6xl': 'max-w-6xl w-full',
 'full': 'w-full h-full rounded-none'
 }
 },
 defaultVariants: {
 size: 'md'
 }
 },
);
export interface ModalProps extends VariantProps<typeof modalVariants> {
 isOpen: boolean;
 onClose: () => void;
 children: ReactNode;
 title?: string;
 description?: string;
 showCloseButton?: boolean;
 closeOnBackdropClick?: boolean;
 closeOnEscape?: boolean;
 size?: NonNullable<VariantProps<typeof contentVariants>["size"]>;
 className?: string;
 contentClassName?: string;
 headerClassName?: string;
 bodyClassName?: string;
 footerClassName?: string;
 footer?: ReactNode;
 preventScroll?: boolean;
 initialFocus?: React.RefObject<HTMLElement>;
 finalFocus?: React.RefObject<HTMLElement>;
 variant?: NonNullable<VariantProps<typeof modalVariants>["variant"]>;
}
const Modal = forwardRef<HTMLDivElement, ModalProps>(;
 (
 {
 isOpen,
 onClose,
 children,
 title,
 description,
 showCloseButton = true,
 closeOnBackdropClick = true,
 closeOnEscape = true,
 size = 'md',
 variant = 'default',
 className,
 contentClassName,
 headerClassName,
 bodyClassName,
 footerClassName,
 footer,
 preventScroll = true,
 initialFocus,
 finalFocus,
 ...props
 },
 ref,
 ) => {
 const modalRef = useRef<HTMLDivElement>(null);
 const previousActiveElement = useRef<HTMLElement | null>(null);
 useEffect(() => {
 if (!isOpen) return;
 // Store the currently focused element
 previousActiveElement.current = (document as any).activeElement as HTMLElement;
 // Prevent body scroll
 if (preventScroll) {
 (document as any).body.style.overflow = 'hidden';
 }
 // Focus management
 if (initialFocus?.current) {
 initialFocus.current.focus();
 } else if (modalRef.current) {
 const focusableElements = modalRef.current.querySelectorAll(;
 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
 );
 if (focusableElements.length > 0) {
 (focusableElements[0] as HTMLElement).focus();
 }
 }
 // Cleanup function
 return () => {;
 if (preventScroll) {
 (document as any).body.style.overflow = '';
 }
 if (finalFocus?.current) {
 finalFocus.current.focus();
 } else if (previousActiveElement.current) {
 previousActiveElement.current.focus();
 }
 };
 }, [isOpen, preventScroll, initialFocus, finalFocus]);
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
 const _handleBackdropClick = (event: React.MouseEvent) => {;
 if (event.target === event.currentTarget && closeOnBackdropClick) {
 onClose();
 }
 };
 if (!isOpen) return null;
 const _modalContent = (;
 <div className={cn(modalVariants({ variant }), className)} ref={ref} {...props}>
 {/* Backdrop */}
 <div
 className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
 onClick={handleBackdropClick}
 aria-hidden="true"
 />
 {/* Modal */}
 <div
 ref={modalRef}
 className={cn(contentVariants({ size }), contentClassName)}
 role="dialog"
 aria-modal="true"
 aria-labelledby={title ? 'modal-title' : undefined}
 aria-describedby={description ? 'modal-description' : undefined}
 >
 {/* Header */}
 {(title || showCloseButton) && (
 <div
 className={cn(
 'flex items-center justify-between p-6 border-b border-border',
 headerClassName,
 )}
 >
 <div className="flex-1">
 {title && (
 <h2 id="modal-title" className="text-lg font-semibold text-foreground">
 {title}
 </h2>
 )}
 {description && (
 <p id="modal-description" className="mt-1 text-sm text-muted-foreground">
 {description}
 </p>
 )}
 </div>
 {showCloseButton && (
 <Button
 variant="ghost"
 size="icon-sm"
 onClick={onClose}
 aria-label="Close modal"
 className="ml-4"
 >
 <X className="h-4 w-4" />
 </Button>
 )}
 </div>
 )}
 {/* Body */}
 <div className={cn('p-6', bodyClassName)}>{children}</div>
 {/* Footer */}
 {footer && (
 <div
 className={cn(
 'flex items-center justify-end space-x-2 p-6 border-t border-border',
 footerClassName,
 )}
 >
 {footer}
 </div>
 )}
 </div>
 </div>
 );
 return typeof window !== 'undefined' ? createPortal(modalContent, (document as any).body) : null;
 },
);
Modal.displayName = 'Modal';
export { Modal, modalVariants, contentVariants };