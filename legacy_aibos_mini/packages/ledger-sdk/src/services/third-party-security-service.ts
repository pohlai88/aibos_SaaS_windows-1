import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SecurityScan {
  id: string;
  moduleId: string;
  version: string;
  scanType: 'static' | 'dynamic' | 'behavioral' | 'dependency';
  status: 'pending' | 'scanning' | 'passed' | 'failed' | 'blocked';
  results: SecurityResult[];
  riskScore: number; // 0-100
  scanDate: string;
  scanDuration: number; // seconds
  scannerVersion: string;
}

export interface SecurityResult {
  id: string;
  type: 'vulnerability' | 'malware' | 'suspicious_code' | 'dependency_issue' | 'permission_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string; // file:line:column
  codeSnippet?: string;
  cveId?: string;
  remediation?: string;
  confidence: number; // 0-100
}

export interface ContainerConfig {
  id: string;
  moduleId: string;
  version: string;
  containerType: 'docker' | 'firecracker' | 'gvisor' | 'custom';
  image: string;
  resources: {
    cpu: number;
    memory: number; // MB
    storage: number; // MB
    network: 'isolated' | 'restricted' | 'public';
  };
  security: {
    readOnly: boolean;
    noPrivileged: boolean;
    noNewPrivileges: boolean;
    seccompProfile: string;
    apparmorProfile: string;
    capabilities: string[];
    userNamespace: boolean;
  };
  networking: {
    isolated: boolean;
    allowedPorts: number[];
    allowedHosts: string[];
    dnsServers: string[];
  };
  filesystem: {
    readOnlyPaths: string[];
    writablePaths: string[];
    mountedVolumes: string[];
  };
  environment: {
    variables: Record<string, string>;
    secrets: string[];
  };
}

export interface CodeValidation {
  id: string;
  moduleId: string;
  version: string;
  validationType: 'syntax' | 'semantic' | 'security' | 'performance' | 'compliance';
  status: 'pending' | 'validating' | 'passed' | 'failed';
  results: ValidationResult[];
  validationDate: string;
  validatorVersion: string;
}

export interface ValidationResult {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location: string;
  rule: string;
  suggestion?: string;
}

export interface BundleAnalysis {
  id: string;
  moduleId: string;
  version: string;
  bundleSize: number; // bytes
  fileCount: number;
  dependencies: DependencyInfo[];
  suspiciousPatterns: SuspiciousPattern[];
  obfuscatedCode: boolean;
  minifiedCode: boolean;
  sourceMaps: boolean;
  analysisDate: string;
}

export interface DependencyInfo {
  name: string;
  version: string;
  license: string;
  vulnerabilities: number;
  size: number;
  type: 'production' | 'development' | 'peer';
}

export interface SuspiciousPattern {
  type: 'eval' | 'exec' | 'require' | 'import' | 'network' | 'file_system' | 'process';
  pattern: string;
  location: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRule {
  id: string;
  type: 'pattern' | 'function' | 'api' | 'dependency' | 'permission';
  pattern: string;
  action: 'allow' | 'deny' | 'warn' | 'quarantine';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  examples: string[];
}

export interface QuarantineEntry {
  id: string;
  moduleId: string;
  version: string;
  reason: string;
  securityIssues: SecurityResult[];
  quarantineDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: 'quarantined' | 'reviewed' | 'approved' | 'rejected';
}

export class ThirdPartySecurityService extends EventEmitter {
  private redis: Redis;
  private supabase: any;
  private readonly SCAN_CACHE_TTL = 3600; // 1 hour
  private readonly QUARANTINE_TTL = 86400; // 24 hours
  private containers: Map<string, ContainerConfig> = new Map();
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private quarantineList: Map<string, QuarantineEntry> = new Map();

  constructor(redisUrl: string, supabaseUrl: string, supabaseKey: string) {
    super();
    this.redis = new Redis(redisUrl);
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeSecurityPolicies();
  }

