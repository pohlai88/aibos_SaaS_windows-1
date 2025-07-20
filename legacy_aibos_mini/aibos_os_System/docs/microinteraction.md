'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Bell,
  Calendar,
  Activity
} from 'lucide-react'
import { DashboardLayout } from '../components/layouts/dashboard-layout'
import { MetricCard } from '../components/ui/MetricCard'
import { CommandPalette } from '../components/ui/CommandPalette'
// ... existing imports ...

// Apple's signature animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: [0.4, 0.0, 0.2, 1]
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1]
    }
  }
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  useEffect(() => {
    // Apple-style loading with perfect timing
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // ... existing metrics and data ...

  if (isLoading) {
    return (
      <DashboardLayout>
        <motion.div 
          className="flex items-center justify-center min-h-[60vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="max-w-7xl mx-auto p-6 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Command Palette */}
        <motion.div 
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, here's what's happening
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <CommandPalette />
            <button className="apple-button-ghost">
              <Bell className="w-5 h-5" />
            </button>
            <button className="apple-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </button>
          </div>
        </motion.div>

        {/* Metrics Grid with Hover Effects */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMetric(selectedMetric === metric.title ? null : metric.title)}
              className="cursor-pointer"
            >
              <MetricCard 
                {...metric} 
                className={`transition-all duration-300 ${
                  selectedMetric === metric.title 
                    ? 'ring-2 ring-blue-500/50 shadow-xl' 
                    : 'hover:shadow-lg'
                }`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions with Micro-Interactions */}
        <motion.div variants={itemVariants}>
          <DashboardSection title="Quick Actions">
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
            >
              {[
                { icon: FileText, label: 'Create Invoice', color: 'blue' },
                { icon: Users, label: 'Add Customer', color: 'green' },
                { icon: BarChart3, label: 'View Reports', color: 'purple' },
                { icon: Settings, label: 'Settings', color: 'gray' }
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-panel p-4 text-center group hover:shadow-lg transition-all duration-300"
                >
                  <motion.div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center group-hover:bg-${action.color}-200 dark:group-hover:bg-${action.color}-800/50 transition-colors`}
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <action.icon className={`w-6 h-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </motion.div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </DashboardSection>
        </motion.div>

        {/* Charts and Tables with Stagger Animation */}
        <motion.div variants={itemVariants}>
          <LuxuryTabs 
            items={tabItems}
            className="animate-apple-fade"
          />
        </motion.div>

        {/* Recent Activity with List Animation */}
        <motion.div variants={itemVariants}>
          <DashboardSection title="Recent Activity">
            <motion.div 
              variants={containerVariants}
              className="space-y-3"
            >
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="glass-panel p-4 hover:shadow-md transition-all duration-200"
                >
                  <RecentActivity activity={activity} />
                </motion.div>
              ))}
            </motion.div>
          </DashboardSection>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}