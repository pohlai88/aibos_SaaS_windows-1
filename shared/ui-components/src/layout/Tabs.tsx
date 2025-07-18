import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  createContext,
  useContext,
} from 'react';
import type { ReactNode } from 'react';
import type { cva, type VariantProps  } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { Button } from '../primitives/Button';
import { Badge } from '../primitives/Badge';
import { Tooltip } from '../primitives/Tooltip';
import {
  X,
  Plus,
  MoreHorizontal,
  Settings,
  Clock,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Circle,
} from 'lucide-react';

const tabsVariants = cva('flex items-center border-b border-border', {
  variants: {
    variant: {
      default: '',
      pills: 'space-x-1 p-1 bg-muted rounded-lg',
      underline: 'border-b-2 border-border',
      cards: 'space-x-2',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const tabVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        pills:
          'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline: 'data-[state=active]:border-primary data-[state=active]:text-primary',
        cards:
          'data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:border-border',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  closable?: boolean;
  pinned?: boolean;
  aiFeatures?: {
    smartOrdering?: boolean;
    usageTracking?: boolean;
    contextAware?: boolean;
    autoClose?: boolean;
  };
  metadata?: {
    lastAccessed?: Date;
    accessCount?: number;
    category?: string;
    priority?: number;
  };
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabs: TabItem[];
  addTab: (tab: Omit<TabItem, 'id'>) => string;
  removeTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<TabItem>) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  aiFeatures: {
    smartOrdering: boolean;
    usageTracking: boolean;
    contextAware: boolean;
    autoClose: boolean;
  };
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};

export interface TabsProps extends VariantProps<typeof tabsVariants> {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  onTabAdd?: (tab: TabItem) => void;
  onTabRemove?: (tabId: string) => void;
  className?: string;
  contentClassName?: string;
  showAddButton?: boolean;
  showCloseButtons?: boolean;
  showMoreMenu?: boolean;
  draggable?: boolean;
  maxTabs?: number;
  aiFeatures?: {
    smartOrdering?: boolean;
    usageTracking?: boolean;
    contextAware?: boolean;
    autoClose?: boolean;
    usageAnalytics?: boolean;
  };
}

export const Tabs: React.FC<TabsProps> = ({
  tabs: initialTabs,
  defaultActiveTab,
  onTabChange,
  onTabAdd,
  onTabRemove,
  className,
  contentClassName,
  showAddButton = false,
  showCloseButtons = false,
  showMoreMenu = false,
  draggable = false,
  maxTabs = 10,
  aiFeatures = {},
  variant = 'default',
  size = 'md',
}) => {
  const [tabs, setTabs] = useState<TabItem[]>(initialTabs);
  const [activeTab, setActiveTab] = useState(defaultActiveTab || initialTabs[0]?.id || '');
  const [usageStats, setUsageStats] = useState<
    Record<string, { count: number; lastAccessed: Date }>
  >({});
  const [dragState, setDragState] = useState<{ isDragging: boolean; draggedId: string | null }>({
    isDragging: false,
    draggedId: null,
  });

  const tabsRef = useRef<HTMLDivElement>(null);

  // AI-powered smart ordering based on usage
  useEffect(() => {
    if (aiFeatures.smartOrdering && Object.keys(usageStats).length > 0) {
      const sortedTabs = [...tabs].sort((a, b) => {
        const aStats = usageStats[a.id];
        const bStats = usageStats[b.id];

        if (!aStats && !bStats) return 0;
        if (!aStats) return 1;
        if (!bStats) return -1;

        // Sort by access count, then by last accessed time
        if (aStats.count !== bStats.count) {
          return bStats.count - aStats.count;
        }
        return bStats.lastAccessed.getTime() - aStats.lastAccessed.getTime();
      });

      if (JSON.stringify(sortedTabs.map((t) => t.id)) !== JSON.stringify(tabs.map((t) => t.id))) {
        setTabs(sortedTabs);
      }
    }
  }, [usageStats, aiFeatures.smartOrdering, tabs]);

  // AI-powered auto-close for unused tabs
  useEffect(() => {
    if (aiFeatures.autoClose && tabs.length > maxTabs) {
      const unusedTabs = tabs
        .filter((tab) => !usageStats[tab.id] || usageStats[tab.id].count < 2)
        .slice(0, tabs.length - maxTabs);

      unusedTabs.forEach((tab) => {
        removeTab(tab.id);
      });
    }
  }, [tabs.length, maxTabs, aiFeatures.autoClose, usageStats]);

  const updateUsageStats = useCallback((tabId: string) => {
    setUsageStats((prev) => ({
      ...prev,
      [tabId]: {
        count: (prev[tabId]?.count || 0) + 1,
        lastAccessed: new Date(),
      },
    }));
  }, []);

  const handleTabClick = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);

      if (aiFeatures.usageTracking) {
        updateUsageStats(tabId);
      }
    },
    [onTabChange, aiFeatures.usageTracking, updateUsageStats],
  );

  const addTab = useCallback(
    (tab: Omit<TabItem, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newTab: TabItem = { ...tab, id };
      setTabs((prev) => [...prev, newTab]);
      onTabAdd?.(newTab);
      return id;
    },
    [onTabAdd],
  );

  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId);
        if (activeTab === tabId && newTabs.length > 0) {
          setActiveTab(newTabs[0].id);
          onTabChange?.(newTabs[0].id);
        }
        return newTabs;
      });
      onTabRemove?.(tabId);
    },
    [activeTab, onTabChange, onTabRemove],
  );

  const updateTab = useCallback((tabId: string, updates: Partial<TabItem>) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)));
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs((prev) => {
      const newTabs = [...prev];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  }, []);

  // Drag and drop functionality
  const handleDragStart = useCallback(
    (e: React.DragEvent, tabId: string) => {
      if (!draggable) return;
      setDragState({ isDragging: true, draggedId: tabId });
      e.dataTransfer.effectAllowed = 'move';
    },
    [draggable],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!draggable || !dragState.isDragging) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    },
    [draggable, dragState.isDragging],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, targetTabId: string) => {
      if (!draggable || !dragState.draggedId) return;
      e.preventDefault();

      const fromIndex = tabs.findIndex((tab) => tab.id === dragState.draggedId);
      const toIndex = tabs.findIndex((tab) => tab.id === targetTabId);

      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        reorderTabs(fromIndex, toIndex);
      }

      setDragState({ isDragging: false, draggedId: null });
    },
    [draggable, dragState.draggedId, tabs, reorderTabs],
  );

  const contextValue: TabsContextType = {
    activeTab,
    setActiveTab: handleTabClick,
    tabs,
    addTab,
    removeTab,
    updateTab,
    reorderTabs,
    aiFeatures: {
      smartOrdering: aiFeatures.smartOrdering || false,
      usageTracking: aiFeatures.usageTracking || false,
      contextAware: aiFeatures.contextAware || false,
      autoClose: aiFeatures.autoClose || false,
    },
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        {/* Tab Navigation */}
        <div className={cn(tabsVariants({ variant, size }))} ref={tabsRef}>
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                draggable={draggable}
                onDragStart={(e) => handleDragStart(e, tab.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, tab.id)}
                className={cn('relative', dragState.draggedId === tab.id && 'opacity-50')}
              >
                <button
                  className={cn(
                    tabVariants({ variant, size }),
                    'relative',
                    tab.disabled && 'opacity-50 cursor-not-allowed',
                  )}
                  data-state={activeTab === tab.id ? 'active' : 'inactive'}
                  onClick={() => !tab.disabled && handleTabClick(tab.id)}
                  disabled={tab.disabled}
                >
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {tab.badge}
                    </Badge>
                  )}
                  {tab.pinned && <Star className="ml-2 h-3 w-3 text-yellow-500" />}
                  {aiFeatures.usageAnalytics && usageStats[tab.id] && (
                    <Tooltip content={`Accessed ${usageStats[tab.id].count} times`}>
                      <TrendingUp className="ml-1 h-3 w-3 text-muted-foreground" />
                    </Tooltip>
                  )}
                </button>

                {showCloseButtons && tab.closable && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {showAddButton && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => addTab({ label: 'New Tab', content: <div>New Tab Content</div> })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {showMoreMenu && (
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}

            {aiFeatures.usageAnalytics && (
              <Tooltip content="AI Usage Analytics">
                <Button variant="ghost" size="icon-sm">
                  <Circle className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className={cn('mt-4', contentClassName)}>{activeTabContent}</div>
      </div>
    </TabsContext.Provider>
  );
};

// AI-Powered Tab Analytics Component
export const TabAnalytics: React.FC<{
  usageStats: Record<string, { count: number; lastAccessed: Date }>;
}> = ({ usageStats }) => {
  const sortedStats = Object.entries(usageStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="text-sm font-medium mb-3">Most Used Tabs</h3>
      <div className="space-y-2">
        {sortedStats.map(([tabId, stats]) => (
          <div key={tabId} className="flex items-center justify-between text-sm">
            <span className="truncate">{tabId}</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{stats.count} uses</span>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AI-Powered Tab Hook
export const useAITabs = (
  options: {
    smartOrdering?: boolean;
    usageTracking?: boolean;
    contextAware?: boolean;
    autoClose?: boolean;
    maxTabs?: number;
  } = {},
) => {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [usageStats, setUsageStats] = useState<
    Record<string, { count: number; lastAccessed: Date }>
  >({});

  const addTab = useCallback(
    (tab: Omit<TabItem, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newTab: TabItem = { ...tab, id };
      setTabs((prev) => [...prev, newTab]);
      if (!activeTab) setActiveTab(id);
      return id;
    },
    [activeTab],
  );

  const removeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const newTabs = prev.filter((tab) => tab.id !== tabId);
        if (activeTab === tabId && newTabs.length > 0) {
          setActiveTab(newTabs[0].id);
        }
        return newTabs;
      });
    },
    [activeTab],
  );

  const updateUsage = useCallback((tabId: string) => {
    setUsageStats((prev) => ({
      ...prev,
      [tabId]: {
        count: (prev[tabId]?.count || 0) + 1,
        lastAccessed: new Date(),
      },
    }));
  }, []);

  return {
    tabs,
    activeTab,
    usageStats,
    addTab,
    removeTab,
    setActiveTab: (id: string) => {
      setActiveTab(id);
      if (options.usageTracking) {
        updateUsage(id);
      }
    },
  };
};
