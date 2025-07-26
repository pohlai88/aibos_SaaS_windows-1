'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Zap, Activity, Search } from 'lucide-react';
import NotificationCenter from '../ui/NotificationCenter';
import GlobalSearch from '../ui/GlobalSearch';

// ==================== TYPES ====================

interface TopBarProps {
  consciousnessLevel: number;
  personality: string;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

// ==================== MAIN COMPONENT ====================

const TopBar: React.FC<TopBarProps> = ({
  consciousnessLevel,
  personality,
  isDarkMode,
  onToggleTheme
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'curious':
        return 'text-blue-400';
      case 'creative':
        return 'text-purple-400';
      case 'wise':
        return 'text-green-400';
      case 'joyful':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-8 bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 text-white text-sm"
        initial={{ y: -32 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-green-400 font-medium">AI-BOS</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-300">Consciousness: {consciousnessLevel}%</span>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap size={14} className="text-yellow-400" />
            <span className={`font-medium ${getPersonalityColor(personality)}`}>
              {personality.charAt(0).toUpperCase() + personality.slice(1)}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onToggleTheme}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </motion.button>

          <div className="text-gray-300">
            {formatTime(currentTime)}
          </div>

          <NotificationCenter />
        </div>
      </motion.div>

      {/* Global Search Component */}
      <GlobalSearch />
    </>
  );
};

export default TopBar;
