import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { auditLogger } from '../../utils/auditLogger';

// Types
interface ConversationState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  commands: Command[];
  confidence: number;
  error: string | null
}

interface Command {
  id: string;
  type: 'click' | 'input' | 'navigate' | 'custom';
  target: string;
  parameters: Record<string, any>;
  confidence: number;
  executed: boolean;
  timestamp: Date
}

interface VoiceCommand {
  phrase: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number
}

interface ConversationalContextType {
  // Core functionality
  startListening: () => void;
  stopListening: () => void;
  processCommand: (command: string) => void;
  executeCommand: (command: Command) => void;

  // State
  conversationState: ConversationState;
  isVoiceEnabled: boolean;
  isChatEnabled: boolean;

  // Configuration
  enableVoice: (enabled: boolean) => void;
  enableChat: (enabled: boolean) => void;
  setScope: (scope: string) => void;

  // Utilities
  speak: (text: string) => void;
  getAvailableCommands: () => VoiceCommand[];
  registerCommand: (command: VoiceCommand) => void
}

// AI-powered command processor
class CommandProcessor {
  private static instance: CommandProcessor;
  private commands: Map<string, VoiceCommand> = new Map();
  private naturalLanguageProcessor: NaturalLanguageProcessor;

  constructor() {
    this.naturalLanguageProcessor = new NaturalLanguageProcessor();
    this.initializeDefaultCommands()
}

  static getInstance(): CommandProcessor {
    if (!CommandProcessor.instance) {
      CommandProcessor.instance = new CommandProcessor()
}
    return CommandProcessor.instance
}

  private initializeDefaultCommands(): void {
    const defaultCommands: VoiceCommand[] = [
      {
        phrase: 'click {element}',
  action: 'click',
        parameters: { element: '{element}' },
        confidence: 0.9
      },
  {
    phrase: 'type {text} in {field}',
  action: 'input',
        parameters: { text: '{text}',
  field: '{field}' },
        confidence: 0.8
      },
  {
    phrase: 'go to {page}',
  action: 'navigate',
        parameters: { page: '{page}' },
        confidence: 0.9
      },
  {
    phrase: 'search for {query}',
  action: 'search',
        parameters: { query: '{query}' },
        confidence: 0.8
      },
  {
    phrase: 'submit form',
  action: 'submit',
        parameters: {},
        confidence: 0.9
      },
  {
    phrase: 'clear {field}',
  action: 'clear',
        parameters: { field: '{field}' },
        confidence: 0.8
      },
  {
    phrase: 'select {option}',
  action: 'select',
        parameters: { option: '{option}' },
        confidence: 0.8
      }
    ];

    defaultCommands.forEach(cmd => this.registerCommand(cmd))
}

  registerCommand(command: VoiceCommand): void {
    this.commands.set(command.phrase, command)
}

  processNaturalLanguage(input: string): Command[] {
    const commands: Command[] = [];

    // Use AI to process natural language
    const processedCommands = this.naturalLanguageProcessor.process(input);

    processedCommands.forEach(processed => {
      const command: Command = {
        id: `cmd_${Date.now()}_${Math.random()}`,
        type: processed.action as any,
        target: processed.target || '',
        parameters: processed.parameters || {},
        confidence: processed.confidence,
        executed: false,
  timestamp: new Date()
      };

      commands.push(command)
});

    return commands
}

  getAvailableCommands(): VoiceCommand[] {
    return Array.from(this.commands.values())
}
}

// Natural Language Processor using AI
class NaturalLanguageProcessor {
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private entityExtractors: Map<string, (text: string) => any> = new Map();

  constructor() {
    this.initializePatterns()
}

  private initializePatterns(): void {
    // Click patterns
    this.intentPatterns.set('click', [
      /click\s+(.+)/i,
      /press\s+(.+)/i,
      /tap\s+(.+)/i,
      /select\s+(.+)/i
    ]);

    // Input patterns
    this.intentPatterns.set('input', [
      /type\s+(.+)\s+in\s+(.+)/i,
      /enter\s+(.+)\s+in\s+(.+)/i,
      /fill\s+(.+)\s+with\s+(.+)/i
    ]);

    // Navigation patterns
    this.intentPatterns.set('navigate', [
      /go\s+to\s+(.+)/i,
      /navigate\s+to\s+(.+)/i,
      /open\s+(.+)/i
    ]);

    // Search patterns
    this.intentPatterns.set('search', [
      /search\s+for\s+(.+)/i,
      /find\s+(.+)/i,
      /look\s+for\s+(.+)/i
    ]);

    // Form patterns
    this.intentPatterns.set('submit', [
      /submit\s+form/i,
      /submit/i,
      /send/i
    ]);

    // Clear patterns
    this.intentPatterns.set('clear', [
      /clear\s+(.+)/i,
      /delete\s+(.+)/i,
      /remove\s+(.+)/i
    ])
}

