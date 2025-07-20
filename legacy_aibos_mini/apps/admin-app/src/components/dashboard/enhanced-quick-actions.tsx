import React, { useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings,
  Plus,
  Users,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { LuxuryModal } from '../ui/LuxuryModal';
import { LuxurySelect } from '../ui/LuxurySelect';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  modal?: {
    title: string;
    content: React.ReactNode;
  };
}

interface EnhancedQuickActionsProps {
  className?: string;
}

export const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ className }) => {
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');

  const periodOptions = [
    { label: 'This Month', value: 'this-month', icon: '📅' },
    { label: 'Last Month', value: 'last-month', icon: '📅' },
    { label: 'This Quarter', value: 'this-quarter', icon: '📊' },
    { label: 'This Year', value: 'this-year', icon: '📈' },
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Create Journal Entry',
      description: 'Record a new transaction',
      icon: <FileText className="w-6 h-6" />,
      action: () => {
        setSelectedAction({
          id: '1',
          title: 'Create Journal Entry',
          description: 'Record a new transaction',
          icon: <FileText className="w-6 h-6" />,
          action: () => {},
          modal: {
            title: 'Create Journal Entry',
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account
                    </label>
                    <LuxurySelect
                      items={[
                        { label: 'Cash', value: 'cash', icon: '💰' },
                        { label: 'Accounts Receivable', value: 'ar', icon: '📄' },
                        { label: 'Accounts Payable', value: 'ap', icon: '🧾' },
                      ]}
                      placeholder="Select account"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-neon-green focus:border-neon-green"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-neon-green focus:border-neon-green"
                    rows={3}
                    placeholder="Enter transaction description..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Journal entry created!');
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-neon-green text-white rounded-lg hover:bg-neon-green/90 transition-colors shadow-neon-green"
                  >
                    Create Entry
                  </button>
                </div>
              </div>
            )
          }
        });
        setIsModalOpen(true);
      }
    },
    {
      id: '2',
      title: 'Generate Invoice',
      description: 'Create a new invoice',
      icon: <DollarSign className="w-6 h-6" />,
      action: () => {
        setSelectedAction({
          id: '2',
          title: 'Generate Invoice',
          description: 'Create a new invoice',
          icon: <DollarSign className="w-6 h-6" />,
          action: () => {},
          modal: {
            title: 'Generate Invoice',
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer
                    </label>
                    <LuxurySelect
                      items={[
                        { label: 'Acme Corp', value: 'acme', icon: '🏢' },
                        { label: 'Tech Solutions', value: 'tech', icon: '💻' },
                        { label: 'Global Industries', value: 'global', icon: '🌍' },
                      ]}
                      placeholder="Select customer"
                      onChange={() => {}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-neon-green focus:border-neon-green"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Invoice generated!');
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-neon-green text-white rounded-lg hover:bg-neon-green/90 transition-colors shadow-neon-green"
                  >
                    Generate Invoice
                  </button>
                </div>
              </div>
            )
          }
        });
        setIsModalOpen(true);
      }
    },
    {
      id: '3',
      title: 'Record Payment',
      description: 'Record customer payment',
      icon: <CreditCard className="w-6 h-6" />,
      action: () => alert('Record payment')
    },
    {
      id: '4',
      title: 'Run Reports',
      description: 'Generate financial reports',
      icon: <BarChart3 className="w-6 h-6" />,
      action: () => {
        setSelectedAction({
          id: '4',
          title: 'Run Reports',
          description: 'Generate financial reports',
          icon: <BarChart3 className="w-6 h-6" />,
          action: () => {},
          modal: {
            title: 'Generate Financial Report',
            content: (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Report Period
                  </label>
                  <LuxurySelect
                    items={periodOptions}
                    value={selectedPeriod}
                    onChange={setSelectedPeriod}
                    placeholder="Select period"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                    <div className="text-2xl font-bold text-neon-green">$45,230</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/40 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Expenses</div>
                    <div className="text-2xl font-bold text-red-400">$23,450</div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      alert('Report generated!');
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-medium bg-neon-green text-white rounded-lg hover:bg-neon-green/90 transition-colors shadow-neon-green"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )
          }
        });
        setIsModalOpen(true);
      }
    }
  ];

  return (
    <>
      <div className={cn(
        'rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gray-900/70',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-800',
        'transition-colors duration-300 ease-in-out p-6',
        className
      )}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 neon-text-shadow">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={cn(
                'h-auto p-4 flex flex-col items-start space-y-2 rounded-xl',
                'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg',
                'border border-gray-200 dark:border-gray-800',
                'shadow-[0_4px_24px_rgba(0,0,0,0.18)]',
                'transition-all duration-300 ease-in-out',
                'hover:shadow-[0_8px_32px_rgba(0,255,136,0.25)] hover:scale-105',
                'focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2'
              )}
            >
              <div className="text-neon-green">{action.icon}</div>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">{action.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedAction?.modal && (
        <LuxuryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedAction.modal.title}
          size="lg"
        >
          {selectedAction.modal.content}
        </LuxuryModal>
      )}
    </>
  );
}; 