import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Bot, Sparkles, Settings, Download, Share2, Copy, Edit3, Trash2, Volume2, VolumeX, Camera, FileText, Code, Image, Video, Circle, Zap, Clock, CheckCircle, AlertCircle, Loader2,  } from 'lucide-react';
import type { User } from 'lucide-react';

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
      size: number;
    }>;
  };
  status: 'sending' | 'sent' | 'error' | 'processing';
}

export interface AIAssistantProps {
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
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
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
}) => {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  // Voice recording functionality
  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start voice recording');
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob): Promise<void> => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('model', model);

      const response = await fetch(`${apiEndpoint}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const { text } = await response.json();
      setInputValue(text);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error processing voice input:', error);
      onError?.('Failed to process voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  // File upload handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev: File[]) => [...prev, ...files]);
  };

  const removeAttachment = (index: number): void => {
    setAttachments((prev: File[]) => prev.filter((_, i: number) => i !== index));
  };

  // Message sending
  const sendMessage = async (): Promise<void> => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
    };

    setMessages((prev: AIMessage[]) => [...prev, userMessage]);
    onMessageSend?.(userMessage);

    // Add attachments to message
    if (attachments.length > 0) {
      userMessage.metadata = {
        attachments: attachments.map((file: File) => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size,
        })),
      };
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

      attachments.forEach((file: File) => {
        formData.append('files', file);
      });

      if (enableStreaming) {
        await streamResponse(formData);
      } else {
        await sendRegularRequest(formData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      onError?.('Failed to send message');
      setMessages((prev: AIMessage[]) =>
        prev.map((msg: AIMessage) =>
          msg.id === userMessage.id ? { ...msg, status: 'error' } : msg,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const streamResponse = async (formData: FormData): Promise<void> => {
    const response = await fetch(`${apiEndpoint}/stream`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Streaming request failed');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const assistantMessage: AIMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'text',
      status: 'processing',
    };

    setMessages((prev: AIMessage[]) => [...prev, assistantMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages((prev: AIMessage[]) =>
                prev.map((msg: AIMessage) =>
                  msg.id === assistantMessage.id ? { ...msg, status: 'sent' } : msg,
                ),
              );
              onMessageReceive?.(assistantMessage);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setStreamingMessage(assistantMessage.content);
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const sendRegularRequest = async (formData: FormData): Promise<void> => {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Request failed');

    const data = await response.json();

    const assistantMessage: AIMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: data.content,
      timestamp: new Date(),
      type: 'text',
      metadata: {
        model: data.model,
        tokens: data.tokens,
        processingTime: data.processingTime,
        confidence: data.confidence,
        suggestions: data.suggestions,
      },
      status: 'sent',
    };

    setMessages((prev: AIMessage[]) => [...prev, assistantMessage]);
    onMessageReceive?.(assistantMessage);
  };

  // Keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Generate suggestions based on conversation
  useEffect(() => {
    if (enableSuggestions && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        const suggestions = generateSuggestions(messages);
        setSuggestions(suggestions);
      }
    }
  }, [messages, enableSuggestions]);

  const generateSuggestions = (conversation: AIMessage[]): string[] => {
    // AI-powered suggestion generation based on conversation context
    const context = conversation
      .slice(-3)
      .map((msg) => msg.content)
      .join(' ');

    // This would typically call an AI service for contextual suggestions
    // For now, return generic suggestions
    return [
      'Can you explain that in more detail?',
      'What are the alternatives?',
      'How can I implement this?',
      'Show me an example',
    ];
  };

  const copyMessage = (content: string): void => {
    navigator.clipboard.writeText(content);
  };

  const editMessage = (messageId: string, newContent: string): void => {
    setMessages((prev: AIMessage[]) =>
      prev.map((msg: AIMessage) => (msg.id === messageId ? { ...msg, content: newContent } : msg)),
    );
  };

  const deleteMessage = (messageId: string): void => {
    setMessages((prev: AIMessage[]) => prev.filter((msg: AIMessage) => msg.id !== messageId));
  };

  const speakMessage = (content: string): void => {
    if ('speechSynthesis' in window && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(content);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <p className="text-sm text-blue-100">Powered by {model}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message: AIMessage) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    {message.status === 'processing' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    )}

                    {message.type === 'code' && enableCodeHighlighting ? (
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                        <code>{message.content}</code>
                      </pre>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}

                    {message.metadata?.attachments && (
                      <div className="mt-2 space-y-1">
                        {message.metadata.attachments.map((attachment, index: number) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <FileText className="w-4 h-4" />
                            <span>{attachment.name}</span>
                            <span className="text-gray-500">
                              ({(attachment.size / 1024).toFixed(1)}KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.metadata?.processingTime && (
                      <span>• {message.metadata.processingTime}ms</span>
                    )}
                    {message.metadata?.tokens && <span>• {message.metadata.tokens} tokens</span>}
                  </div>

                  {/* Message Actions */}
                  <div
                    className={`flex items-center space-x-1 mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {message.role === 'assistant' && (
                      <>
                        <button
                          onClick={() => speakMessage(message.content)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => editMessage(message.id, message.content)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming Message */}
        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className="whitespace-pre-wrap">{streamingMessage}</div>
                  <div className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {suggestions.map((suggestion: string, index: number) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file: File, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputValue(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              rows={1}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          <div className="flex items-center space-x-1">
            {enableFileUpload && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}

            {enableVoice && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording ? 'bg-red-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={sendMessage}
              disabled={(!inputValue.trim() && attachments.length === 0) || isProcessing}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.json"
        />
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    /* Handle model change */
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    /* Handle temperature change */
                  }}
                  className="w-full"
                />
                <span className="text-xs">{temperature}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
