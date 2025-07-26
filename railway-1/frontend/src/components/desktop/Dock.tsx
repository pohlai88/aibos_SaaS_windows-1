'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DockItem } from './DesktopView';

// ==================== TYPES ====================

interface DockProps {
  items: DockItem[];
  onItemClick: (itemId: string) => void;
  isDarkMode: boolean;
}

// ==================== MAIN COMPONENT ====================

const Dock: React.FC<DockProps> = ({ items, onItemClick, isDarkMode }) => {
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center space-x-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
        {items.map((item) => (
          <DockItemComponent
            key={item.id}
            item={item}
            onClick={() => onItemClick(item.id)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ==================== DOCK ITEM COMPONENT ====================

interface DockItemComponentProps {
  item: DockItem;
  onClick: () => void;
  isDarkMode: boolean;
}

const DockItemComponent: React.FC<DockItemComponentProps> = ({
  item,
  onClick,
  isDarkMode
}) => {
  const Icon = item.icon;

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.2, y: -10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ y: 10 }}
        whileHover={{ y: 0 }}
      >
        {item.name}
        <div className="text-gray-400 text-xs">{item.description}</div>
      </motion.div>

      {/* Icon Container */}
      <motion.div
        className={`relative p-3 rounded-xl transition-colors ${
          item.isActive
            ? 'bg-purple-500/20 border border-purple-500/30'
            : 'bg-white/5 hover:bg-white/10'
        }`}
        animate={item.bounce ? {
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Icon
          size={24}
          className={`transition-colors ${
            item.isActive
              ? 'text-purple-400'
              : isDarkMode
                ? 'text-white/80 group-hover:text-white'
                : 'text-gray-700 group-hover:text-gray-900'
          }`}
        />

        {/* Active Indicator */}
        {item.isActive && (
          <motion.div
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dock;
