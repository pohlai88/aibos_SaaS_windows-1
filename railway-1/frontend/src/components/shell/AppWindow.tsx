'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/components/providers/AppProvider';
import { cn } from '@/lib/utils';
import RealtimeDemo from '../apps/RealtimeDemo';

interface Window {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isActive: boolean;
}

interface AppWindowProps {
  window: Window;
}

export function AppWindow({ window }: AppWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, setActiveWindow, updateWindowPosition, updateWindowSize } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      setActiveWindow(window.id);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !window.isMaximized) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      updateWindowPosition(window.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, window.isMaximized]);

  if (window.isMinimized) {
    return null;
  }

  const getAppContent = (appId: string) => {
    switch (appId) {
      case 'accounting':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Accounting Dashboard</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Revenue</h4>
                <p className="text-2xl font-bold text-blue-600">$45,230</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Expenses</h4>
                <p className="text-2xl font-bold text-green-600">$12,450</p>
              </div>
            </div>
          </div>
        );
      case 'tax':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tax Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Income</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Enter income" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Rate</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Enter tax rate %" />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Calculate Tax
              </button>
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Product A</span>
                <span className="font-medium">Qty: 150</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Product B</span>
                <span className="font-medium">Qty: 89</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Product C</span>
                <span className="font-medium">Qty: 234</span>
              </div>
            </div>
          </div>
        );
      case 'crm':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Relationship</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  JD
                </div>
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-gray-500">john@example.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  JS
                </div>
                <div>
                  <div className="font-medium">Jane Smith</div>
                  <div className="text-sm text-gray-500">jane@example.com</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'realtime':
        return (
          <div className="h-full">
            <RealtimeDemo />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{window.title}</h3>
            <p className="text-gray-600">App content will be loaded here...</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={windowRef}
      className={cn(
        'absolute window-shadow rounded-lg bg-white border border-gray-200 pointer-events-auto',
        window.isActive ? 'ring-2 ring-primary-500' : 'ring-1 ring-gray-300'
      )}
      style={{
        left: window.isMaximized ? 0 : window.position.x,
        top: window.isMaximized ? 0 : window.position.y,
        width: window.isMaximized ? '100%' : window.size.width,
        height: window.isMaximized ? '100%' : window.size.height,
        zIndex: window.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Window Header */}
      <div className="window-header flex items-center justify-between px-4 py-2 rounded-t-lg cursor-move">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{window.title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => minimizeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <button
            onClick={() => maximizeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          
          <button
            onClick={() => closeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-100 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="window-content flex-1 overflow-auto">
        {getAppContent(window.appId)}
      </div>
    </div>
  );
} 