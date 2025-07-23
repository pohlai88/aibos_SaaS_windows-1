import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  WindowManagerStore,
  WindowManagerState,
  WindowState,
  WindowPosition,
  WindowSize
} from './WindowManager.types';

// ==================== WINDOW MANAGER STORE ====================
export const useWindowManager = create<WindowManagerStore>()(
  devtools(
    (set, get) => ({
      // ==================== STATE ====================
      windows: {},
      focusedWindowId: null,
      maxZIndex: 1000,
      isDragging: false,
      dragTarget: null,

      // ==================== WINDOW CREATION & DESTRUCTION ====================
      createWindow: (windowData: Omit<WindowState, 'id' | 'zIndex' | 'isFocused'>) => {
        const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newZIndex = get().maxZIndex + 1;

        const newWindow: WindowState = {
          ...windowData,
          id: windowId,
          zIndex: newZIndex,
          isFocused: true,
          isVisible: true,
          isMinimized: false,
          isMaximized: false,
        };

        set((state) => ({
          windows: {
            ...state.windows,
            [windowId]: newWindow
          },
          focusedWindowId: windowId,
          maxZIndex: newZIndex
        }));

        return windowId;
      },

      closeWindow: (windowId: string) => {
        set((state: WindowManagerState) => {
          const { [windowId]: removed, ...remainingWindows } = state.windows;

          // If we're closing the focused window, focus the next available window
          let newFocusedWindowId = state.focusedWindowId;
          if (state.focusedWindowId === windowId) {
            const windowIds = Object.keys(remainingWindows);
            newFocusedWindowId = windowIds.length > 0 ? windowIds[windowIds.length - 1] : null;
          }

          return {
            windows: remainingWindows,
            focusedWindowId: newFocusedWindowId
          };
        });
      },

      // ==================== WINDOW POSITIONING & SIZING ====================
      moveWindow: (windowId: string, position: WindowPosition) => {
        set((state: WindowManagerState) => ({
          windows: {
            ...state.windows,
            [windowId]: {
              ...state.windows[windowId],
              position,
              isMaximized: false // Moving a window un-maximizes it
            }
          }
        }));
      },

      resizeWindow: (windowId: string, size: WindowSize) => {
        set((state: WindowManagerState) => {
          const window = state.windows[windowId];
          if (!window) return state;

          // Apply size constraints
          let constrainedSize = { ...size };

          if (window.minSize) {
            constrainedSize.width = Math.max(constrainedSize.width, window.minSize.width);
            constrainedSize.height = Math.max(constrainedSize.height, window.minSize.height);
          }

          if (window.maxSize) {
            constrainedSize.width = Math.min(constrainedSize.width, window.maxSize.width);
            constrainedSize.height = Math.min(constrainedSize.height, window.maxSize.height);
          }

          return {
            windows: {
              ...state.windows,
              [windowId]: {
                ...window,
                size: constrainedSize,
                isMaximized: false // Resizing a window un-maximizes it
              }
            }
          };
        });
      },

      // ==================== WINDOW STATE MANAGEMENT ====================
      focusWindow: (windowId: string) => {
        set((state: WindowManagerState) => {
          const newZIndex = state.maxZIndex + 1;

          // Update all windows to remove focus
          const updatedWindows = Object.keys(state.windows).reduce((acc, id) => ({
            ...acc,
            [id]: {
              ...state.windows[id],
              isFocused: id === windowId,
              zIndex: id === windowId ? newZIndex : state.windows[id].zIndex
            }
          }), {});

          return {
            windows: updatedWindows,
            focusedWindowId: windowId,
            maxZIndex: newZIndex
          };
        });
      },

      minimizeWindow: (windowId: string) => {
        set((state: WindowManagerState) => ({
          windows: {
            ...state.windows,
            [windowId]: {
              ...state.windows[windowId],
              isMinimized: true,
              isFocused: false
            }
          },
          focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId
        }));
      },

      maximizeWindow: (windowId: string) => {
        set((state: WindowManagerState) => ({
          windows: {
            ...state.windows,
            [windowId]: {
              ...state.windows[windowId],
              isMaximized: true,
              isFocused: true
            }
          },
          focusedWindowId: windowId
        }));
      },

      restoreWindow: (windowId: string) => {
        set((state: WindowManagerState) => ({
          windows: {
            ...state.windows,
            [windowId]: {
              ...state.windows[windowId],
              isMinimized: false,
              isMaximized: false,
              isFocused: true
            }
          },
          focusedWindowId: windowId
        }));
      },

      // ==================== WINDOW VISIBILITY ====================
      showWindow: (windowId: string) => {
        set((state: WindowManagerState) => ({
          windows: {
            ...state.windows,
            [windowId]: {
              ...state.windows[windowId],
              isVisible: true
            }
          }
        }));
      },

      hideWindow: (windowId) => {
        set((state) => ({
          windows: {
            ...state.windows,
            [windowId]: {
              ...state.windows[windowId],
              isVisible: false,
              isFocused: false
            }
          },
          focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId
        }));
      },

      // ==================== Z-INDEX MANAGEMENT ====================
      bringToFront: (windowId) => {
        set((state) => {
          const newZIndex = state.maxZIndex + 1;

          return {
            windows: {
              ...state.windows,
              [windowId]: {
                ...state.windows[windowId],
                zIndex: newZIndex,
                isFocused: true
              }
            },
            focusedWindowId: windowId,
            maxZIndex: newZIndex
          };
        });
      },

      sendToBack: (windowId) => {
        set((state) => {
          const minZIndex = Math.min(...Object.values(state.windows).map(w => w.zIndex));

          return {
            windows: {
              ...state.windows,
              [windowId]: {
                ...state.windows[windowId],
                zIndex: minZIndex - 1,
                isFocused: false
              }
            },
            focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId
          };
        });
      },

      // ==================== DRAG & DROP ====================
      startDrag: (windowId) => {
        set({
          isDragging: true,
          dragTarget: windowId
        });
      },

      stopDrag: () => {
        set({
          isDragging: false,
          dragTarget: null
        });
      },

      // ==================== UTILITY METHODS ====================
      getWindow: (windowId) => {
        return get().windows[windowId];
      },

      getAllWindows: () => {
        return Object.values(get().windows);
      },

      getFocusedWindow: () => {
        const state = get();
        return state.focusedWindowId ? state.windows[state.focusedWindowId] : undefined;
      },

      getTopWindow: () => {
        const windows = get().getAllWindows();
        if (windows.length === 0) return undefined;

        return windows.reduce((top, current) =>
          current.zIndex > top.zIndex ? current : top
        );
      }
    }),
    {
      name: 'window-manager-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);
