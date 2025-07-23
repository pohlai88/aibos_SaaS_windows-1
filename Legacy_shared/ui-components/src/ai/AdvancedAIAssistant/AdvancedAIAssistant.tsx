import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, MicOff, Bot, Sparkles, Settings, Download, Share2,
  Copy, Edit3, Trash2, Volume2, VolumeX, Camera, FileText, Code,
  Image, Video, Circle, Zap, Clock, CheckCircle, AlertCircle, Loader2, Shield
} from 'lucide-react';
import { auditLog } from '../../utils/auditLogger';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';

// Enterprise-grade types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'code' | 'file' | 'voice';
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    confidence?: number;
    suggestions?: string[];
    attachments?: Array<{
      name: string;
      type: string;
      url: string;
      size: number
}>
};
  status: 'sending' | 'sent' | 'error' | 'processing'
}

export interface AdvancedAIAssistantProps {
  className?: string;
  initialMessages?: AIMessage[];
  model?: string;
  apiEndpoint?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  enableCodeHighlighting?: boolean;
  enableSuggestions?: boolean;
  maxTokens?: number;
  temperature?: number;
  onMessageSend?: (message: AIMessage) => void;
  onMessageReceive?: (message: AIMessage) => void;
  onError?: (error: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  placeholder?: string;
  autoScroll?: boolean;
  showTypingIndicator?: boolean;
  enableStreaming?: boolean;
  // Enterprise features
  complianceLevel?: 'basic' | 'gdpr' | 'hipaa' | 'soc2';
  auditTrail?: boolean;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
}

// Voice recording hook with enterprise compliance
const useVoiceRecording = (complianceLevel: string,
  auditTrail: boolean) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      // GDPR compliance check
      if (complianceLevel === 'gdpr') {
        const consent = await requestVoiceConsent();
        if (!consent) {
          throw new Error('Voice recording consent required')
}
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
};

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach((track) => track.stop())
};

      mediaRecorder.start();
      setIsRecording(true);
      setIsListening(true);

      if (auditTrail) {
        auditLog('voice_recording_started', {
          timestamp: new Date().toISOString(),
          complianceLevel,
          dataClassification: 'confidential'
        })
}
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error
}
  }, [complianceLevel, auditTrail]);

  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);

      if (auditTrail) {
        auditLog('voice_recording_stopped', {
          timestamp: new Date().toISOString(),
          duration: 'calculated',
  dataClassification: 'confidential'
        })
}
    }
  }, [isRecording, auditTrail]);

  const processVoiceInput = async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('compliance', complianceLevel);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
  body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');
      const { text } = await response.json();

      if (auditTrail) {
        auditLog('voice_transcription_completed', {
          timestamp: new Date().toISOString(),
          textLength: text.length,
          dataClassification: 'confidential'
        })
}

      return text
} catch (error) {
      console.error('Error processing voice input:', error);
      throw error
}
  };

  const requestVoiceConsent = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const consent = window.confirm(
        'This application would like to access your microphone for voice recording. ' +
        'Your voice data will be processed securely and in compliance with GDPR. ' +
        'Do you consent to voice recording?'
      );
      resolve(consent)
})
};

  return {
    isRecording,
    isListening,
    startRecording,
    stopRecording,
    processVoiceInput
  }
};

