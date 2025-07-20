import * as React from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface RevenueExpensesChartProps {
  data: Array<{
    label: string;
    revenue: number;
    expenses: number;
  }>;
  className?: string;
}

// Simple SVG bar chart for demo purposes
export const RevenueExpensesChart: React.FC<RevenueExpensesChartProps> = ({ data, className }) => {
  const max = Math.max(
    ...data.map((d) => Math.max(d.revenue, d.expenses)),
    1
  );
  return (
    <div
      className={cn(
        'rounded-2xl p-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-gray-200 dark:border-gray-800',
        'transition-colors duration-300 ease-in-out',
        className
      )}
    >
      <svg viewBox={`0 0 ${data.length * 60} 160`} width="100%" height="160" className="block">
        {data.map((d, i) => {
          const revenueHeight = (d.revenue / max) * 120;
          const expensesHeight = (d.expenses / max) * 120;
          return (
            <g key={d.label}>
              {/* Revenue bar */}
              <rect
                x={i * 60 + 8}
                y={140 - revenueHeight}
                width={16}
                height={revenueHeight}
                rx={4}
                className="fill-green-400/80 hover:fill-green-300 transition-all"
                style={{ filter: 'drop-shadow(0 0 8px #00FF88AA)' }}
              />
              {/* Expenses bar */}
              <rect
                x={i * 60 + 32}
                y={140 - expensesHeight}
                width={16}
                height={expensesHeight}
                rx={4}
                className="fill-pink-400/80 hover:fill-pink-300 transition-all"
                style={{ filter: 'drop-shadow(0 0 8px #FF00AA99)' }}
              />
              {/* Label */}
              <text
                x={i * 60 + 24}
                y={155}
                textAnchor="middle"
                className="fill-gray-700 dark:fill-gray-300 text-xs"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}; 