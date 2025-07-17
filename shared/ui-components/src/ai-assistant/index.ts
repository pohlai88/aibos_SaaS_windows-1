/**
 * AI Assistant UI Components
 *
 * State-of-the-art AI assistant components for AI-BOS platform.
 * Provides comprehensive AI chat, voice interaction, and conversation management.
 */

// Main Components
export { AIAssistant } from './AIAssistant';
export { AIAssistantProvider, useAIAssistant } from './AIAssistantProvider';

// Types
export type { AIMessage, AIAssistantProps } from './AIAssistant';
export type {
  Conversation,
  AIAssistantContextValue,
  AIAssistantProviderProps,
  AIModel,
  AISettings,
} from './AIAssistantProvider';

// Component Registry Entry
export const AI_ASSISTANT_COMPONENTS = {
  AIAssistant: 'ai-assistant/AIAssistant',
  AIAssistantProvider: 'ai-assistant/AIAssistantProvider',
} as const;

// Default Configuration
export const DEFAULT_AI_ASSISTANT_CONFIG = {
  apiEndpoint: '/api/ai',
  enablePersistence: true,
  maxConversations: 100,
  maxMessagesPerConversation: 1000,
  defaultModel: 'gpt-4',
  maxTokens: 4000,
  temperature: 0.7,
  enableStreaming: true,
  enableVoice: true,
  enableFileUpload: true,
  enableCodeHighlighting: true,
  enableSuggestions: true,
} as const;

// Utility Functions
export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return timestamp.toLocaleDateString();
};

export const estimateTokens = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

export const calculateCost = (tokens: number, costPerToken: number): number => {
  return tokens * costPerToken;
};

export const validateMessage = (content: string): { isValid: boolean; error?: string } => {
  if (!content.trim()) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > 10000) {
    return { isValid: false, error: 'Message too long (max 10,000 characters)' };
  }

  return { isValid: true };
};

export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const sanitizeMessage = (content: string): string => {
  // Basic sanitization - remove potentially harmful content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// AI Model Utilities
export const getModelInfo = (modelId: string) => {
  const models = {
    'gpt-4': {
      name: 'GPT-4',
      provider: 'OpenAI',
      maxTokens: 8192,
      costPerToken: 0.00003,
      capabilities: ['text', 'code', 'reasoning', 'creative'],
    },
    'gpt-3.5-turbo': {
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      maxTokens: 4096,
      costPerToken: 0.000002,
      capabilities: ['text', 'code'],
    },
    'claude-3': {
      name: 'Claude 3',
      provider: 'Anthropic',
      maxTokens: 100000,
      costPerToken: 0.000015,
      capabilities: ['text', 'code', 'reasoning', 'creative'],
    },
    'gemini-pro': {
      name: 'Gemini Pro',
      provider: 'Google',
      maxTokens: 32768,
      costPerToken: 0.00001,
      capabilities: ['text', 'code', 'multimodal'],
    },
  };

  return models[modelId as keyof typeof models] || null;
};

// Conversation Utilities
export const generateConversationTitle = (messages: any[]): string => {
  if (messages.length === 0) return 'New Conversation';

  const firstMessage = messages[0];
  const content = firstMessage.content || '';

  // Extract first sentence or first 50 characters
  const title = content.split(/[.!?]/)[0] || content.substring(0, 50);
  return title.length > 50 ? title.substring(0, 50) + '...' : title;
};

export const summarizeConversation = (messages: any[]): string => {
  if (messages.length === 0) return 'No messages';

  const userMessages = messages.filter((msg) => msg.role === 'user');
  const assistantMessages = messages.filter((msg) => msg.role === 'assistant');

  return `${userMessages.length} user messages, ${assistantMessages.length} AI responses`;
};

// Voice Utilities
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if ('speechSynthesis' in window) {
    return speechSynthesis.getVoices();
  }
  return [];
};

export const speakText = (text: string, voice?: string, speed = 1, pitch = 1): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = pitch;

    if (voice) {
      const voices = getAvailableVoices();
      const selectedVoice = voices.find((v) => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    speechSynthesis.speak(utterance);
  }
};

// File Upload Utilities
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'text/plain',
    'application/json',
  ];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File too large (max 10MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Export Utilities
export const exportConversationAsMarkdown = (conversation: any): string => {
  let markdown = `# ${conversation.title}\n\n`;
  markdown += `**Created:** ${conversation.createdAt.toLocaleString()}\n`;
  markdown += `**Model:** ${conversation.model}\n\n`;
  markdown += `---\n\n`;

  conversation.messages.forEach((message: any) => {
    const role = message.role === 'user' ? '👤 User' : '🤖 AI';
    const time = message.timestamp.toLocaleTimeString();

    markdown += `### ${role} (${time})\n\n`;
    markdown += `${message.content}\n\n`;

    if (message.metadata?.attachments) {
      markdown += `**Attachments:**\n`;
      message.metadata.attachments.forEach((attachment: any) => {
        markdown += `- ${attachment.name} (${formatFileSize(attachment.size)})\n`;
      });
      markdown += `\n`;
    }
  });

  return markdown;
};

export const exportConversationAsJSON = (conversation: any): string => {
  return JSON.stringify(conversation, null, 2);
};
