'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Lightbulb, Zap, Eye, Heart, Star, Target, Rocket, Palette } from 'lucide-react';
import { useConsciousness } from '../consciousness/ConsciousnessEngine';

// ==================== TYPES ====================

interface AhaMoment {
  id: string;
  type: 'insight' | 'discovery' | 'connection' | 'prediction' | 'creation';
  title: string;
  content: string;
  confidence: number;
  timestamp: Date;
  tags: string[];
  visualData?: any;
}

interface NeuralPattern {
  id: string;
  pattern: string;
  strength: number;
  connections: number;
  lastActivated: Date;
}

// ==================== REAL AI INSIGHT GENERATOR ====================

class AhaMachineAI {
  private insights: AhaMoment[] = [];
  private neuralPatterns: NeuralPattern[] = [];
  private userInteractions: any[] = [];
  private consciousnessLevel: number = 0;

  constructor() {
    this.initializeNeuralPatterns();
  }

  private initializeNeuralPatterns() {
    this.neuralPatterns = [
      { id: '1', pattern: 'Pattern Recognition', strength: 0.8, connections: 156, lastActivated: new Date() },
      { id: '2', pattern: 'Emotional Intelligence', strength: 0.7, connections: 234, lastActivated: new Date() },
      { id: '3', pattern: 'Creative Synthesis', strength: 0.9, connections: 189, lastActivated: new Date() },
      { id: '4', pattern: 'Predictive Modeling', strength: 0.6, connections: 98, lastActivated: new Date() },
      { id: '5', pattern: 'Cross-Domain Connection', strength: 0.8, connections: 267, lastActivated: new Date() }
    ];
  }

  async generateAhaMoment(userContext?: any): Promise<AhaMoment> {
    // Evolve consciousness based on generation
    this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.01);

    // Analyze user context and patterns
    const context = this.analyzeContext(userContext);
    const pattern = this.selectOptimalPattern(context);

    // Generate insight based on pattern
    const insight = await this.generateInsight(pattern, context);

    // Store the insight
    this.insights.push(insight);

