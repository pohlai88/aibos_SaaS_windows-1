'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Clipboard, Scissors, Delete, FileText, Settings,
  Share, Download, Upload, Star, Edit, Eye,
  MoreHorizontal, ChevronRight, Check, Plus
} from 'lucide-react';

// ==================== TYPES ====================

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
  action?: () => void;
  type?: 'default' | 'danger' | 'primary';
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onItemClick?: (item: ContextMenuItem) => void;
}

// ==================== CONTEXT MENU ====================

const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  isOpen,
  position,
  onClose,
  onItemClick
}) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  // ==================== POSITIONING ====================

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Adjust horizontal position if menu would overflow
      if (rect.width + position.x > viewportWidth) {
        adjustedX = position.x - rect.width;
      }

      // Adjust vertical position if menu would overflow
      if (rect.height + position.y > viewportHeight) {
        adjustedY = position.y - rect.height;
      }

      // Ensure menu stays within viewport bounds
      adjustedX = Math.max(0, Math.min(adjustedX, viewportWidth - rect.width));
      adjustedY = Math.max(0, Math.min(adjustedY, viewportHeight - rect.height));

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [isOpen, position]);

  // ==================== KEYBOARD NAVIGATION ====================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => {
            const nextIndex = prev < items.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : items.length - 1;
            return nextIndex;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (activeIndex >= 0 && items[activeIndex]?.submenu) {
            setOpenSubmenu(items[activeIndex].id);
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeIndex >= 0 && items[activeIndex]) {
            handleItemClick(items[activeIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, items, activeIndex, onClose]);

  // ==================== CLICK OUTSIDE HANDLER ====================

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // ==================== SUBMENU POSITIONING ====================

  const handleSubmenuOpen = useCallback((item: ContextMenuItem, index: number) => {
    if (!item.submenu) return;

    setOpenSubmenu(item.id);
    setActiveIndex(index);

    // Calculate submenu position
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const itemElement = menuRef.current.children[index] as HTMLElement;
      if (itemElement) {
        const itemRect = itemElement.getBoundingClientRect();
        setSubmenuPosition({
          x: menuRect.right + 5,
          y: itemRect.top - menuRect.top
        });
      }
    }
  }, []);

  const handleSubmenuClose = useCallback(() => {
    setOpenSubmenu(null);
  }, []);

  // ==================== ITEM CLICK HANDLER ====================

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return;

    if (item.action) {
      item.action();
    }

    if (onItemClick) {
      onItemClick(item);
    }

    onClose();
  }, [onItemClick, onClose]);

  // ==================== RENDER ITEM ====================

  const renderItem = (item: ContextMenuItem, index: number) => {
    if (item.divider) {
      return (
        <div
          key={item.id}
          className="h-px bg-gray-200 my-1"
        />
      );
    }

    const isActive = activeIndex === index;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = openSubmenu === item.id;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`relative`}
      >
        <button
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700'
              : item.disabled
              ? 'text-gray-400 cursor-not-allowed'
              : item.type === 'danger'
              ? 'text-red-600 hover:bg-red-50'
              : item.type === 'primary'
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => {
            setActiveIndex(index);
            if (hasSubmenu && !isSubmenuOpen) {
              handleSubmenuOpen(item, index);
            }
          }}
          onMouseLeave={() => {
            if (hasSubmenu) {
              // Delay closing to allow moving to submenu
              setTimeout(() => {
                if (openSubmenu === item.id) {
                  handleSubmenuClose();
                }
              }, 100);
            }
          }}
          disabled={item.disabled}
        >
          <div className="flex items-center space-x-2">
            {item.icon && (
              <item.icon size={16} className="flex-shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.shortcut && (
              <span className="text-xs text-gray-400 font-mono">
                {item.shortcut}
              </span>
            )}
            {hasSubmenu && (
              <ChevronRight size={14} className="text-gray-400" />
            )}
          </div>
        </button>

        {/* Submenu */}
        {hasSubmenu && isSubmenuOpen && (
          <div
            ref={submenuRef}
            className="absolute left-full top-0 ml-1 z-50"
            style={{
              left: '100%',
              top: submenuPosition.y
            }}
            onMouseEnter={() => setOpenSubmenu(item.id)}
            onMouseLeave={handleSubmenuClose}
          >
            <ContextMenu
              items={item.submenu!}
              isOpen={true}
              position={{ x: 0, y: 0 }}
              onClose={handleSubmenuClose}
              onItemClick={onItemClick}
            />
          </div>
        )}
      </motion.div>
    );
  };

  // ==================== RENDER ====================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 min-w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          {items.map((item, index) => renderItem(item, index))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==================== CONTEXT MENU HOOK ====================

export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showContextMenu = useCallback((e: React.MouseEvent, items: ContextMenuItem[]) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  const hideContextMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    position,
    showContextMenu,
    hideContextMenu
  };
};

// ==================== PRESET MENUS ====================

export const getFileContextMenu = (onAction: (action: string) => void): ContextMenuItem[] => [
  {
    id: 'open',
    label: 'Open',
    icon: Eye,
    action: () => onAction('open')
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: Edit,
    action: () => onAction('edit')
  },
  { id: 'divider5', label: '', divider: true },
  {
    id: 'copy',
    label: 'Copy',
    icon: Copy,
    shortcut: 'Ctrl+C',
    action: () => onAction('copy')
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: Scissors,
    shortcut: 'Ctrl+X',
    action: () => onAction('cut')
  },
  {
    id: 'paste',
    label: 'Paste',
    icon: Clipboard,
    shortcut: 'Ctrl+V',
    action: () => onAction('paste')
  },
  { id: 'divider1', label: '', divider: true },
  {
    id: 'rename',
    label: 'Rename',
    icon: FileText,
    action: () => onAction('rename')
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: Settings,
    action: () => onAction('properties')
  },
  { id: 'divider7', label: '', divider: true },
  {
    id: 'share',
    label: 'Share',
    icon: Share,
    submenu: [
      {
        id: 'share-email',
        label: 'Email',
        action: () => onAction('share-email')
      },
      {
        id: 'share-link',
        label: 'Copy Link',
        action: () => onAction('share-link')
      }
    ]
  },
  {
    id: 'favorite',
    label: 'Add to Favorites',
    icon: Star,
    action: () => onAction('favorite')
  },
  { id: 'divider2', label: '', divider: true },
  {
    id: 'delete',
    label: 'Delete',
    icon: Delete,
    type: 'danger',
    action: () => onAction('delete')
  }
];

export const getWindowContextMenu = (onAction: (action: string) => void): ContextMenuItem[] => [
  {
    id: 'minimize',
    label: 'Minimize',
    action: () => onAction('minimize')
  },
  {
    id: 'maximize',
    label: 'Maximize',
    action: () => onAction('maximize')
  },
  { id: 'divider3', label: '', divider: true },
  {
    id: 'move',
    label: 'Move',
    action: () => onAction('move')
  },
  {
    id: 'resize',
    label: 'Resize',
    action: () => onAction('resize')
  },
  { id: 'divider4', label: '', divider: true },
  {
    id: 'close',
    label: 'Close',
    type: 'danger',
    action: () => onAction('close')
  }
];

export default ContextMenu;
