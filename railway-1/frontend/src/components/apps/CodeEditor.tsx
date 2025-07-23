import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContainer } from '../shell/AppContainer';

// ==================== TYPES & INTERFACES ====================

interface FileData {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  lastModified: Date;
  size: number;
}

interface CodeSuggestion {
  id: string;
  type: 'completion' | 'refactor' | 'bug-fix' | 'optimization';
  text: string;
  description: string;
  confidence: number;
  line: number;
  column: number;
}

interface EditorState {
  currentFile: FileData | null;
  files: FileData[];
  suggestions: CodeSuggestion[];
  isSaving: boolean;
  isCollaborating: boolean;
  collaborators: string[];
  cursorPosition: { line: number; column: number };
  selectedText: string;
}

// ==================== SYNTAX HIGHLIGHTING ====================

const syntaxHighlight = (code: string, language: string): string => {
  // Real syntax highlighting implementation
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'import', 'export', 'class', 'interface', 'type'];
  const strings = /"[^"]*"|'[^']*'|`[^`]*`/g;
  const comments = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
  const numbers = /\b\d+\.?\d*\b/g;

  let highlighted = code;

  // Highlight keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`);
  });

  // Highlight strings
  highlighted = highlighted.replace(strings, '<span class="text-green-400">$&</span>');

  // Highlight comments
  highlighted = highlighted.replace(comments, '<span class="text-gray-500 italic">$&</span>');

  // Highlight numbers
  highlighted = highlighted.replace(numbers, '<span class="text-yellow-400">$&</span>');

  return highlighted;
};

// ==================== MAIN COMPONENT ====================

