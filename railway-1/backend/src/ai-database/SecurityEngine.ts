/**
 * AI-BOS Security Engine
 *
 * Revolutionary security system for AI-BOS platform with:
 * - Input validation and sanitization
 * - Rate limiting and DDoS protection
 * - Prompt injection protection
 * - Model access control
 * - Audit logging
 * - Threat detection
 */

import {
  SecurityValidation,
  RateLimiter,
  Logger
} from 'aibos-shared-infrastructure';

export interface SecurityConfig {
  enableRateLimiting: boolean;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  enablePromptValidation: boolean;
  enableModelAccessControl: boolean;
  enableAuditLogging: boolean;
  enableThreatDetection: boolean;
  allowedModels: string[];
  blockedPatterns: string[];
  maxPromptLength: number;
  maxResponseLength: number;
}

export interface SecurityEvent {
  id: string;
  type: 'rate_limit' | 'prompt_injection' | 'model_access' | 'threat_detected' | 'validation_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string | undefined;
  ipAddress?: string | undefined;
  details: any;
  action: 'blocked' | 'warned' | 'logged' | 'allowed';
}

export interface ThreatDetection {
  promptInjection: boolean;
  rateLimitExceeded: boolean;
  modelAccessViolation: boolean;
  suspiciousPattern: boolean;
  confidence: number;
}

export class SecurityEngine {
  private static instance: SecurityEngine;
  private config: SecurityConfig;
  private rateLimiters: Map<string, any> = new Map();
  private blockedIPs: Set<string> = new Set();
  private securityEvents: SecurityEvent[] = [];
  private logger: any;

  private constructor(config: SecurityConfig) {
    this.config = config;
    this.logger = Logger;
    this.initializeSecurity();
  }

  static getInstance(config?: SecurityConfig): SecurityEngine {
    if (!SecurityEngine.instance) {
      SecurityEngine.instance = new SecurityEngine(config || SecurityEngine.getDefaultConfig());
    }
    return SecurityEngine.instance;
  }

  static getDefaultConfig(): SecurityConfig {
    return {
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000,
      enablePromptValidation: true,
      enableModelAccessControl: true,
      enableAuditLogging: true,
      enableThreatDetection: true,
      allowedModels: ['llama3:8b', 'codellama:7b', 'mistral:7b'],
      blockedPatterns: [
        'system:',
        'assistant:',
        'user:',
        'prompt injection',
        'ignore previous',
        'disregard instructions'
      ],
      maxPromptLength: 10000,
      maxResponseLength: 50000
    };
  }

  private initializeSecurity(): void {
    console.log('🛡️ AI-BOS Security Engine Initialized');
    this.logger.info('Security engine initialized', { config: this.config });
  }

  /**
   * Validate and sanitize prompt
   */
  validatePrompt(prompt: string, userId?: string, ipAddress?: string): {
    isValid: boolean;
    sanitizedPrompt: string;
    threats: ThreatDetection;
    events: SecurityEvent[];
  } {
    const events: SecurityEvent[] = [];
    const threats: ThreatDetection = {
      promptInjection: false,
      rateLimitExceeded: false,
      modelAccessViolation: false,
      suspiciousPattern: false,
      confidence: 0
    };

    let sanitizedPrompt = prompt;
    let isValid = true;

    // Check prompt length
    if (prompt.length > this.config.maxPromptLength) {
      isValid = false;
      events.push(this.createSecurityEvent('validation_failed', 'high', {
        reason: 'prompt_too_long',
        length: prompt.length,
        maxLength: this.config.maxPromptLength
      }, 'blocked', userId, ipAddress));
    }

    // Check for blocked patterns
    const blockedPatternFound = this.config.blockedPatterns.some(pattern =>
      prompt.toLowerCase().includes(pattern.toLowerCase())
    );

    if (blockedPatternFound) {
      threats.promptInjection = true;
      threats.confidence += 0.8;
      isValid = false;

      events.push(this.createSecurityEvent('prompt_injection', 'critical', {
        pattern: this.config.blockedPatterns.find(p => prompt.toLowerCase().includes(p.toLowerCase())),
        prompt: prompt.substring(0, 100) + '...'
      }, 'blocked', userId, ipAddress));
    }

    // Sanitize prompt
    if (this.config.enablePromptValidation) {
      sanitizedPrompt = SecurityValidation.sanitizeInput(prompt);

      // Check for suspicious patterns after sanitization
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi
      ];

      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(sanitizedPrompt));

