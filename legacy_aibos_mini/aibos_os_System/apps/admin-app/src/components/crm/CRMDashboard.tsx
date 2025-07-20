import React from 'react';
import { motion } from 'framer-motion';

interface CRMDashboardProps {
  user: User;
  organization: Organization;
}

export const CRMDashboard: React.FC<CRMDashboardProps> = ({ user, organization }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Steve Jobs inspired clean header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-light text-slate-900 dark:text-white">
                Sales Command Center
              </h1>
            </div>
            <QuickActions />
          </div>
        </div>
      </header>

      {/* Main dashboard grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pipeline overview */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PipelineKanban />
          </motion.div>
          
          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <QuickStats />
            <UpcomingActivities />
            <LeadCapture />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Minimalist pipeline Kanban
const PipelineKanban: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-slate-900 dark:text-white">
          Sales Pipeline
        </h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            This Month
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
            This Quarter
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <PipelineStage key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
};