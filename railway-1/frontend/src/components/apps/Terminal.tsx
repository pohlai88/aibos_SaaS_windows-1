import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContainer } from '../shell/AppContainer';

// ==================== TYPES & INTERFACES ====================

interface Command {
  id: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  startTime: Date;
  endTime?: Date;
  exitCode?: number;
}

interface TerminalState {
  commands: Command[];
  currentCommand: string;
  commandHistory: string[];
  historyIndex: number;
  isExecuting: boolean;
  currentDirectory: string;
  environment: Record<string, string>;
  suggestions: string[];
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: Date;
  permissions: string;
}

// ==================== COMMAND SUGGESTIONS ====================

const COMMAND_SUGGESTIONS = {
  'ls': 'List directory contents',
  'cd': 'Change directory',
  'pwd': 'Print working directory',
  'mkdir': 'Create directory',
  'rm': 'Remove files or directories',
  'cp': 'Copy files or directories',
  'mv': 'Move or rename files',
  'cat': 'Display file contents',
  'echo': 'Display a line of text',
  'grep': 'Search for patterns in files',
  'find': 'Search for files',
  'chmod': 'Change file permissions',
  'ps': 'Show process status',
  'kill': 'Terminate processes',
  'top': 'Show system processes',
  'df': 'Show disk space usage',
  'du': 'Show directory space usage',
  'tar': 'Archive files',
  'git': 'Git version control',
  'npm': 'Node.js package manager',
  'node': 'Node.js runtime',
  'python': 'Python interpreter',
  'docker': 'Container management',
  'kubectl': 'Kubernetes management'
};

// ==================== MAIN COMPONENT ====================

