// ==================== WINDOW MANAGEMENT TYPES ====================

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  minSize?: WindowSize;
  maxSize?: WindowSize;
}

export interface WindowManagerState {
  windows: Record<string, WindowState>;
  focusedWindowId: string | null;
  maxZIndex: number;
  isDragging: boolean;
  dragTarget: string | null;
}

export interface WindowActions {
  // Window Creation & Destruction
  createWindow: (window: Omit<WindowState, 'id' | 'zIndex' | 'isFocused'>) => string;
  closeWindow: (windowId: string) => void;

  // Window Positioning & Sizing
  moveWindow: (windowId: string, position: WindowPosition) => void;
  resizeWindow: (windowId: string, size: WindowSize) => void;

  // Window State Management
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;

  // Window Visibility
  showWindow: (windowId: string) => void;
  hideWindow: (windowId: string) => void;

  // Z-Index Management
  bringToFront: (windowId: string) => void;
  sendToBack: (windowId: string) => void;

  // Drag & Drop
  startDrag: (windowId: string) => void;
  stopDrag: () => void;

  // Utility
  getWindow: (windowId: string) => WindowState | undefined;
  getAllWindows: () => WindowState[];
  getFocusedWindow: () => WindowState | undefined;
  getTopWindow: () => WindowState | undefined;
}

export type WindowManagerStore = WindowManagerState & WindowActions;

// ==================== WINDOW CONSTRAINTS ====================
export interface WindowConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable: boolean;
  draggable: boolean;
}

// ==================== WINDOW EVENTS ====================
export interface WindowEvent {
  type: 'focus' | 'blur' | 'minimize' | 'maximize' | 'restore' | 'close' | 'move' | 'resize';
  windowId: string;
  timestamp: number;
  data?: any;
}

// ==================== WINDOW ANIMATIONS ====================
export interface WindowAnimation {
  type: 'fade' | 'slide' | 'scale' | 'none';
  duration: number;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}
