import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AIMessage } from './AIAssistant';

export interface Conversation {
  id: string;
  title: string;
  messages: AIMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: Record<string, any>;
}

export interface AIAssistantContextValue {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  models: AIModel[];
  settings: AISettings;
  
  // Conversation management
  createConversation: (title?: string, model?: string) => Promise<Conversation>;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  
  // Message management
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  
  // AI features
  generateTitle: (messages: AIMessage[]) => Promise<string>;
  summarizeConversation: (conversationId: string) => Promise<string>;
  exportConversation: (conversationId: string, format: 'json' | 'markdown' | 'pdf') => Promise<void>;
  
  // Settings
  updateSettings: (settings: Partial<AISettings>) => void;
  resetSettings: () => void;
  
  // Context management
  addContext: (context: string) => void;
  clearContext: () => void;
  getContext: () => string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
  isAvailable: boolean;
}

export interface AISettings {
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  enableStreaming: boolean;
  enableVoice: boolean;
  enableFileUpload: boolean;
  enableCodeHighlighting: boolean;
  enableSuggestions: boolean;
  autoSave: boolean;
  autoScroll: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
  };
}

const AIAssistantContext = createContext<AIAssistantContextValue | undefined>(undefined);

export interface AIAssistantProviderProps {
  children: ReactNode;
  apiEndpoint?: string;
  initialSettings?: Partial<AISettings>;
  enablePersistence?: boolean;
  maxConversations?: number;
  maxMessagesPerConversation?: number;
}

const defaultSettings: AISettings = {
  defaultModel: 'gpt-4',
  maxTokens: 4000,
  temperature: 0.7,
  enableStreaming: true,
  enableVoice: true,
  enableFileUpload: true,
  enableCodeHighlighting: true,
  enableSuggestions: true,
  autoSave: true,
  autoScroll: true,
  theme: 'auto',
  language: 'en',
  voiceSettings: {
    voice: 'en-US-Neural2-F',
    speed: 1,
    pitch: 1
  }
};

const defaultModels: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    capabilities: ['text', 'code', 'reasoning', 'creative'],
    maxTokens: 8192,
    costPerToken: 0.00003,
    isAvailable: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    capabilities: ['text', 'code'],
    maxTokens: 4096,
    costPerToken: 0.000002,
    isAvailable: true
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    capabilities: ['text', 'code', 'reasoning', 'creative'],
    maxTokens: 100000,
    costPerToken: 0.000015,
    isAvailable: true
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    capabilities: ['text', 'code', 'multimodal'],
    maxTokens: 32768,
    costPerToken: 0.00001,
    isAvailable: true
  }
];

