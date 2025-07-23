import React from 'react';
import { motion } from 'framer-motion';

interface WindowControlsProps {
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  className?: string;
}

// DRY class composition for consistent button styling
const baseControlBtn =
  "w-6 h-6 rounded text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent";

const CONTROL_BUTTON_VARIANTS = {
  hover: { scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  tap: { scale: 0.95 }
};

const CLOSE_BUTTON_VARIANTS = {
  hover: {
    scale: 1.1,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    color: '#ffffff'
  },
  tap: { scale: 0.95 }
};

const WindowControls: React.FC<WindowControlsProps> = ({
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
  className = ''
}) => {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="toolbar"
      aria-label="Window controls"
    >
      {/* Minimize Button */}
      <motion.button
        type="button"
        aria-label="Minimize window"
        className={`${baseControlBtn} hover:bg-white/10 focus-visible:ring-white/50`}
        onClick={onMinimize}
        onKeyDown={(e) => e.key === 'Enter' && onMinimize()}
        variants={CONTROL_BUTTON_VARIANTS}
        whileHover="hover"
        whileTap="tap"
        tabIndex={0}
        title="Minimize"
      >
        <span className="text-[14px] leading-none">—</span>
      </motion.button>

      {/* Maximize/Restore Button */}
      <motion.button
        type="button"
        aria-label={isMaximized ? 'Restore window' : 'Maximize window'}
        className={`${baseControlBtn} hover:bg-white/10 focus-visible:ring-white/50`}
        onClick={onMaximize}
        onKeyDown={(e) => e.key === 'Enter' && onMaximize()}
        variants={CONTROL_BUTTON_VARIANTS}
        whileHover="hover"
        whileTap="tap"
        tabIndex={0}
        title={isMaximized ? 'Restore' : 'Maximize'}
      >
        <span className="text-[14px] leading-none">
          {isMaximized ? '❐' : '☐'}
        </span>
      </motion.button>

      {/* Close Button */}
      <motion.button
        type="button"
        aria-label="Close window"
        className={`${baseControlBtn} hover:bg-red-500/80 focus-visible:ring-red-400`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        variants={CLOSE_BUTTON_VARIANTS}
        whileHover="hover"
        whileTap="tap"
        tabIndex={0}
        title="Close"
      >
        <span className="text-[14px] leading-none">×</span>
      </motion.button>
    </div>
  );
};

export default WindowControls;
