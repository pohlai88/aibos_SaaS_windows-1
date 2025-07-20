import React from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface RevenueExpensesTableProps {
  data: Array<{
    label: string;
    revenue: number;
    expenses: number;
  }>;
  className?: string;
}

export const RevenueExpensesTable: React.FC<RevenueExpensesTableProps> = ({ data, className }) => {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl backdrop-blur-lg bg-white/70 dark:bg-gray-900/70',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-800',
        'transition-colors duration-300 ease-in-out',
        className
      )}
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Month</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-green-500 uppercase tracking-wider">Revenue</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-pink-500 uppercase tracking-wider">Expenses</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((row, idx) => (
            <tr key={row.label} className={cn(idx % 2 === 0 ? 'bg-white/40 dark:bg-gray-900/40' : '')}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.label}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 text-right font-mono">${row.revenue.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-500 text-right font-mono">${row.expenses.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 