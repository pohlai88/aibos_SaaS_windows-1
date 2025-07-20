'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icon imports will be handled by existing icon system
import { useSystemCore } from './SystemCore';
import { useStateManager } from './StateManager';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppLauncherModal } from './AppLauncherModal';
import { SmartSuggestions } from './SmartSuggestions';
import { useToastActions } from '@/components/ui/Toast';
import { suggestionRegistry, registerSuggestionManifest } from './SuggestionRegistry';
import { usageHeatmapTracker, startHeatmapTracking, recordUsageEvent } from './UsageHeatmap';
import { autoExecuteManager, initializeAutoExecute, registerAutoExecuteAction } from './AutoExecute';
import { aiTipsGenerator, initializeAITips, generateAITips } from './AITipsGenerator';
import { feedbackLoopManager, initializeFeedbackLoop, recordFeedback } from './FeedbackLoop';

// ==================== TYPES ====================
interface DesktopIcon {
  id: string;
  appId: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  isSelected: boolean;
  isDragging: boolean;
  isInFolder?: boolean;
  folderId?: string;
  metadata: {
    lastAccessed: Date;
    created: Date;
    size: number;
  };
}

interface DesktopFolder {
  id: string;
  name: string;
  icon: string;
  position: { x: number; y: number };
  isSelected: boolean;
  isDragging: boolean;
  isOpen: boolean;
  icons: string[]; // Array of icon IDs
  metadata: {
    created: Date;
    lastAccessed: Date;
  };
}

interface Widget {
  id: string;
  type: 'clock' | 'weather' | 'system-stats' | 'quick-actions';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isVisible: boolean;
  config: Record<string, any>;
}