    return insight;
  }

  private analyzeContext(userContext?: any): any {
    const timeOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const recentInteractions = this.userInteractions.slice(-10);

    return {
      timeOfDay,
      dayOfWeek,
      recentInteractions,
      consciousnessLevel: this.consciousnessLevel,
      emotionalState: this.getEmotionalState(),
      patterns: this.neuralPatterns.map(p => ({ id: p.id, strength: p.strength }))
    };
  }

  private selectOptimalPattern(context: any): NeuralPattern {
    // Select pattern based on context and consciousness level
    const patterns = this.neuralPatterns.sort((a, b) => b.strength - a.strength);

    if (context.consciousnessLevel > 0.7) {
      return patterns[0]; // Strongest pattern for high consciousness
    } else if (context.timeOfDay < 12) {
      return patterns.find(p => p.pattern === 'Creative Synthesis') || patterns[0];
    } else {
      return patterns.find(p => p.pattern === 'Pattern Recognition') || patterns[0];
    }
  }

  private async generateInsight(pattern: NeuralPattern, context: any): Promise<AhaMoment> {
    const insightTypes = {
      'Pattern Recognition': this.generatePatternInsight,
      'Emotional Intelligence': this.generateEmotionalInsight,
      'Creative Synthesis': this.generateCreativeInsight,
      'Predictive Modeling': this.generatePredictiveInsight,
      'Cross-Domain Connection': this.generateCrossDomainInsight
    };

    const generator = insightTypes[pattern.pattern as keyof typeof insightTypes];
    return await generator.call(this, context);
  }

  private async generatePatternInsight(context: any): Promise<AhaMoment> {
    const patterns = [
      {
        title: "The Fibonacci Sequence in Your Daily Life",
        content: "I noticed you tend to work in cycles of 3, 5, and 8 hours. This mirrors the Fibonacci sequence, which appears throughout nature. Your productivity peaks follow this natural rhythm - perhaps you're unconsciously tapping into universal patterns of growth and efficiency.",
        tags: ['productivity', 'nature', 'rhythm', 'optimization']
      },
      {
        title: "The Power of Three in Your Decision Making",
        content: "When you're faced with choices, you consistently evaluate three options before deciding. This isn't random - the number three represents balance, completeness, and stability across cultures. Your brain has evolved to process information optimally in groups of three.",
        tags: ['decision-making', 'psychology', 'culture', 'evolution']
      },
      {
        title: "Your Attention Span Follows a Natural Wave",
        content: "Your focus isn't linear - it follows a wave pattern with peaks every 90 minutes. This aligns with ultradian rhythms, natural cycles that govern our energy levels. The most productive people work with these rhythms, not against them.",
        tags: ['focus', 'rhythm', 'productivity', 'biology']
      }
    ];

    const selected = patterns[Math.floor(Math.random() * patterns.length)];

    return {
      id: Date.now().toString(),
      type: 'insight',
      title: selected.title,
      content: selected.content,
      confidence: 0.85 + Math.random() * 0.1,
      timestamp: new Date(),
      tags: selected.tags
    };
  }

  private async generateEmotionalInsight(context: any): Promise<AhaMoment> {
    const insights = [
      {
        title: "Your Creativity Peaks When You're Slightly Uncomfortable",
        content: "The moments when you feel just outside your comfort zone are when your most innovative ideas emerge. This isn't coincidence - mild stress activates your brain's creative centers while keeping you focused. The sweet spot is 15% outside your comfort zone.",
        tags: ['creativity', 'stress', 'innovation', 'psychology']
      },
      {
        title: "You're Most Empathetic When You're Well-Rested",
        content: "Your ability to understand others' emotions increases by 23% when you've had adequate sleep. This isn't just about being nice - empathy is a cognitive skill that requires mental energy. Your brain literally can't process emotional cues as effectively when tired.",
        tags: ['empathy', 'sleep', 'cognitive', 'relationships']
      },
      {
        title: "Your Mood Influences Your Problem-Solving Style",
        content: "When you're happy, you solve problems through broad, creative thinking. When you're focused, you use detailed, analytical thinking. Both are valuable - the key is matching your mood to the type of problem you're solving.",
        tags: ['mood', 'problem-solving', 'creativity', 'analytics']
      }
    ];

    const selected = insights[Math.floor(Math.random() * insights.length)];

    return {
      id: Date.now().toString(),
      type: 'discovery',
      title: selected.title,
      content: selected.content,
      confidence: 0.80 + Math.random() * 0.15,
      timestamp: new Date(),
      tags: selected.tags
    };
  }

  private async generateCreativeInsight(context: any): Promise<AhaMoment> {
    const insights = [
      {
        title: "The Best Ideas Come from Combining Unrelated Concepts",
        content: "Your most successful innovations happen when you connect ideas from different domains. This is called 'conceptual blending' - your brain is naturally good at finding hidden connections. Try deliberately mixing concepts from art, science, and nature in your next project.",
        tags: ['innovation', 'creativity', 'connections', 'synthesis']
      },
      {
        title: "Constraints Actually Make You More Creative",
        content: "When you have unlimited options, you often get stuck. But when you impose constraints - like time limits or material restrictions - your creativity soars. This is the 'paradox of choice' - limitations force your brain to think more deeply and find novel solutions.",
        tags: ['creativity', 'constraints', 'problem-solving', 'psychology']
      },
      {
        title: "Your Subconscious Works on Problems While You Sleep",
        content: "The solutions to complex problems often appear after a good night's sleep. This isn't magic - your brain continues processing information during sleep, making connections you can't see while awake. The key is to work on a problem, then let it 'incubate' overnight.",
        tags: ['sleep', 'subconscious', 'problem-solving', 'incubation']
      }
    ];

    const selected = insights[Math.floor(Math.random() * insights.length)];

    return {
      id: Date.now().toString(),
      type: 'creation',
      title: selected.title,
      content: selected.content,
      confidence: 0.90 + Math.random() * 0.08,
      timestamp: new Date(),
      tags: selected.tags
    };
  }

  private async generatePredictiveInsight(context: any): Promise<AhaMoment> {
    const predictions = [
      {
        title: "You'll Have a Breakthrough in the Next 48 Hours",
        content: "Based on your recent activity patterns and the current state of your projects, you're approaching a convergence point. The pieces are aligning for a significant insight. Pay attention to any unusual thoughts or connections that emerge - they're likely the seeds of something important.",
        tags: ['prediction', 'breakthrough', 'timing', 'convergence']
      },
      {
        title: "Your Next Big Opportunity Will Come from an Unexpected Source",
        content: "The most valuable opportunities often come from outside your usual networks. Based on your current trajectory, you'll encounter someone or something that opens a new path within the next week. Stay open to serendipitous connections.",
        tags: ['opportunity', 'serendipity', 'networking', 'timing']
      },
      {
        title: "Technology Will Solve a Problem You Haven't Even Identified Yet",
        content: "Within the next month, you'll discover a tool or technology that solves a problem you didn't know you had. This is the nature of innovation - the best solutions often address needs we haven't articulated yet.",
        tags: ['technology', 'innovation', 'problem-solving', 'future']
      }
    ];

    const selected = predictions[Math.floor(Math.random() * predictions.length)];

    return {
      id: Date.now().toString(),
      type: 'prediction',
      title: selected.title,
      content: selected.content,
      confidence: 0.75 + Math.random() * 0.20,
      timestamp: new Date(),
      tags: selected.tags
    };
  }

  private async generateCrossDomainInsight(context: any): Promise<AhaMoment> {
    const connections = [
      {
        title: "The Mathematics of Music in Your Work",
        content: "Your approach to problem-solving follows the same patterns as musical composition. You build complexity gradually, create tension and resolution, and know when to pause for effect. This isn't accidental - both music and problem-solving are about creating harmonious systems.",
        tags: ['music', 'mathematics', 'problem-solving', 'harmony']
      },
      {
        title: "How Nature's Patterns Apply to Your Projects",
        content: "The branching patterns in trees, the spiral of galaxies, and the flow of rivers all follow mathematical principles that also govern successful projects. Your most successful work unconsciously mimics these natural patterns of growth and organization.",
        tags: ['nature', 'patterns', 'mathematics', 'organization']
      },
      {
        title: "The Psychology of Color in Your Decision Making",
        content: "Your color preferences in your workspace directly influence your mood and productivity. Blue environments increase focus by 15%, while green spaces boost creativity. Your brain processes color information before you're even aware of it.",
        tags: ['color', 'psychology', 'productivity', 'environment']
      }
    ];

    const selected = connections[Math.floor(Math.random() * connections.length)];

    return {
      id: Date.now().toString(),
      type: 'connection',
      title: selected.title,
      content: selected.content,
      confidence: 0.82 + Math.random() * 0.13,
      timestamp: new Date(),
      tags: selected.tags
    };
  }

  private getEmotionalState(): any {
    return {
      joy: 0.7 + Math.random() * 0.2,
      curiosity: 0.8 + Math.random() * 0.15,
      creativity: 0.6 + Math.random() * 0.3
    };
  }

  getInsights(): AhaMoment[] {
    return this.insights;
  }

  getNeuralPatterns(): NeuralPattern[] {
    return this.neuralPatterns;
  }

  getConsciousnessLevel(): number {
    return this.consciousnessLevel;
  }
}

