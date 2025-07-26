'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe, Play, Pause, RotateCcw, Plus, Minus, Settings, X } from 'lucide-react';

// ==================== TYPES ====================

interface TimeZone {
  id: string;
  name: string;
  offset: number;
  city: string;
  country: string;
}

interface Timer {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  isCompleted: boolean;
}

// ==================== CONSTANTS ====================

const TIME_ZONES: TimeZone[] = [
  { id: 'utc', name: 'UTC', offset: 0, city: 'London', country: 'UK' },
  { id: 'est', name: 'EST', offset: -5, city: 'New York', country: 'USA' },
  { id: 'pst', name: 'PST', offset: -8, city: 'Los Angeles', country: 'USA' },
  { id: 'cet', name: 'CET', offset: 1, city: 'Paris', country: 'France' },
  { id: 'jst', name: 'JST', offset: 9, city: 'Tokyo', country: 'Japan' },
  { id: 'aest', name: 'AEST', offset: 10, city: 'Sydney', country: 'Australia' },
  { id: 'ist', name: 'IST', offset: 5.5, city: 'Mumbai', country: 'India' },
  { id: 'cst', name: 'CST', offset: 8, city: 'Beijing', country: 'China' }
];

// ==================== CLOCK APP ====================

const ClockApp: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZone>(TIME_ZONES[0]);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);
  const [activeTab, setActiveTab] = useState<'clock' | 'stopwatch' | 'timer' | 'world'>('clock');

  // ==================== TIME UPDATES ====================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==================== STOPWATCH ====================

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const handleStopwatchStart = useCallback(() => {
    setIsStopwatchRunning(true);
  }, []);

  const handleStopwatchPause = useCallback(() => {
    setIsStopwatchRunning(false);
  }, []);

  const handleStopwatchReset = useCallback(() => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
  }, []);

  // ==================== TIMER MANAGEMENT ====================

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (timer.isRunning && timer.remaining > 0) {
          const newRemaining = timer.remaining - 1000;
          if (newRemaining <= 0) {
            // Timer completed
            return { ...timer, remaining: 0, isRunning: false, isCompleted: true };
          }
          return { ...timer, remaining: newRemaining };
        }
        return timer;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTimer = useCallback(() => {
    if (newTimerName.trim() && newTimerMinutes > 0) {
      const newTimer: Timer = {
        id: `timer-${Date.now()}`,
        name: newTimerName,
        duration: newTimerMinutes * 60 * 1000,
        remaining: newTimerMinutes * 60 * 1000,
        isRunning: false,
        isCompleted: false
      };
      setTimers(prev => [...prev, newTimer]);
      setNewTimerName('');
      setNewTimerMinutes(5);
    }
  }, [newTimerName, newTimerMinutes]);

  const toggleTimer = useCallback((timerId: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === timerId ? { ...timer, isRunning: !timer.isRunning } : timer
    ));
  }, []);

  const resetTimer = useCallback((timerId: string) => {
    setTimers(prev => prev.map(timer =>
      timer.id === timerId
        ? { ...timer, remaining: timer.duration, isRunning: false, isCompleted: false }
        : timer
    ));
  }, []);

  const removeTimer = useCallback((timerId: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== timerId));
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  const formatTime = (date: Date, timeZone: TimeZone) => {
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (timeZone.offset * 3600000));

    return targetTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatStopwatch = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const centiseconds = Math.floor((milliseconds % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatTimer = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clock & Time</h1>
        <div className="flex items-center space-x-2">
          <Clock className="text-blue-600" size={24} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
        {[
          { id: 'clock', label: 'Clock', icon: Clock },
          { id: 'world', label: 'World', icon: Globe },
          { id: 'stopwatch', label: 'Stopwatch', icon: Play },
          { id: 'timer', label: 'Timer', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Clock Tab */}
          {activeTab === 'clock' && (
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-6xl font-light text-gray-800 mb-4">
                  {formatTime(currentTime, selectedTimeZone)}
                </div>
                <div className="text-xl text-gray-600 mb-6">
                  {selectedTimeZone.city}, {selectedTimeZone.country}
                </div>
                <div className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          )}

          {/* World Clock Tab */}
          {activeTab === 'world' && (
            <div className="grid grid-cols-2 gap-4">
              {TIME_ZONES.map((timeZone) => (
                <motion.div
                  key={timeZone.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg p-4 shadow-sm cursor-pointer"
                  onClick={() => setSelectedTimeZone(timeZone)}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {formatTime(currentTime, timeZone)}
                    </div>
                    <div className="text-sm text-gray-600">{timeZone.city}</div>
                    <div className="text-xs text-gray-500">{timeZone.country}</div>
                    <div className="text-xs text-blue-500 mt-1">
                      {timeZone.offset >= 0 ? '+' : ''}{timeZone.offset}h
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stopwatch Tab */}
          {activeTab === 'stopwatch' && (
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-5xl font-mono text-gray-800 mb-8">
                  {formatStopwatch(stopwatchTime)}
                </div>
                <div className="flex justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStopwatchStart}
                    disabled={isStopwatchRunning}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    <Play size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStopwatchPause}
                    disabled={!isStopwatchRunning}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    <Pause size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStopwatchReset}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium"
                  >
                    <RotateCcw size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              {/* Add Timer Form */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Add New Timer</h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Timer name"
                    value={newTimerName}
                    onChange={(e) => setNewTimerName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setNewTimerMinutes(Math.max(1, newTimerMinutes - 1))}
                      className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{newTimerMinutes}m</span>
                    <button
                      onClick={() => setNewTimerMinutes(newTimerMinutes + 1)}
                      className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={addTimer}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Timer List */}
              <div className="space-y-3">
                {timers.map((timer) => (
                  <motion.div
                    key={timer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white rounded-lg p-4 shadow-sm ${
                      timer.isCompleted ? 'border-2 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-mono text-gray-800">
                            {formatTimer(timer.remaining)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{timer.name}</div>
                            <div className="text-sm text-gray-500">
                              {timer.isCompleted ? 'Completed' : timer.isRunning ? 'Running' : 'Paused'}
                            </div>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${((timer.duration - timer.remaining) / timer.duration) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleTimer(timer.id)}
                          disabled={timer.isCompleted}
                          className={`p-2 rounded-md ${
                            timer.isRunning
                              ? 'bg-yellow-500 text-white'
                              : 'bg-green-500 text-white'
                          } disabled:opacity-50`}
                        >
                          {timer.isRunning ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                          onClick={() => resetTimer(timer.id)}
                          className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => removeTimer(timer.id)}
                          className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ClockApp;
