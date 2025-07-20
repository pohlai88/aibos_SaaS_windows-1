/**
 * Enterprise Provider Component
 * Combines all enterprise providers for easy setup
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { ComplianceProvider } from './compliance/withCompliance';
import { PerformanceProvider } from './performance/withPerformance';
import type { EnterpriseCompliance } from '../types';

/**
 * Enterprise Provider Props
 */
export interface EnterpriseProviderProps {
  children: React.ReactNode;
  compliance?: Partial<EnterpriseCompliance>;
  performance?: {
    enableTracking?: boolean;
    enableOptimization?: boolean;
    performanceThreshold?: number
}
}

/**
 * Enterprise Provider that combines all providers
 */
export const EnterpriseProvider: React.FC<EnterpriseProviderProps> = ({
  children,
  compliance,
  performance
}) => {
  return (
    <ComplianceProvider compliance={compliance || {}}>
      <PerformanceProvider {...performance}>
        {children}
      </PerformanceProvider>
    </ComplianceProvider>
  )
};
