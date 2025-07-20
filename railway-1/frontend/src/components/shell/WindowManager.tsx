'use client';

import React, { useState, useCallback, useReducer, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// Types
type Position = { x: number; y: number };
type Size = { width: number; height: number };
type WindowState = 'normal' | 'minimized' | 'maximized';

interface Window {
  id: string;
  title: string;
  component: React.ReactNode;
  position: Position;
  size: Size;
  zIndex: number;
  state: WindowState;
  isFocused: boolean;
  minSize?: Size;
  aspectRatio?: number;
  resizable?: boolean;
  draggable?: boolean;
}

interface WindowManagerState {
  windows: Window[];
  focusedWindowId: string | null;
}

type WindowAction =
  | { type: 'CREATE_WINDOW'; payload: Omit<Window, 'id' | 'zIndex' | 'state' | 'isFocused'> }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'FOCUS_WINDOW'; payload: string }
  | { type: 'UPDATE_WINDOW'; payload: Partial<Window> & { id: string } }
  | { type: 'MINIMIZE_WINDOW'; payload: string }
  | { type: 'MAXIMIZE_WINDOW'; payload: string }
  | { type: 'RESTORE_WINDOW'; payload: string }
  | { type: 'BRING_TO_FRONT'; payload: string }
  | { type: 'RESET_WINDOWS'; payload: Window[] };

// Constants
const GRID_SIZE = 20;
const DEFAULT_MIN_SIZE = { width: 300, height: 200 };
const WINDOW_ANIMATION_DURATION = 0.3;

