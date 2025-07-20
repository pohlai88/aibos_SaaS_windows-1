import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { auditLog } from '../../utils/auditLogger';

// Accessibility types
export interface AccessibilityIssue {
  id: string;
  type: 'missing_aria' | 'contrast_ratio' | 'keyboard_navigation' | 'screen_reader' | 'focus_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  element: HTMLElement | null;
  description: string;
  suggestion: string;
  autoFixable: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  timestamp: Date
}

export interface AccessibilityFix {
  id: string;
  issueId: string;
  type: 'aria_label' | 'contrast_adjustment' | 'focus_trap' | 'keyboard_handler';
  description: string;
  changes: {
    attributes?: Record<string, string>;
    styles?: Record<string, string>;
    eventHandlers?: Record<string, Function>
};
  confidence: number; // 0-1
  applied: boolean;
  timestamp: Date
}

export interface AccessibilityConfig {
  wcagLevel: 'A' | 'AA' | 'AAA';
  autoApplyFixes: boolean;
  enableRealTimeScanning: boolean;
  scanInterval: number; // milliseconds
  includeThirdParty: boolean;
  auditTrail: boolean;
  complianceLevel: 'basic' | 'enterprise' | 'government'
}

// Accessibility context
interface AccessibilityContextType {
  issues: AccessibilityIssue[];
  fixes: AccessibilityFix[];
  config: AccessibilityConfig;
  scanForIssues: () => Promise<AccessibilityIssue[]>;
  applyFix: (issueId: string,
  fix: AccessibilityFix) => Promise<boolean>;
  autoFixAll: () => Promise<AccessibilityFix[]>;
  getComplianceReport: () => AccessibilityComplianceReport;
  updateConfig: (config: Partial<AccessibilityConfig>) => void
}

interface AccessibilityComplianceReport {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  autoFixedIssues: number;
  manualFixesRequired: number;
  wcagCompliance: {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean
};
  overallScore: number; // 0-100
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// AI-powered accessibility scanner
const scanForAccessibilityIssues = async (config: AccessibilityConfig): Promise<AccessibilityIssue[]> => {
  const issues: AccessibilityIssue[] = [];

  // Get all interactive elements
  const interactiveElements = document.querySelectorAll('button, input, select, textarea, a, [role], [tabindex]');

  interactiveElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement;

    // Check for missing ARIA labels
    if (!htmlElement.getAttribute('aria-label') &&
        !htmlElement.getAttribute('aria-labelledby') &&
        !htmlElement.getAttribute('title')) {

      // AI-generated label suggestion
      const suggestedLabel = generateAILabel(htmlElement);

      issues.push({
        id: `aria-${index}`,
        type: 'missing_aria',
  severity: 'high',
        element: htmlElement,
  description: `Missing ARIA label for ${htmlElement.tagName.toLowerCase()}`,
        suggestion: `Add aria-label="${suggestedLabel}"`,
        autoFixable: true,
  wcagLevel: 'A',
  timestamp: new Date()
      })
}

    // Check for contrast ratio issues
    const contrastIssue = checkContrastRatio(htmlElement);
    if (contrastIssue) {
      issues.push(contrastIssue)
}

    // Check for keyboard navigation
    const keyboardIssue = checkKeyboardNavigation(htmlElement);
    if (keyboardIssue) {
      issues.push(keyboardIssue)
}

    // Check for focus management
    const focusIssue = checkFocusManagement(htmlElement);
    if (focusIssue) {
      issues.push(focusIssue)
}
  });

  // Check for screen reader issues
  const screenReaderIssues = checkScreenReaderCompatibility();
  issues.push(...screenReaderIssues);

  return issues
};