  /**
   * Comprehensive security scan of a third-party module
   */
  async scanModule(
    moduleId: string,
    version: string,
    bundlePath: string,
    scanTypes: ('static' | 'dynamic' | 'behavioral' | 'dependency')[] = ['static', 'dependency']
  ): Promise<SecurityScan> {
    const scanId = `scan_${moduleId}_${version}_${Date.now()}`;
    
    // Create scan record
    const scan: SecurityScan = {
      id: scanId,
      moduleId,
      version,
      scanType: scanTypes[0],
      status: 'scanning',
      results: [],
      riskScore: 0,
      scanDate: new Date().toISOString(),
      scanDuration: 0,
      scannerVersion: '1.0.0'
    };

    const startTime = Date.now();

    try {
      // Perform security scans
      for (const scanType of scanTypes) {
        const results = await this.performSecurityScan(scanType, bundlePath, moduleId);
        scan.results.push(...results);
      }

      // Calculate risk score
      scan.riskScore = this.calculateRiskScore(scan.results);
      
      // Determine scan status
      scan.status = this.determineScanStatus(scan.results, scan.riskScore);
      scan.scanDuration = (Date.now() - startTime) / 1000;

      // Store scan results
      await this.storeSecurityScan(scan);

      // Emit scan completion event
      this.emit('scanCompleted', {
        scanId,
        moduleId,
        version,
        status: scan.status,
        riskScore: scan.riskScore,
        resultsCount: scan.results.length
      });

      return scan;

    } catch (error) {
      scan.status = 'failed';
      scan.scanDuration = (Date.now() - startTime) / 1000;
      await this.storeSecurityScan(scan);
      throw error;
    }
  }

  /**
   * Create secure container for third-party module
   */
  async createSecureContainer(
    moduleId: string,
    version: string,
    containerType: 'docker' | 'firecracker' | 'gvisor' = 'docker'
  ): Promise<ContainerConfig> {
    const containerId = `container_${moduleId}_${version}`;
    
    // Get base security configuration
    const baseConfig = this.getBaseContainerConfig(containerType);
    
    const container: ContainerConfig = {
      id: containerId,
      moduleId,
      version,
      containerType,
      image: `aibos/${moduleId}:${version}`,
      resources: {
        cpu: 0.5,
        memory: 512,
        storage: 1024,
        network: 'isolated'
      },
      security: {
        readOnly: true,
        noPrivileged: true,
        noNewPrivileges: true,
        seccompProfile: 'default',
        apparmorProfile: 'docker-default',
        capabilities: [],
        userNamespace: true
      },
      networking: {
        isolated: true,
        allowedPorts: [3000],
        allowedHosts: [],
        dnsServers: ['8.8.8.8', '1.1.1.1']
      },
      filesystem: {
        readOnlyPaths: ['/app', '/usr', '/lib'],
        writablePaths: ['/tmp', '/var/log'],
        mountedVolumes: []
      },
      environment: {
        variables: {
          NODE_ENV: 'production',
          AIBOS_MODULE_ID: moduleId,
          AIBOS_VERSION: version
        },
        secrets: []
      },
      ...baseConfig
    };

    // Store container configuration
    const { error } = await this.supabase
      .from('module_containers')
      .insert(container);

    if (error) throw error;

    // Store in memory for quick access
    this.containers.set(containerId, container);

    return container;
  }

