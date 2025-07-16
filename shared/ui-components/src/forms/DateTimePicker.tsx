import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Globe, Zap, AlertTriangle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Natural language date parser with timezone support
class NaturalLanguageDateParser {
  private userTimezone: string;
  private now: Date;

  constructor(userTimezone?: string) {
    this.userTimezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.now = new Date();
  }

  parse(input: string): { date: Date; confidence: number; parsedText: string } {
    const normalizedInput = input.toLowerCase().trim();
    
    // Handle timezone-aware expressions
    if (normalizedInput.includes('my time') || normalizedInput.includes('local time')) {
      return this.parseTimezoneAware(normalizedInput);
    }

    // Handle relative dates
    if (normalizedInput.includes('next') || normalizedInput.includes('last')) {
      return this.parseRelativeDate(normalizedInput);
    }

    // Handle absolute dates
    return this.parseAbsoluteDate(normalizedInput);
  }

  private parseTimezoneAware(input: string): { date: Date; confidence: number; parsedText: string } {
    // Remove timezone indicators
    const cleanInput = input
      .replace(/\bmy time\b/g, '')
      .replace(/\blocal time\b/g, '')
      .trim();

    // Parse the base expression
    const baseResult = this.parseRelativeDate(cleanInput);
    
    if (baseResult.confidence > 0.5) {
      // Convert to user's timezone
      const userDate = new Date(baseResult.date.toLocaleString('en-US', {
        timeZone: this.userTimezone
      }));

      return {
        date: userDate,
        confidence: baseResult.confidence * 0.9, // Slightly lower confidence for timezone conversion
        parsedText: `${baseResult.parsedText} in your timezone (${this.userTimezone})`
      };
    }

    return baseResult;
  }

  private parseRelativeDate(input: string): { date: Date; confidence: number; parsedText: string } {
    const now = new Date();
    let targetDate = new Date(now);
    let confidence = 0.8;
    let parsedText = '';

    // Handle "next" expressions
    if (input.includes('next')) {
      if (input.includes('friday')) {
        targetDate = this.getNextDayOfWeek(5); // Friday
        parsedText = 'Next Friday';
      } else if (input.includes('monday')) {
        targetDate = this.getNextDayOfWeek(1);
        parsedText = 'Next Monday';
      } else if (input.includes('week')) {
        targetDate.setDate(now.getDate() + 7);
        parsedText = 'Next week';
      } else if (input.includes('month')) {
        targetDate.setMonth(now.getMonth() + 1);
        parsedText = 'Next month';
      }
    }

    // Handle "last" expressions
    if (input.includes('last')) {
      if (input.includes('friday')) {
        targetDate = this.getLastDayOfWeek(5);
        parsedText = 'Last Friday';
      } else if (input.includes('week')) {
        targetDate.setDate(now.getDate() - 7);
        parsedText = 'Last week';
      }
    }

    // Handle time expressions
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1] || '0');
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3]?.toLowerCase();

      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      targetDate.setHours(hours, minutes, 0, 0);
      parsedText += ` at ${hours}:${minutes.toString().padStart(2, '0')} ${period?.toUpperCase() || ''}`;
    }

    return { date: targetDate, confidence, parsedText: parsedText.trim() };
  }

  private parseAbsoluteDate(input: string): { date: Date; confidence: number; parsedText: string } {
    // Handle various date formats
    const dateFormats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\w+)\s+(\d{1,2}),?\s+(\d{4})/, // Month DD, YYYY
    ];

    for (const format of dateFormats) {
      const match = input.match(format);
      if (match) {
        const [_, month, day, year] = match;
        const date = new Date(parseInt(year || '0'), parseInt(month || '1') - 1, parseInt(day || '1'));
        
        return {
          date,
          confidence: 0.9,
          parsedText: date.toLocaleDateString()
        };
      }
    }

    return { date: new Date(), confidence: 0.1, parsedText: 'Could not parse date' };
  }

  private getNextDayOfWeek(targetDay: number): Date {
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    return targetDate;
  }

  private getLastDayOfWeek(targetDay: number): Date {
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilTarget = (targetDay - currentDay - 7) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntilTarget);
    return targetDate;
  }
}

// Enhanced DateTimePicker with AI-powered parsing
export interface DateTimePickerProps extends VariantProps<typeof datePickerVariants> {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  enableNaturalLanguage?: boolean;
  enableTimezone?: boolean;
  aiFeatures?: {
    smartSuggestions?: boolean;
    usageOptimization?: boolean;
    contextAware?: boolean;
  };
}

const datePickerVariants = cva(
  'relative w-full',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-muted',
        outlined: 'border border-border',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder = "Enter date and time...",
  disabled = false,
  className,
  enableNaturalLanguage = true,
  enableTimezone = true,
  aiFeatures = {},
  variant = 'default',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const [parsingConfidence, setParsingConfidence] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const parser = useRef<NaturalLanguageDateParser>();

  // Initialize parser with user timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);
    parser.current = new NaturalLanguageDateParser(timezone);
  }, []);

  // Generate AI-powered suggestions
  useEffect(() => {
    if (aiFeatures.smartSuggestions && inputValue.length > 0) {
      const commonExpressions = [
        'next friday at 4 pm',
        'tomorrow at 9 am',
        'next week monday',
        'in 2 hours',
        'next month 15th',
        'last friday',
        'this weekend',
        'next business day',
      ];

      const filtered = commonExpressions.filter(expr => 
        expr.toLowerCase().includes(inputValue.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  }, [inputValue, aiFeatures.smartSuggestions]);

  // Parse natural language input
  const parseInput = useCallback((input: string) => {
    if (!parser.current || !enableNaturalLanguage) return;

    const result = parser.current.parse(input);
    setParsedDate(result.date);
    setParsingConfidence(result.confidence);

    if (result.confidence > 0.7) {
      setInputValue(result.parsedText);
      onChange?.(result.date);
    }
  }, [enableNaturalLanguage, onChange]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    parseInput(value);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    parseInput(suggestion);
    setSuggestions([]);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(datePickerVariants({ variant, size }), className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2 rounded-md border border-border bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            enableNaturalLanguage && 'pr-12'
          )}
        />
        
        {enableNaturalLanguage && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {enableTimezone && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsing Confidence Indicator */}
      {parsingConfidence > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {parsingConfidence > 0.7 ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : parsingConfidence > 0.4 ? (
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            )}
            <span className="text-xs text-muted-foreground">
              Confidence: {Math.round(parsingConfidence * 100)}%
            </span>
          </div>
          
          {parsedDate && (
            <span className="text-xs text-muted-foreground">
              Parsed: {formatDate(parsedDate)}
            </span>
          )}
        </div>
      )}

      {/* Timezone Information */}
      {enableTimezone && userTimezone && (
        <div className="mt-1 text-xs text-muted-foreground">
          Your timezone: {userTimezone}
        </div>
      )}
    </div>
  );
}; 