const windowReducer = (state: WindowManagerState, action: WindowAction): WindowManagerState => {
  switch (action.type) {
    case 'CREATE_WINDOW': {
      const newWindow: Window = {
        ...action.payload,
        id: `window-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        zIndex: Math.max(0, ...state.windows.map(w => w.zIndex)) + 1,
        state: 'normal',
        isFocused: true,
        minSize: action.payload.minSize || DEFAULT_MIN_SIZE,
        resizable: action.payload.resizable ?? true,
        draggable: action.payload.draggable ?? true,
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        focusedWindowId: newWindow.id,
      };
    }

    case 'CLOSE_WINDOW': {
      const remainingWindows = state.windows.filter(w => w.id !== action.payload);
      const newFocusedId = remainingWindows.length > 0
        ? remainingWindows[remainingWindows.length - 1].id
        : null;

      return {
        ...state,
        windows: remainingWindows,
        focusedWindowId: newFocusedId,
      };
    }

    case 'FOCUS_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          zIndex: w.id === action.payload ? Math.max(...state.windows.map(w => w.zIndex)) + 1 : w.zIndex,
          isFocused: w.id === action.payload,
        })),
        focusedWindowId: action.payload,
      };
    }

    case 'UPDATE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id ? { ...w, ...action.payload } : w
        ),
      };
    }

    case 'MINIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload ? { ...w, state: 'minimized' } : w
        ),
      };
    }

    case 'MAXIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload ? { ...w, state: 'maximized' } : w
        ),
      };
    }

    case 'RESTORE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload ? { ...w, state: 'normal' } : w
        ),
      };
    }

    case 'BRING_TO_FRONT': {
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          zIndex: w.id === action.payload ? Math.max(...state.windows.map(w => w.zIndex)) + 1 : w.zIndex,
        })),
        focusedWindowId: action.payload,
      };
    }

    case 'RESET_WINDOWS': {
      return {
        windows: action.payload,
        focusedWindowId: action.payload.length > 0 ? action.payload[action.payload.length - 1].id : null,
      };
    }

    default:
      return state;
  }
};

// Custom hooks
const useWindowActions = () => {
  const [state, dispatch] = useReducer(windowReducer, { windows: [], focusedWindowId: null });

  const createWindow = useCallback((windowData: Omit<Window, 'id' | 'zIndex' | 'state' | 'isFocused'>) => {
    dispatch({ type: 'CREATE_WINDOW', payload: windowData });
  }, []);

  const closeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: windowId });
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    dispatch({ type: 'FOCUS_WINDOW', payload: windowId });
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: windowId });
  }, []);

  const maximizeWindow = useCallback((windowId: string) => {
    dispatch({ type: 'MAXIMIZE_WINDOW', payload: windowId });
  }, []);

  const restoreWindow = useCallback((windowId: string) => {
    dispatch({ type: 'RESTORE_WINDOW', payload: windowId });
  }, []);

  const updateWindow = useCallback((windowId: string, updates: Partial<Window>) => {
    dispatch({ type: 'UPDATE_WINDOW', payload: { id: windowId, ...updates } });
  }, []);

  const bringToFront = useCallback((windowId: string) => {
    dispatch({ type: 'BRING_TO_FRONT', payload: windowId });
  }, []);

  const resetWindows = useCallback((windows: Window[]) => {
    dispatch({ type: 'RESET_WINDOWS', payload: windows });
  }, []);

  return {
    state,
    actions: {
      createWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      updateWindow,
      bringToFront,
      resetWindows,
    },
  };
};

const useDragAndResize = (windowId: string, windowActions: ReturnType<typeof useWindowActions>['actions']) => {
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
  });

  const [resizeState, setResizeState] = useState({
    isResizing: false,
    resizeHandle: '',
    resizeStart: { x: 0, y: 0, width: 0, height: 0 },
    maintainAspectRatio: false,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize', handle = '') => {
    e.preventDefault();
    e.stopPropagation();

    windowActions.focusWindow(windowId);

    if (action === 'drag') {
      setDragState({
        isDragging: true,
        dragOffset: {
          x: e.clientX - (e.currentTarget as HTMLElement).getBoundingClientRect().left,
          y: e.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top,
        },
      });
    } else if (action === 'resize') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setResizeState({
        isResizing: true,
        resizeHandle: handle,
        resizeStart: {
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
        },
        maintainAspectRatio: e.shiftKey,
      });
    }
  }, [windowId, windowActions]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging) {
      const newPosition = {
        x: e.clientX - dragState.dragOffset.x,
        y: e.clientY - dragState.dragOffset.y,
      };

      windowActions.updateWindow(windowId, { position: newPosition });
    }

    if (resizeState.isResizing && resizeState.resizeHandle) {
      const deltaX = e.clientX - resizeState.resizeStart.x;
      const deltaY = e.clientY - resizeState.resizeStart.y;

      let newWidth = resizeState.resizeStart.width;
      let newHeight = resizeState.resizeStart.height;

      switch (resizeState.resizeHandle) {
        case 'nw':
          newWidth -= deltaX;
          newHeight -= deltaY;
          break;
        case 'ne':
          newWidth += deltaX;
          newHeight -= deltaY;
          break;
        case 'sw':
          newWidth -= deltaX;
          newHeight += deltaY;
          break;
        case 'se':
          newWidth += deltaX;
          newHeight += deltaY;
          break;
        case 'n':
          newHeight -= deltaY;
          break;
        case 's':
          newHeight += deltaY;
          break;
        case 'e':
          newWidth += deltaX;
          break;
        case 'w':
          newWidth -= deltaX;
          break;
      }

      if (resizeState.maintainAspectRatio) {
        const aspectRatio = resizeState.resizeStart.width / resizeState.resizeStart.height;
        if (['nw', 'ne', 'sw', 'se'].includes(resizeState.resizeHandle)) {
          newHeight = newWidth / aspectRatio;
        }
      }

      windowActions.updateWindow(windowId, { size: { width: newWidth, height: newHeight } });
    }
  }, [dragState, resizeState, windowId, windowActions]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
    setResizeState(prev => ({ ...prev, isResizing: false }));
  }, []);

  useEffect(() => {
    if (dragState.isDragging || resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

  return {
    handleMouseDown,
    isDragging: dragState.isDragging,
    isResizing: resizeState.isResizing,
  };
};

// Animation variants
const windowVariants: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: { duration: WINDOW_ANIMATION_DURATION },
  },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: WINDOW_ANIMATION_DURATION,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: -20,
    transition: { duration: WINDOW_ANIMATION_DURATION },
  },
  focus: {
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
  unfocus: {
    scale: 1,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// Main component
export const WindowManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { state, actions } = useWindowActions();
  const { windows, focusedWindowId } = state;

  // Context value for child components
  const contextValue = useMemo(() => ({
    createWindow: actions.createWindow,
    closeWindow: actions.closeWindow,
    focusWindow: actions.focusWindow,
    minimizeWindow: actions.minimizeWindow,
    maximizeWindow: actions.maximizeWindow,
    restoreWindow: actions.restoreWindow,
  }), [actions]);

  return (
    <WindowManagerContext.Provider value={contextValue}>
      <div className="window-manager relative w-full h-full overflow-hidden bg-gray-50">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            }}
          />
        </div>

        {/* Windows */}
        <AnimatePresence>
          {windows.map((window) => (
            <WindowComponent
              key={window.id}
              window={window}
              isFocused={window.id === focusedWindowId}
              windowActions={actions}
            />
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {windows.length === 0 && (
          <EmptyState onCreateWindow={actions.createWindow} />
        )}

        {/* Children */}
        {children}
      </div>
    </WindowManagerContext.Provider>
  );
};

// Window Component
const WindowComponent: React.FC<{
  window: Window;
  isFocused: boolean;
  windowActions: ReturnType<typeof useWindowActions>['actions'];
}> = ({ window, isFocused, windowActions }) => {
  const { handleMouseDown, isDragging, isResizing } = useDragAndResize(window.id, windowActions);

  const getWindowStyle = useMemo(() => {
    const baseStyle = {
      left: window.position.x,
      top: window.position.y,
      zIndex: window.zIndex,
    };

    if (window.state === 'maximized') {
      return {
        ...baseStyle,
        width: '100vw',
        height: '100vh',
      };
    }

    return {
      ...baseStyle,
      width: window.size.width,
      height: window.size.height,
    };
  }, [window]);

  const handleDoubleClick = useCallback(() => {
    if (window.state === 'maximized') {
      windowActions.restoreWindow(window.id);
    } else {
      windowActions.maximizeWindow(window.id);
    }
  }, [window, windowActions]);

  return (
    <motion.div
      className={`absolute ${window.state === 'minimized' ? 'hidden' : ''}`}
      style={getWindowStyle}
      variants={windowVariants}
      initial="initial"
      animate={isFocused ? "focus" : "unfocus"}
      exit="exit"
      onClick={() => windowActions.focusWindow(window.id)}
      onDoubleClick={handleDoubleClick}
      role="application"
      aria-label={`Window: ${window.title}`}
      aria-modal="true"
    >
      <div className={`w-full h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col ${
        isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isDragging ? 'cursor-grabbing' : ''} ${isResizing ? 'cursor-resize' : ''}`}>

        {/* Title Bar */}
        <div
          className="h-10 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-3 select-none"
          onMouseDown={(e) => window.draggable && handleMouseDown(e, 'drag')}
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex items-center space-x-2">
            <button
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              onClick={() => windowActions.closeWindow(window.id)}
              aria-label="Close window"
            />
            <button
              className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
              onClick={() => windowActions.minimizeWindow(window.id)}
              aria-label="Minimize window"
            />
            <button
              className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
              onClick={() => windowActions.maximizeWindow(window.id)}
              aria-label={window.state === 'maximized' ? 'Restore window' : 'Maximize window'}
            />
          </div>

          <div className="flex-1 text-center px-2">
            <h3 className="text-sm font-medium text-gray-700 truncate" title={window.title}>
              {window.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {window.component}
        </div>

        {/* Resize Handles */}
        {window.resizable && window.state === 'normal' && (
          <ResizeHandles
            onMouseDown={(e, handle) => handleMouseDown(e, 'resize', handle)}
          />
        )}
      </div>
    </motion.div>
  );
};

// Resize Handles Component
const ResizeHandles: React.FC<{
  onMouseDown: (e: React.MouseEvent, handle: string) => void;
}> = ({ onMouseDown }) => (
  <>
    {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((handle) => (
      <div
        key={handle}
        className={`absolute ${
          handle === 'nw' ? 'top-0 left-0 cursor-nw-resize' :
          handle === 'ne' ? 'top-0 right-0 cursor-ne-resize' :
          handle === 'sw' ? 'bottom-0 left-0 cursor-sw-resize' :
          handle === 'se' ? 'bottom-0 right-0 cursor-se-resize' :
          handle === 'n' ? 'top-0 left-2 right-2 h-1 cursor-n-resize' :
          handle === 's' ? 'bottom-0 left-2 right-2 h-1 cursor-s-resize' :
          handle === 'e' ? 'right-0 top-2 bottom-2 w-1 cursor-e-resize' :
          'left-0 top-2 bottom-2 w-1 cursor-w-resize'
        }`}
        onMouseDown={(e) => onMouseDown(e, handle)}
      />
    ))}
  </>
);

// Empty State Component
const EmptyState: React.FC<{ onCreateWindow: (windowData: any) => void }> = ({ onCreateWindow }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-center p-8 max-w-md">
      <motion.div
        className="text-8xl mb-6"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🪟
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Welcome to Window Manager
      </h2>
      <p className="text-gray-600 mb-6">
        Your workspace is ready! Create a new window to get started.
      </p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        onClick={() => onCreateWindow({
          title: 'New Window',
          component: <div className="p-4">Window Content</div>,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 400 },
        })}
      >
        Create New Window
      </button>
    </div>
  </motion.div>
);

// Context
const WindowManagerContext = React.createContext<{
  createWindow: (windowData: any) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
}>({
  createWindow: () => {},
  closeWindow: () => {},
  focusWindow: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  restoreWindow: () => {},
});

export const useWindowManager = () => React.useContext(WindowManagerContext);