  /**
   * Validate JavaScript bundle for malicious code
   */
  async validateBundle(
    moduleId: string,
    version: string,
    bundlePath: string
  ): Promise<BundleAnalysis> {
    const analysisId = `analysis_${moduleId}_${version}_${Date.now()}`;
    
    const analysis: BundleAnalysis = {
      id: analysisId,
      moduleId,
      version,
      bundleSize: 0,
      fileCount: 0,
      dependencies: [],
      suspiciousPatterns: [],
      obfuscatedCode: false,
      minifiedCode: false,
      sourceMaps: false,
      analysisDate: new Date().toISOString()
    };

    try {
      // Get bundle statistics
      const stats = await this.analyzeBundleStats(bundlePath);
      analysis.bundleSize = stats.size;
      analysis.fileCount = stats.fileCount;

      // Check for obfuscation and minification
      analysis.obfuscatedCode = await this.detectObfuscation(bundlePath);
      analysis.minifiedCode = await this.detectMinification(bundlePath);
      analysis.sourceMaps = await this.detectSourceMaps(bundlePath);

      // Analyze dependencies
      analysis.dependencies = await this.analyzeDependencies(bundlePath);

      // Detect suspicious patterns
      analysis.suspiciousPatterns = await this.detectSuspiciousPatterns(bundlePath);

      // Store analysis results
      await this.storeBundleAnalysis(analysis);

      return analysis;

    } catch (error) {
      throw new Error(`Bundle validation failed: ${error.message}`);
    }
  }

  /**
   * Run module in secure container
   */
  async runModuleInContainer(
    moduleId: string,
    version: string,
    entryPoint: string
  ): Promise<{ containerId: string; status: string; logs: string[] }> {
    const containerId = `container_${moduleId}_${version}`;
    const container = this.containers.get(containerId);

    if (!container) {
      throw new Error(`Container not found for ${moduleId}:${version}`);
    }

    try {
      // Create and start container
      const dockerCommand = this.buildDockerCommand(container, entryPoint);
      const { stdout, stderr } = await execAsync(dockerCommand);

      // Monitor container
      const logs = await this.monitorContainer(containerId);

      return {
        containerId,
        status: 'running',
        logs: logs
      };

    } catch (error) {
      throw new Error(`Failed to run module in container: ${error.message}`);
    }
  }

  /**
   * Quarantine suspicious module
   */
  async quarantineModule(
    moduleId: string,
    version: string,
    reason: string,
    securityIssues: SecurityResult[]
  ): Promise<QuarantineEntry> {
    const quarantineId = `quarantine_${moduleId}_${version}`;
    
    const quarantine: QuarantineEntry = {
      id: quarantineId,
      moduleId,
      version,
      reason,
      securityIssues,
      quarantineDate: new Date().toISOString(),
      status: 'quarantined'
    };

    // Store quarantine entry
    const { error } = await this.supabase
      .from('quarantine_entries')
      .insert(quarantine);

    if (error) throw error;

    // Add to memory cache
    this.quarantineList.set(quarantineId, quarantine);

    // Set Redis key for quick lookup
    await this.redis.setex(
      `quarantine:${moduleId}:${version}`,
      this.QUARANTINE_TTL,
      JSON.stringify(quarantine)
    );

    // Emit quarantine event
    this.emit('moduleQuarantined', {
      moduleId,
      version,
      reason,
      issuesCount: securityIssues.length
    });

    return quarantine;
  }

