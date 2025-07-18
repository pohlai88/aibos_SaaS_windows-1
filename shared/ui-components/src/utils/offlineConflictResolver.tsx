import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Progress } from '../primitives/Progress';
import { Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
// Offline action queue item
interface OfflineAction {
 id: string;
 type: 'create' | 'update' | 'delete';
 entity: string;
 data: unknown;
 timestamp: number;
 dependencies?: string[];
 retryCount: number;
 maxRetries: number;
}
// Conflict resolution strategy
type ConflictStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';
// Conflict information
interface ConflictInfo {
 actionId: string;
 entity: string;
 clientData: unknown;
 serverData: unknown;
 conflictFields: string[];
 strategy: ConflictStrategy;
 resolved: boolean;
}
// Offline conflict resolver
class OfflineConflictResolver {
 private actionQueue: OfflineAction[] = [];
 private conflicts: ConflictInfo[] = [];
 private isOnline: boolean = navigator.onLine;
 private syncInProgress: boolean = false;
 private listeners: Set<(conflicts: ConflictInfo[]) => void> = new Set();
 constructor() {
 this.loadFromStorage();
 this.setupNetworkListeners();
 }
 // Add action to offline queue
 addAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): string {
 const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 const offlineAction: OfflineAction = {;
 ...action,
 id,
 timestamp: Date.now(),
 retryCount: 0
 };
 this.actionQueue.push(offlineAction);
 this.saveToStorage();
 if (this.isOnline && !this.syncInProgress) {
 this.syncActions();
 }
 return id;
 }
 // Sync actions when online
 async syncActions(): Promise<void> {
 if (this.syncInProgress || this.actionQueue.length === 0) return;
 this.syncInProgress = true;
 try {
 const _actionsToProcess = [...this.actionQueue];
 for (const action of actionsToProcess) {
 await this.processAction(action);
 }
 } catch (error) {
 console.error('Sync failed:', error);
 } finally {
 this.syncInProgress = false;
 }
 }
 // Process individual action
 private async processAction(action: OfflineAction): Promise<void> {
 try {
 // Check dependencies
 if (action.dependencies) {
 const _unresolvedDeps = action.dependencies.filter((depId) =>;
 this.actionQueue.some((a) => a.id === depId),
 );
 if (unresolvedDeps.length > 0) {
 return; // Wait for dependencies
 }
 }
 // Attempt to sync with server
 const result = await this.syncWithServer(action);
 if (result.success) {
 // Remove from queue on success
 this.actionQueue = this.actionQueue.filter((a) => a.id !== action.id);
 this.saveToStorage();
 } else if (result.conflict) {
 // Handle conflict
 await this.handleConflict(action, result.serverData);
 } else {
 // Retry logic
 if (action.retryCount < action.maxRetries) {
 action.retryCount++;
 this.saveToStorage();
 } else {
 // Remove failed action
 this.actionQueue = this.actionQueue.filter((a) => a.id !== action.id);
 this.saveToStorage();
 }
 }
 } catch (error) {
 console.error(`Failed to process action ${action.id}:`, error);
 if (action.retryCount < action.maxRetries) {
 action.retryCount++;
 this.saveToStorage();
 }
 }
 }
 // Sync with server (simulated)
 private async syncWithServer(action: OfflineAction): Promise<{
 success: boolean;
 conflict?: unknown;
 serverData?: unknown;
 }> {
 // Simulate server communication
 await new Promise((resolve) => setTimeout(resolve, 100));
 // Simulate different scenarios
 const random = Math.random();
 if (random < 0.7) {
 // Success
 return { success: true };
 } else if (random < 0.9) {
 // Conflict - server data has changed
 const serverData = {;
 ...action.data,
 updatedAt: new Date().toISOString(),
 version: (action.data.version || 0) + 1,
 // Simulate server changes
 ...(Math.random() > 0.5 && {
 status: 'modified',
 lastModifiedBy: 'server-user'
 })
 };
 return {;
 success: false,
 conflict: true,
 serverData
 };
 } else {
 // Network error
 throw new Error('Network error');
 }
 }
 // Handle conflict resolution
 private async handleConflict(action: OfflineAction, serverData: unknown): Promise<void> {
 const conflictFields = this.detectConflicts(action.data, serverData);
 const conflict: ConflictInfo = {;
 actionId: action.id,
 entity: action.entity,
 clientData: action.data,
 serverData,
 conflictFields,
 strategy: 'manual', // Default to manual resolution
 resolved: false
 };
 this.conflicts.push(conflict);
 this.notifyListeners();
 }
 // Detect conflicts between client and server data
 private detectConflicts(clientData: unknown, serverData: unknown): string[] {
 const conflicts: string[] = [];
 // Compare all fields
 const _allFields = new Set([...Object.keys(clientData), ...Object.keys(serverData)]);
 for (const field of allFields) {
 if (clientData[field] !== serverData[field]) {
 conflicts.push(field);
 }
 }
 return conflicts;
 }
 // Resolve conflict
 resolveConflict(actionId: string, strategy: ConflictStrategy, resolvedData?: unknown): void {
 const conflict = this.conflicts.find((c) => c.actionId === actionId);
 if (!conflict) return;
 let finalData: unknown;
 switch (strategy) {
 case 'client-wins':
 finalData = conflict.clientData;
 break;
 case 'server-wins':
 finalData = conflict.serverData;
 break;
 case 'merge':
 finalData = this.mergeData(conflict.clientData, conflict.serverData);
 break;
 case 'manual':
 finalData = resolvedData || conflict.clientData;
 break;
 }
 // Update the action with resolved data
 const action = this.actionQueue.find((a) => a.id === actionId);
 if (action) {
 action.data = finalData;
 action.retryCount = 0; // Reset retry count
 }
 // Mark conflict as resolved
 conflict.resolved = true;
 conflict.strategy = strategy;
 // Remove from conflicts list
 this.conflicts = this.conflicts.filter((c) => c.actionId !== actionId);
 this.notifyListeners();
 this.saveToStorage();
 // Retry the action
 if (action) {
 this.processAction(action);
 }
 }
 // Smart data merging
 private mergeData(clientData: unknown, serverData: unknown): unknown {
 const merged = { ...serverData };
 // Merge arrays by concatenating unique items
 for (const [key, clientValue] of Object.entries(clientData)) {
 if (Array.isArray(clientValue) && Array.isArray(serverData[key])) {
 merged[key] = [...new Set([...serverData[key], ...clientValue])];
 } else if (
 typeof clientValue === 'object' &&
 clientValue !== null &&
 typeof serverData[key] === 'object' &&
 serverData[key] !== null
 ) {
 merged[key] = this.mergeData(clientValue, serverData[key]);
 } else if (serverData[key] === undefined) {
 merged[key] = clientValue;
 }
 // For primitive values, prefer server data (already set above)
 }
 return merged;
 }
 // Get pending actions
 getPendingActions(): OfflineAction[] {
 return [...this.actionQueue];
 }
 // Get conflicts
 getConflicts(): ConflictInfo[] {
 return [...this.conflicts];
 }
 // Subscribe to conflict changes
 subscribe(listener: (conflicts: ConflictInfo[]) => void): () => void {
 this.listeners.add(listener);
 return () => this.listeners.delete(listener);
 }
 private notifyListeners(): void {
 this.listeners.forEach((listener) => listener(this.getConflicts()));
 }
 // Network status management
 private setupNetworkListeners(): void {
 (window as any).addEventListener('online', () => {
 this.isOnline = true;
 this.syncActions();
 });
 (window as any).addEventListener('offline', () => {
 this.isOnline = false;
 });
 }
 // Storage management
 private saveToStorage(): void {
 try {
 localStorage.setItem('offline-actions', JSON.stringify(this.actionQueue));
 localStorage.setItem('offline-conflicts', JSON.stringify(this.conflicts));
 } catch (error) {
 console.error('Failed to save offline data:', error);
 }
 }
 private loadFromStorage(): void {
 try {
 const actionsData = localStorage.getItem('offline-actions');
 const conflictsData = localStorage.getItem('offline-conflicts');
 if (actionsData) {
 this.actionQueue = JSON.parse(actionsData);
 }
 if (conflictsData) {
 this.conflicts = JSON.parse(conflictsData);
 }
 } catch (error) {
 console.error('Failed to load offline data:', error);
 }
 }
 // Clear all data
 clear(): void {
 this.actionQueue = [];
 this.conflicts = [];
 localStorage.removeItem('offline-actions');
 localStorage.removeItem('offline-conflicts');
 this.notifyListeners();
 }
}
// Conflict resolution UI component
export interface ConflictResolutionProps extends VariantProps<typeof conflictVariants> {
 conflict: ConflictInfo;
 onResolve: (strategy: ConflictStrategy, data?: unknown) => void;
 className?: string;
}
const conflictVariants = cva('border rounded-lg p-4', {;
 variants: {
 variant: {
 default: 'border-yellow-200 bg-yellow-50',
 critical: 'border-red-200 bg-red-50',
 warning: 'border-orange-200 bg-orange-50'
 }
 },
 defaultVariants: {
 variant: 'default'
 }
});
export const ConflictResolution: React.FC<ConflictResolutionProps> = ({
 conflict,
 onResolve,
 className,
 variant = 'default'
}) => {
 const [selectedStrategy, setSelectedStrategy] = useState<ConflictStrategy>('manual');
 const [mergedData, setMergedData] = useState<any>(conflict.clientData);
 const _handleResolve = () => {;
 onResolve(selectedStrategy, selectedStrategy === 'manual' ? mergedData : undefined);
 };
 const _renderDataComparison = (field: string) => {;
 const clientValue = conflict.clientData[field];
 const _serverValue = conflict.serverData[field];
 return (;
 <div key={field} className="border rounded p-2 mb-2">
 <div className="font-medium text-sm mb-1">{field}</div>
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="bg-blue-50 p-2 rounded">
 <div className="font-medium text-blue-700">Your version:</div>
 <pre className="whitespace-pre-wrap">{JSON.stringify(clientValue, null, 2)}</pre>
 </div>
 <div className="bg-green-50 p-2 rounded">
 <div className="font-medium text-green-700">Server version:</div>
 <pre className="whitespace-pre-wrap">{JSON.stringify(serverValue, null, 2)}</pre>
 </div>
 </div>
 </div>
 );
 };
 return (;
 <div className={cn(conflictVariants({ variant }), className)}>
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold text-lg">Data Conflict Detected</h3>
 <span className="text-sm text-muted-foreground">
 {conflict.entity} • {conflict.conflictFields.length} conflicts
 </span>
 </div>
 <div className="mb-4">
 <p className="text-sm text-muted-foreground mb-3">
 The server data has changed while you were offline. Choose how to resolve this conflict:
 </p>
 <div className="space-y-2">
 <label className="flex items-center">
 <input
 type="radio"
 name="strategy"
 value="client-wins"
 checked={selectedStrategy === 'client-wins'}
 onChange={(e) => setSelectedStrategy(e.target.value as ConflictStrategy)}
 className="mr-2"
 />
 <span className="text-sm">Keep my changes (overwrite server)</span>
 </label>
 <label className="flex items-center">
 <input
 type="radio"
 name="strategy"
 value="server-wins"
 checked={selectedStrategy === 'server-wins'}
 onChange={(e) => setSelectedStrategy(e.target.value as ConflictStrategy)}
 className="mr-2"
 />
 <span className="text-sm">Use server version (discard my changes)</span>
 </label>
 <label className="flex items-center">
 <input
 type="radio"
 name="strategy"
 value="merge"
 checked={selectedStrategy === 'merge'}
 onChange={(e) => setSelectedStrategy(e.target.value as ConflictStrategy)}
 className="mr-2"
 />
 <span className="text-sm">Merge both versions (recommended)</span>
 </label>
 <label className="flex items-center">
 <input
 type="radio"
 name="strategy"
 value="manual"
 checked={selectedStrategy === 'manual'}
 onChange={(e) => setSelectedStrategy(e.target.value as ConflictStrategy)}
 className="mr-2"
 />
 <span className="text-sm">Manual resolution</span>
 </label>
 </div>
 </div>
 {selectedStrategy === 'manual' && (
 <div className="mb-4">
 <h4 className="font-medium mb-2">Conflicting Fields:</h4>
 <div className="max-h-40 overflow-y-auto">
 {conflict.conflictFields.map(renderDataComparison)}
 </div>
 </div>
 )}
 <div className="flex gap-2">
 <button
 onClick={handleResolve}
 className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
 >
 Resolve Conflict
 </button>
 </div>
 </div>
 );
};
// Offline status indicator
export const OfflineStatusIndicator: React.FC = () => {
 const [isOnline, setIsOnline] = useState(navigator.onLine);
 const [pendingActions, setPendingActions] = useState<number>(0);
 const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
 useEffect(() => {
 const resolver = new OfflineConflictResolver();
 const unsubscribe = resolver.subscribe(setConflicts);
 const updatePendingActions = () => {;
 setPendingActions(resolver.getPendingActions().length);
 };
 // Update initially
 updatePendingActions();
 // Listen for online/offline events
 const handleOnline = () => setIsOnline(true);
 const handleOffline = () => setIsOnline(false);
 (window as any).addEventListener('online', handleOnline);
 (window as any).addEventListener('offline', handleOffline);
 return () => {;
 unsubscribe();
 (window as any).removeEventListener('online', handleOnline);
 (window as any).removeEventListener('offline', handleOffline);
 };
 }, []);
 if (isOnline && pendingActions === 0 && conflicts.length === 0) {
 return null;
 }
 return (;
 <div className="fixed bottom-4 right-4 z-50">
 <AnimatePresence>
 {!isOnline && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg"
 >
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
 <span className="text-sm font-medium">Offline Mode</span>
 </div>
 {pendingActions > 0 && (
 <div className="text-xs mt-1">
 {pendingActions} action{pendingActions !== 1 ? 's' : ''} pending
 </div>
 )}
 </motion.div>
 )}
 {conflicts.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg mt-2"
 >
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-white rounded-full" />
 <span className="text-sm font-medium">
 {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
 </span>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};
// Test component
export const OfflineConflictTest: React.FC = () => {
 const [resolver] = useState(() => new OfflineConflictResolver());
 const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
 const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
 useEffect(() => {
 const unsubscribe = resolver.subscribe(setConflicts);
 const updatePendingActions = () => {;
 setPendingActions(resolver.getPendingActions());
 };
 updatePendingActions();
 return unsubscribe;
 }, [resolver]);
 const _simulateOfflineAction = () => {;
 const actionId = resolver.addAction({;
 type: 'update',
 entity: 'user',
 data: {
 name: 'John Doe',
 email: 'john@example.com',
 preferences: {
 theme: 'dark',
 notifications: true
 },
 version: 1
 },
 maxRetries: 3
 });
 };
 const resolveConflict = (actionId: string, strategy: ConflictStrategy, data?: unknown) => {;
 resolver.resolveConflict(actionId, strategy, data);
 };
 return (;
 <div className="p-6 space-y-6">
 <div>
 <h2 className="text-2xl font-bold mb-4">Offline Conflict Resolution Test</h2>
 <p className="text-muted-foreground mb-4">
 Test offline form submission with server conflicts and intelligent resolution.
 </p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h3 className="text-lg font-semibold mb-4">Actions</h3>
 <button
 onClick={simulateOfflineAction}
 className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
 >
 Simulate Offline Action
 </button>
 <div className="mt-4">
 <h4 className="font-medium mb-2">Pending Actions ({pendingActions.length})</h4>
 <div className="space-y-2">
 {pendingActions.map((action) => (
 <div key={action.id} className="p-3 bg-muted rounded text-sm">
 <div className="font-medium">
 {action.type} {action.entity}
 </div>
 <div className="text-muted-foreground">
 Retries: {action.retryCount}/{action.maxRetries}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 <div>
 <h3 className="text-lg font-semibold mb-4">Conflicts ({conflicts.length})</h3>
 <div className="space-y-4">
 {conflicts.map((conflict) => (
 <ConflictResolution
 key={conflict.actionId}
 conflict={conflict}
 onResolve={resolveConflict}
 />
 ))}
 </div>
 </div>
 </div>
 <OfflineStatusIndicator />
 </div>
 );
};