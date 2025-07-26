'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, FileText, PieChart, Activity, Settings,
  Play, Pause, RotateCcw, Plus, Trash2, CheckCircle, AlertTriangle,
  Gauge, Server, Network, Scale, Brain, Zap, Target, Calendar
} from 'lucide-react';

import {
  advancedAnalyticsInsights,
  AnalyticsMetric,
  InsightType,
  ReportFormat,
  VisualizationType,
  AnalyticsData,
  BusinessIntelligence,
  Insight,
  Prediction,
  Recommendation,
  AnalyticsReport,
  AnalyticsDashboard,
  AnalyticsMetrics
} from '@/lib/advanced-analytics-insights';

interface AdvancedAnalyticsInsightsDashboardProps {
  className?: string;
}

export default function AdvancedAnalyticsInsightsDashboard({ className = '' }: AdvancedAnalyticsInsightsDashboardProps) {
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
  const [businessIntelligence, setBusinessIntelligence] = useState<BusinessIntelligence[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [dashboards, setDashboards] = useState<AnalyticsDashboard[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'intelligence' | 'insights' | 'predictions' | 'reports' | 'dashboards'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15000);

  const [biForm, setBiForm] = useState({
    name: '',
    description: '',
    metrics: [] as AnalyticsMetric[]
  });

  const [dataForm, setDataForm] = useState({
    metric: 'performance' as AnalyticsMetric,
    value: 0,
    source: 'system'
  });

  useEffect(() => {
    initializeAnalyticsData();
    const interval = setInterval(() => {
      if (autoRefresh) refreshAnalyticsData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const initializeAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshAnalyticsData();
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAnalyticsData = useCallback(async () => {
    try {
      // Real API call to backend analytics endpoint
      const response = await fetch('/api/analytics/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      const data = await response.json();
      setAnalyticsMetrics(data.metrics);
      setBusinessIntelligence(data.businessIntelligence || []);
      setInsights(data.insights || []);
      setPredictions(data.predictions || []);
      setRecommendations(data.recommendations || []);
      setReports(data.reports || []);
      setDashboards(data.dashboards || []);
    } catch (err) {
      console.error('Analytics API error:', err);
      // Set empty state on error
      setAnalyticsMetrics(null);
      setBusinessIntelligence([]);
      setInsights([]);
      setPredictions([]);
      setRecommendations([]);
      setReports([]);
      setDashboards([]);
    }
  }, []);

  const createBusinessIntelligence = useCallback(async () => {
    if (!biForm.name || !biForm.description) return;
    setIsLoading(true);
    try {
      // Real API call to create business intelligence
      const response = await fetch('/api/analytics/business-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(biForm),
      });

      if (!response.ok) {
        throw new Error(`Create BI API error: ${response.status}`);
      }

      const bi = await response.json();
      setBusinessIntelligence(prev => [...prev, bi]);
      setBiForm({ name: '', description: '', metrics: [] });
      await refreshAnalyticsData();
    } catch (err) {
      console.error('Create BI API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [biForm, refreshAnalyticsData]);

  const recordAnalyticsData = useCallback(async () => {
    if (dataForm.value === 0) return;
    setIsLoading(true);
    try {
      // Real API call to record analytics data
      const response = await fetch('/api/analytics/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: dataForm.metric,
          value: dataForm.value,
          dimensions: {},
          metadata: {},
          source: dataForm.source
        }),
      });

      if (!response.ok) {
        throw new Error(`Record data API error: ${response.status}`);
      }

      setDataForm({ metric: 'performance', value: 0, source: 'system' });
      await refreshAnalyticsData();
    } catch (err) {
      console.error('Record data API error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dataForm, refreshAnalyticsData]);

    const renderOverview = () => {
    if (!analyticsMetrics) {
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-gray-900 p-12 rounded-lg border border-gray-700 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl text-white mb-2">No Analytics Data Available</h3>
            <p className="text-gray-400 mb-6">Start by recording analytics data to see insights and metrics.</p>
            <button
              onClick={() => setSelectedTab('intelligence')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Record Analytics Data
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Insights" value={analyticsMetrics.totalInsights} icon={Brain} color="blue" />
          <MetricCard title="Prediction Accuracy" value={`${(analyticsMetrics.averagePredictionAccuracy * 100).toFixed(1)}%`} icon={Target} color="green" />
          <MetricCard title="AI Enhancement Rate" value={`${(analyticsMetrics.aiEnhancementRate * 100).toFixed(1)}%`} icon={Zap} color="purple" />
          <MetricCard title="Data Points" value={analyticsMetrics.dataPointsCollected.toLocaleString()} icon={BarChart3} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Insights by Type
            </h3>
            <div className="space-y-2">
              {Object.entries(analyticsMetrics.insightsByType).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{type}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Generate New Insights
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Create Report
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                Build Dashboard
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderIntelligence = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Create Business Intelligence</h3>
        <div className="space-y-4">
          <input
            className="w-full bg-gray-800 text-white p-2 rounded"
            placeholder="Intelligence Name"
            value={biForm.name}
            onChange={e => setBiForm({ ...biForm, name: e.target.value })}
          />
          <textarea
            className="w-full bg-gray-800 text-white p-2 rounded"
            placeholder="Description"
            rows={3}
            value={biForm.description}
            onChange={e => setBiForm({ ...biForm, description: e.target.value })}
          />
          <button
            onClick={createBusinessIntelligence}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Intelligence'}
          </button>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Record Analytics Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="bg-gray-800 text-white p-2 rounded"
            value={dataForm.metric}
            onChange={e => setDataForm({ ...dataForm, metric: e.target.value as AnalyticsMetric })}
          >
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="scalability">Scalability</option>
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
          </select>
          <input
            type="number"
            className="bg-gray-800 text-white p-2 rounded"
            placeholder="Value"
            value={dataForm.value}
            onChange={e => setDataForm({ ...dataForm, value: Number(e.target.value) })}
          />
          <button
            onClick={recordAnalyticsData}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Recording...' : 'Record Data'}
          </button>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Business Intelligence</h3>
        {businessIntelligence.length === 0 ? (
          <p className="text-gray-400">No business intelligence created yet</p>
        ) : (
          <div className="space-y-3">
            {businessIntelligence.map(bi => (
              <div key={bi.id} className="bg-gray-800 p-4 rounded">
                <h4 className="text-white font-semibold">{bi.name}</h4>
                <p className="text-gray-400 text-sm">{bi.description}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>Insights: {bi.insights.length}</span>
                  <span className="mx-2">•</span>
                  <span>Predictions: {bi.predictions.length}</span>
                  <span className="mx-2">•</span>
                  <span>Recommendations: {bi.recommendations.length}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderInsights = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Recent Insights</h3>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400 mb-4">No insights generated yet</p>
            <p className="text-sm text-gray-500">Insights will appear here once you have sufficient analytics data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 5).map(insight => (
              <div key={insight.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    <p className="text-gray-400 text-sm">{insight.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    insight.impact === 'critical' ? 'bg-red-600 text-white' :
                    insight.impact === 'high' ? 'bg-orange-600 text-white' :
                    insight.impact === 'medium' ? 'bg-yellow-600 text-black' :
                    'bg-green-600 text-white'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                  <span className="mx-2">•</span>
                  <span>{insight.type}</span>
                  <span className="mx-2">•</span>
                  <span>{insight.timestamp.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderPredictions = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Predictions</h3>
        {predictions.length === 0 ? (
          <p className="text-gray-400">No predictions available</p>
        ) : (
          <div className="space-y-3">
            {predictions.slice(0, 5).map(prediction => (
              <div key={prediction.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{prediction.metric}</h4>
                    <p className="text-gray-400 text-sm">
                      Current: {prediction.currentValue} → Predicted: {prediction.predictedValue}
                    </p>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>{prediction.timeframe} days</span>
                  <span className="mx-2">•</span>
                  <span>{prediction.aiModel}</span>
                  {prediction.quantumEnhanced && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="text-purple-400">Quantum Enhanced</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderReports = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Analytics Reports</h3>
        {reports.length === 0 ? (
          <p className="text-gray-400">No reports generated yet</p>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map(report => (
              <div key={report.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{report.name}</h4>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                  </div>
                  <span className="text-blue-400 font-semibold uppercase">{report.format}</span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>Insights: {report.insights.length}</span>
                  <span className="mx-2">•</span>
                  <span>Predictions: {report.predictions.length}</span>
                  <span className="mx-2">•</span>
                  <span>{report.generatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderDashboards = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg text-white mb-4">Analytics Dashboards</h3>
        {dashboards.length === 0 ? (
          <p className="text-gray-400">No dashboards created yet</p>
        ) : (
          <div className="space-y-3">
            {dashboards.slice(0, 5).map(dashboard => (
              <div key={dashboard.id} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{dashboard.name}</h4>
                    <p className="text-gray-400 text-sm">{dashboard.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {dashboard.aiEnhanced && <span className="text-blue-400 text-xs">AI</span>}
                    {dashboard.quantumEnhanced && <span className="text-purple-400 text-xs">Quantum</span>}
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>Widgets: {dashboard.widgets.length}</span>
                  <span className="mx-2">•</span>
                  <span>Refresh: {dashboard.refreshInterval / 1000}s</span>
                  <span className="mx-2">•</span>
                  <span>{dashboard.realTime ? 'Real-time' : 'Static'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-400" />
              Advanced Analytics & Insights
            </h1>
            <button onClick={refreshAnalyticsData} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">
              <RotateCcw className="w-4 h-4 inline-block mr-1" /> Refresh
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'intelligence', 'insights', 'predictions', 'reports', 'dashboards'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  selectedTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && renderOverview()}
          {selectedTab === 'intelligence' && renderIntelligence()}
          {selectedTab === 'insights' && renderInsights()}
          {selectedTab === 'predictions' && renderPredictions()}
          {selectedTab === 'reports' && renderReports()}
          {selectedTab === 'dashboards' && renderDashboards()}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon: Icon, color }: { title: string; value: React.ReactNode; icon: any; color: string }) => (
  <div className={`bg-${color}-500/20 p-4 border border-${color}-500/30 rounded-lg`}>
    <div className="flex justify-between items-center">
      <div>
        <p className={`text-sm text-${color}-300`}>{title}</p>
        <p className={`text-2xl font-bold text-${color}-100`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-400`} />
    </div>
  </div>
);