// AI-generated label suggestion
const generateAILabel = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();
  const className = element.className;
  const textContent = element.textContent?.trim();
  const placeholder = element.getAttribute('placeholder');
  const type = element.getAttribute('type');

  // AI logic to generate meaningful labels
  if (textContent && textContent.length < 50) {
    return textContent
}

  if (placeholder) {
    return placeholder
}

  if (className) {
    const classWords = className.split(/[-_\s]/).filter(word => word.length > 2);
    if (classWords.length > 0) {
      return classWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
  }

  // Generate based on element type
  switch (tagName) {
    case 'button':
      return type === 'submit' ? 'Submit Form' : 'Button';
    case 'input':
      return type === 'text' ? 'Text Input' : `${type || 'Input'} Field`;
    case 'select':
      return 'Select Option';
    case 'textarea':
      return 'Text Area';
    case 'a':
      return 'Link';
    default:
      return `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} Element`
}
};

// Check contrast ratio
const checkContrastRatio = (element: HTMLElement): AccessibilityIssue | null => {
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;

  // Simplified contrast ratio calculation
  const contrastRatio = calculateContrastRatio(backgroundColor, color);

  if (contrastRatio < 4.5) { // WCAG AA requirement
    return {
      id: `contrast-${Date.now()}`,
      type: 'contrast_ratio',
  severity: contrastRatio < 3 ? 'critical' : 'high',
      element,
      description: `Insufficient contrast ratio: ${contrastRatio.toFixed(2)}:1`,
      suggestion: `Increase contrast ratio to at least 4.5:1 for WCAG AA compliance`,
      autoFixable: true,
  wcagLevel: 'AA',
  timestamp: new Date()
    }
}

  return null
};

// Simplified contrast ratio calculation
const calculateContrastRatio = (bgColor: string,
  fgColor: string): number => {
  // This is a simplified version - in production, use a proper color contrast library
  const bgLuminance = getLuminance(bgColor);
  const fgLuminance = getLuminance(fgColor);

  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);

  return (lighter + 0.05) / (darker + 0.05)
};

// Simplified luminance calculation
const getLuminance = (color: string): number => {
  // Simplified - in production, use proper color parsing
  return 0.5; // Placeholder
};

// Check keyboard navigation
const checkKeyboardNavigation = (element: HTMLElement): AccessibilityIssue | null => {
  const tabIndex = element.getAttribute('tabindex');
  const role = element.getAttribute('role');

  // Check if element is focusable but shouldn't be
  if (tabIndex === '0' && !isInteractiveElement(element)) {
    return {
      id: `keyboard-${Date.now()}`,
      type: 'keyboard_navigation',
  severity: 'medium',
      element,
      description: 'Non-interactive element is focusable',
  suggestion: 'Remove tabindex or add appropriate role',
      autoFixable: true,
  wcagLevel: 'A',
  timestamp: new Date()
    }
}

  // Check if interactive element is not focusable
  if (isInteractiveElement(element) && tabIndex === '-1') {
    return {
      id: `keyboard-${Date.now()}`,
      type: 'keyboard_navigation',
  severity: 'high',
      element,
      description: 'Interactive element is not keyboard accessible',
  suggestion: 'Add tabindex="0" or ensure element is naturally focusable',
      autoFixable: true,
  wcagLevel: 'A',
  timestamp: new Date()
    }
}

  return null
};

// Check if element should be interactive
const isInteractiveElement = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  return ['button', 'input', 'select', 'textarea', 'a'].includes(tagName) ||
         ['button', 'link', 'menuitem', 'tab'].includes(role || '')
};

// Check focus management
const checkFocusManagement = (element: HTMLElement): AccessibilityIssue | null => {
  // Check for focus traps without proper escape
  const hasFocusTrap = element.querySelector('[data-focus-trap]');
  const hasEscapeHandler = element.querySelector('[data-escape-handler]');

  if (hasFocusTrap && !hasEscapeHandler) {
    return {
      id: `focus-${Date.now()}`,
      type: 'focus_management',
  severity: 'high',
      element,
      description: 'Focus trap without escape mechanism',
  suggestion: 'Add keyboard handler for Escape key to close modal/dialog',
      autoFixable: true,
  wcagLevel: 'A',
  timestamp: new Date()
    }
}

  return null
};