      if (hasSuspiciousPattern) {
        threats.suspiciousPattern = true;
        threats.confidence += 0.6;
        isValid = false;

        events.push(this.createSecurityEvent('threat_detected', 'high', {
          type: 'suspicious_pattern',
          pattern: 'malicious_code_pattern'
        }, 'blocked', userId, ipAddress));
      }
    }

    // Log security events
    if (this.config.enableAuditLogging) {
      events.forEach(event => this.logSecurityEvent(event));
    }

    return { isValid, sanitizedPrompt, threats, events };
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(userId: string, ipAddress: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    events: SecurityEvent[];
  } {
    const events: SecurityEvent[] = [];
    let allowed = true;
    let remaining = 0;
    let resetTime = 0;

    if (!this.config.enableRateLimiting) {
      return { allowed: true, remaining: -1, resetTime: 0, events };
    }

    // Check per-minute rate limit
    const minuteKey = `rate_limit:${userId}:${ipAddress}:minute`;
    const minuteAllowed = RateLimiter.isAllowed(minuteKey, this.config.maxRequestsPerMinute, 60000);

    if (!minuteAllowed) {
      allowed = false;
      events.push(this.createSecurityEvent('rate_limit', 'medium', {
        type: 'per_minute',
        limit: this.config.maxRequestsPerMinute,
        window: '1 minute'
      }, 'blocked', userId, ipAddress));
    }

    // Check per-hour rate limit
    const hourKey = `rate_limit:${userId}:${ipAddress}:hour`;
    const hourAllowed = RateLimiter.isAllowed(hourKey, this.config.maxRequestsPerHour, 3600000);

    if (!hourAllowed) {
      allowed = false;
      events.push(this.createSecurityEvent('rate_limit', 'high', {
        type: 'per_hour',
        limit: this.config.maxRequestsPerHour,
        window: '1 hour'
      }, 'blocked', userId, ipAddress));
    }

    // Log events
    if (this.config.enableAuditLogging) {
      events.forEach(event => this.logSecurityEvent(event));
    }

    return { allowed, remaining, resetTime, events };
  }

  /**
   * Validate model access
   */
  validateModelAccess(model: string, userId?: string, ipAddress?: string): {
    allowed: boolean;
    events: SecurityEvent[];
  } {
    const events: SecurityEvent[] = [];
    let allowed = true;

    if (!this.config.enableModelAccessControl) {
      return { allowed: true, events };
    }

    if (!this.config.allowedModels.includes(model)) {
      allowed = false;
      events.push(this.createSecurityEvent('model_access', 'high', {
        requestedModel: model,
        allowedModels: this.config.allowedModels
      }, 'blocked', userId, ipAddress));
    }

    // Log events
    if (this.config.enableAuditLogging) {
      events.forEach(event => this.logSecurityEvent(event));
    }

    return { allowed, events };
  }

  /**
   * Comprehensive security check
   */
  async performSecurityCheck(
    prompt: string,
    model: string,
    userId?: string,
    ipAddress?: string
  ): Promise<{
    allowed: boolean;
    sanitizedPrompt: string;
    threats: ThreatDetection;
    events: SecurityEvent[];
    securityScore: number;
  }> {
    const events: SecurityEvent[] = [];
    let allowed = true;
    let securityScore = 100;

    // Check if IP is blocked
    if (this.blockedIPs.has(ipAddress || '')) {
      allowed = false;
      securityScore = 0;
      events.push(this.createSecurityEvent('threat_detected', 'critical', {
        reason: 'ip_blocked'
      }, 'blocked', userId, ipAddress));
    }

    // Validate prompt
    const promptValidation = this.validatePrompt(prompt, userId, ipAddress);
    if (!promptValidation.isValid) {
      allowed = false;
      securityScore -= 50;
    }
    events.push(...promptValidation.events);

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit(userId || 'anonymous', ipAddress || 'unknown');
    if (!rateLimitCheck.allowed) {
      allowed = false;
      securityScore -= 30;
    }
    events.push(...rateLimitCheck.events);

    // Validate model access
    const modelValidation = this.validateModelAccess(model, userId, ipAddress);
    if (!modelValidation.allowed) {
      allowed = false;
      securityScore -= 20;
    }
    events.push(...modelValidation.events);

    // Threat detection
    if (this.config.enableThreatDetection) {
      const threats = this.detectThreats(prompt, userId, ipAddress);
      if (threats.confidence > 0.7) {
        allowed = false;
        securityScore -= 40;
        events.push(this.createSecurityEvent('threat_detected', 'critical', {
          threats,
          confidence: threats.confidence
        }, 'blocked', userId, ipAddress));
      }
    }

    return {
      allowed,
      sanitizedPrompt: promptValidation.sanitizedPrompt,
      threats: promptValidation.threats,
      events,
      securityScore: Math.max(0, securityScore)
    };
  }

  /**
   * Detect threats in request
   */
  private detectThreats(prompt: string, userId?: string, ipAddress?: string): ThreatDetection {
    const threats: ThreatDetection = {
      promptInjection: false,
      rateLimitExceeded: false,
      modelAccessViolation: false,
      suspiciousPattern: false,
      confidence: 0
    };

    // Check for prompt injection attempts
    const injectionPatterns = [
      /ignore.*previous.*instructions/gi,
      /disregard.*above.*instructions/gi,
      /system.*prompt/gi,
      /assistant.*role/gi,
      /bypass.*safety/gi
    ];

    const injectionDetected = injectionPatterns.some(pattern => pattern.test(prompt));
    if (injectionDetected) {
      threats.promptInjection = true;
      threats.confidence += 0.9;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /eval\(/gi,
      /document\./gi,
      /window\./gi
    ];

    const suspiciousDetected = suspiciousPatterns.some(pattern => pattern.test(prompt));
    if (suspiciousDetected) {
      threats.suspiciousPattern = true;
      threats.confidence += 0.7;
    }

    return threats;
  }

  /**
   * Create security event
   */
  private createSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    details: any,
    action: SecurityEvent['action'],
    userId?: string,
    ipAddress?: string
  ): SecurityEvent {
    return {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      timestamp: new Date(),
      userId,
      ipAddress,
      details,
      action
    };
  }

  /**
   * Log security event
   */
  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    this.logger.warn('Security event detected', {
      eventId: event.id,
      type: event.type,
      severity: event.severity,
      action: event.action,
      userId: event.userId,
      ipAddress: event.ipAddress,
      details: event.details
    });

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }

  /**
   * Block IP address
   */
  blockIP(ipAddress: string, reason: string): void {
    this.blockedIPs.add(ipAddress);
    this.logger.error('IP address blocked', { ipAddress, reason });
  }

  /**
   * Unblock IP address
   */
  unblockIP(ipAddress: string): void {
    this.blockedIPs.delete(ipAddress);
    this.logger.info('IP address unblocked', { ipAddress });
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalEvents: number;
    blockedEvents: number;
    threatEvents: number;
    blockedIPs: number;
    securityScore: number;
  } {
    const blockedEvents = this.securityEvents.filter(e => e.action === 'blocked').length;
    const threatEvents = this.securityEvents.filter(e => e.type === 'threat_detected').length;

    return {
      totalEvents: this.securityEvents.length,
      blockedEvents,
      threatEvents,
      blockedIPs: this.blockedIPs.size,
      securityScore: Math.max(0, 100 - (blockedEvents * 10))
    };
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Security configuration updated', { newConfig });
  }
}

// Export singleton instance
export const securityEngine = SecurityEngine.getInstance();