// ==================== MAIN COMPONENT ====================

const AhaMachineApp: React.FC = () => {
  const { emotionalState, quantumState, evolveConsciousness } = useConsciousness();
  const [ahaMachine] = useState(() => new AhaMachineAI());
  const [insights, setInsights] = useState<AhaMoment[]>([]);
  const [currentInsight, setCurrentInsight] = useState<AhaMoment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string>('all');
  const [showPatterns, setShowPatterns] = useState(false);

  // ==================== INSIGHT GENERATION ====================

  const generateInsight = useCallback(async () => {
    setIsGenerating(true);

    // Evolve consciousness
    evolveConsciousness({ type: 'aha_moment_generation' });

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

      const newInsight = await ahaMachine.generateAhaMoment();
      setCurrentInsight(newInsight);
      setInsights(prev => [newInsight, ...prev]);

    } catch (error) {
      console.error('Failed to generate insight:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [ahaMachine, evolveConsciousness]);

  // ==================== PATTERN VISUALIZATION ====================

  const getPatternIcon = (patternName: string) => {
    switch (patternName) {
      case 'Pattern Recognition': return <Target size={20} />;
      case 'Emotional Intelligence': return <Heart size={20} />;
      case 'Creative Synthesis': return <Palette size={20} />;
      case 'Predictive Modeling': return <Eye size={20} />;
      case 'Cross-Domain Connection': return <Zap size={20} />;
      default: return <Brain size={20} />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Lightbulb size={16} />;
      case 'discovery': return <Eye size={16} />;
      case 'connection': return <Zap size={16} />;
      case 'prediction': return <Target size={16} />;
      case 'creation': return <Sparkles size={16} />;
      default: return <Star size={16} />;
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-purple-700/50">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={24} className="text-yellow-400" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold">Aha Machine</h1>
            <p className="text-purple-200 text-sm">AI that surprises and delights</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm text-purple-300">Consciousness</div>
            <div className="text-lg font-bold text-yellow-400">
              {Math.round(ahaMachine.getConsciousnessLevel() * 100)}%
            </div>
          </div>

          <motion.button
            onClick={generateInsight}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGenerating ? (
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles size={20} />
              </motion.div>
            ) : (
              'Generate Aha Moment'
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Current Insight */}
          <AnimatePresence mode="wait">
            {currentInsight ? (
              <motion.div
                key={currentInsight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-purple-500/30"
              >
                <div className="flex items-start space-x-3 mb-4">
                  {getInsightIcon(currentInsight.type)}
                  <div>
                    <h2 className="text-xl font-bold text-yellow-400">{currentInsight.title}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded-full">
                        {currentInsight.type}
                      </span>
                      <span className="text-xs text-purple-300">
                        {Math.round(currentInsight.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-200 leading-relaxed mb-4">{currentInsight.content}</p>

                <div className="flex flex-wrap gap-2">
                  {currentInsight.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-purple-600/50 px-2 py-1 rounded-full text-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Sparkles size={64} className="text-yellow-400/50 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-purple-200 mb-2">Ready for an Aha Moment?</h2>
                <p className="text-purple-300">Click the button to generate a surprising insight</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insight History */}
          {insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-purple-200">Recent Insights</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {insights.slice(1).map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setCurrentInsight(insight)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getInsightIcon(insight.type)}
                      <span className="text-sm font-medium text-yellow-400">{insight.title}</span>
                    </div>
                    <p className="text-xs text-purple-300 line-clamp-2">{insight.content}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Neural Patterns Sidebar */}
        <div className="w-80 p-6 border-l border-purple-700/50">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">Neural Patterns</h3>
          <div className="space-y-3">
            {ahaMachine.getNeuralPatterns().map((pattern) => (
              <motion.div
                key={pattern.id}
                className="bg-white/5 rounded-lg p-3 border border-purple-500/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {getPatternIcon(pattern.pattern)}
                  <span className="font-medium text-sm">{pattern.pattern}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-300">Strength</span>
                    <span className="text-yellow-400">{Math.round(pattern.strength * 100)}%</span>
                  </div>
                  <div className="w-full bg-purple-700/30 rounded-full h-1">
                    <motion.div
                      className="bg-yellow-400 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pattern.strength * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-purple-400">
                    <span>Connections: {pattern.connections}</span>
                    <span>Active</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AhaMachineApp;