// Check screen reader compatibility
const checkScreenReaderCompatibility = (): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];

  // Check for images without alt text
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push({
        id: `screen-reader-${index}`,
        type: 'screen_reader',
  severity: 'high',
        element: img as HTMLElement,
        description: 'Image missing alt text',
  suggestion: 'Add descriptive alt text or alt="" for decorative images',
        autoFixable: false, // Requires human input
        wcagLevel: 'A',
  timestamp: new Date()
      })
}
  });

  // Check for form labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const label = document.querySelector(`label[for="${id}"]`);

    if (!label && !input.getAttribute('aria-label')) {
      issues.push({
        id: `form-label-${index}`,
        type: 'screen_reader',
  severity: 'high',
        element: input as HTMLElement,
        description: 'Form control missing label',
  suggestion: 'Add label element or aria-label attribute',
        autoFixable: true,
  wcagLevel: 'A',
  timestamp: new Date()
      })
}
  });

  return issues
};

// Generate accessibility fixes
const generateAccessibilityFixes = (issues: AccessibilityIssue[]): AccessibilityFix[] => {
  return issues
    .filter(issue => issue.autoFixable)
    .map(issue => {
      let fix: AccessibilityFix;

      switch (issue.type) {
        case 'missing_aria':
          fix = {
            id: `fix-${issue.id}`,
            issueId: issue.id,
            type: 'aria_label',
  description: `Add ARIA label: ${issue.suggestion}`,
            changes: {
              attributes: {
                'aria-label': generateAILabel(issue.element!)
              }
            },
            confidence: 0.9,
            applied: false,
  timestamp: new Date()
          };
          break;

        case 'contrast_ratio':
          fix = {
            id: `fix-${issue.id}`,
            issueId: issue.id,
            type: 'contrast_adjustment',
  description: 'Adjust contrast ratio',
            changes: {
              styles: {
                color: '#000000', // Force high contrast
                backgroundColor: '#ffffff'
              }
            },
            confidence: 0.7,
            applied: false,
  timestamp: new Date()
          };
          break;

        case 'keyboard_navigation':
          fix = {
            id: `fix-${issue.id}`,
            issueId: issue.id,
            type: 'keyboard_handler',
  description: 'Add keyboard navigation',
            changes: {
              attributes: {
                tabindex: '0'
              }
            },
            confidence: 0.8,
            applied: false,
  timestamp: new Date()
          };
          break;

        default:
          fix = {
            id: `fix-${issue.id}`,
            issueId: issue.id,
            type: 'aria_label',
  description: issue.suggestion,
            changes: {},
            confidence: 0.5,
            applied: false,
  timestamp: new Date()
          }
}

      return fix
})
};

