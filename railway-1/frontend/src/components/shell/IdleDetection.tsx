'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemCore } from './SystemCore';

// ==================== TYPES ====================
interface IdleDetectionProps {
  idleTimeout?: number; // milliseconds
  onIdleStart?: () => void;
  onIdleEnd?: () => void;
  onSleep?: () => void;
  onWake?: () => void;
  className?: string;
}

interface IdleState {
  isIdle: boolean;
  isSleeping: boolean;
  idleStartTime: Date | null;
  lastActivity: Date;
  idleDuration: number; // milliseconds
}

// ==================== CONSTANTS ====================
const DEFAULT_IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const SLEEP_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus'
];

// ==================== COMPONENTS ====================
interface SleepOverlayProps {
  isVisible: boolean;
  onWake: () => void;
}

const SleepOverlay: React.FC<SleepOverlayProps> = ({ isVisible, onWake }) => {
  const [showWakePrompt, setShowWakePrompt] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show wake prompt after 2 seconds
      const timer = setTimeout(() => setShowWakePrompt(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowWakePrompt(false);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sleep Animation */}
          <div className="text-center">
            <motion.div
              className="text-8xl mb-8"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              😴
            </motion.div>

            <motion.h2
              className="text-2xl font-bold text-white mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              AI-BOS is sleeping
            </motion.h2>

            <motion.p
              className="text-white/80 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Move your mouse or press any key to wake up
            </motion.p>

            {/* Wake Prompt */}
            <AnimatePresence>
              {showWakePrompt && (
                <motion.button
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors border border-white/30"
                  onClick={onWake}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Wake Up AI-BOS
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==================== MAIN COMPONENT ====================
export const IdleDetection: React.FC<IdleDetectionProps> = ({
  idleTimeout = DEFAULT_IDLE_TIMEOUT,
  onIdleStart,
  onIdleEnd,
  onSleep,
  onWake,
  className = ''
}) => {
  const { trackEvent } = useSystemCore();
  const [idleState, setIdleState] = useState<IdleState>({
    isIdle: false,
    isSleeping: false,
    idleStartTime: null,
    lastActivity: new Date(),
    idleDuration: 0
  });

  // Activity detection
  const handleActivity = useCallback(() => {
    const now = new Date();
    const wasIdle = idleState.isIdle;
    const wasSleeping = idleState.isSleeping;

    setIdleState(prev => ({
      ...prev,
      isIdle: false,
      isSleeping: false,
      idleStartTime: null,
      lastActivity: now,
      idleDuration: 0
    }));

    // Track wake events
    if (wasSleeping) {
      onWake?.();
      trackEvent('system_wake', {
        idleDuration: idleState.idleDuration,
        totalIdleTime: now.getTime() - idleState.lastActivity.getTime()
      });
    } else if (wasIdle) {
      onIdleEnd?.();
      trackEvent('idle_end', {
        idleDuration: idleState.idleDuration
      });
    }
  }, [idleState, onWake, onIdleEnd, trackEvent]);

  // Set up activity listeners
  useEffect(() => {
    const handleEvent = () => handleActivity();

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleEvent, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleEvent);
      });
    };
  }, [handleActivity]);

  // Idle detection timer
  useEffect(() => {
    const checkIdle = () => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - idleState.lastActivity.getTime();
      const isCurrentlyIdle = timeSinceActivity > idleTimeout;
      const isCurrentlySleeping = timeSinceActivity > SLEEP_TIMEOUT;

      // Update idle state
      if (isCurrentlySleeping && !idleState.isSleeping) {
        setIdleState(prev => ({
          ...prev,
          isIdle: true,
          isSleeping: true,
          idleStartTime: prev.idleStartTime || now,
          idleDuration: timeSinceActivity
        }));
        onSleep?.();
        trackEvent('system_sleep', {
          idleDuration: timeSinceActivity,
          totalIdleTime: timeSinceActivity
        });
      } else if (isCurrentlyIdle && !idleState.isIdle) {
        setIdleState(prev => ({
          ...prev,
          isIdle: true,
          idleStartTime: now,
          idleDuration: timeSinceActivity
        }));
        onIdleStart?.();
        trackEvent('idle_start', {
          idleDuration: timeSinceActivity
        });
      } else if (idleState.isIdle) {
        setIdleState(prev => ({
          ...prev,
          idleDuration: timeSinceActivity
        }));
      }
    };

    const interval = setInterval(checkIdle, 1000); // Check every second
    return () => clearInterval(interval);
  }, [idleState, idleTimeout, onIdleStart, onSleep, trackEvent]);

  // Idle indicator (subtle visual feedback)
  const showIdleIndicator = idleState.isIdle && !idleState.isSleeping;

  return (
    <>
      {/* Idle Indicator */}
      <AnimatePresence>
        {showIdleIndicator && (
          <motion.div
            className={`fixed top-4 right-4 z-40 ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-yellow-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg border border-yellow-400/50">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-sm font-medium">
                  Idle ({Math.floor(idleState.idleDuration / 1000)}s)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleep Overlay */}
      <SleepOverlay
        isVisible={idleState.isSleeping}
        onWake={handleActivity}
      />
    </>
  );
};

// ==================== HOOK ====================
export const useIdleDetection = (timeout?: number) => {
  const [isIdle, setIsIdle] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  const handleIdleStart = useCallback(() => {
    setIsIdle(true);
  }, []);

  const handleIdleEnd = useCallback(() => {
    setIsIdle(false);
  }, []);

  const handleSleep = useCallback(() => {
    setIsSleeping(true);
  }, []);

  const handleWake = useCallback(() => {
    setIsIdle(false);
    setIsSleeping(false);
  }, []);

  return {
    isIdle,
    isSleeping,
    IdleDetection: (
      <IdleDetection
        idleTimeout={timeout}
        onIdleStart={handleIdleStart}
        onIdleEnd={handleIdleEnd}
        onSleep={handleSleep}
        onWake={handleWake}
      />
    )
  };
};