// Main component with enterprise features
export const AdvancedAIAssistant: React.FC<AdvancedAIAssistantProps> = ({
  className = '',
  initialMessages = [],
  model = 'gpt-4',
  apiEndpoint = '/api/ai/chat',
  enableVoice = true,
  enableFileUpload = true,
  enableCodeHighlighting = true,
  enableSuggestions = true,
  maxTokens = 4000,
  temperature = 0.7,
  onMessageSend,
  onMessageReceive,
  onError,
  theme = 'auto',
  placeholder = 'Ask me anything...',
  autoScroll = true,
  showTypingIndicator = true,
  enableStreaming = true,
  complianceLevel = 'gdpr',
  auditTrail = true,
  dataClassification = 'confidential'
}) => {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording with compliance
  const {
    isRecording,
    isListening,
    startRecording,
    stopRecording,
    processVoiceInput
  } = useVoiceRecording(complianceLevel, auditTrail);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
}
  }, [autoScroll]);

  useEffect(() => {
    scrollToBottom()
}, [messages, streamingMessage, scrollToBottom]);

  // File upload handling with security
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || []);

    // Security validation
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'text/', 'application/pdf'];

      if (file.size > maxSize) {
        onError?.('File too large. Maximum size is 10MB.');
        return false
}

      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        onError?.('File type not allowed.');
        return false
}

      return true
});

    setAttachments(prev => [...prev, ...validFiles]);

    if (auditTrail) {
      auditLog('files_uploaded', {
        timestamp: new Date().toISOString(),
        fileCount: validFiles.length,
        totalSize: validFiles.reduce((sum, file) => sum + file.size, 0),
        dataClassification
      })
}
  }, [onError, auditTrail, dataClassification]);

  const removeAttachment = useCallback((index: number): void => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
}, []);

  // Message sending with streaming
  const sendMessage = useCallback(async (): Promise<void> => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
  content: inputValue,
      timestamp: new Date(),
      type: 'text',
  status: 'sending',
    };

    setMessages(prev => [...prev, userMessage]);
    onMessageSend?.(userMessage);

    // Add attachments to message
    if (attachments.length > 0) {
      userMessage.metadata = {
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size
        }))
      }
}

    setInputValue('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('message', inputValue);
      formData.append('model', model);
      formData.append('maxTokens', maxTokens.toString());
      formData.append('temperature', temperature.toString());
      formData.append('enableStreaming', enableStreaming.toString());
      formData.append('complianceLevel', complianceLevel);
      formData.append('dataClassification', dataClassification);

      attachments.forEach(file => {
        formData.append('files', file)
});

      if (enableStreaming) {
        await streamResponse(formData)
} else {
        await sendRegularRequest(formData)
}

      if (auditTrail) {
        auditLog('message_sent', {
          timestamp: new Date().toISOString(),
          messageLength: inputValue.length,
          attachments: attachments.length,
          model,
          dataClassification
        })
}
    } catch (error) {
      console.error('Error sending message:', error);
      onError?.('Failed to send message');

      if (auditTrail) {
        auditLog('message_error', {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          dataClassification
        })
}
    } finally {
      setIsProcessing(false)
}
  }, [
    inputValue, attachments, model, maxTokens, temperature, enableStreaming,
    complianceLevel, dataClassification, onMessageSend, onError, auditTrail
  ]);

  // Streaming response handling
  const streamResponse = async (formData: FormData): Promise<void> => {
    const response = await fetch(`${apiEndpoint}/stream`, {
      method: 'POST',
  body: formData
    });

    if (!response.ok) throw new Error('Streaming request failed');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let assistantMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
  content: '',
      timestamp: new Date(),
      type: 'text',
  status: 'processing'
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              assistantMessage.status = 'sent';
              setMessages(prev => [...prev]);
              onMessageReceive?.(assistantMessage);
              return
}

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setStreamingMessage(assistantMessage.content)
}
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
}
  };

  // Regular request handling
  const sendRegularRequest = async (formData: FormData): Promise<void> => {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
  body: formData
    });

    if (!response.ok) throw new Error('Request failed');

    const data = await response.json();
    const assistantMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
  content: data.content,
      timestamp: new Date(),
      type: 'text',
  status: 'sent',
      metadata: {
        model: data.model,
        tokens: data.tokens,
        processingTime: data.processingTime
      }
    };

    setMessages(prev => [...prev, assistantMessage]);
    onMessageReceive?.(assistantMessage)
};

  // Smart suggestions generation
  const generateSuggestions = useCallback((conversation: AIMessage[]): string[] => {
    if (!enableSuggestions) return [];

    const recentMessages = conversation.slice(-5);
    const userMessages = recentMessages.filter(msg => msg.role === 'user');

    if (userMessages.length === 0) {
      return [
        'How can I help you today?',
        'What would you like to know?',
        'I\'m ready to assist you!'
      ]
}

    const lastMessage = userMessages[userMessages.length - 1];
    const content = lastMessage.content.toLowerCase();

    if (content.includes('help') || content.includes('assist')) {
      return [
        'I can help you with various tasks',
        'What specific area do you need help with?',
        'Let me know what you\'d like to accomplish'
      ]
}

    if (content.includes('code') || content.includes('programming')) {
      return [
        'I can help you write and debug code',
        'What programming language are you working with?',
        'Would you like me to explain a concept?'
      ]
}

    return [
      'Tell me more about that',
      'How can I assist you further?',
      'What would you like to explore next?'
    ]
}, [enableSuggestions]);

  // Update suggestions when messages change
  useEffect(() => {
    const newSuggestions = generateSuggestions(messages);
    setSuggestions(newSuggestions)
}, [messages, generateSuggestions]);

  // Keyboard handling
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage()
}
  }, [sendMessage]);

  // Utility functions
  const copyMessage = useCallback((content: string): void => {
    navigator.clipboard.writeText(content);

    if (auditTrail) {
      auditLog('message_copied', {
        timestamp: new Date().toISOString(),
        contentLength: content.length,
        dataClassification
      })
}
  }, [auditTrail, dataClassification]);

  const editMessage = useCallback((messageId: string,
  newContent: string): void => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ))
}, []);

  const deleteMessage = useCallback((messageId: string): void => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));

    if (auditTrail) {
      auditLog('message_deleted', {
        timestamp: new Date().toISOString(),
        messageId,
        dataClassification
      })
}
  }, [auditTrail, dataClassification]);

  const speakMessage = useCallback((content: string): void => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      speechSynthesis.speak(utterance)
}
  }, []);

  return (
    <div className={`advanced-ai-assistant ${className}`}>
      {/* Header */}
      <div className="assistant-header">
        <div className="assistant-info">
          <Bot className="assistant-icon" />
          <div>
            <h3>AI Assistant</h3>
            <p>Model: {model} • Compliance: {complianceLevel.toUpperCase()}</p>
          </div>
        </div>
        <div className="assistant-controls">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="settings-button"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0,
  y: 20 }}
              animate={{ opacity: 1,
  y: 0 }}
              exit={{ opacity: 0,
  y: -20 }}
              className={`message ${message.role}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <Circle className="w-6 h-6" />
                ) : (
                  <Bot className="w-6 h-6" />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                {message.metadata?.attachments && (
                  <div className="message-attachments">
                    {message.metadata.attachments.map((attachment, index) => (
                      <div key={index} className="attachment">
                        <FileText className="w-4 h-4" />
                        <span>{attachment.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="message-actions">
                  <button onClick={() => copyMessage(message.content)}>
                    <Copy className="w-4 h-4" />
                  </button>
                  {message.role === 'user' && (
                    <button onClick={() => editMessage(message.id, message.content)}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteMessage(message.id)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => speakMessage(message.content)}>
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="message assistant streaming"
          >
            <div className="message-avatar">
              <Bot className="w-6 h-6" />
            </div>
            <div className="message-content">
              <div className="message-text">
                {streamingMessage}
                <Loader2 className="w-4 h-4 animate-spin inline ml-2" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setInputValue(suggestion);
                inputRef.current?.focus()
}}
              className="suggestion-button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="input-container">
        <div className="input-controls">
          {enableVoice && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {enableFileUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="file-button"
              aria-label="Upload file"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,text/*,.pdf"
          />
        </div>

        <div className="input-main">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="message-input"
            rows={1}
            disabled={isProcessing}
          />

          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() && attachments.length === 0 || isProcessing}
            className="send-button"
            aria-label="Send message"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="attachments">
            {attachments.map((file, index) => (
              <div key={index} className="attachment-item">
                <FileText className="w-4 h-4" />
                <span>{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="remove-attachment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compliance Badge */}
      {auditTrail && (
        <div className="compliance-badge">
          <Shield className="w-3 h-3" />
          <span>{complianceLevel.toUpperCase()} Compliant</span>
        </div>
      )}
    </div>
  )
};

// Export with enterprise HOCs
export default withCompliance(
  withPerformance(AdvancedAIAssistant, {
    metrics: ['responseTime', 'accuracy', 'userSatisfaction'],
    auditTrail: true
  }),
  {
    complianceLevel: 'gdpr',
  dataClassification: 'confidential',
    auditLogging: true
  }
);
