// TypeScript module declarations for packages without types

declare module 'class-variance-authority' {
  export function cva(...args: any[]): any;
  export type VariantProps<T> = any;
}

declare module 'lucide-react' {
  import type * as React from 'react';
  export const Loader2: React.FC<any>;
  export const X: React.FC<any>;
  export const Activity: React.FC<any>;
  export const Cpu: React.FC<any>;
  export const HardDrive: React.FC<any>;
  export const Network: React.FC<any>;
  export const AlertTriangle: React.FC<any>;
  export const TrendingUp: React.FC<any>;
  export const TrendingDown: React.FC<any>;
  export const Zap: React.FC<any>;
  export const Clock: React.FC<any>;
  export const Search: React.FC<any>;
  export const Command: React.FC<any>;
  export const ArrowUp: React.FC<any>;
  export const ArrowDown: React.FC<any>;
  export const FileText: React.FC<any>;
  export const Settings: React.FC<any>;
  export const Users: React.FC<any>;
  export const Database: React.FC<any>;
  export const Code: React.FC<any>;
  export const Globe: React.FC<any>;
  export const Star: React.FC<any>;
  export type LucideIcon = React.FC<any>;
}

declare module 'framer-motion' {
  import type * as React from 'react';
  export const motion: any;
  export const AnimatePresence: React.FC<any>;
}

declare module 'fuse.js' {
  const Fuse: any;
  export default Fuse;
}

declare module 'recharts' {
  import type * as React from 'react';
  export const LineChart: React.FC<any>;
  export const Line: React.FC<any>;
  export const AreaChart: React.FC<any>;
  export const Area: React.FC<any>;
  export const BarChart: React.FC<any>;
  export const Bar: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const Legend: React.FC<any>;
  export const ResponsiveContainer: React.FC<any>;
  export const PieChart: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Cell: React.FC<any>;
}

declare module 'clsx' {
  export function clsx(...args: any[]): string;
  export type ClassValue = any;
}

declare module 'tailwind-merge' {
  export function twMerge(...args: any[]): string;
}