  process(text: string): Array<{
    action: string;
    target: string;
    parameters: Record<string, any>;
    confidence: number
}> {
    const results: Array<{
      action: string;
      target: string;
      parameters: Record<string, any>;
      confidence: number
}> = [];

    // Try to match each intent pattern
    for (const [action, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const confidence = this.calculateConfidence(text, pattern);
          const parameters = this.extractParameters(text, action, match);

          results.push({
            action,
            target: this.extractTarget(text, action, match),
            parameters,
            confidence
          })
}
      }
    }

    return results
}

  private calculateConfidence(text: string,
  pattern: RegExp): number {
    // Simple confidence calculation based on pattern match quality
    const match = text.match(pattern);
    if (!match) return 0;

    // Higher confidence for exact matches
    if (text.toLowerCase() === match[0].toLowerCase()) return 0.95;

    // Lower confidence for partial matches
    return Math.max(0.5, 0.9 - (text.length - match[0].length) * 0.1)
}

  private extractTarget(text: string,
  action: string, match: RegExpMatchArray): string {
    switch (action) {
      case 'click':
        return match[1] || '';
      case 'input':
        return match[2] || '';
      case 'navigate':
        return match[1] || '';
      case 'search':
        return 'search';
      case 'submit':
        return 'form';
      case 'clear':
        return match[1] || '';
      default:
        return ''
}
  }

  private extractParameters(text: string,
  action: string, match: RegExpMatchArray): Record<string, any> {
    const parameters: Record<string, any> = {};

    switch (action) {
      case 'input':
        parameters.text = match[1] || '';
        parameters.field = match[2] || '';
        break;
      case 'search':
        parameters.query = match[1] || '';
        break;
      case 'clear':
        parameters.field = match[1] || '';
        break
}

    return parameters
}
}

// Speech Recognition and Synthesis
class SpeechManager {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.initializeSpeech()
}

  private initializeSpeech(): void {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.isSupported = true
}

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
}
  }

  startListening(onResult: (transcript: string) => void, onError: (error: string) => void): void {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return
}

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript)
};

    this.recognition.onerror = (event: any) => {
      onError(event.error)
};

    this.recognition.start()
}

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop()
}
  }

  speak(text: string): void {
    if (!this.synthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    this.synthesis.speak(utterance)
}

  isSpeechSupported(): boolean {
    return this.isSupported
}
}

// Context
const ConversationalContext = createContext<ConversationalContextType | null>(null);

// Provider Component
interface ConversationalProviderProps {
  children: ReactNode;
  enableVoice?: boolean;
  enableChat?: boolean;
  scope?: string;
  enableAuditTrail?: boolean
}

