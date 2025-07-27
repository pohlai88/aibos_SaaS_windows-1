'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

// ==================== MANIFESTOR INTEGRATION ====================
import { useManifestor, usePermission, useModuleConfig, useModuleEnabled } from '@/hooks/useManifestor';

interface VoiceCommand {
  id: string;
  phrase: string;
  action: () => void;
  category: 'development' | 'navigation' | 'data' | 'system';
}

interface VoiceCommandBarProps {
  wakeWord?: string;
  commands?: VoiceCommand[];
  aiResponse?: boolean;
  className?: string;
}

export const VoiceCommandBar: React.FC<VoiceCommandBarProps> = ({
  wakeWord = "Hey AI-BOS",
  commands = [],
  aiResponse = true,
  className = ""
}) => {
  // ==================== MANIFESTOR INTEGRATION ====================
  const { manifestor, health, isHealthy } = useManifestor();
  const manifestLoading = false; // TODO: Add loading state to useManifestor
  const manifestError = null; // TODO: Add error state to useManifestor
  const moduleConfig = useModuleConfig('ai-components');
  const isModuleEnabled = useModuleEnabled('ai-components');

  // Check permissions for current user
  const currentUser = { id: 'current-user', role: 'user', permissions: [] };
  const canView = usePermission('ai-components', 'view', currentUser);
  const canVoiceControl = usePermission('ai-components', 'voice_control', currentUser);

  // Get configuration from manifest
  const voiceConfig = moduleConfig.components?.VoiceCommandBar;
  const features = moduleConfig.features;
  const performance = moduleConfig.performance;
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // ==================== MANIFESTOR PERMISSION CHECKS ====================
  if (manifestLoading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-16 w-full" />;
  }

  if (manifestError) {
    return <div className="text-red-600 p-2">Voice Control Error</div>;
  }

  if (!isModuleEnabled) {
    return <div className="text-gray-600 p-2">Voice Control Disabled</div>;
  }

  if (!canView || !canVoiceControl) {
    return <div className="text-gray-600 p-2">Voice Control Access Denied</div>;
  }

  // Check if voice features are enabled
  const speechRecognitionEnabled = voiceConfig?.features?.speech_recognition;
  const voiceSynthesisEnabled = voiceConfig?.features?.voice_synthesis;
  const commandExecutionEnabled = voiceConfig?.features?.command_execution;
  const customCommandsEnabled = voiceConfig?.features?.custom_commands;
  const noiseReductionEnabled = voiceConfig?.features?.noise_reduction;

  // Initialize speech recognition
  useEffect(() => {
    if (!speechRecognitionEnabled) return;

    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        try {
          const recognitionInstance = new SpeechRecognitionAPI();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = true;
          recognitionInstance.lang = 'en-US';

          recognitionInstance.onstart = () => {
            setIsListening(true);
            setIsProcessing(false);
          };

          recognitionInstance.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            const fullTranscript = finalTranscript + interimTranscript;
            setTranscript(fullTranscript);

            // Check for wake word
            if ((fullTranscript || '').toLowerCase().includes((wakeWord || '').toLowerCase())) {
              handleWakeWord();
            }

            // Process commands
            if (finalTranscript) {
              processCommand(finalTranscript);
            }
          };

          recognitionInstance.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setIsProcessing(false);
          };

          recognitionInstance.onend = () => {
            setIsListening(false);
          };

          setRecognition(recognitionInstance);
          setIsSupported(true);
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    }
  }, [wakeWord]);

  const handleWakeWord = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }
    setIsProcessing(true);
    setTranscript('');

    // Generate AI suggestions
    if (aiResponse) {
      generateSuggestions();
    }
  };

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Find matching command
    const matchedCommand = commands.find(cmd =>
      (lowerCommand || '').includes((cmd.phrase || '').toLowerCase())
    );

    if (matchedCommand) {
      executeCommand(matchedCommand);
    } else {
      // AI-powered command interpretation
      interpretCommand(command);
    }
  };

  const executeCommand = (command: VoiceCommand) => {
    setIsProcessing(true);

    // Visual feedback
    showCommandFeedback(command.phrase);

    // Execute command
    setTimeout(() => {
      command.action();
      setIsProcessing(false);
      setTranscript('');
    }, 1000);
  };

  const interpretCommand = (command: string) => {
    setIsProcessing(true);

    // AI interpretation logic
    const interpretedAction = interpretWithAI(command);

    setTimeout(() => {
      interpretedAction();
      setIsProcessing(false);
      setTranscript('');
    }, 2000);
  };

  const interpretWithAI = (command: string) => {
    // AI-powered command interpretation
    const actions: Record<string, () => void> = {
      'create': () => console.log('Creating...'),
      'show': () => console.log('Showing...'),
      'generate': () => console.log('Generating...'),
      'build': () => console.log('Building...'),
      'deploy': () => console.log('Deploying...'),
    };

    const action = Object.keys(actions).find(key =>
      (command || '').toLowerCase().includes(key)
    );

    return actions[action || ''] || (() => console.log('Command not understood'));
  };

  const generateSuggestions = () => {
    const aiSuggestions = [
      "Create a customer dashboard",
      "Show me user analytics",
      "Generate API documentation",
      "Build a new component",
      "Deploy to production"
    ];
    setSuggestions(aiSuggestions);
  };

  const showCommandFeedback = (command: string) => {
    // Create visual feedback element
    const feedback = document.createElement('div');
    feedback.className = 'voice-feedback';
    feedback.textContent = `Executing: ${command}`;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--gradient-primary);
      color: white;
      padding: 1rem 2rem;
      border-radius: 1rem;
      z-index: 10000;
      font-weight: 600;
      box-shadow: var(--shadow-xl);
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
      if (document.body.contains(feedback)) {
        document.body.removeChild(feedback);
      }
    }, 2000);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  if (!isSupported) {
    return (
      <div className={`voice-command-bar ${className}`}>
        <div className="voice-indicator disabled">
          <MicOff size={24} />
          <span>Voice commands not supported</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`voice-command-bar ${className}`}>
        {/* Voice Command Indicator */}
        <div
          className={`voice-indicator ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={toggleListening}
        >
          {isProcessing ? (
            <div className="ai-loading" />
          ) : isListening ? (
            <MicOff size={24} />
          ) : (
            <Mic size={24} />
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="transcript-display">
            <div className="transcript-content">
              <Sparkles size={16} />
              <span>{transcript}</span>
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="ai-suggestions">
            <h4>AI Suggestions:</h4>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setTranscript(suggestion);
                    processCommand(suggestion);
                    setSuggestions([]);
                  }}
                >
                  <Volume2 size={14} />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audio feedback */}
      <audio ref={audioRef} src="/sounds/wake-word.mp3" preload="auto" />

      <style jsx>{`
        .voice-command-bar {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }

        .voice-indicator {
          position: relative;
          width: 60px;
          height: 60px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          transition: all 0.3s ease;
          color: white;
        }

        .voice-indicator:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-xl);
        }

        .voice-indicator.listening {
          animation: voicePulse 1.5s ease-in-out infinite;
        }

        .voice-indicator.processing {
          background: var(--gradient-neural);
        }

        .voice-indicator.disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .transcript-display {
          background: var(--light-surface);
          border: 1px solid var(--light-border);
          border-radius: var(--radius-lg);
          padding: 1rem;
          box-shadow: var(--shadow-lg);
          max-width: 300px;
          min-width: 200px;
        }

        .transcript-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--light-text);
          font-size: 0.875rem;
        }

        .ai-suggestions {
          background: var(--light-surface);
          border: 1px solid var(--light-border);
          border-radius: var(--radius-lg);
          padding: 1rem;
          box-shadow: var(--shadow-lg);
          max-width: 300px;
          min-width: 200px;
        }

        .ai-suggestions h4 {
          margin: 0 0 0.5rem 0;
          color: var(--light-text);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--light-bg);
          border: 1px solid var(--light-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.75rem;
          color: var(--light-text);
        }

        .suggestion-item:hover {
          background: var(--ai-primary);
          color: white;
          border-color: var(--ai-primary);
        }

        @keyframes voicePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: var(--shadow-lg);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 0 20px rgba(102, 126, 234, 0.2);
          }
        }

        @media (max-width: 768px) {
          .voice-command-bar {
            bottom: 1rem;
            right: 1rem;
          }

          .voice-indicator {
            width: 50px;
            height: 50px;
          }

          .transcript-display,
          .ai-suggestions {
            max-width: calc(100vw - 2rem);
          }
        }
      `}</style>
    </>
  );
};