const Terminal: React.FC = () => {
  const { instance, backend, saveData, loadData, sendMessage } = useAppContainer();

  const [state, setState] = useState<TerminalState>({
    commands: [],
    currentCommand: '',
    commandHistory: [],
    historyIndex: -1,
    isExecuting: false,
    currentDirectory: '/home/user',
    environment: {
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/home/user',
      USER: 'user',
      SHELL: '/bin/bash'
    },
    suggestions: []
  });

  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [fileSystemItems, setFileSystemItems] = useState<FileSystemItem[]>([]);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load terminal state
  useEffect(() => {
    const loadTerminalState = async () => {
      try {
        const data = await loadData();
        if (data) {
          setState(prev => ({
            ...prev,
            commands: data.commands || [],
            commandHistory: data.commandHistory || [],
            currentDirectory: data.currentDirectory || '/home/user',
            environment: data.environment || prev.environment
          }));
        }
      } catch (error) {
        console.error('Failed to load terminal state:', error);
      }
    };

    loadTerminalState();
  }, [loadData]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [state.commands]);

  // Generate command suggestions
  useEffect(() => {
    if (state.currentCommand.trim()) {
      const suggestions = Object.keys(COMMAND_SUGGESTIONS)
        .filter(cmd => cmd.startsWith(state.currentCommand.toLowerCase()))
        .slice(0, 5);
      setAutoCompleteSuggestions(suggestions);
    } else {
      setAutoCompleteSuggestions([]);
    }
  }, [state.currentCommand]);

  // Execute command
  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    const commandId = `cmd-${Date.now()}`;
    const newCommand: Command = {
      id: commandId,
      command: command.trim(),
      output: '',
      status: 'running',
      startTime: new Date()
    };

    setState(prev => ({
      ...prev,
      commands: [...prev.commands, newCommand],
      commandHistory: [...prev.commandHistory, command.trim()],
      historyIndex: -1,
      isExecuting: true,
      currentCommand: ''
    }));

    try {
      // Send command to backend
      const response = await backend.callAPI('terminal/execute', 'POST', {
        command: command.trim(),
        directory: state.currentDirectory,
        environment: state.environment
      });

      // Update command with result
      setState(prev => ({
        ...prev,
        commands: prev.commands.map(cmd =>
          cmd.id === commandId
            ? {
                ...cmd,
                output: response.output || 'Command completed successfully',
                status: response.exitCode === 0 ? 'completed' : 'error',
                endTime: new Date(),
                exitCode: response.exitCode || 0
              }
            : cmd
        ),
        isExecuting: false
      }));

      // Update current directory if cd command
      if (command.trim().startsWith('cd ')) {
        const newDir = command.trim().substring(3).trim();
        setState(prev => ({
          ...prev,
          currentDirectory: newDir || prev.currentDirectory
        }));
      }

      // Save terminal state
      await saveData({
        commands: state.commands,
        commandHistory: state.commandHistory,
        currentDirectory: state.currentDirectory,
        environment: state.environment
      });

    } catch (error) {
      console.error('Command execution failed:', error);

      setState(prev => ({
        ...prev,
        commands: prev.commands.map(cmd =>
          cmd.id === commandId
            ? {
                ...cmd,
                output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                status: 'error',
                endTime: new Date(),
                exitCode: 1
              }
            : cmd
        ),
        isExecuting: false
      }));
    }
  }, [state.currentDirectory, state.environment, state.commands, state.commandHistory, backend, saveData]);

  // Handle command input
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.currentCommand.trim() && !state.isExecuting) {
      executeCommand(state.currentCommand);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.commandHistory.length > 0) {
        const newIndex = Math.min(state.historyIndex + 1, state.commandHistory.length - 1);
        setState(prev => ({
          ...prev,
          historyIndex: newIndex,
          currentCommand: prev.commandHistory[prev.commandHistory.length - 1 - newIndex] || ''
        }));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(state.historyIndex - 1, -1);
      setState(prev => ({
        ...prev,
        historyIndex: newIndex,
        currentCommand: newIndex === -1 ? '' : prev.commandHistory[prev.commandHistory.length - 1 - newIndex] || ''
      }));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (autoCompleteSuggestions.length > 0) {
        setState(prev => ({
          ...prev,
          currentCommand: autoCompleteSuggestions[0] || ''
        }));
      }
    }
  };

  // Load directory contents
  const loadDirectoryContents = useCallback(async () => {
    try {
      const response = await backend.callAPI('filesystem/list', 'POST', {
        path: state.currentDirectory
      });

      setFileSystemItems(response.items || []);
    } catch (error) {
      console.error('Failed to load directory contents:', error);
      setFileSystemItems([]);
    }
  }, [state.currentDirectory, backend]);

  // Handle file system operations
  const handleFileOperation = async (operation: string, path: string) => {
    try {
      const response = await backend.callAPI('filesystem/operation', 'POST', {
        operation,
        path,
        currentDirectory: state.currentDirectory
      });

      if (response.success) {
        await loadDirectoryContents();
        executeCommand(`echo "Operation ${operation} completed successfully"`);
      }
    } catch (error) {
      console.error(`File operation ${operation} failed:`, error);
      executeCommand(`echo "Error: ${error instanceof Error ? error.message : 'Unknown error'}"`);
    }
  };

  // Clear terminal
  const clearTerminal = () => {
    setState(prev => ({
      ...prev,
      commands: []
    }));
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-green-400 font-mono">
      {/* Terminal Header */}
      <div className="h-8 bg-slate-800 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">AI-BOS Terminal</span>
          <span className="text-xs text-white/50">•</span>
          <span className="text-xs text-white/50">{state.currentDirectory}</span>
          {state.isExecuting && (
            <>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs text-yellow-400">Executing...</span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className="p-1 hover:bg-white/10 rounded text-xs"
            title="File Explorer"
          >
            📁
          </button>
          <button
            onClick={clearTerminal}
            className="p-1 hover:bg-white/10 rounded text-xs"
            title="Clear Terminal"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex">
        {/* Main Terminal */}
        <div className="flex-1 flex flex-col">
          {/* Command Output */}
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {state.commands.map((command) => (
              <motion.div
                key={command.id}
                className="space-y-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Command Input */}
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">$</span>
                  <span className="text-white">{command.command}</span>
                  {command.status === 'running' && (
                    <motion.div
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Command Output */}
                {command.output && (
                  <div className="ml-4 text-sm">
                    <pre className="whitespace-pre-wrap break-words">
                      {command.output}
                    </pre>
                  </div>
                )}

                {/* Command Status */}
                {command.status !== 'running' && (
                  <div className="ml-4 text-xs text-white/50">
                    {command.status === 'completed' ? '✅' : '❌'}
                    Exit code: {command.exitCode}
                    ({((command.endTime?.getTime() || 0) - command.startTime.getTime())}ms)
                  </div>
                )}
              </motion.div>
            ))}

            {/* Welcome Message */}
            {state.commands.length === 0 && (
              <div className="space-y-2">
                <div className="text-green-400">Welcome to AI-BOS Terminal v1.0.0</div>
                <div className="text-white/50">Type &apos;help&apos; for available commands</div>
                <div className="text-white/50">Current directory: {state.currentDirectory}</div>
              </div>
            )}
          </div>

          {/* Command Input */}
          <div className="border-t border-white/10 p-4">
            <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2">
              <span className="text-blue-400">$</span>
              <input
                ref={inputRef}
                type="text"
                value={state.currentCommand}
                onChange={(e) => setState(prev => ({ ...prev, currentCommand: e.target.value }))}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-white outline-none"
                placeholder="Enter command..."
                disabled={state.isExecuting}
                autoFocus
              />
            </form>

            {/* Auto-complete Suggestions */}
            <AnimatePresence>
              {autoCompleteSuggestions.length > 0 && (
                <motion.div
                  className="mt-2 space-y-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {autoCompleteSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className="text-xs text-white/50 ml-4 cursor-pointer hover:text-white/70"
                      onClick={() => setState(prev => ({ ...prev, currentCommand: suggestion }))}
                    >
                      {suggestion} - {COMMAND_SUGGESTIONS[suggestion as keyof typeof COMMAND_SUGGESTIONS]}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* File Explorer */}
        <AnimatePresence>
          {showFileExplorer && (
            <motion.div
              className="w-80 bg-slate-900 border-l border-white/10 flex flex-col"
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">File System</h3>
                <p className="text-xs text-white/50 mt-1">{state.currentDirectory}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {fileSystemItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded cursor-pointer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (item.type === 'directory') {
                        setState(prev => ({ ...prev, currentDirectory: `${prev.currentDirectory}/${item.name}` }));
                        loadDirectoryContents();
                      } else {
                        executeCommand(`cat "${item.name}"`);
                      }
                    }}
                  >
                    <span className="text-lg">
                      {item.type === 'directory' ? '📁' : '📄'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{item.name}</div>
                      <div className="text-xs text-white/50">
                        {item.type === 'file' ? `${item.size} bytes` : 'Directory'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleFileOperation('mkdir', 'new-directory')}
                    className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded text-xs"
                  >
                    New Folder
                  </button>
                  <button
                    onClick={() => handleFileOperation('touch', 'new-file.txt')}
                    className="px-2 py-1 bg-green-500/20 hover:bg-green-500/30 rounded text-xs"
                  >
                    New File
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Terminal;