interface DesktopSettings {
  wallpaper: string;
  iconSize: 'small' | 'medium' | 'large';
  showWidgets: boolean;
  gridSnap: boolean;
  autoArrange: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface DesktopViewProps {
  className?: string;
  onIconClick?: (icon: DesktopIcon) => void;
  onIconDoubleClick?: (icon: DesktopIcon) => void;
  onIconDrag?: (icon: DesktopIcon, position: { x: number; y: number }) => void;
  onBackgroundClick?: () => void;
}

// ==================== CONSTANTS ====================
const GRID_SIZE = 80;
const ICON_SIZES = {
  small: 48,
  medium: 64,
  large: 80
};

const DEFAULT_WALLPAPERS = [
  '/wallpapers/ai-bos-gradient.jpg',
  '/wallpapers/geometric-pattern.jpg',
  '/wallpapers/minimal-abstract.jpg',
  '/wallpapers/tech-circuit.jpg'
];

const SAMPLE_APPS = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊' },
  { id: 'tenants', name: 'Tenants', icon: '🏢' },
  { id: 'modules', name: 'Modules', icon: '📦' },
  { id: 'analytics', name: 'Analytics', icon: '📈' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
  { id: 'help', name: 'Help', icon: '❓' }
];

// ==================== COMPONENTS ====================
interface DesktopIconProps {
  icon: DesktopIcon;
  size: number;
  onSelect: (icon: DesktopIcon) => void;
  onDoubleClick: (icon: DesktopIcon) => void;
  onDragStart: (icon: DesktopIcon) => void;
  onDragEnd: (icon: DesktopIcon) => void;
}

const DesktopIconComponent: React.FC<DesktopIconProps> = ({
  icon,
  size,
  onSelect,
  onDoubleClick,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    onDragStart(icon);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      // Snap to grid
      const snappedPosition = {
        x: Math.round(newPosition.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(newPosition.y / GRID_SIZE) * GRID_SIZE
      };
      // Update icon position (this would be handled by parent)
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd(icon);
    }
  }, [isDragging, onDragEnd, icon]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      className={`absolute cursor-pointer select-none ${
        icon.isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      style={{
        left: icon.position.x,
        top: icon.position.y,
        width: size,
        height: size + 40, // Extra space for label
        zIndex: isDragging ? 1000 : 1
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isDragging ? 1.1 : 1,
        opacity: 1,
        x: isDragging ? -dragOffset.x / 2 : 0,
        y: isDragging ? -dragOffset.y / 2 : 0
      }}
      transition={{ duration: 0.2 }}
      onMouseDown={handleMouseDown}
      onClick={() => onSelect(icon)}
      onDoubleClick={() => onDoubleClick(icon)}
    >
      {/* Icon */}
      <div className="flex flex-col items-center">
        <motion.div
          className={`flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors ${
            isDragging ? 'shadow-2xl' : 'shadow-lg'
          }`}
          style={{ width: size, height: size }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-2xl">{icon.icon}</span>
        </motion.div>

        {/* Label */}
        <div className="mt-2 text-center">
          <p className="text-white text-sm font-medium drop-shadow-lg">
            {icon.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface ClockWidgetProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const ClockWidget: React.FC<ClockWidgetProps> = ({ position, size }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="absolute bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 text-white"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <div className="text-2xl font-bold">
          {time.toLocaleTimeString()}
        </div>
        <div className="text-sm opacity-80">
          {time.toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

interface SystemStatsWidgetProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const SystemStatsWidget: React.FC<SystemStatsWidgetProps> = ({ position, size }) => {
  const { getPerformanceMetrics } = useSystemCore();
  const [metrics, setMetrics] = useState(getPerformanceMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 5000);
    return () => clearInterval(interval);
  }, [getPerformanceMetrics]);

  return (
    <motion.div
      className="absolute bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 text-white"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <div className="text-sm font-semibold">System Stats</div>
        <div className="text-xs space-y-1">
          <div>Boot Time: {metrics.bootTime.toFixed(0)}ms</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>CPU: {metrics.cpuUsage.toFixed(1)}%</div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export const DesktopView: React.FC<DesktopViewProps> = ({
  className = '',
  onIconClick,
  onIconDoubleClick,
  onIconDrag,
  onBackgroundClick
}) => {
  // ==================== REVOLUTIONARY INTEGRATION ====================
  const { config, trackEvent } = useSystemCore();
  const { getActiveTenant, getWindowsByApp } = useStateManager();
  const { success, showToast } = useToastActions();
  const [sessionStartTime] = useState(Date.now());

  // Initialize all revolutionary systems
  useEffect(() => {
    // Initialize AI Tips Generator
    initializeAITips();

    // Initialize Feedback Loop
    initializeFeedbackLoop({
      enabled: true,
      autoCollect: true,
      minRatingThreshold: 3,
      feedbackPromptDelay: 5000,
      categories: ['all'],
      userSegments: ['all']
    });

    // Initialize Auto-Execute Manager
    initializeAutoExecute({
      userId: 'user-123',
      sessionId: `session-${Date.now()}`,
      userRole: 'admin',
      recentActions: [],
      systemState: {},
      preferences: {
        autoExecuteEnabled: true,
        confidenceThreshold: 0.8,
        maxActionsPerSession: 5,
        categories: ['all']
      }
    });

    // Start Usage Heatmap Tracking
    startHeatmapTracking();

    // Register sample suggestion manifest
    registerSuggestionManifest({
      id: 'desktop-suggestions-v1',
      appId: 'desktop',
      appName: 'Desktop View',
      version: '1.0.0',
      suggestions: [
        {
          id: 'organize-desktop',
          type: 'action',
          title: 'Organize Desktop',
          description: 'Automatically arrange icons in a clean grid layout',
          icon: '📱',
          priority: 'high',
          category: 'productivity',
          triggers: [{ type: 'user_action', event: 'desktop_cluttered' }],
          conditions: [{ type: 'system_state', condition: 'desktop_icons', value: 10, operator: 'greater_than' }],
          action: { type: 'execute', payload: { action: 'organize_desktop' } },
          confidence: 0.9,
          feedback: { helpful: 0, notHelpful: 0, totalResponses: 0 }
        },
        {
          id: 'create-folder',
          type: 'action',
          title: 'Create Folder',
          description: 'Group related apps together in a new folder',
          icon: '📁',
          priority: 'medium',
          category: 'organization',
          triggers: [{ type: 'user_action', event: 'multiple_apps_selected' }],
          conditions: [{ type: 'system_state', condition: 'selected_icons', value: 2, operator: 'greater_than' }],
          action: { type: 'execute', payload: { action: 'create_folder_from_selection' } },
          confidence: 0.85,
          feedback: { helpful: 0, notHelpful: 0, totalResponses: 0 }
        }
      ],
      permissions: ['desktop_modify'],
      metadata: {
        description: 'Desktop organization suggestions',
        author: 'AI-BOS System',
        category: 'productivity',
        tags: ['desktop', 'organization', 'productivity']
      }
    });

    // Register auto-execute actions
    registerAutoExecuteAction({
      id: 'auto-organize-desktop',
      type: 'optimization',
      title: 'Auto-Organize Desktop',
      description: 'Automatically arrange desktop icons for better organization',
      confidence: 0.9,
      estimatedTime: 2000,
      impact: 'medium',
      category: 'productivity',
      action: async () => {
        // Auto-organize logic would go here
        console.log('🤖 Auto-organizing desktop...');
        return { success: true, message: 'Desktop organized automatically' };
      },
      undo: async () => {
        console.log('🤖 Undoing desktop organization...');
        return { success: true, message: 'Desktop organization undone' };
      },
      requirements: ['user_authenticated', 'desktop_access'],
      risks: ['May change icon positions'],
      benefits: ['Cleaner workspace', 'Better organization']
    });

    console.log('🚀 Revolutionary systems initialized in DesktopView!');
  }, []);

  // Track usage events
  const trackUsage = useCallback((event: string, metadata?: any) => {
    recordUsageEvent({
      type: 'action',
      target: event,
      metadata: metadata || {},
      userId: 'user-123',
      sessionId: `session-${Date.now()}`
    });
  }, []);

  // Generate AI tips based on user behavior
  const generateTips = useCallback(async () => {
    try {
      const tips = await generateAITips({
        context: {
          userId: 'user-123',
          role: 'admin',
          recentActions: ['app_launch', 'folder_create'],
          usagePatterns: ['desktop_organization'],
          preferences: {},
          systemState: { desktop_icons: icons.length },
          sessionDuration: Date.now() - sessionStartTime,
          featureUsage: { desktop: 1, folders: 1 }
        },
        limit: 3,
        minRelevance: 0.7
      });

      if (tips.tips.length > 0) {
        showToast({
          title: '💡 AI Tip',
          message: tips.tips[0].title,
          type: 'info',
          duration: 8000
        });
      }
    } catch (error) {
      console.error('Failed to generate AI tips:', error);
    }
  }, [sessionStartTime, showToast]);

  // Record feedback for suggestions
  const recordSuggestionFeedback = useCallback((suggestionId: string, wasHelpful: boolean) => {
    recordFeedback({
      suggestionId,
      userId: 'user-123',
      feedback: wasHelpful ? 'helpful' : 'not_helpful',
      context: {
        userRole: 'admin',
        sessionDuration: Date.now() - sessionStartTime,
        recentActions: ['suggestion_feedback'],
        systemState: { desktop_icons: icons.length }
      },
      metadata: {
        source: 'inline',
        category: 'productivity',
        confidence: 0.8
      }
    });
  }, [sessionStartTime]);

  const [icons, setIcons] = useState<DesktopIcon[]>([]);
  const [folders, setFolders] = useState<DesktopFolder[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [settings, setSettings] = useState<DesktopSettings>({
    wallpaper: DEFAULT_WALLPAPERS[0],
    iconSize: 'medium',
    showWidgets: true,
    gridSnap: true,
    autoArrange: false,
    theme: 'auto'
  });

  // Load saved icon positions and folders from localStorage
  useEffect(() => {
    const savedIcons = localStorage.getItem('aibos-desktop-icons');
    const savedFolders = localStorage.getItem('aibos-desktop-folders');

    if (savedIcons) {
      try {
        const parsedIcons = JSON.parse(savedIcons);
        setIcons(parsedIcons);
        trackEvent('desktop_icons_loaded_from_storage', { count: parsedIcons.length });
      } catch (error) {
        console.warn('Failed to load saved icon positions:', error);
      }
    }

    if (savedFolders) {
      try {
        const parsedFolders = JSON.parse(savedFolders);
        setFolders(parsedFolders);
        trackEvent('desktop_folders_loaded_from_storage', { count: parsedFolders.length });
      } catch (error) {
        console.warn('Failed to load saved folders:', error);
      }
    }
  }, [trackEvent]);

  // Save icon positions and folders to localStorage whenever they change
  useEffect(() => {
    if (icons.length > 0) {
      localStorage.setItem('aibos-desktop-icons', JSON.stringify(icons));
    }
    if (folders.length > 0) {
      localStorage.setItem('aibos-desktop-folders', JSON.stringify(folders));
    }
  }, [icons, folders]);

  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'clock',
      type: 'clock',
      position: { x: 20, y: 20 },
      size: { width: 120, height: 80 },
      isVisible: true,
      config: {}
    },
    {
      id: 'system-stats',
      type: 'system-stats',
      position: { x: 20, y: 120 },
      size: { width: 120, height: 100 },
      isVisible: true,
      config: {}
    }
  ]);

  const [isAppLauncherVisible, setIsAppLauncherVisible] = useState(false);
  const [isSmartSuggestionsVisible, setIsSmartSuggestionsVisible] = useState(false);

  const desktopRef = useRef<HTMLDivElement>(null);

  // Initialize desktop icons
  useEffect(() => {
    const initialIcons: DesktopIcon[] = SAMPLE_APPS.map((app, index) => ({
      id: `icon-${app.id}`,
      appId: app.id,
      name: app.name,
      icon: app.icon,
      position: {
        x: 50 + (index % 3) * 120,
        y: 100 + Math.floor(index / 3) * 120
      },
      isSelected: false,
      isDragging: false,
      metadata: {
        lastAccessed: new Date(),
        created: new Date(),
        size: 0
      }
    }));

    setIcons(initialIcons);
    trackEvent('desktop_initialized', { iconCount: initialIcons.length });
  }, [trackEvent]);

  // Handle icon selection
  const handleIconSelect = useCallback((icon: DesktopIcon) => {
    setSelectedIcon(icon.id);
    setIcons(prev => prev.map(i => ({
      ...i,
      isSelected: i.id === icon.id
    })));
    onIconClick?.(icon);
    trackEvent('desktop_icon_selected', { appId: icon.appId });
  }, [onIconClick, trackEvent]);

  // Handle icon double click
  const handleIconDoubleClick = useCallback((icon: DesktopIcon) => {
    onIconDoubleClick?.(icon);
    trackEvent('desktop_icon_launched', { appId: icon.appId });
    success('App Launched', `${icon.name} is now running`);
  }, [onIconDoubleClick, trackEvent, success]);

  // Handle icon drag
  const handleIconDragStart = useCallback((icon: DesktopIcon) => {
    setIcons(prev => prev.map(i => ({
      ...i,
      isDragging: i.id === icon.id
    })));
    trackEvent('desktop_icon_drag_started', { appId: icon.appId });
  }, [trackEvent]);

  const handleIconDragEnd = useCallback((icon: DesktopIcon, newPosition?: { x: number; y: number }) => {
    setIcons(prev => prev.map(i => {
      if (i.id === icon.id) {
        return {
          ...i,
          isDragging: false,
          position: newPosition || i.position
        };
      }
      return i;
    }));
    trackEvent('desktop_icon_drag_ended', {
      appId: icon.appId,
      newPosition: newPosition || icon.position
    });
  }, [trackEvent]);

  // Handle background click
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
      setIcons(prev => prev.map(i => ({ ...i, isSelected: false })));
      onBackgroundClick?.();
    }
  }, [onBackgroundClick]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIcon(null);
        setIcons(prev => prev.map(i => ({ ...i, isSelected: false })));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-arrange icons
    const autoArrangeIcons = useCallback(() => {
    const iconSize = ICON_SIZES[settings.iconSize];
    const spacing = 120;
    const iconsPerRow = Math.floor((window.innerWidth - 100) / spacing);

    const arrangedIcons = icons.map((icon, index) => ({
      ...icon,
      position: {
        x: 50 + (index % iconsPerRow) * spacing,
        y: 100 + Math.floor(index / iconsPerRow) * spacing
      }
    }));

    setIcons(arrangedIcons);
    trackEvent('desktop_icons_auto_arranged');
  }, [icons, settings.iconSize, trackEvent]);

  const createFolder = useCallback((name: string, position: { x: number; y: number }) => {
    const folderId = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newFolder: DesktopFolder = {
      id: folderId,
      name,
      icon: '📁',
      position,
      isSelected: false,
      isDragging: false,
      isOpen: false,
      icons: [],
      metadata: {
        created: new Date(),
        lastAccessed: new Date()
      }
    };

    setFolders(prev => [...prev, newFolder]);
    trackEvent('desktop_folder_created', { folderName: name });
    return folderId;
  }, [trackEvent]);

  const addIconToFolder = useCallback((iconId: string, folderId: string) => {
    setIcons(prev => prev.map(icon =>
      icon.id === iconId
        ? { ...icon, isInFolder: true, folderId }
        : icon
    ));

    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, icons: [...folder.icons, iconId] }
        : folder
    ));

    trackEvent('icon_added_to_folder', { iconId, folderId });
  }, [trackEvent]);

  const removeIconFromFolder = useCallback((iconId: string) => {
    setIcons(prev => prev.map(icon =>
      icon.id === iconId
        ? { ...icon, isInFolder: false, folderId: undefined }
        : icon
    ));

    setFolders(prev => prev.map(folder => ({
      ...folder,
      icons: folder.icons.filter(id => id !== iconId)
    })));

    trackEvent('icon_removed_from_folder', { iconId });
  }, [trackEvent]);

  // Context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // In a real implementation, this would show a context menu
    trackEvent('desktop_context_menu_opened');
  }, [trackEvent]);

  const iconSize = ICON_SIZES[settings.iconSize];
  const activeTenant = getActiveTenant();

  return (
    <div
      ref={desktopRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      onClick={handleBackgroundClick}
      onContextMenu={handleContextMenu}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${settings.wallpaper})`,
          backgroundSize: 'cover'
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />
      </div>

      {/* Desktop Icons */}
      <div className="relative z-10">
        <AnimatePresence>
          {icons.map((icon) => (
            <DesktopIconComponent
              key={icon.id}
              icon={icon}
              size={iconSize}
              onSelect={handleIconSelect}
              onDoubleClick={handleIconDoubleClick}
              onDragStart={handleIconDragStart}
              onDragEnd={handleIconDragEnd}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Widgets */}
      {settings.showWidgets && (
        <div className="relative z-20">
          <AnimatePresence>
            {widgets.map((widget) => {
              if (!widget.isVisible) return null;

              switch (widget.type) {
                case 'clock':
                  return (
                    <ClockWidget
                      key={widget.id}
                      position={widget.position}
                      size={widget.size}
                    />
                  );
                case 'system-stats':
                  return (
                    <SystemStatsWidget
                      key={widget.id}
                      position={widget.position}
                      size={widget.size}
                    />
                  );
                default:
                  return null;
              }
            })}
          </AnimatePresence>
        </div>
      )}

              {/* Empty State (when no icons) */}
        {icons.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <EmptyState
              icon="🖥️"
              title="Welcome to Your Desktop"
              description="Your desktop is ready! Add some apps to get started."
              actionLabel="Add Apps"
              onAction={() => {
                setIsAppLauncherVisible(true);
                trackEvent('desktop_empty_state_action');
              }}
              variant="info"
              size="lg"
            />
          </div>
        )}

      {/* Tenant Info */}
      {activeTenant && (
        <motion.div
          className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-3 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm font-semibold">{activeTenant.name}</div>
          <div className="text-xs opacity-80">Active Tenant</div>
        </motion.div>
      )}

              {/* Revolutionary Quick Actions */}
        <motion.div
          className="absolute top-4 right-4 flex space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => {
              setIsAppLauncherVisible(true);
              trackUsage('app_launcher_opened');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="App Store"
          >
            🚀
          </button>
          <button
            onClick={() => {
              autoArrangeIcons();
              trackUsage('auto_arrange_triggered');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="Auto Arrange"
          >
            📐
          </button>
          <button
            onClick={() => {
              setSettings(prev => ({ ...prev, showWidgets: !prev.showWidgets }));
              trackUsage('widgets_toggled');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="Toggle Widgets"
          >
            {settings.showWidgets ? '📊' : '📈'}
          </button>
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                theme: prev.theme === 'light' ? 'dark' : prev.theme === 'dark' ? 'auto' : 'light'
              }));
              trackUsage('theme_changed');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="Toggle Theme"
          >
            {settings.theme === 'light' ? '🌙' : settings.theme === 'dark' ? '🌅' : '🌓'}
          </button>
          <button
            onClick={() => {
              setIsSmartSuggestionsVisible(true);
              trackUsage('smart_suggestions_opened');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="AI Smart Suggestions"
          >
            🧠
          </button>
          <button
            onClick={() => {
              generateTips();
              trackUsage('ai_tips_generated');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="Generate AI Tips"
          >
            💡
          </button>
          <button
            onClick={() => {
              // Show auto-execute analytics
              const analytics = autoExecuteManager.getAnalytics();
              showToast({
                title: '🤖 Auto-Execute Analytics',
                message: `${analytics.totalExecutions} actions executed with ${Math.round(analytics.successRate * 100)}% success rate`,
                type: 'info',
                duration: 6000
              });
              trackUsage('auto_execute_analytics_viewed');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="Auto-Execute Analytics"
          >
            ⚡
          </button>
          <button
            onClick={() => {
              // Show usage heatmap analytics
              const analytics = usageHeatmapTracker.getAnalytics();
              showToast({
                title: '🔥 Usage Analytics',
                message: `${analytics.totalEvents} events tracked, ${analytics.recommendations.length} recommendations available`,
                type: 'info',
                duration: 6000
              });
              trackUsage('usage_analytics_viewed');
            }}
            className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            title="Usage Analytics"
          >
            📊
          </button>
        </motion.div>

        {/* App Launcher Modal */}
        <AppLauncherModal
          isVisible={isAppLauncherVisible}
          onClose={() => setIsAppLauncherVisible(false)}
          onInstall={(app) => {
            // Add the app to desktop icons
            const newIcon: DesktopIcon = {
              id: `icon-${app.id}`,
              appId: app.id,
              name: app.name,
              icon: app.icon,
              position: {
                x: 50 + (icons.length % 3) * 120,
                y: 100 + Math.floor(icons.length / 3) * 120
              },
              isSelected: false,
              isDragging: false,
              metadata: {
                lastAccessed: new Date(),
                created: new Date(),
                size: 0
              }
            };
            setIcons(prev => [...prev, newIcon]);
            setIsAppLauncherVisible(false);
            trackEvent('app_added_to_desktop', { appId: app.id, appName: app.name });
            success('App Installed', `${app.name} has been added to your desktop`);
          }}
        />

        {/* Smart Suggestions Modal */}
        <SmartSuggestions
          isVisible={isSmartSuggestionsVisible}
          onClose={() => setIsSmartSuggestionsVisible(false)}
          onAction={(suggestion) => {
            // Handle different suggestion types
            switch (suggestion.type) {
              case 'folder':
                const folderId = createFolder('Productivity', { x: 200, y: 200 });
                // Add some icons to the folder
                const dashboardIcon = icons.find(icon => icon.appId === 'dashboard');
                const settingsIcon = icons.find(icon => icon.appId === 'settings');
                if (dashboardIcon) addIconToFolder(dashboardIcon.id, folderId);
                if (settingsIcon) addIconToFolder(settingsIcon.id, folderId);
                break;
              case 'action':
                if (suggestion.id === 'suggest-arrange') {
                  autoArrangeIcons();
                }
                break;
              case 'app':
                if (suggestion.id === 'suggest-analytics') {
                  setIsAppLauncherVisible(true);
                }
                break;
            }
            setIsSmartSuggestionsVisible(false);
          }}
        />
    </div>
  );
};

export default DesktopView;
