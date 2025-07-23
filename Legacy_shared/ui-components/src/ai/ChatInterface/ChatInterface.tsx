import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';
import { Button } from '../../primitives/Button/Button';
import { Input } from '../../primitives/Input/Input';
import { Avatar } from '../../primitives/Avatar/Avatar';
import { Card, CardContent } from '../../primitives/Card/Card';

const chatInterfaceVariants = cva(
  'flex flex-col h-full bg-white border border-gray-200 rounded-lg',
  {
    variants: {
      variant: {
        default: 'bg-white',
  dark: 'bg-gray-900 text-white',
        compact: 'bg-gray-50',
      },
      size: {
        sm: 'max-h-96',
  md: 'max-h-[600px]',
        lg: 'max-h-[800px]',
  full: 'h-full',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    confidence?: number
};
  status?: 'sending' | 'sent' | 'error' | 'processing'
}

export interface ChatInterfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatInterfaceVariants> {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  userAvatar?: string;
  assistantAvatar?: string;
  systemAvatar?: string;
  showTypingIndicator?: boolean;
  maxMessages?: number;
  autoScroll?: boolean;
  enableMarkdown?: boolean;
  enableCodeHighlighting?: boolean;
  onMessageClick?: (message: ChatMessage) => void
}

const ChatInterfaceComponent: React.FC<ChatInterfaceProps> = ({
  className,
  variant,
  size,
  messages,
  onSendMessage,
  onRetryMessage,
  onDeleteMessage,
  placeholder = 'Type your message...',
  disabled = false,
  loading = false,
  userAvatar,
  assistantAvatar,
  systemAvatar,
  showTypingIndicator = true,
  maxMessages = 100,
  autoScroll = true,
  enableMarkdown = true,
  enableCodeHighlighting = true,
  onMessageClick,
  ...props
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
};

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
}
  }, [messages, autoScroll]);

  useEffect(() => {
    if (loading) {
      setIsTyping(true)
} else {
      setIsTyping(false)
}
  }, [loading]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || disabled || loading) return;

    const message = inputValue.trim();
    setInputValue('');
    onSendMessage(message);

    auditLog('chat_message_sent', {
      component: 'ChatInterface',
  messageLength: message.length,
      timestamp: new Date().toISOString(),
    })
};

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage()
}
  };

  const handleRetry = (messageId: string) => {
    if (onRetryMessage) {
      onRetryMessage(messageId);
      auditLog('chat_message_retry', {
        component: 'ChatInterface',
        messageId,
      })
}
  };

  const handleDelete = (messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
      auditLog('chat_message_delete', {
        component: 'ChatInterface',
        messageId,
      })
}
  };

  const getAvatar = (role: string) => {
    switch (role) {
      case 'user':
        return userAvatar || '/api/avatars/user';
      case 'assistant':
        return assistantAvatar || '/api/avatars/assistant';
      case 'system':
        return systemAvatar || '/api/avatars/system';
      default:
        return undefined
}
  };

  const getAvatarFallback = (role: string) => {
    switch (role) {
      case 'user':
        return 'U';
      case 'assistant':
        return 'AI';
      case 'system':
        return 'S';
      default:
        return '?'
}
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';
    const isSystem = message.role === 'system';

    return (
      <div
        key={message.id}
        className={cn(
          'flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors',
          isUser && 'flex-row-reverse space-x-reverse',
          message.status === 'error' && 'bg-red-50',
          message.status === 'processing' && 'bg-blue-50'
        )}
        onClick={() => onMessageClick?.(message)}
      >
        <Avatar
          src={getAvatar(message.role)}
          alt={`${message.role} avatar`}
          fallback={getAvatarFallback(message.role)}
          size="sm"
          variant={isUser ? 'primary' : isAssistant ? 'success' : 'secondary'}
        />

        <div className={cn('flex-1 min-w-0', isUser && 'text-right')}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'AI Assistant' : 'System'}
            </span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {message.status === 'error' && (
              <span className="text-xs text-red-500">Error</span>
            )}
            {message.status === 'processing' && (
              <span className="text-xs text-blue-500">Processing...</span>
            )}
          </div>

          <div className={cn(
            'text-sm text-gray-900 whitespace-pre-wrap break-words',
            enableMarkdown && 'prose prose-sm max-w-none'
          )}>
            {message.content}
          </div>

          {message.metadata && (
            <div className="mt-2 text-xs text-gray-500 space-x-4">
              {message.metadata.model && (
                <span>Model: {message.metadata.model}</span>
              )}
              {message.metadata.tokens && (
                <span>Tokens: {message.metadata.tokens}</span>
              )}
              {message.metadata.processingTime && (
                <span>Time: {message.metadata.processingTime}ms</span>
              )}
              {message.metadata.confidence && (
                <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
              )}
            </div>
          )}

          <div className="mt-2 flex items-center space-x-2">
            {message.status === 'error' && onRetryMessage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRetry(message.id)}
              >
                Retry
              </Button>
            )}
            {onDeleteMessage && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(message.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    )
};

  const displayedMessages = messages.slice(-maxMessages);

  return (
    <div
      className={cn(chatInterfaceVariants({ variant, size }), className)}
      {...props}
    >
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayedMessages.map(renderMessage)}

        {showTypingIndicator && isTyping && (
          <div className="flex items-start space-x-3 p-4">
            <Avatar
              src={getAvatar('assistant')}
              alt="Assistant avatar"
              fallback="AI"
              size="sm"
              variant="success"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-900">AI Assistant</span>
                <span className="text-xs text-gray-500">Typing...</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || disabled || loading}
            loading={loading}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
};

export const ChatInterface = withCompliance(withPerformance(ChatInterfaceComponent));

export default ChatInterface;