export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({
  children,
  apiEndpoint = '/api/ai',
  initialSettings = {},
  enablePersistence = true,
  maxConversations = 100,
  maxMessagesPerConversation = 1000
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models] = useState<AIModel[]>(defaultModels);
  const [settings, setSettings] = useState<AISettings>({ ...defaultSettings, ...initialSettings });
  const [context, setContext] = useState<string[]>([]);

  // Load conversations from localStorage
  useEffect(() => {
    if (enablePersistence) {
      try {
        const saved = localStorage.getItem('ai-assistant-conversations');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConversations(parsed.conversations || []);
          setCurrentConversation(parsed.currentConversation || null);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }
  }, [enablePersistence]);

  // Save conversations to localStorage
  useEffect(() => {
    if (enablePersistence && conversations.length > 0) {
      try {
        localStorage.setItem('ai-assistant-conversations', JSON.stringify({
          conversations,
          currentConversation
        }));
      } catch (error) {
        console.error('Failed to save conversations:', error);
      }
    }
  }, [conversations, currentConversation, enablePersistence]);

  // Create new conversation
  const createConversation = useCallback(async (title?: string, model?: string): Promise<Conversation> => {
    const conversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: title || 'New Conversation',
      messages: [],
      model: model || settings.defaultModel,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      metadata: {}
    };

    setConversations(prev => {
      const updated = [conversation, ...prev.slice(0, maxConversations - 1)];
      return updated;
    });

    setCurrentConversation(conversation);
    return conversation;
  }, [settings.defaultModel, maxConversations]);

  // Switch conversation
  const switchConversation = useCallback((conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    if (currentConversation?.id === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      setCurrentConversation(remaining[0] || null);
    }
  }, [conversations, currentConversation]);

  // Update conversation
  const updateConversation = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, ...updates, updatedAt: new Date() } : c
    ));
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  }, [currentConversation]);

  // Send message
  const sendMessage = useCallback(async (content: string, attachments?: File[]): Promise<void> => {
    if (!currentConversation) {
      await createConversation();
    }

    const conversation = currentConversation!;
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };

    // Add attachments if any
    if (attachments && attachments.length > 0) {
      userMessage.metadata = {
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size
        }))
      };
    }

    // Add user message
    const updatedMessages = [...conversation.messages, userMessage];
    updateConversation(conversation.id, { messages: updatedMessages });

    setIsLoading(true);
    setError(null);

    try {
      // Prepare request data
      const formData = new FormData();
      formData.append('message', content);
      formData.append('model', conversation.model);
      formData.append('maxTokens', settings.maxTokens.toString());
      formData.append('temperature', settings.temperature.toString());
      formData.append('enableStreaming', settings.enableStreaming.toString());
      
      // Add context if available
      if (context.length > 0) {
        formData.append('context', JSON.stringify(context));
      }

      // Add attachments
      if (attachments) {
        attachments.forEach(file => {
          formData.append('files', file);
        });
      }

      // Send request
      const response = await fetch(`${apiEndpoint}/chat`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

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
          suggestions: data.suggestions
        },
        status: 'sent'
      };

      // Add assistant message
      const finalMessages = [...updatedMessages, assistantMessage];
      updateConversation(conversation.id, { messages: finalMessages });

      // Auto-generate title if it's the first message
      if (conversation.messages.length === 0) {
        const title = await generateTitle([userMessage, assistantMessage]);
        updateConversation(conversation.id, { title });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      
      // Mark message as failed
      const failedMessages = conversation.messages.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' as const } : msg
      );
      updateConversation(conversation.id, { messages: failedMessages });
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, createConversation, updateConversation, context, settings, apiEndpoint]);

  // Edit message
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (!currentConversation) return;

    const updatedMessages = currentConversation.messages.map(msg => 
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );
    updateConversation(currentConversation.id, { messages: updatedMessages });
  }, [currentConversation, updateConversation]);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (!currentConversation) return;

    const updatedMessages = currentConversation.messages.filter(msg => msg.id !== messageId);
    updateConversation(currentConversation.id, { messages: updatedMessages });
  }, [currentConversation, updateConversation]);

  // Generate conversation title
  const generateTitle = useCallback(async (messages: AIMessage[]): Promise<string> => {
    try {
      const response = await fetch(`${apiEndpoint}/generate-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(0, 3) })
      });

      if (!response.ok) throw new Error('Failed to generate title');

      const { title } = await response.json();
      return title;
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Conversation';
    }
  }, [apiEndpoint]);

  // Summarize conversation
  const summarizeConversation = useCallback(async (conversationId: string): Promise<string> => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');

    try {
      const response = await fetch(`${apiEndpoint}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: conversation.messages,
          model: conversation.model 
        })
      });

      if (!response.ok) throw new Error('Failed to summarize conversation');

      const { summary } = await response.json();
      return summary;
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      throw error;
    }
  }, [conversations, apiEndpoint]);

  // Export conversation
  const exportConversation = useCallback(async (conversationId: string, format: 'json' | 'markdown' | 'pdf'): Promise<void> => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');

    try {
      const response = await fetch(`${apiEndpoint}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversation,
          format 
        })
      });

      if (!response.ok) throw new Error('Failed to export conversation');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conversation.title}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting conversation:', error);
      throw error;
    }
  }, [conversations, apiEndpoint]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Reset settings
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Context management
  const addContext = useCallback((contextItem: string) => {
    setContext(prev => [...prev, contextItem]);
  }, []);

  const clearContext = useCallback(() => {
    setContext([]);
  }, []);

  const getContext = useCallback(() => {
    return context;
  }, [context]);

  const contextValue: AIAssistantContextValue = {
    conversations,
    currentConversation,
    isLoading,
    error,
    models,
    settings,
    createConversation,
    switchConversation,
    deleteConversation,
    updateConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    generateTitle,
    summarizeConversation,
    exportConversation,
    updateSettings,
    resetSettings,
    addContext,
    clearContext,
    getContext
  };

  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  );
};

// Hook to use AI assistant context
export const useAIAssistant = (): AIAssistantContextValue => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}; 