export const ConversationalProvider: React.FC<ConversationalProviderProps> = ({
  children,
  enableVoice = true,
  enableChat = true,
  scope = 'global',
  enableAuditTrail = true
}) => {
  const [conversationState, setConversationState] = useState<ConversationState>({
    isListening: false,
  isProcessing: false,
    transcript: '',
  commands: [],
    confidence: 0,
  error: null
  });

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(enableVoice);
  const [isChatEnabled, setIsChatEnabled] = useState(enableChat);
  const [currentScope, setCurrentScope] = useState(scope);

  const speechManager = useRef(new SpeechManager());
  const commandProcessor = useRef(CommandProcessor.getInstance());

  const startListening = () => {
    if (!speechManager.current.isSpeechSupported()) {
      setConversationState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return
}

    setConversationState(prev => ({
      ...prev,
      isListening: true,
  error: null,
      transcript: '',
  commands: []
    }));

    speechManager.current.startListening(
      (transcript) => {
        setConversationState(prev => ({
          ...prev,
          transcript,
          isProcessing: true
        }));

        processCommand(transcript)
},
      (error) => {
        setConversationState(prev => ({
          ...prev,
          error,
          isListening: false
        }))
}
    );

    if (enableAuditTrail) {
      auditLogger.info('Voice listening started', { scope: currentScope })
}
  };

  const stopListening = () => {
    speechManager.current.stopListening();
    setConversationState(prev => ({
      ...prev,
      isListening: false,
  isProcessing: false
    }));

    if (enableAuditTrail) {
      auditLogger.info('Voice listening stopped', { scope: currentScope })
}
  };

  const processCommand = (command: string) => {
    setConversationState(prev => ({ ...prev, isProcessing: true }));

    // Process the command using AI
    const commands = commandProcessor.current.processNaturalLanguage(command);

    setConversationState(prev => ({
      ...prev,
      commands,
      isProcessing: false,
  confidence: commands.length > 0 ? commands[0].confidence : 0
    }));

    // Auto-execute high-confidence commands
    commands.forEach(cmd => {
      if (cmd.confidence > 0.7) {
        executeCommand(cmd)
}
    });

    if (enableAuditTrail) {
      auditLogger.info('Command processed', {
        command,
        commands: commands.length,
        scope: currentScope
      })
}
  };

  const executeCommand = (command: Command) => {
    // Execute the command based on type
    switch (command.type) {
      case 'click':
        // Find and click the target element
        const clickTarget = document.querySelector(`[data-voice-target="${command.target}"]`) ||
                           document.querySelector(`[aria-label*="${command.target}"]`) ||
                           document.querySelector(`button:contains("${command.target}")`);
        if (clickTarget) {
          (clickTarget as HTMLElement).click();
          command.executed = true
}
        break;

      case 'input':
        // Find and fill the target input
        const inputTarget = document.querySelector(`input[placeholder*="${command.parameters.field}"]`) ||
                           document.querySelector(`input[name="${command.parameters.field}"]`);
        if (inputTarget) {
          (inputTarget as HTMLInputElement).value = command.parameters.text;
          inputTarget.dispatchEvent(new Event('input', { bubbles: true }));
          command.executed = true
}
        break;

      case 'navigate':
        // Navigate to the target page
        const navigationEvent = new CustomEvent('voice-navigation', {
          detail: { target: command.target }
        });
        window.dispatchEvent(navigationEvent);
        command.executed = true;
        break;

      case 'search':
        // Trigger search
        const searchEvent = new CustomEvent('voice-search', {
          detail: { query: command.parameters.query }
        });
        window.dispatchEvent(searchEvent);
        command.executed = true;
        break;

      case 'submit':
        // Submit the current form
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true }));
          command.executed = true
}
        break;

      case 'clear':
        // Clear the target field
        const clearTarget = document.querySelector(`input[placeholder*="${command.parameters.field}"]`) ||
                           document.querySelector(`input[name="${command.parameters.field}"]`);
        if (clearTarget) {
          (clearTarget as HTMLInputElement).value = '';
          clearTarget.dispatchEvent(new Event('input', { bubbles: true }));
          command.executed = true
}
        break
}

    setConversationState(prev => ({
      ...prev,
      commands: prev.commands.map(cmd =>
        cmd.id === command.id ? { ...cmd, executed: true } : cmd
      )
    }));

    if (enableAuditTrail) {
      auditLogger.info('Command executed', {
        command: command.type,
        target: command.target,
        executed: command.executed,
        scope: currentScope
      })
}
  };

  const speak = (text: string) => {
    speechManager.current.speak(text)
};

  const getAvailableCommands = () => {
    return commandProcessor.current.getAvailableCommands()
};

  const registerCommand = (command: VoiceCommand) => {
    commandProcessor.current.registerCommand(command)
};

  const value: ConversationalContextType = {
    startListening,
    stopListening,
    processCommand,
    executeCommand,
    conversationState,
    isVoiceEnabled,
    isChatEnabled,
    enableVoice: setIsVoiceEnabled,
  enableChat: setIsChatEnabled,
    setScope: setCurrentScope,
    speak,
    getAvailableCommands,
    registerCommand
  };

  return (
    <ConversationalContext.Provider value={value}>
      {children}
    </ConversationalContext.Provider>
  )
};

// Hook
export const useConversational = (options: { scope?: string } = {}) => {
  const context = useContext(ConversationalContext);
  if (!context) {
    throw new Error('useConversational must be used within ConversationalProvider')
}

  useEffect(() => {
    if (options.scope) {
      context.setScope(options.scope)
}
  }, [options.scope]);

  return context
};

