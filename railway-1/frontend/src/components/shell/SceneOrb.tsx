'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SceneOrbProps {
  onClick: () => void;
}

export const SceneOrb: React.FC<SceneOrbProps> = ({ onClick }) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 shadow-xl rounded-full flex items-center justify-center text-white text-lg font-bold cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      🧠
    </motion.div>
  );
};