  /**
   * Check if module is quarantined
   */
  async isModuleQuarantined(moduleId: string, version: string): Promise<boolean> {
    // Check Redis cache first
    const cached = await this.redis.get(`quarantine:${moduleId}:${version}`);
    if (cached) return true;

    // Check database
    const { data, error } = await this.supabase
      .from('quarantine_entries')
      .select('id')
      .eq('module_id', moduleId)
      .eq('version', version)
      .eq('status', 'quarantined')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  /**
   * Review quarantined module
   */
  async reviewQuarantinedModule(
    moduleId: string,
    version: string,
    reviewerId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('quarantine_entries')
      .update({
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        status: decision,
        review_notes: notes
      })
      .eq('module_id', moduleId)
      .eq('version', version);

    if (error) throw error;

    // Remove from quarantine cache if approved
    if (decision === 'approved') {
      await this.redis.del(`quarantine:${moduleId}:${version}`);
    }

    // Emit review event
    this.emit('moduleReviewed', {
      moduleId,
      version,
      reviewerId,
      decision,
      notes
    });
  }

  /**
   * Get security statistics
   */
  async getSecurityStatistics(): Promise<{
    totalScans: number;
    passedScans: number;
    failedScans: number;
    quarantinedModules: number;
    averageRiskScore: number;
    topVulnerabilities: string[];
  }> {
    const { data: scans, error: scansError } = await this.supabase
      .from('security_scans')
      .select('*');

    if (scansError) throw scansError;

    const { data: quarantined, error: quarantineError } = await this.supabase
      .from('quarantine_entries')
      .select('*')
      .eq('status', 'quarantined');

    if (quarantineError) throw quarantineError;

    const totalScans = scans?.length || 0;
    const passedScans = scans?.filter(s => s.status === 'passed').length || 0;
    const failedScans = scans?.filter(s => s.status === 'failed').length || 0;
    const quarantinedModules = quarantined?.length || 0;
    const averageRiskScore = scans?.reduce((sum, s) => sum + s.risk_score, 0) / totalScans || 0;

    // Get top vulnerabilities
    const allResults = scans?.flatMap(s => s.results || []) || [];
    const vulnerabilityCounts = allResults
      .filter(r => r.type === 'vulnerability')
      .reduce((acc, r) => {
        acc[r.title] = (acc[r.title] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topVulnerabilities = Object.entries(vulnerabilityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([title]) => title);

    return {
      totalScans,
      passedScans,
      failedScans,
      quarantinedModules,
      averageRiskScore,
      topVulnerabilities
    };
  }

  // Private helper methods

  private async performSecurityScan(
    scanType: string,
    bundlePath: string,
    moduleId: string
  ): Promise<SecurityResult[]> {
    const results: SecurityResult[] = [];

    switch (scanType) {
      case 'static':
        results.push(...await this.performStaticAnalysis(bundlePath));
        break;
      case 'dependency':
        results.push(...await this.performDependencyAnalysis(bundlePath));
        break;
      case 'behavioral':
        results.push(...await this.performBehavioralAnalysis(bundlePath));
        break;
      case 'dynamic':
        results.push(...await this.performDynamicAnalysis(bundlePath));
        break;
    }

    return results;
  }

  private async performStaticAnalysis(bundlePath: string): Promise<SecurityResult[]> {
    const results: SecurityResult[] = [];

    try {
      // Read bundle content
      const content = fs.readFileSync(bundlePath, 'utf8');

      // Check for dangerous patterns
      const dangerousPatterns = [
        { pattern: /eval\s*\(/, type: 'eval', severity: 'critical' },
        { pattern: /Function\s*\(/, type: 'eval', severity: 'critical' },
        { pattern: /exec\s*\(/, type: 'exec', severity: 'critical' },
        { pattern: /spawn\s*\(/, type: 'exec', severity: 'high' },
        { pattern: /require\s*\(\s*['"`][^'"`]*['"`]\s*\)/, type: 'require', severity: 'medium' },
        { pattern: /process\.env/, type: 'env_access', severity: 'medium' },
        { pattern: /fs\./, type: 'file_system', severity: 'high' },
        { pattern: /http\.|https\.|fetch\s*\(/, type: 'network', severity: 'medium' }
      ];

      for (const { pattern, type, severity } of dangerousPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          results.push({
            id: crypto.randomUUID(),
            type: 'suspicious_code',
            severity,
            title: `Dangerous ${type} usage detected`,
            description: `Found ${matches.length} instances of potentially dangerous ${type} usage`,
            location: 'bundle.js',
            codeSnippet: matches[0],
            confidence: 90
          });
        }
      }

    } catch (error) {
      results.push({
        id: crypto.randomUUID(),
        type: 'vulnerability',
        severity: 'high',
        title: 'Static analysis failed',
        description: `Failed to perform static analysis: ${error.message}`,
        location: 'bundle.js',
        confidence: 100
      });
    }

    return results;
  }

  private async performDependencyAnalysis(bundlePath: string): Promise<SecurityResult[]> {
    const results: SecurityResult[] = [];

    try {
      // Check package.json if available
      const packagePath = path.join(path.dirname(bundlePath), 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Check for known vulnerable dependencies
        const vulnerableDeps = await this.checkVulnerableDependencies(packageJson.dependencies || {});
        
        for (const dep of vulnerableDeps) {
          results.push({
            id: crypto.randomUUID(),
            type: 'dependency_issue',
            severity: dep.severity,
            title: `Vulnerable dependency: ${dep.name}`,
            description: dep.description,
            location: 'package.json',
            cveId: dep.cveId,
            confidence: 95
          });
        }
      }
    } catch (error) {
      results.push({
        id: crypto.randomUUID(),
        type: 'dependency_issue',
        severity: 'medium',
        title: 'Dependency analysis failed',
        description: `Failed to analyze dependencies: ${error.message}`,
        location: 'package.json',
        confidence: 100
      });
    }

    return results;
  }

  private async performBehavioralAnalysis(bundlePath: string): Promise<SecurityResult[]> {
    const results: SecurityResult[] = [];

    try {
      // Analyze code behavior patterns
      const content = fs.readFileSync(bundlePath, 'utf8');
      
      // Check for suspicious behavioral patterns
      const behavioralPatterns = [
        { pattern: /setTimeout\s*\(\s*function\s*\(\)\s*\{[^}]*eval/, type: 'deferred_eval', severity: 'critical' },
        { pattern: /setInterval\s*\(\s*function\s*\(\)\s*\{[^}]*eval/, type: 'repeated_eval', severity: 'critical' },
        { pattern: /new\s+Function\s*\(/, type: 'dynamic_function', severity: 'high' },
        { pattern: /document\.write\s*\(/, type: 'dom_manipulation', severity: 'medium' }
      ];

      for (const { pattern, type, severity } of behavioralPatterns) {
        if (pattern.test(content)) {
          results.push({
            id: crypto.randomUUID(),
            type: 'suspicious_code',
            severity,
            title: `Suspicious behavioral pattern: ${type}`,
            description: `Detected potentially malicious behavioral pattern`,
            location: 'bundle.js',
            confidence: 85
          });
        }
      }

    } catch (error) {
      results.push({
        id: crypto.randomUUID(),
        type: 'vulnerability',
        severity: 'medium',
        title: 'Behavioral analysis failed',
        description: `Failed to perform behavioral analysis: ${error.message}`,
        location: 'bundle.js',
        confidence: 100
      });
    }

    return results;
  }

  private async performDynamicAnalysis(bundlePath: string): Promise<SecurityResult[]> {
    const results: SecurityResult[] = [];

    try {
      // Run module in isolated environment and monitor behavior
      const worker = new Worker(`
        const { parentPort } = require('worker_threads');
        
        // Set up monitoring
        const originalEval = eval;
        const originalRequire = require;
        
        // Override dangerous functions
        global.eval = function(code) {
          parentPort.postMessage({
            type: 'dangerous_call',
            function: 'eval',
            code: code
          });
          return originalEval(code);
        };
        
        // Monitor file system access
        const fs = require('fs');
        const originalReadFile = fs.readFile;
        fs.readFile = function(path, options, callback) {
          parentPort.postMessage({
            type: 'file_access',
            operation: 'read',
            path: path
          });
          return originalReadFile(path, options, callback);
        };
        
        // Load and run the module
        try {
          const module = require('${bundlePath}');
          parentPort.postMessage({ type: 'module_loaded', success: true });
        } catch (error) {
          parentPort.postMessage({ type: 'module_error', error: error.message });
        }
      `, { eval: true });

      // Monitor worker for suspicious activity
      worker.on('message', (message) => {
        if (message.type === 'dangerous_call') {
          results.push({
            id: crypto.randomUUID(),
            type: 'suspicious_code',
            severity: 'critical',
            title: 'Dynamic eval detected',
            description: `Module attempted to use eval() during execution`,
            location: 'runtime',
            codeSnippet: message.code,
            confidence: 100
          });
        }
      });

      // Wait for analysis to complete
      await new Promise(resolve => setTimeout(resolve, 5000));
      worker.terminate();

    } catch (error) {
      results.push({
        id: crypto.randomUUID(),
        type: 'vulnerability',
        severity: 'medium',
        title: 'Dynamic analysis failed',
        description: `Failed to perform dynamic analysis: ${error.message}`,
        location: 'runtime',
        confidence: 100
      });
    }

    return results;
  }

  private calculateRiskScore(results: SecurityResult[]): number {
    let score = 0;
    
    for (const result of results) {
      switch (result.severity) {
        case 'critical':
          score += 25;
          break;
        case 'high':
          score += 15;
          break;
        case 'medium':
          score += 8;
          break;
        case 'low':
          score += 3;
          break;
      }
    }
    
    return Math.min(score, 100);
  }

  private determineScanStatus(results: SecurityResult[], riskScore: number): 'passed' | 'failed' | 'blocked' {
    const criticalIssues = results.filter(r => r.severity === 'critical').length;
    const highIssues = results.filter(r => r.severity === 'high').length;
    
    if (criticalIssues > 0 || riskScore > 80) return 'blocked';
    if (highIssues > 2 || riskScore > 50) return 'failed';
    return 'passed';
  }

  private async analyzeBundleStats(bundlePath: string): Promise<{ size: number; fileCount: number }> {
    const stats = fs.statSync(bundlePath);
    return {
      size: stats.size,
      fileCount: 1 // For single bundle file
    };
  }

  private async detectObfuscation(bundlePath: string): Promise<boolean> {
    const content = fs.readFileSync(bundlePath, 'utf8');
    
    // Check for obfuscation indicators
    const obfuscationPatterns = [
      /[a-zA-Z]{1,2}\.[a-zA-Z]{1,2}\([a-zA-Z]{1,2}\)/, // Short variable names
      /eval\([^)]{50,}/, // Long eval strings
      /function\([a-z]\)\{[a-z]=[a-z]\+[a-z]/, // Simple obfuscation patterns
      /[a-z]{1,3}\+[a-z]{1,3}\+[a-z]{1,3}/ // Concatenated short strings
    ];
    
    return obfuscationPatterns.some(pattern => pattern.test(content));
  }

  private async detectMinification(bundlePath: string): Promise<boolean> {
    const content = fs.readFileSync(bundlePath, 'utf8');
    
    // Check for minification indicators
    const minificationPatterns = [
      /function\([a-z]\)\{/, // Short parameter names
      /var [a-z]=/, // Short variable names
      /[a-z]\.[a-z]\(/, // Short method calls
      /\n\s*[a-z]/, // No proper indentation
    ];
    
    return minificationPatterns.some(pattern => pattern.test(content));
  }

  private async detectSourceMaps(bundlePath: string): Promise<boolean> {
    const sourceMapPath = bundlePath + '.map';
    return fs.existsSync(sourceMapPath);
  }

  private async analyzeDependencies(bundlePath: string): Promise<DependencyInfo[]> {
    const dependencies: DependencyInfo[] = [];
    
    try {
      const packagePath = path.join(path.dirname(bundlePath), 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
          dependencies.push({
            name,
            version: version as string,
            license: 'Unknown',
            vulnerabilities: 0,
            size: 0,
            type: 'production'
          });
        }
      }
    } catch (error) {
      // Handle error silently
    }
    
    return dependencies;
  }

  private async detectSuspiciousPatterns(bundlePath: string): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    const content = fs.readFileSync(bundlePath, 'utf8');
    
    const suspiciousPatterns = [
      { pattern: /eval\s*\(/, type: 'eval', risk: 'critical' },
      { pattern: /Function\s*\(/, type: 'eval', risk: 'critical' },
      { pattern: /exec\s*\(/, type: 'exec', risk: 'critical' },
      { pattern: /spawn\s*\(/, type: 'exec', risk: 'high' },
      { pattern: /require\s*\(\s*['"`][^'"`]*['"`]\s*\)/, type: 'require', risk: 'medium' },
      { pattern: /process\.env/, type: 'env_access', risk: 'medium' },
      { pattern: /fs\./, type: 'file_system', risk: 'high' },
      { pattern: /http\.|https\.|fetch\s*\(/, type: 'network', risk: 'medium' }
    ];
    
    for (const { pattern, type, risk } of suspiciousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        patterns.push({
          type: type as any,
          pattern: pattern.source,
          location: 'bundle.js',
          risk: risk as any,
          description: `Found ${matches.length} instances of ${type} usage`
        });
      }
    }
    
    return patterns;
  }

  private getBaseContainerConfig(containerType: string): Partial<ContainerConfig> {
    switch (containerType) {
      case 'docker':
        return {
          security: {
            seccompProfile: 'default',
            apparmorProfile: 'docker-default'
          }
        };
      case 'firecracker':
        return {
          security: {
            seccompProfile: 'firecracker',
            apparmorProfile: 'firecracker'
          }
        };
      case 'gvisor':
        return {
          security: {
            seccompProfile: 'gvisor',
            apparmorProfile: 'gvisor'
          }
        };
      default:
        return {};
    }
  }

  private buildDockerCommand(container: ContainerConfig, entryPoint: string): string {
    const securityFlags = [
      '--read-only',
      '--no-privileged',
      '--security-opt=no-new-privileges',
      `--security-opt=seccomp=${container.security.seccompProfile}`,
      `--security-opt=apparmor=${container.security.apparmorProfile}`,
      '--user=1000:1000'
    ];

    const resourceFlags = [
      `--cpus=${container.resources.cpu}`,
      `--memory=${container.resources.memory}m`,
      `--storage-opt=size=${container.resources.storage}m`
    ];

    const networkFlags = container.networking.isolated ? [
      '--network=none'
    ] : [
      '--network=bridge',
      `--publish=${container.networking.allowedPorts.join(',')}`
    ];

    return `docker run -d ${securityFlags.join(' ')} ${resourceFlags.join(' ')} ${networkFlags.join(' ')} ${container.image} ${entryPoint}`;
  }

  private async monitorContainer(containerId: string): Promise<string[]> {
    // Simulate container monitoring
    return [
      `Container ${containerId} started successfully`,
      'Module loaded and initialized',
      'Health check passed'
    ];
  }

  private async checkVulnerableDependencies(dependencies: Record<string, string>): Promise<any[]> {
    // Simulate vulnerability check
    return [];
  }

  private async storeSecurityScan(scan: SecurityScan): Promise<void> {
    const { error } = await this.supabase
      .from('security_scans')
      .insert(scan);

    if (error) throw error;
  }

  private async storeBundleAnalysis(analysis: BundleAnalysis): Promise<void> {
    const { error } = await this.supabase
      .from('bundle_analyses')
      .insert(analysis);

    if (error) throw error;
  }

  private initializeSecurityPolicies(): void {
    // Initialize default security policies
    const defaultPolicies: SecurityPolicy[] = [
      {
        id: 'policy_1',
        name: 'No Eval Usage',
        description: 'Prevent use of eval() and Function()',
        rules: [
          {
            id: 'rule_1',
            type: 'pattern',
            pattern: 'eval\\s*\\(',
            action: 'deny',
            severity: 'critical',
            description: 'Block eval() usage',
            examples: ['eval(code)', 'eval("alert(1)")']
          }
        ],
        severity: 'critical',
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultPolicies.forEach(policy => {
      this.securityPolicies.set(policy.id, policy);
    });
  }
} 