// ==================== WINDOW MANAGEMENT EXPORTS ====================

// Main Window Component
export { default as Window } from './Window';

// Modular Window Components
export { default as WindowHeader } from './WindowHeader';
export { default as WindowControls } from './WindowControls';
export { default as WindowContent } from './WindowContent';
export { default as WindowFooter } from './WindowFooter';
export { default as WindowShell } from './WindowShell';
export { useWindowShell } from './WindowShell';

// Workspace Management
export { default as WorkspaceManager } from './WorkspaceManager';
export { useWorkspaceManager } from './WorkspaceManager';
export { default as WorkspaceExample } from './WorkspaceExample';

// AI-Powered Workspace Features
export { default as WorkspaceAIEngine } from './WorkspaceAIEngine';
export { useWorkspaceAI } from './WorkspaceAIEngine';
export { default as AIWorkspaceExample } from './AIWorkspaceExample';

// App Container System
export { default as AppContainer } from './AppContainer';
export { useAppContainer, AppRegistry, BackendIntegration } from './AppContainer';

// App Registry System
export { default as AppRegistryManager, AppLauncher } from '../apps/AppRegistry';

// Revolutionary Desktop Example
export { default as RevolutionaryDesktopExample } from './RevolutionaryDesktopExample';

// Window Management Store & Hooks
export { useWindowManager } from './WindowManagerStore';
export {
  useWindow,
  useWindowCreator,
  useWindowManagerState,
  useWindowDrag,
  useWindowPositioning,
  useWindowConstraints
} from './WindowManager.hooks';

// Window Management Types
export type {
  WindowState,
  WindowPosition,
  WindowSize,
  WindowManagerState,
  WindowActions,
  WindowManagerStore,
  WindowConstraints,
  WindowEvent,
  WindowAnimation
} from './WindowManager.types';
