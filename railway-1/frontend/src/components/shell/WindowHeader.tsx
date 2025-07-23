import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import WindowControls from './WindowControls';

interface WindowHeaderProps {
  title: string;
  isMaximized: boolean;
  isDragging: boolean;
  isFocused?: boolean; // New prop for active state
  onDragStart: (e: React.MouseEvent) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onDoubleClick?: () => void; // New prop for double-click handling
  enableDoubleClickResize?: boolean; // Toggle for double-click maximize/restore
  className?: string;
  children?: React.ReactNode; // Allow custom content in header
}

// Design tokens for dynamic theming
const HEADER_TOKENS = {
  colors: {
    primary: 'from-indigo-700/80 to-indigo-500/60',
    active: 'from-indigo-600/90 to-indigo-400/70',
    dragging: 'from-indigo-600/95 to-indigo-400/80'
  },
  borders: {
    idle: 'border-white/8',
    active: 'border-white/20',
    dragging: 'border-white/15'
  },
  transitions: {
    cursor: 'transition-[cursor] duration-100',
    all: 'transition-all duration-200'
  }
};

const HEADER_VARIANTS = {
  idle: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    scale: 1
  },
  active: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    scale: 1,
    boxShadow: '0 0 0 1px rgba(255,255,255,0.1)'
  },
  dragging: {
    backgroundColor: 'rgba(99, 102, 241, 0.95)',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    scale: 1.01,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  }
};

const WindowHeader: React.FC<WindowHeaderProps> = ({
  title,
  isMaximized,
  isDragging,
  isFocused = false,
  onDragStart,
  onMinimize,
  onMaximize,
  onClose,
  onDoubleClick,
  enableDoubleClickResize = true,
  className = '',
  children
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  // Handle double-click to maximize/restore
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onDoubleClick) {
      onDoubleClick();
    } else if (enableDoubleClickResize) {
      // Default behavior: toggle maximize/restore
      if (isMaximized) {
        onMinimize();
      } else {
        onMaximize();
      }
    }
  };

  // Determine current state for animation
  const getCurrentState = () => {
    if (isDragging) return 'dragging';
    if (isFocused) return 'active';
    return 'idle';
  };

  // Get appropriate styling based on state
  const getHeaderStyling = () => {
    const baseClasses = [
      'flex items-center justify-between px-4 py-2 select-none',
      'bg-gradient-to-r',
      HEADER_TOKENS.transitions.all,
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1',
      'focus-visible:ring-offset-transparent'
    ];

    if (isDragging) {
      baseClasses.push(
        'cursor-grabbing',
        HEADER_TOKENS.colors.dragging,
        `border-b ${HEADER_TOKENS.borders.dragging}`
      );
    } else {
      baseClasses.push(
        'cursor-grab',
        isFocused ? HEADER_TOKENS.colors.active : HEADER_TOKENS.colors.primary,
        `border-b ${isFocused ? HEADER_TOKENS.borders.active : HEADER_TOKENS.borders.idle}`
      );
    }

    return baseClasses.join(' ');
  };

  return (
    <motion.div
      ref={headerRef}
      className={`${getHeaderStyling()} ${className}`}
      onMouseDown={onDragStart}
      onDoubleClick={handleDoubleClick}
      role="toolbar"
      aria-label={`Header for window titled ${title}`}
      tabIndex={0}
      variants={HEADER_VARIANTS}
      animate={getCurrentState()}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={!isDragging ? { scale: 1.001 } : {}}
      whileTap={!isDragging ? { scale: 0.999 } : {}}
    >
      {/* Title Section */}
      <div className="flex items-center flex-1 min-w-0">
        <div
          className="font-semibold text-white text-sm truncate pr-2"
          aria-label={`Window title: ${title}`}
        >
          {title}
        </div>

        {/* Custom header content */}
        {children && (
          <div className="flex items-center ml-2">
            {children}
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <WindowControls
          isMaximized={isMaximized}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
        />
      </div>
    </motion.div>
  );
};

export default WindowHeader;
