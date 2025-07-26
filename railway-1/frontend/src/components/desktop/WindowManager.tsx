'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

// ==================== TYPES ====================

export interface DesktopWindow {
  id: string;
  title: string;
  type: 'terminal' | 'aha-machine' | 'file-system' | 'settings' | 'consciousness-dashboard' | 'workspace-manager' | 'connectivity' | 'notes' | 'calculator' | 'clock' | 'weather';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  content: React.ReactNode;
}

interface WindowManagerProps {
  windows: DesktopWindow[];
  onWindowUpdate: (windowId: string, updates: Partial<DesktopWindow>) => void;
  onWindowClose: (windowId: string) => void;
  onWindowFocus: (windowId: string) => void;
  isDarkMode: boolean;
}

interface WindowComponentProps {
  window: DesktopWindow;
  onUpdate: (windowId: string, updates: Partial<DesktopWindow>) => void;
  onClose: (windowId: string) => void;
  onFocus: (windowId: string) => void;
  isDarkMode: boolean;
}

// ==================== GRID SNAPPING UTILITY ====================

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// ==================== WINDOW CONSTRAINTS ====================

const VIRTUAL_DESKTOP_WIDTH = 3000;
const VIRTUAL_DESKTOP_HEIGHT = 2000;

const constrainWindowPosition = (position: { x: number; y: number }, size: { width: number; height: number }) => {
  return {
    x: Math.max(0, Math.min(position.x, VIRTUAL_DESKTOP_WIDTH - size.width)),
    y: Math.max(0, Math.min(position.y, VIRTUAL_DESKTOP_HEIGHT - size.height))
  };
};

const constrainWindowSize = (size: { width: number; height: number }) => {
  return {
    width: Math.max(400, Math.min(size.width, VIRTUAL_DESKTOP_WIDTH)),
    height: Math.max(300, Math.min(size.height, VIRTUAL_DESKTOP_HEIGHT))
  };
};

// ==================== WINDOW COMPONENT ====================

