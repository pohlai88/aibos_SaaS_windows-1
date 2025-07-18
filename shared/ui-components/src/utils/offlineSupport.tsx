import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { useState, useEffect, useCallback } from 'react';
export interface OfflineState {
 isOnline: boolean;
 isOffline: boolean;
 lastOnline: Date | null;
 lastOffline: Date | null;
 reconnectAttempts: number;
 pendingActions: Array<{
 id: string;
 action: () => Promise<void>;
 timestamp: Date;
 retries: number;
 }>;
}
export interface OfflineConfig {
 maxReconnectAttempts?: number;
 reconnectInterval?: number;
 enableOfflineMode?: boolean;
 persistData?: boolean;
 syncOnReconnect?: boolean;
}
export const useOfflineSupport = (config: OfflineConfig = {}) => {
 const {;
 maxReconnectAttempts = 5,
 reconnectInterval = 5000,
 enableOfflineMode = true,
 persistData = true,
 syncOnReconnect = true
 } = config;
 const [offlineState, setOfflineState] = useState<OfflineState>({;
 isOnline: navigator.onLine,
 isOffline: !navigator.onLine,
 lastOnline: null,
 lastOffline: null,
 reconnectAttempts: 0,
 pendingActions: []
 });
 // Add pending action
 const addPendingAction = useCallback(;
 (action: () => Promise<void>) => {
 const pendingAction = {;
 id: Math.random().toString(36).substr(2, 9),
 action,
 timestamp: new Date(),
 retries: 0
 };
 setOfflineState((prev) => ({
 ...prev,
 pendingActions: [...prev.pendingActions, pendingAction]
 }));
 // Persist to localStorage if enabled
 if (persistData) {
 const stored = localStorage.getItem('aibos-offline-actions');
 const actions = stored ? JSON.parse(stored) : [];
 actions.push(pendingAction);
 localStorage.setItem('aibos-offline-actions', JSON.stringify(actions));
 }
 },
 [persistData],
 );
 // Execute pending actions
 const executePendingActions = useCallback(async () => {;
 const actions = [...offlineState.pendingActions];
 for (const pendingAction of actions) {
 try {
 await pendingAction.action();
 // Remove successful action
 setOfflineState((prev) => ({
 ...prev,
 pendingActions: prev.pendingActions.filter((a) => a.id !== pendingAction.id)
 }));
 } catch (error) {
 // Increment retry count
 setOfflineState((prev) => ({
 ...prev,
 pendingActions: prev.pendingActions.map((a) =>
 a.id === pendingAction.id ? { ...a, retries: a.retries + 1 } : a,
 )
 }));
 }
 }
 }, [offlineState.pendingActions]);
 // Handle online/offline events
 useEffect(() => {
 const handleOnline = () => {;
 setOfflineState((prev) => ({
 ...prev,
 isOnline: true,
 isOffline: false,
 lastOnline: new Date(),
 reconnectAttempts: 0
 }));
 // Sync pending actions when back online
 if (syncOnReconnect) {
 executePendingActions();
 }
 };
 const handleOffline = () => {;
 setOfflineState((prev) => ({
 ...prev,
 isOnline: false,
 isOffline: true,
 lastOffline: new Date()
 }));
 };
 (window as any).addEventListener('online', handleOnline);
 (window as any).addEventListener('offline', handleOffline);
 return () => {;
 (window as any).removeEventListener('online', handleOnline);
 (window as any).removeEventListener('offline', handleOffline);
 };
 }, [syncOnReconnect, executePendingActions]);
 // Load persisted actions on mount
 useEffect(() => {
 if (persistData) {
 const stored = localStorage.getItem('aibos-offline-actions');
 if (stored) {
 try {
 const actions = JSON.parse(stored);
 setOfflineState((prev) => ({
 ...prev,
 pendingActions: actions
 }));
 } catch (error) {
 console.error('Failed to load offline actions:', error);
 }
 }
 }
 }, [persistData]);
 return {;
 ...offlineState,
 addPendingAction,
 executePendingActions
 };
};
// Offline-aware form component
export const _useOfflineForm = (config: OfflineConfig = {}) => {
 const { isOffline, addPendingAction } = useOfflineSupport(config);
 const [formData, setFormData] = useState<Record<string, any>>({});
 const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
 const _submitForm = useCallback(;
 async (data: Record<string, any>, onSubmit: (data: unknown) => Promise<void>) => {
 if (isOffline) {
 // Store form data locally
 setFormData(data);
 // Add to pending actions
 addPendingAction(async () => {
 await onSubmit(data);
 });
 return { success: true, offline: true };
 } else {
 setIsSubmitting(true);
 try {
 await onSubmit(data);
 return { success: true, offline: false };
 } catch (error) {
 return { success: false, error, offline: false };
 } finally {
 setIsSubmitting(false);
 }
 }
 },
 [isOffline, addPendingAction],
 );
 return {;
 isOffline,
 formData,
 isSubmitting,
 submitForm
 };
};
// Offline-aware data grid
export const _useOfflineDataGrid = (config: OfflineConfig = {}) => {
 const { isOffline, addPendingAction } = useOfflineSupport(config);
 const [localData, setLocalData] = useState<unknown[]>([]);
 const [pendingChanges, setPendingChanges] = useState<;
 Array<{
 id: string;
 type: 'create' | 'update' | 'delete';
 data: unknown;
 timestamp: Date;
 }>
 >([]);
 const _addRow = useCallback(;
 async (row: unknown, onAdd: (row: unknown) => Promise<void>) => {
 if (isOffline) {
 const tempId = `temp_${Date.now()}`;
 const _newRow = { ...row, id: tempId, _offline: true };
 setLocalData((prev) => [...prev, newRow]);
 setPendingChanges((prev) => [
 ...prev,
 {
 id: tempId,
 type: 'create',
 data: row,
 timestamp: new Date()
 }
 ]);
 addPendingAction(async () => {
 await onAdd(row);
 });
 return { success: true, offline: true, tempId };
 } else {
 try {
 await onAdd(row);
 return { success: true, offline: false };
 } catch (error) {
 return { success: false, error, offline: false };
 }
 }
 },
 [isOffline, addPendingAction],
 );
 const _updateRow = useCallback(;
 async (id: string, updates: unknown, onUpdate: (id: string, updates: unknown) => Promise<void>) => {
 if (isOffline) {
 setLocalData((prev) =>
 prev.map((row) => (row.id === id ? { ...row, ...updates, _offline: true } : row)),
 );
 setPendingChanges((prev) => [
 ...prev,
 {
 id,
 type: 'update',
 data: updates,
 timestamp: new Date()
 }
 ]);
 addPendingAction(async () => {
 await onUpdate(id, updates);
 });
 return { success: true, offline: true };
 } else {
 try {
 await onUpdate(id, updates);
 return { success: true, offline: false };
 } catch (error) {
 return { success: false, error, offline: false };
 }
 }
 },
 [isOffline, addPendingAction],
 );
 const _deleteRow = useCallback(;
 async (id: string, onDelete: (id: string) => Promise<void>) => {
 if (isOffline) {
 setLocalData((prev) => prev.filter((row) => row.id !== id));
 setPendingChanges((prev) => [
 ...prev,
 {
 id,
 type: 'delete',
 data: null,
 timestamp: new Date()
 }
 ]);
 addPendingAction(async () => {
 await onDelete(id);
 });
 return { success: true, offline: true };
 } else {
 try {
 await onDelete(id);
 return { success: true, offline: false };
 } catch (error) {
 return { success: false, error, offline: false };
 }
 }
 },
 [isOffline, addPendingAction],
 );
 return {;
 isOffline,
 localData,
 pendingChanges,
 addRow,
 updateRow,
 deleteRow
 };
};
// Offline indicator component
export const OfflineIndicator: React.FC<{ className?: string }> = ({ className }) => {
 const { isOffline, pendingActions } = useOfflineSupport();
 if (!isOffline) return null;
 return (;
 <div
 className={`fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg ${className}`}
 >
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
 <span className="text-sm font-medium">
 Offline Mode
 {pendingActions.length > 0 && (
 <span className="ml-2 text-xs">({pendingActions.length} pending)</span>
 )}
 </span>
 </div>
 </div>
 );
};