const CodeEditor: React.FC = () => {
  const { instance, backend, saveData, loadData, sendMessage } = useAppContainer();

  const [state, setState] = useState<EditorState>({
    currentFile: null,
    files: [],
    suggestions: [],
    isSaving: false,
    isCollaborating: false,
    collaborators: [],
    cursorPosition: { line: 1, column: 1 },
    selectedText: ''
  });

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    const loadEditorData = async () => {
      try {
        const data = await loadData();
        if (data.files && data.files.length > 0) {
          setState(prev => ({
            ...prev,
            files: data.files,
            currentFile: data.files[0]
          }));
          setCode(data.files[0].content || '');
          setLanguage(data.files[0].language || 'typescript');
        } else {
          // Create default file
          const defaultFile: FileData = {
            id: 'default.tsx',
            name: 'App.tsx',
            path: '/src/App.tsx',
            content: `import React from 'react';

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Hello, AI-BOS!</h1>
      <p>Welcome to the revolutionary AI-powered desktop OS.</p>
    </div>
  );
};

export default App;`,
            language: 'typescript',
            lastModified: new Date(),
            size: 0
          };

          setState(prev => ({
            ...prev,
            files: [defaultFile],
            currentFile: defaultFile
          }));
          setCode(defaultFile.content);
          setLanguage(defaultFile.language);
        }
      } catch (error) {
        console.error('Failed to load editor data:', error);
      }
    };

    loadEditorData();
  }, [loadData]);

  // Real-time collaboration
  useEffect(() => {
    const handleCollaborationMessage = (message: any) => {
      if (message.type === 'data' && message.payload.type === 'code-change') {
        setCode(message.payload.content);
        setState(prev => ({
          ...prev,
          collaborators: message.payload.collaborators || []
        }));
      }
    };

    // Listen for collaboration messages
    const interval = setInterval(() => {
      if (state.isCollaborating) {
        sendMessage({
          type: 'data',
          to: 'all',
          payload: {
            type: 'cursor-position',
            position: state.cursorPosition,
            fileId: state.currentFile?.id
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isCollaborating, state.cursorPosition, state.currentFile, sendMessage]);

  // AI Code Suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      if (code.length > 50) {
        try {
          const response = await backend.callAPI('ai/code-suggestions', 'POST', {
            code,
            language,
            cursorPosition: state.cursorPosition
          });

          setState(prev => ({
            ...prev,
            suggestions: response.suggestions || []
          }));
        } catch (error) {
          console.error('Failed to generate suggestions:', error);
        }
      }
    };

    const debounceTimer = setTimeout(generateSuggestions, 1000);
    return () => clearTimeout(debounceTimer);
  }, [code, language, state.cursorPosition, backend]);

  // Handle code changes
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);

    // Update cursor position
    const textarea = e.target;
    const cursorPosition = {
      line: textarea.value.substr(0, textarea.selectionStart).split('\n').length,
      column: textarea.selectionStart - textarea.value.lastIndexOf('\n', textarea.selectionStart - 1)
    };

    setState(prev => ({
      ...prev,
      cursorPosition,
      selectedText: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
    }));

    // Auto-save after delay
    const saveTimer = setTimeout(async () => {
      if (state.currentFile) {
        const updatedFile = {
          ...state.currentFile,
          content: newCode,
          lastModified: new Date(),
          size: newCode.length
        };

        setState(prev => ({
          ...prev,
          currentFile: updatedFile,
          files: prev.files.map(f => f.id === updatedFile.id ? updatedFile : f)
        }));

        try {
          await saveData({
            files: state.files.map(f => f.id === updatedFile.id ? updatedFile : f)
          });
        } catch (error) {
          console.error('Failed to save file:', error);
        }
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [state.currentFile, state.files, saveData]);

  // Handle file selection
  const handleFileSelect = (file: FileData) => {
    setState(prev => ({ ...prev, currentFile: file }));
    setCode(file.content);
    setLanguage(file.language);
  };

  // Handle suggestion application
  const applySuggestion = (suggestion: CodeSuggestion) => {
    const lines = code.split('\n');
    const lineIndex = suggestion.line - 1;

    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines[lineIndex] = lines[lineIndex].substring(0, suggestion.column - 1) + suggestion.text + lines[lineIndex].substring(suggestion.column - 1);
      const newCode = lines.join('\n');
      setCode(newCode);
    }

    setShowSuggestions(false);
  };

  // Create new file
  const createNewFile = () => {
    const newFile: FileData = {
      id: `file-${Date.now()}`,
      name: 'New File.tsx',
      path: `/src/NewFile.tsx`,
      content: '',
      language: 'typescript',
      lastModified: new Date(),
      size: 0
    };

    setState(prev => ({
      ...prev,
      files: [...prev.files, newFile],
      currentFile: newFile
    }));
    setCode('');
    setLanguage('typescript');
  };

  return (
    <div className="w-full h-full flex bg-slate-900 text-white">
      {/* File Explorer */}
      <AnimatePresence>
        {showFileExplorer && (
          <motion.div
            className="w-64 bg-slate-800 border-r border-white/10 flex flex-col"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Files</h3>
                <button
                  onClick={createNewFile}
                  className="p-1 hover:bg-white/10 rounded"
                  title="New File"
                >
                  ➕
                </button>
              </div>
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 bg-slate-700 rounded text-sm"
              />
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto">
              {state.files
                .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(file => (
                  <motion.div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`p-3 cursor-pointer hover:bg-white/5 border-l-2 ${
                      state.currentFile?.id === file.id
                        ? 'bg-indigo-500/20 border-indigo-400'
                        : 'border-transparent'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {file.language === 'typescript' ? '📄' :
                         file.language === 'javascript' ? '📜' :
                         file.language === 'css' ? '🎨' : '📝'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-xs text-white/50">{file.path}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Collaboration Status */}
            {state.isCollaborating && (
              <div className="p-3 border-t border-white/10 bg-green-500/10">
                <div className="text-sm text-green-400 mb-1">Collaborating</div>
                <div className="text-xs text-white/70">
                  {state.collaborators.length} collaborators
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="h-12 bg-slate-800 border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFileExplorer(!showFileExplorer)}
              className="p-1 hover:bg-white/10 rounded"
              title="Toggle File Explorer"
            >
              📁
            </button>

            {state.currentFile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{state.currentFile.name}</span>
                <span className="text-xs text-white/50">•</span>
                <span className="text-xs text-white/50 capitalize">{state.currentFile.language}</span>
                {state.isSaving && (
                  <>
                    <span className="text-xs text-white/50">•</span>
                    <span className="text-xs text-yellow-400">Saving...</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 bg-slate-700 rounded text-sm"
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
            </select>

            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-1 hover:bg-white/10 rounded"
              title="AI Suggestions"
            >
              🤖
            </button>

            <button
              onClick={() => setState(prev => ({ ...prev, isCollaborating: !prev.isCollaborating }))}
              className={`p-1 rounded ${
                state.isCollaborating ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10'
              }`}
              title="Collaboration"
            >
              👥
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              className="w-full h-full bg-slate-900 text-white p-4 font-mono text-sm resize-none outline-none"
              spellCheck={false}
              placeholder="Start coding..."
            />

            {/* Syntax Highlighting Overlay */}
            <div
              className="absolute inset-0 pointer-events-none p-4 font-mono text-sm"
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(code, language)
              }}
            />
          </div>

          {/* AI Suggestions Panel */}
          <AnimatePresence>
            {showSuggestions && state.suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                className="w-80 bg-slate-800 border-l border-white/10 flex flex-col"
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="font-semibold text-white">AI Suggestions</h3>
                  <p className="text-xs text-white/50 mt-1">
                    {state.suggestions.length} suggestions available
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {state.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.id}
                      className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">
                          {suggestion.type === 'completion' ? '✨' :
                           suggestion.type === 'refactor' ? '🔧' :
                           suggestion.type === 'bug-fix' ? '🐛' : '⚡'}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">
                            {suggestion.type.replace('-', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-white/70 mt-1">
                            {suggestion.description}
                          </div>
                          <div className="text-xs text-green-400 mt-1">
                            Line {suggestion.line}, Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-slate-800 border-t border-white/10 flex items-center justify-between px-4 text-xs text-white/50">
          <div className="flex items-center space-x-4">
            <span>Line {state.cursorPosition.line}, Column {state.cursorPosition.column}</span>
            {state.selectedText && (
              <span>{state.selectedText.length} characters selected</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>{code.length} characters</span>
            <span>{code.split('\n').length} lines</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