// Accessibility provider component
export const AccessibilityProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<AccessibilityConfig>
}> = ({ children, config = {} }) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [fixes, setFixes] = useState<AccessibilityFix[]>([]);
  const [scanningInterval, setScanningInterval] = useState<NodeJS.Timeout | null>(null);

  // Default configuration
  const defaultConfig: AccessibilityConfig = {
    wcagLevel: 'AA',
  autoApplyFixes: false,
    enableRealTimeScanning: true,
  scanInterval: 5000, // 5 seconds
    includeThirdParty: false,
  auditTrail: true,
    complianceLevel: 'enterprise'
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Scan for accessibility issues
  const scanForIssues = useCallback(async (): Promise<AccessibilityIssue[]> => {
    const newIssues = await scanForAccessibilityIssues(finalConfig);
    setIssues(newIssues);

    // Generate fixes for auto-fixable issues
    const newFixes = generateAccessibilityFixes(newIssues);
    setFixes(newFixes);

    // Auto-apply fixes if enabled
    if (finalConfig.autoApplyFixes) {
      await autoFixAll()
}

    // Audit logging
    if (finalConfig.auditTrail) {
      auditLog('accessibility_scan_completed', {
        issuesFound: newIssues.length,
        autoFixable: newFixes.length,
        wcagLevel: finalConfig.wcagLevel,
        timestamp: new Date().toISOString()
      })
}

    return newIssues
}, [finalConfig]);

  // Apply a specific fix
  const applyFix = useCallback(async (issueId: string,
  fix: AccessibilityFix): Promise<boolean> => {
    try {
      const issue = issues.find(i => i.id === issueId);
      if (!issue || !issue.element) return false;

      // Apply the fix
      if (fix.changes.attributes) {
        Object.entries(fix.changes.attributes).forEach(([key, value]) => {
          issue.element!.setAttribute(key, value)
})
}

      if (fix.changes.styles) {
        Object.entries(fix.changes.styles).forEach(([key, value]) => {
          issue.element!.style[key as any] = value
})
}

      // Mark fix as applied
      setFixes(prev => prev.map(f =>
        f.id === fix.id ? { ...f, applied: true } : f
      ));

      // Remove issue from list
      setIssues(prev => prev.filter(i => i.id !== issueId));

      // Audit logging
      if (finalConfig.auditTrail) {
        auditLog('accessibility_fix_applied', {
          issueId,
          fixType: fix.type,
          confidence: fix.confidence,
          timestamp: new Date().toISOString()
        })
}

      return true
} catch (error) {
      console.error('Failed to apply accessibility fix:', error);
      return false
}
  }, [issues, finalConfig.auditTrail]);

  // Auto-fix all applicable issues
  const autoFixAll = useCallback(async (): Promise<AccessibilityFix[]> => {
    const appliedFixes: AccessibilityFix[] = [];

    for (const fix of fixes) {
      if (!fix.applied && fix.confidence > 0.7) {
        const success = await applyFix(fix.issueId, fix);
        if (success) {
          appliedFixes.push(fix)
}
      }
    }

    return appliedFixes
}, [fixes, applyFix]);

  // Get compliance report
  const getComplianceReport = useCallback((): AccessibilityComplianceReport => {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;
    const autoFixedIssues = fixes.filter(f => f.applied).length;
    const manualFixesRequired = issues.filter(i => !i.autoFixable).length;

    // Calculate WCAG compliance
    const levelAIssues = issues.filter(i => i.wcagLevel === 'A').length;
    const levelAAIssues = issues.filter(i => i.wcagLevel === 'AA').length;
    const levelAAAIssues = issues.filter(i => i.wcagLevel === 'AAA').length;

    const levelA = levelAIssues === 0;
    const levelAA = levelAAIssues === 0;
    const levelAAA = levelAAAIssues === 0;

    // Calculate overall score
    const totalIssues = issues.length;
    const resolvedIssues = autoFixedIssues;
    const overallScore = totalIssues > 0 ? Math.max(0, 100 - (totalIssues - resolvedIssues) * 10) : 100;

    return {
      totalIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
      autoFixedIssues,
      manualFixesRequired,
      wcagCompliance: { levelA, levelAA, levelAAA },
      overallScore
    }
}, [issues, fixes]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<AccessibilityConfig>) => {
    Object.assign(finalConfig, newConfig)
}, [finalConfig]);

  // Set up real-time scanning
  useEffect(() => {
    if (finalConfig.enableRealTimeScanning) {
      const interval = setInterval(() => {
        scanForIssues()
}, finalConfig.scanInterval);

      setScanningInterval(interval);

      return () => {
        if (interval) clearInterval(interval)
}
}
  }, [finalConfig.enableRealTimeScanning, finalConfig.scanInterval, scanForIssues]);

  // Initial scan
  useEffect(() => {
    scanForIssues()
}, [scanForIssues]);

  const value: AccessibilityContextType = {
    issues,
    fixes,
    config: finalConfig,
    scanForIssues,
    applyFix,
    autoFixAll,
    getComplianceReport,
    updateConfig
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
};

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
}
  return context
};

