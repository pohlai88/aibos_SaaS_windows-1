import { useCallback } from 'react';
import { useWindowManager } from './WindowManagerStore';
import { WindowPosition, WindowSize } from './WindowManager.types';

// ==================== WINDOW MANAGEMENT HOOKS ====================

/**
 * Hook for window creation and management
 */
export const useWindow = (windowId: string) => {
  const {
    getWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    closeWindow,
    moveWindow,
    resizeWindow,
    showWindow,
    hideWindow,
    bringToFront,
    sendToBack
  } = useWindowManager();

  const window = getWindow(windowId);

  return {
    window,
    isVisible: window?.isVisible ?? false,
    isFocused: window?.isFocused ?? false,
    isMinimized: window?.isMinimized ?? false,
    isMaximized: window?.isMaximized ?? false,

    // Actions
    focus: useCallback(() => focusWindow(windowId), [focusWindow, windowId]),
    minimize: useCallback(() => minimizeWindow(windowId), [minimizeWindow, windowId]),
    maximize: useCallback(() => maximizeWindow(windowId), [maximizeWindow, windowId]),
    restore: useCallback(() => restoreWindow(windowId), [restoreWindow, windowId]),
    close: useCallback(() => closeWindow(windowId), [closeWindow, windowId]),
    move: useCallback((position: WindowPosition) => moveWindow(windowId, position), [moveWindow, windowId]),
    resize: useCallback((size: WindowSize) => resizeWindow(windowId, size), [resizeWindow, windowId]),
    show: useCallback(() => showWindow(windowId), [showWindow, windowId]),
    hide: useCallback(() => hideWindow(windowId), [hideWindow, windowId]),
    bringToFront: useCallback(() => bringToFront(windowId), [bringToFront, windowId]),
    sendToBack: useCallback(() => sendToBack(windowId), [sendToBack, windowId])
  };
};

/**
 * Hook for creating new windows
 */
export const useWindowCreator = () => {
  const { createWindow } = useWindowManager();

  const createNewWindow = useCallback((
    appId: string,
    title: string,
    options: {
      position?: WindowPosition;
      size?: WindowSize;
      isResizable?: boolean;
      isDraggable?: boolean;
      minSize?: WindowSize;
      maxSize?: WindowSize;
    } = {}
  ) => {
    const {
      position = { x: 100, y: 100 },
      size = { width: 800, height: 600 },
      isResizable = true,
      isDraggable = true,
      minSize,
      maxSize
    } = options;

    return createWindow({
      appId,
      title,
      position,
      size,
      isResizable,
      isDraggable,
      minSize,
      maxSize,
      isVisible: true,
      isMinimized: false,
      isMaximized: false
    });
  }, [createWindow]);

  return { createNewWindow };
};

/**
 * Hook for managing all windows
 */
export const useWindowManagerState = () => {
  const {
    windows,
    focusedWindowId,
    getAllWindows,
    getFocusedWindow,
    getTopWindow
  } = useWindowManager();

  return {
    windows,
    focusedWindowId,
    getAllWindows,
    getFocusedWindow,
    getTopWindow,
    windowCount: Object.keys(windows).length,
    hasFocusedWindow: focusedWindowId !== null
  };
};

/**
 * Hook for window drag and drop operations
 */
export const useWindowDrag = () => {
  const { startDrag, stopDrag, isDragging, dragTarget } = useWindowManager();

  return {
    isDragging,
    dragTarget,
    startDrag,
    stopDrag
  };
};

/**
 * Hook for window positioning utilities
 */
export const useWindowPositioning = () => {
  const { getAllWindows } = useWindowManager();

  const getCascadePosition = useCallback((basePosition: WindowPosition = { x: 50, y: 50 }) => {
    const windows = getAllWindows();
    const offset = 30;

    return {
      x: basePosition.x + (windows.length * offset),
      y: basePosition.y + (windows.length * offset)
    };
  }, [getAllWindows]);

  const getCenterPosition = useCallback((windowSize: WindowSize) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    return {
      x: (screenWidth - windowSize.width) / 2,
      y: (screenHeight - windowSize.height) / 2
    };
  }, []);

    const getSnapPosition = useCallback((position: WindowPosition, windowSize: WindowSize, screenSize: WindowSize) => {
    const snapThreshold = 50;
    const snapDistance = 20;

    let snappedPosition = { ...position };

    // Snap to left edge
    if (position.x < snapThreshold) {
      snappedPosition.x = snapDistance;
    }

    // Snap to right edge
    if (position.x > screenSize.width - windowSize.width - snapThreshold) {
      snappedPosition.x = screenSize.width - windowSize.width - snapDistance;
    }

    // Snap to top edge
    if (position.y < snapThreshold) {
      snappedPosition.y = snapDistance;
    }

    // Snap to bottom edge
    if (position.y > screenSize.height - windowSize.height - snapThreshold) {
      snappedPosition.y = screenSize.height - windowSize.height - snapDistance;
    }

    return snappedPosition;
  }, []);

  return {
    getCascadePosition,
    getCenterPosition,
    getSnapPosition
  };
};

/**
 * Hook for window constraints and validation
 */
export const useWindowConstraints = () => {
  const validatePosition = useCallback((
    position: WindowPosition,
    windowSize: WindowSize,
    screenSize: WindowSize
  ) => {
    const minX = 0;
    const minY = 0;
    const maxX = screenSize.width - windowSize.width;
    const maxY = screenSize.height - windowSize.height;

    return {
      x: Math.max(minX, Math.min(maxX, position.x)),
      y: Math.max(minY, Math.min(maxY, position.y))
    };
  }, []);

  const validateSize = useCallback((
    size: WindowSize,
    minSize: WindowSize,
    maxSize?: WindowSize,
    screenSize?: WindowSize
  ) => {
    let validatedSize = { ...size };

    // Apply minimum size constraints
    validatedSize.width = Math.max(validatedSize.width, minSize.width);
    validatedSize.height = Math.max(validatedSize.height, minSize.height);

    // Apply maximum size constraints
    if (maxSize) {
      validatedSize.width = Math.min(validatedSize.width, maxSize.width);
      validatedSize.height = Math.min(validatedSize.height, maxSize.height);
    }

    // Apply screen size constraints
    if (screenSize) {
      validatedSize.width = Math.min(validatedSize.width, screenSize.width);
      validatedSize.height = Math.min(validatedSize.height, screenSize.height);
    }

    return validatedSize;
  }, []);

  return {
    validatePosition,
    validateSize
  };
};