// HOC for conversational components
export const withConversational = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    scope?: string;
    voiceCommands?: VoiceCommand[];
    enableVoice?: boolean;
    enableChat?: boolean
} = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const {
      conversationState,
      startListening,
      stopListening,
      processCommand,
      registerCommand,
      isVoiceEnabled
    } = useConversational({ scope: options.scope });

    useEffect(() => {
      // Register custom voice commands
      if (options.voiceCommands) {
        options.voiceCommands.forEach(cmd => registerCommand(cmd))
}
    }, []);

    const handleVoiceToggle = () => {
      if (conversationState.isListening) {
        stopListening()
} else {
        startListening()
}
    };

    return (
      <div style={{ position: 'relative' }}>
        <Component {...props} />

        {isVoiceEnabled && (
          <button
            onClick={handleVoiceToggle}
            style={{
              position: 'absolute',
  top: '-40px',
              right: '0',
  background: conversationState.isListening ? '#ff4444' : '#28a745',
              color: '#fff',
  border: 'none',
              borderRadius: '50%',
  width: '32px',
              height: '32px',
  cursor: 'pointer',
              display: 'flex',
  alignItems: 'center',
              justifyContent: 'center'
            }}
            title={conversationState.isListening ? 'Stop listening' : 'Start listening'}
          >
            {conversationState.isListening ? '🔴' : '🎤'}
          </button>
        )}

        {conversationState.transcript && (
          <div style={{
            position: 'absolute',
  top: '-80px',
            left: '0',
  right: '0',
            background: '#1a1a1a',
  color: '#fff',
            padding: '8px',
  borderRadius: '4px',
            fontSize: '12px',
  zIndex: 1000
          }}>
            <strong>Voice:</strong> {conversationState.transcript}
            {conversationState.isProcessing && <span> (Processing...)</span>}
          </div>
        )}

        {conversationState.commands.length > 0 && (
          <div style={{
            position: 'absolute',
  bottom: '-60px',
            left: '0',
  right: '0',
            background: '#1a1a1a',
  color: '#fff',
            padding: '8px',
  borderRadius: '4px',
            fontSize: '12px',
  zIndex: 1000
          }}>
            <strong>Commands:</strong>
            {conversationState.commands.map((cmd, index) => (
              <div key={cmd.id} style={{ marginTop: '4px' }}>
                {cmd.type} {cmd.target}
                {cmd.executed && <span style={{ color: '#28a745' }}> ✓</span>}
                <span style={{ color: '#888' }}> ({(cmd.confidence * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
};

  WrappedComponent.displayName = `withConversational(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Voice-enabled Button Component
export const VoiceButton: React.FC<{
  children: ReactNode;
  onClick: () => void;
  voiceLabel: string;
  scope?: string
}> = ({ children, onClick, voiceLabel, scope }) => {
  const { registerCommand } = useConversational({ scope });

  useEffect(() => {
    registerCommand({
      phrase: `click ${voiceLabel}`,
      action: 'click',
  parameters: { target: voiceLabel },
      confidence: 0.9
    })
}, [voiceLabel]);

  return (
    <button
      onClick={onClick}
      data-voice-target={voiceLabel}
      style={{
        padding: '8px 16px',
  background: '#007bff',
        color: '#fff',
  border: 'none',
        borderRadius: '4px',
  cursor: 'pointer'
      }}
    >
      {children}
    </button>
  )
};

// Voice-enabled Input Component
export const VoiceInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  voiceFieldName: string;
  scope?: string
}> = ({ value, onChange, placeholder, voiceFieldName, scope }) => {
  const { registerCommand } = useConversational({ scope });

  useEffect(() => {
    registerCommand({
      phrase: `type {text} in ${voiceFieldName}`,
      action: 'input',
  parameters: { field: voiceFieldName,
  text: '{text}' },
      confidence: 0.8
    })
}, [voiceFieldName]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-voice-target={voiceFieldName}
      style={{
        padding: '8px 12px',
  border: '1px solid #ccc',
        borderRadius: '4px',
  width: '100%'
      }}
    />
  )
};

// Conversational Dashboard
export const ConversationalDashboard: React.FC = () => {
  const {
    conversationState,
    isVoiceEnabled,
    isChatEnabled,
    startListening,
    stopListening,
    getAvailableCommands
  } = useConversational();

  const availableCommands = getAvailableCommands();

  return (
    <div style={{
      background: '#1a1a1a',
  color: '#fff',
      padding: '20px',
  borderRadius: '8px',
      maxWidth: '400px'
    }}>
      <h3>🎤 Conversational Interface</h3>

      <div style={{ marginBottom: '15px' }}>
        <strong>Voice:</strong> {isVoiceEnabled ? '🟢 Enabled' : '🔴 Disabled'}
        <br />
        <strong>Chat:</strong> {isChatEnabled ? '🟢 Enabled' : '🔴 Disabled'}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={conversationState.isListening ? stopListening : startListening}
          style={{
            background: conversationState.isListening ? '#ff4444' : '#28a745',
            color: '#fff',
  border: 'none',
            padding: '8px 16px',
  borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {conversationState.isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      {conversationState.transcript && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Transcript:</strong> {conversationState.transcript}
        </div>
      )}

      {conversationState.error && (
        <div style={{ marginBottom: '15px',
  color: '#ff4444' }}>
          <strong>Error:</strong> {conversationState.error}
        </div>
      )}

      <div>
        <strong>Available Commands:</strong>
        <div style={{ maxHeight: '200px',
  overflowY: 'auto', marginTop: '8px' }}>
          {availableCommands.map((cmd, index) => (
            <div key={index} style={{
              padding: '4px 8px',
  background: '#333',
              marginBottom: '4px',
  borderRadius: '4px',
              fontSize: '12px'
            }}>
              "{cmd.phrase}"
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};