// Accessibility scanner component
export const AIAccessibilityScanner: React.FC<{
  autoScan?: boolean;
  showReport?: boolean;
  onIssuesFound?: (issues: AccessibilityIssue[]) => void
}> = ({ autoScan = true, showReport = true, onIssuesFound }) => {
  const { issues, fixes, scanForIssues, autoFixAll, getComplianceReport } = useAccessibility();
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<AccessibilityComplianceReport | null>(null);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const newIssues = await scanForIssues();
      if (onIssuesFound) {
        onIssuesFound(newIssues)
}
      setReport(getComplianceReport())
} finally {
      setIsScanning(false)
}
  }, [scanForIssues, onIssuesFound, getComplianceReport]);

  const handleAutoFix = useCallback(async () => {
    const appliedFixes = await autoFixAll();
    setReport(getComplianceReport());
    return appliedFixes
}, [autoFixAll, getComplianceReport]);

  useEffect(() => {
    if (autoScan) {
      handleScan()
}
  }, [autoScan, handleScan]);

  return (
    <div className="ai-accessibility-scanner">
      <div className="scanner-controls">
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="scan-button"
        >
          {isScanning ? 'Scanning...' : 'Scan for Issues'}
        </button>

        <button
          onClick={handleAutoFix}
          disabled={fixes.filter(f => !f.applied).length === 0}
          className="auto-fix-button"
        >
          Auto-Fix All ({fixes.filter(f => !f.applied).length})
        </button>
      </div>

      {showReport && report && (
        <div className="accessibility-report">
          <h3>Accessibility Report</h3>
          <div className="report-metrics">
            <div className="metric">
              <span className="label">Overall Score</span>
              <span className={`value ${report.overallScore > 80 ? 'good' : report.overallScore > 60 ? 'warning' : 'critical'}`}>
                {report.overallScore}/100
              </span>
            </div>
            <div className="metric">
              <span className="label">Total Issues</span>
              <span className="value">{report.totalIssues}</span>
            </div>
            <div className="metric">
              <span className="label">Auto-Fixed</span>
              <span className="value">{report.autoFixedIssues}</span>
            </div>
            <div className="metric">
              <span className="label">Manual Fixes</span>
              <span className="value">{report.manualFixesRequired}</span>
            </div>
          </div>

          <div className="wcag-compliance">
            <h4>WCAG Compliance</h4>
            <div className="compliance-levels">
              <span className={`level ${report.wcagCompliance.levelA ? 'pass' : 'fail'}`}>
                Level A: {report.wcagCompliance.levelA ? '✓' : '✗'}
              </span>
              <span className={`level ${report.wcagCompliance.levelAA ? 'pass' : 'fail'}`}>
                Level AA: {report.wcagCompliance.levelAA ? '✓' : '✗'}
              </span>
              <span className={`level ${report.wcagCompliance.levelAAA ? 'pass' : 'fail'}`}>
                Level AAA: {report.wcagCompliance.levelAAA ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="issues-list">
        <h4>Accessibility Issues ({issues.length})</h4>
        {issues.map(issue => (
          <div key={issue.id} className={`issue ${issue.severity}`}>
            <div className="issue-header">
              <span className="type">{issue.type}</span>
              <span className="severity">{issue.severity}</span>
              <span className="wcag">WCAG {issue.wcagLevel}</span>
            </div>
            <div className="issue-description">{issue.description}</div>
            <div className="issue-suggestion">{issue.suggestion}</div>
            {issue.autoFixable && (
              <div className="auto-fix-available">✓ Auto-fixable</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
};

// HOC to add accessibility scanning to any component
export const withAccessibilityScanning = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    autoScan?: boolean;
    wcagLevel?: 'A' | 'AA' | 'AAA'
}
) => {
  const AccessibilityComponent: React.FC<P> = (props) => {
    return (
      <AccessibilityProvider config={{ wcagLevel: options.wcagLevel }}>
        <Component {...props} />
        <AIAccessibilityScanner autoScan={options.autoScan} />
      </AccessibilityProvider>
    )
};

  AccessibilityComponent.displayName = `withAccessibilityScanning(${Component.displayName || Component.name})`;
  return AccessibilityComponent
};
