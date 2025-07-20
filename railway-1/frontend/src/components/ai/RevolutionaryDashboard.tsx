'use client';

import React, { useState, useEffect } from 'react';
import { VoiceCommandBar } from './VoiceCommandBar';
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Rocket
} from 'lucide-react';

interface DashboardMetrics {
  activeUsers: number;
  mrr: number;
  churnRate: number;
  npsScore: number;
  serverHealth: 'healthy' | 'warning' | 'critical';
  openTickets: number;
  criticalBugs: number;
  aiPredictions: {
    nextMonthUsers: number;
    revenueForecast: number;
    churnRisk: number;
  };
}

interface RevolutionaryDashboardProps {
  tenantId?: string;
  userId?: string;
  enableAI?: boolean;
  enableRealtime?: boolean;
}

export const RevolutionaryDashboard: React.FC<RevolutionaryDashboardProps> = ({
  tenantId,
  userId,
  enableAI = true,
  enableRealtime = true
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeUsers: 4215,
    mrr: 12450,
    churnRate: 2.8,
    npsScore: 42,
    serverHealth: 'healthy',
    openTickets: 12,
    criticalBugs: 3,
    aiPredictions: {
      nextMonthUsers: 4850,
      revenueForecast: 13800,
      churnRisk: 1.2
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  useEffect(() => {
    // Simulate initialization
    setTimeout(() => {
      setIsLoading(false);
      generateAIInsights();
    }, 1000);
  }, []);

  const generateAIInsights = () => {
    const insights = [
      "🚀 User growth is 15% above predicted trend",
      "💰 Revenue forecast shows 12% increase next quarter",
      "⚠️ 3 customers showing early churn signals",
      "🎯 NPS score improved 8 points this month",
      "⚡ System performance is optimal"
    ];
    setAiInsights(insights);
  };

  const voiceCommands = [
    {
      id: 'show-users',
      phrase: 'show user analytics',
      action: () => setActiveTab('users'),
      category: 'data' as const
    },
    {
      id: 'show-revenue',
      phrase: 'show revenue data',
      action: () => setActiveTab('revenue'),
      category: 'data' as const
    },
    {
      id: 'create-report',
      phrase: 'create a report',
      action: () => console.log('Creating AI-powered report...'),
      category: 'development' as const
    }
  ];

  if (isLoading) {
    return (
      <div className="revolutionary-dashboard-loading">
        <div className="neural-bg">
          <div className="ai-loading-container">
            <div className="ai-loading" />
            <h2 className="font-ai-display text-white">Initializing AI-BOS Dashboard</h2>
            <p className="font-ai-body text-white/80">Loading revolutionary features...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="revolutionary-dashboard">
      {/* AI Voice Command Bar */}
      {enableAI && (
        <VoiceCommandBar
          wakeWord="Hey AI-BOS"
          commands={voiceCommands}
          aiResponse={true}
        />
      )}

      {/* Neural Network Background */}
      <div className="neural-bg dashboard-background">
        <div className="particle-system">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }} />
          ))}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="font-ai-display text-4xl text-white">
              AI-BOS Dashboard
            </h1>
            <p className="font-ai-body text-white/80">
              Revolutionary AI-powered business intelligence
            </p>
          </div>
          <div className="header-right">
            <div className="ai-status">
              <Brain size={20} className="text-neural-cyan" />
              <span className="font-ai-body text-white">AI Active</span>
            </div>
          </div>
        </header>

        {/* AI Insights Bar */}
        <div className="ai-insights-bar">
          <div className="insights-scroll">
            {aiInsights.map((insight, index) => (
              <div key={index} className="insight-item">
                <Sparkles size={16} />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="dashboard-nav">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: Activity },
            { id: 'ai', label: 'AI Insights', icon: Brain }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dashboard Content */}
        <main className="dashboard-main">
          {activeTab === 'overview' && <OverviewTab metrics={metrics} />}
          {activeTab === 'users' && <UsersTab metrics={metrics} />}
          {activeTab === 'revenue' && <RevenueTab metrics={metrics} />}
          {activeTab === 'performance' && <PerformanceTab metrics={metrics} />}
          {activeTab === 'ai' && <AIInsightsTab metrics={metrics} />}
        </main>
      </div>

      <style jsx>{`
        .revolutionary-dashboard {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .dashboard-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }

        .dashboard-content {
          position: relative;
          z-index: 1;
          padding: 2rem;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(10px);
        }

        .ai-insights-bar {
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 1rem;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .insights-scroll {
          display: flex;
          gap: 2rem;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .insights-scroll::-webkit-scrollbar {
          display: none;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-size: 0.875rem;
          white-space: nowrap;
          animation: slideIn 0.5s ease-out;
        }

        .dashboard-nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .dashboard-nav::-webkit-scrollbar {
          display: none;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-lg);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }

        .nav-tab:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .nav-tab.active {
          background: var(--gradient-primary);
          border-color: transparent;
          box-shadow: var(--shadow-lg);
        }

        .dashboard-main {
          display: grid;
          gap: 2rem;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .dashboard-nav {
            gap: 0.5rem;
          }

          .nav-tab {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

// Tab Components
const OverviewTab: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="overview-tab">
    <div className="metrics-grid">
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers.toLocaleString()}
        change="+15%"
        icon={Users}
        gradient="primary"
      />
      <MetricCard
        title="Monthly Revenue"
        value={`$${metrics.mrr.toLocaleString()}`}
        change="+12%"
        icon={DollarSign}
        gradient="neural"
      />
      <MetricCard
        title="Churn Rate"
        value={`${metrics.churnRate}%`}
        change="-0.5%"
        icon={TrendingUp}
        gradient="success"
      />
      <MetricCard
        title="NPS Score"
        value={metrics.npsScore.toString()}
        change="+8"
        icon={Target}
        gradient="accent"
      />
    </div>

    <div className="ai-predictions">
      <h3 className="font-ai-heading text-white mb-4">AI Predictions</h3>
      <div className="predictions-grid">
        <PredictionCard
          title="Next Month Users"
          value={metrics.aiPredictions.nextMonthUsers.toLocaleString()}
          confidence="95%"
          trend="up"
        />
        <PredictionCard
          title="Revenue Forecast"
          value={`$${metrics.aiPredictions.revenueForecast.toLocaleString()}`}
          confidence="92%"
          trend="up"
        />
        <PredictionCard
          title="Churn Risk"
          value={`${metrics.aiPredictions.churnRisk}%`}
          confidence="88%"
          trend="down"
        />
      </div>
    </div>

    <style jsx>{`
      .overview-tab {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .ai-predictions {
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-xl);
        padding: 2rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .predictions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
    `}</style>
  </div>
);

const UsersTab: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="users-tab">
    <h3 className="font-ai-heading text-white mb-4">User Analytics</h3>
    <div className="holographic-card p-6">
      <p className="text-white/80">Advanced user analytics coming soon...</p>
    </div>
  </div>
);

const RevenueTab: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="revenue-tab">
    <h3 className="font-ai-heading text-white mb-4">Revenue Analytics</h3>
    <div className="holographic-card p-6">
      <p className="text-white/80">Advanced revenue analytics coming soon...</p>
    </div>
  </div>
);

const PerformanceTab: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="performance-tab">
    <h3 className="font-ai-heading text-white mb-4">System Performance</h3>
    <div className="holographic-card p-6">
      <p className="text-white/80">Advanced performance analytics coming soon...</p>
    </div>
  </div>
);

const AIInsightsTab: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <div className="ai-insights-tab">
    <h3 className="font-ai-heading text-white mb-4">AI-Powered Insights</h3>
    <div className="holographic-card p-6">
      <p className="text-white/80">Advanced AI insights coming soon...</p>
    </div>
  </div>
);

// Component Components
const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: any;
  gradient: 'primary' | 'neural' | 'success' | 'accent';
}> = ({ title, value, change, icon: Icon, gradient }) => (
  <div className="holographic-card p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`icon-container ${gradient}`}>
        <Icon size={24} className="text-white" />
      </div>
      <span className={`change-badge ${change.startsWith('+') ? 'positive' : 'negative'}`}>
        {change}
      </span>
    </div>
    <h4 className="font-ai-heading text-white text-lg mb-1">{value}</h4>
    <p className="font-ai-body text-white/60">{title}</p>

    <style jsx>{`
      .icon-container {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-container.primary {
        background: var(--gradient-primary);
      }

      .icon-container.neural {
        background: var(--gradient-neural);
      }

      .icon-container.success {
        background: var(--gradient-success);
      }

      .icon-container.accent {
        background: var(--gradient-accent);
      }

      .change-badge {
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .change-badge.positive {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }

      .change-badge.negative {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
    `}</style>
  </div>
);

const PredictionCard: React.FC<{
  title: string;
  value: string;
  confidence: string;
  trend: 'up' | 'down';
}> = ({ title, value, confidence, trend }) => (
  <div className="holographic-card p-4">
    <div className="flex items-center justify-between mb-2">
      <h5 className="font-ai-heading text-white text-sm">{title}</h5>
      <span className="confidence-badge">{confidence}</span>
    </div>
    <p className="font-ai-display text-white text-xl mb-1">{value}</p>
    <div className="flex items-center gap-1">
      <TrendingUp size={16} className={trend === 'up' ? 'text-green-400' : 'text-red-400'} />
      <span className="font-ai-body text-white/60 text-sm">
        {trend === 'up' ? 'Increasing' : 'Decreasing'}
      </span>
    </div>

    <style jsx>{`
      .confidence-badge {
        background: rgba(102, 126, 234, 0.2);
        color: #667eea;
        padding: 0.125rem 0.5rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
      }
    `}</style>
  </div>
);
