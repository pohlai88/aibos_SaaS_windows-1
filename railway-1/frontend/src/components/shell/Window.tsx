import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindow } from './WindowManager.hooks';
import { WindowState } from './WindowManager.types';
import WindowHeader from './WindowHeader';
import WindowContent from './WindowContent';
import WindowFooter from './WindowFooter';

interface WindowProps {
  windowId: string;
  children: React.ReactNode;
  className?: string;
}

const WINDOW_ANIMATION = {
  open: { opacity: 1, scale: 1, y: 0 },
  closed: { opacity: 0, scale: 0.95, y: 40 },
  minimized: { opacity: 0, scale: 0.8, y: 100 },
  exit: { opacity: 0, scale: 0.8, y: 100 },
};

const WINDOW_TRANSITION = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  duration: 0.35,
};

const Window: React.FC<WindowProps> = ({ windowId, children, className = '' }) => {
  const {
    window,
    isVisible,
    isFocused,
    isMinimized,
    isMaximized,
    focus,
    minimize,
    maximize,
    restore,
    close,
    move,
    resize,
    bringToFront,
  } = useWindow(windowId);

  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Enhanced focus management with focus trapping
  useEffect(() => {
    if (!isFocused || !windowRef.current) return;

    const focusableElements = windowRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      // Focus the first focusable element
      focusableElements[0].focus();
    }

    // Focus trap: keep focus within window
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: move backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    windowRef.current.addEventListener('keydown', handleTabKey);
    return () => windowRef.current?.removeEventListener('keydown', handleTabKey);
  }, [isFocused]);

    // Enhanced keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isFocused) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (isMinimized) {
            restore();
            announceState('Window restored');
          } else {
            close();
            announceState('Window closed');
          }
          break;
        case 'Enter':
          e.preventDefault();
          focus();
          announceState('Window focused');
          break;
        case 'F11':
          e.preventDefault();
          if (isMaximized) {
            restore();
            announceState('Window restored');
          } else {
            maximize();
            announceState('Window maximized');
          }
          break;
        case 'F12':
          e.preventDefault();
          minimize();
          announceState('Window minimized');
          break;
      }
    };

    globalThis.window.addEventListener('keydown', handleKey);
    return () => globalThis.window.removeEventListener('keydown', handleKey);
  }, [isFocused, isMinimized, isMaximized, close, focus, restore, maximize, minimize]);

  // Screen reader announcements
  const announceState = (message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  };

  // Enhanced focus window on click
  const handleFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    focus();
    bringToFront();
    announceState('Window focused');
  };

  // Enhanced drag logic with visual feedback
  const handleDragStart = (e: React.MouseEvent) => {
    if (!window?.isDraggable) return;

    e.preventDefault();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - (window?.position.x ?? 0),
      y: e.clientY - (window?.position.y ?? 0),
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    announceState('Window dragging started');
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    // Keep window within viewport bounds
    const maxX = globalThis.window.innerWidth - (window?.size.width ?? 0);
    const maxY = globalThis.window.innerHeight - (window?.size.height ?? 0);

    move({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    announceState('Window dragging ended');
  };

  // Enhanced button handlers with announcements
  const handleMinimize = () => {
    minimize();
    announceState('Window minimized');
  };

  const handleMaximize = () => {
    if (isMaximized) {
      restore();
      announceState('Window restored');
    } else {
      maximize();
      announceState('Window maximized');
    }
  };

  const handleClose = () => {
    close();
    announceState('Window closed');
  };

  if (!window) return null;

  // Animation state
  let animateState: keyof typeof WINDOW_ANIMATION = 'open';
  if (!isVisible) animateState = 'closed';
  if (isMinimized) animateState = 'minimized';

  // Enhanced window style with better focus indicators
  const style: React.CSSProperties = {
    position: 'absolute',
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
    zIndex: window.zIndex,
    outline: 'none', // Remove default outline, we'll handle focus styling
    boxShadow: isFocused
      ? '0 8px 32px 0 rgba(99,102,241,0.25), 0 0 0 2px rgba(99,102,241,0.5)'
      : '0 4px 16px 0 rgba(0,0,0,0.10)',
    borderRadius: 12,
    background: 'rgba(30, 41, 59, 0.95)',
    overflow: 'hidden',
    userSelect: 'none',
    transition: 'box-shadow 0.2s, transform 0.1s',
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
  };

  // ARIA attributes for screen readers
  const ariaAttributes = {
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-label': window.title,
    'aria-describedby': `window-${windowId}-description`,
    'aria-expanded': !isMinimized,
    'aria-hidden': !isVisible,
  };

  return (
    <>
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        {announcement}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={windowRef}
            tabIndex={0}
            className={`aibos-window ${className} ${isFocused ? 'window-focused' : ''}`}
            style={style}
            initial="closed"
            animate={animateState}
            exit="exit"
            variants={WINDOW_ANIMATION}
            transition={WINDOW_TRANSITION}
            onMouseDown={handleFocus}
            {...ariaAttributes}
          >
            {/* Window description for screen readers */}
            <div id={`window-${windowId}-description`} className="sr-only">
              {window.title} window. {isMinimized ? 'Minimized' : isMaximized ? 'Maximized' : 'Normal'} state.
              {isFocused ? ' Currently focused.' : ''}
            </div>

            {/* Window title ID for ARIA labeling */}
            <div id={`window-title-${windowId}`} className="sr-only">
              {window.title}
            </div>

                        {/* Modular Header Component */}
            <WindowHeader
              title={window.title}
              isMaximized={isMaximized}
              isDragging={isDragging}
              isFocused={isFocused}
              onDragStart={handleDragStart}
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onClose={handleClose}
            />

                        {/* Modular Content Component */}
            <WindowContent
              ref={contentRef}
              windowId={windowId}
              showScrollIndicators={true}
            >
              {children}
            </WindowContent>

            {/* Modular Footer Component */}
            <WindowFooter
              windowId={windowId}
              title={window.title}
              isFocused={isFocused}
              isMaximized={isMaximized}
              onAction={(action, data) => {
                console.log('Footer action:', action, data);
                // Handle footer actions
                switch (action) {
                  case 'focus-mode':
                    announceState('Focus mode activated');
                    break;
                  case 'break-reminder':
                    announceState('Break reminder set');
                    break;
                  case 'optimize':
                    announceState('Window optimized');
                    break;
                  case 'swipe-right':
                    announceState('Swiped right');
                    break;
                  case 'swipe-left':
                    announceState('Swiped left');
                    break;
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Window;