const WindowComponent: React.FC<WindowComponentProps> = ({
  window,
  onUpdate,
  onClose,
  onFocus,
  isDarkMode
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');

  // ==================== DRAG HANDLERS ====================

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onFocus(window.id);
  }, [onFocus, window.id]);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsDragging(false);

    // Calculate new position with grid snapping
    let newX = window.position.x + info.offset.x;
    let newY = window.position.y + info.offset.y;

    // Snap to grid
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);

    // Constrain to virtual desktop bounds
    const constrainedPosition = constrainWindowPosition(
      { x: newX, y: newY },
      window.size
    );

    onUpdate(window.id, {
      position: constrainedPosition
    });
  }, [window.position, window.size, onUpdate, window.id]);

  // ==================== RESIZE HANDLERS ====================

  const handleResizeStart = useCallback((direction: string) => {
    setIsResizing(true);
    setResizeDirection(direction);
    onFocus(window.id);
  }, [onFocus, window.id]);

  const handleResizeEnd = useCallback((event: any, info: PanInfo) => {
    setIsResizing(false);
    setResizeDirection('');

    let newWidth = window.size.width;
    let newHeight = window.size.height;
    let newX = window.position.x;
    let newY = window.position.y;

    // Calculate new size based on resize direction
    switch (resizeDirection) {
      case 'e':
        newWidth = window.size.width + info.offset.x;
        break;
      case 'w':
        newWidth = window.size.width - info.offset.x;
        newX = window.position.x + info.offset.x;
        break;
      case 's':
        newHeight = window.size.height + info.offset.y;
        break;
      case 'n':
        newHeight = window.size.height - info.offset.y;
        newY = window.position.y + info.offset.y;
        break;
      case 'se':
        newWidth = window.size.width + info.offset.x;
        newHeight = window.size.height + info.offset.y;
        break;
      case 'sw':
        newWidth = window.size.width - info.offset.x;
        newHeight = window.size.height + info.offset.y;
        newX = window.position.x + info.offset.x;
        break;
      case 'ne':
        newWidth = window.size.width + info.offset.x;
        newHeight = window.size.height - info.offset.y;
        newY = window.position.y + info.offset.y;
        break;
      case 'nw':
        newWidth = window.size.width - info.offset.x;
        newHeight = window.size.height - info.offset.y;
        newX = window.position.x + info.offset.x;
        newY = window.position.y + info.offset.y;
        break;
    }

    // Snap to grid
    newWidth = snapToGrid(newWidth);
    newHeight = snapToGrid(newHeight);
    newX = snapToGrid(newX);
    newY = snapToGrid(newY);

    // Constrain size and position
    const constrainedSize = constrainWindowSize({ width: newWidth, height: newHeight });
    const constrainedPosition = constrainWindowPosition(
      { x: newX, y: newY },
      constrainedSize
    );

    onUpdate(window.id, {
      size: constrainedSize,
      position: constrainedPosition
    });
  }, [window.size, window.position, resizeDirection, onUpdate, window.id]);

  // ==================== WINDOW CONTROL HANDLERS ====================

  const handleMinimize = useCallback(() => {
    onUpdate(window.id, { isMinimized: true });
  }, [onUpdate, window.id]);

  const handleMaximize = useCallback(() => {
    if (window.isMaximized) {
      // Restore to previous size and position
      onUpdate(window.id, {
        isMaximized: false,
        size: { width: 800, height: 600 },
        position: { x: 100, y: 100 }
      });
    } else {
      // Maximize to virtual desktop bounds
      onUpdate(window.id, {
        isMaximized: true,
        size: { width: VIRTUAL_DESKTOP_WIDTH - 40, height: VIRTUAL_DESKTOP_HEIGHT - 40 },
        position: { x: 20, y: 20 }
      });
    }
  }, [window.isMaximized, onUpdate, window.id]);

  const handleClose = useCallback(() => {
    onClose(window.id);
  }, [onClose, window.id]);

  const handleClick = useCallback(() => {
    onFocus(window.id);
  }, [onFocus, window.id]);

  // ==================== RENDER ====================

  if (window.isMinimized) {
    return null;
  }

  return (
    <motion.div
      className="absolute pointer-events-auto gpu-accelerated"
      style={{
        x: window.isMaximized ? 20 : window.position.x,
        y: window.isMaximized ? 20 : window.position.y,
        width: window.isMaximized ? VIRTUAL_DESKTOP_WIDTH - 40 : window.size.width,
        height: window.isMaximized ? VIRTUAL_DESKTOP_HEIGHT - 40 : window.size.height,
        zIndex: window.zIndex
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={handleClick}
    >
      {/* Window Container */}
      <div className={`w-full h-full rounded-lg shadow-2xl border overflow-hidden ${
        isDarkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-300'
      }`}>

        {/* Title Bar - Always Attached */}
        <motion.div
          className={`flex items-center justify-between px-4 py-2 cursor-move ${
            isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b border-gray-300'
          }`}
          drag={!window.isMaximized}
          dragMomentum={false}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Window Title */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className={`font-medium text-sm ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {window.title}
            </span>
          </div>

          {/* Window Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleMinimize}
              className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-400'
              }`}
              title="Minimize"
            >
              <Minus size={12} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <button
              onClick={handleMaximize}
              className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-400'
              }`}
              title={window.isMaximized ? "Restore" : "Maximize"}
            >
              {window.isMaximized ? (
                <Square size={12} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              ) : (
                <Maximize2 size={12} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors"
              title="Close"
            >
              <X size={12} className="text-red-400" />
            </button>
          </div>
        </motion.div>

        {/* Window Content */}
        <div className="w-full h-full overflow-hidden">
          {window.content}
        </div>

        {/* Resize Handles - Only show when not maximized */}
        {!window.isMaximized && (
          <>
            {/* Corner Resize Handles */}
            <motion.div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('se')}
              onDragEnd={handleResizeEnd}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('sw')}
              onDragEnd={handleResizeEnd}
            />
            <motion.div
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('ne')}
              onDragEnd={handleResizeEnd}
            />
            <motion.div
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('nw')}
              onDragEnd={handleResizeEnd}
            />

            {/* Edge Resize Handles */}
            <motion.div
              className="absolute top-0 left-4 right-4 h-2 cursor-n-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('n')}
              onDragEnd={handleResizeEnd}
            />
            <motion.div
              className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('s')}
              onDragEnd={handleResizeEnd}
            />
            <motion.div
              className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('w')}
              onDragEnd={handleResizeEnd}
            />
            <motion.div
              className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => handleResizeStart('e')}
              onDragEnd={handleResizeEnd}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

// ==================== MAIN WINDOW MANAGER ====================

const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  onWindowUpdate,
  onWindowClose,
  onWindowFocus,
  isDarkMode
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((window) => (
        <WindowComponent
          key={window.id}
          window={window}
          onUpdate={onWindowUpdate}
          onClose={onWindowClose}
          onFocus={onWindowFocus}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
};

export default WindowManager;
