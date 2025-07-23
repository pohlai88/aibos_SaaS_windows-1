/**
 * AI-BOS Analytics Tracker
 *
 * World-class analytics tracker for comprehensive user behavior tracking and insights.
 */

// ==================== ANALYTICS TYPES ====================

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  sessionTimeout: number;
  userId?: string;
}

export interface AnalyticsSession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  events: AnalyticsEvent[];
  properties: Record<string, any>;
}

// ==================== ANALYTICS CONSTANTS ====================

export const ANALYTICS_CONSTANTS = {
  DEFAULT_BATCH_SIZE: 10,
  DEFAULT_FLUSH_INTERVAL: 30000, // 30 seconds
  DEFAULT_SESSION_TIMEOUT: 1800000, // 30 minutes
  EVENT_TYPES: {
    PAGE_VIEW: 'page_view',
    CLICK: 'click',
    SCROLL: 'scroll',
    FORM_SUBMIT: 'form_submit',
    FORM_ERROR: 'form_error',
    API_CALL: 'api_call',
    ERROR: 'error',
    PERFORMANCE: 'performance',
    CUSTOM: 'custom'
  },
  CATEGORIES: {
    USER_INTERACTION: 'user_interaction',
    NAVIGATION: 'navigation',
    FORM: 'form',
    API: 'api',
    ERROR: 'error',
    PERFORMANCE: 'performance',
    BUSINESS: 'business'
  }
} as const;

// ==================== ANALYTICS TRACKER ====================

class AnalyticsTracker {
  private config: AnalyticsConfig;
  private session: AnalyticsSession;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: ReturnType<typeof setTimeout>;
  private isInitialized = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      debug: false,
      endpoint: '/api/analytics',
      batchSize: ANALYTICS_CONSTANTS.DEFAULT_BATCH_SIZE,
      flushInterval: ANALYTICS_CONSTANTS.DEFAULT_FLUSH_INTERVAL,
      sessionTimeout: ANALYTICS_CONSTANTS.DEFAULT_SESSION_TIMEOUT,
      ...config
    };

    this.session = this.createSession();
    this.initialize();
  }

  private createSession(): AnalyticsSession {
    return {
      id: this.generateSessionId(),
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      events: [],
      properties: {}
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    if (this.isInitialized || !this.config.enabled) return;

    // Start flush timer
    this.startFlushTimer();

    // Track page view on initialization
    this.trackPageView();

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;

    if (this.config.debug) {
      console.log('Analytics tracker initialized:', this.config);
    }
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target) {
        this.trackClick(target);
      }
    });

    // Track scroll events (throttled)
    let scrollTimeout: ReturnType<typeof setTimeout>;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScroll();
      }, 100);
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      if (form) {
        this.trackFormSubmit(form);
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hide', ANALYTICS_CONSTANTS.CATEGORIES.NAVIGATION);
      } else {
        this.trackEvent('page_show', ANALYTICS_CONSTANTS.CATEGORIES.NAVIGATION);
      }
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private trackClick(element: HTMLElement): void {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent?.trim() || '';
    const id = element.id || '';
    const className = element.className || '';
    const href = (element as HTMLAnchorElement).href || '';

    this.trackEvent('click', ANALYTICS_CONSTANTS.CATEGORIES.USER_INTERACTION, {
      element: tagName,
      text: text.substring(0, 50),
      id,
      className: className.substring(0, 100),
      href: href.substring(0, 200)
    });
  }

  private trackScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);

    this.trackEvent('scroll', ANALYTICS_CONSTANTS.CATEGORIES.USER_INTERACTION, {
      scrollTop,
      scrollPercentage,
      url: window.location.href
    });
  }

  private trackFormSubmit(form: HTMLFormElement): void {
    const formId = form.id || '';
    const formAction = form.action || '';
    const formMethod = form.method || '';

    this.trackEvent('form_submit', ANALYTICS_CONSTANTS.CATEGORIES.FORM, {
      formId,
      formAction,
      formMethod,
      url: window.location.href
    });
  }

  private trackPageView(): void {
    this.session.pageViews++;
    this.session.lastActivity = new Date();

    this.trackEvent('page_view', ANALYTICS_CONSTANTS.CATEGORIES.NAVIGATION, {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    });
  }

  public trackEvent(
    name: string,
    category: string,
    properties: Record<string, any> = {}
  ): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name,
      category,
      action: name,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      sessionId: this.session.id,
      userId: this.config.userId || ''
    };

    this.eventQueue.push(event);
    this.session.events.push(event);
    this.session.lastActivity = new Date();

    if (this.config.debug) {
      console.log('Analytics event tracked:', event);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  public trackCustomEvent(
    name: string,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent(name, ANALYTICS_CONSTANTS.CATEGORIES.BUSINESS, properties);
  }

  public trackError(
    error: Error,
    context: Record<string, any> = {}
  ): void {
    this.trackEvent('error', ANALYTICS_CONSTANTS.CATEGORIES.ERROR, {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      ...context
    });
  }

  public trackPerformance(
    metric: string,
    value: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('performance', ANALYTICS_CONSTANTS.CATEGORIES.PERFORMANCE, {
      metric,
      value,
      ...properties
    });
  }

  public trackApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    duration: number,
    properties: Record<string, any> = {}
  ): void {
    this.trackEvent('api_call', ANALYTICS_CONSTANTS.CATEGORIES.API, {
      endpoint,
      method,
      statusCode,
      duration,
      ...properties
    });
  }

  public setUserId(userId: string): void {
    this.config.userId = userId;
    this.session.properties.userId = userId;
  }

  public setProperty(key: string, value: any): void {
    this.session.properties[key] = value;
  }

  public setProperties(properties: Record<string, any>): void {
    Object.assign(this.session.properties, properties);
  }

  public getSession(): AnalyticsSession {
    return { ...this.session };
  }

  public getEventQueue(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  public flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return Promise.resolve();
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    return this.sendEvents(events);
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      const payload = {
        session: this.session,
        events,
        timestamp: new Date().toISOString()
      };

      if (this.config.debug) {
        console.log('Sending analytics events:', payload);
      }

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      if (this.config.debug) {
        console.log('Analytics events sent successfully');
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);

      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flush();
    this.isInitialized = false;
  }
}

// ==================== SINGLETON INSTANCE ====================

let analyticsInstance: AnalyticsTracker | null = null;

export const initializeAnalytics = (config: Partial<AnalyticsConfig> = {}): AnalyticsTracker => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsTracker(config);
  }
  return analyticsInstance;
};

export const getAnalytics = (): AnalyticsTracker | null => {
  return analyticsInstance;
};

export const trackEvent = (
  name: string,
  category: string,
  properties: Record<string, any> = {}
): void => {
  analyticsInstance?.trackEvent(name, category, properties);
};

export const trackCustomEvent = (
  name: string,
  properties: Record<string, any> = {}
): void => {
  analyticsInstance?.trackCustomEvent(name, properties);
};

export const trackError = (
  error: Error,
  context: Record<string, any> = {}
): void => {
  analyticsInstance?.trackError(error, context);
};

export const trackPerformance = (
  metric: string,
  value: number,
  properties: Record<string, any> = {}
): void => {
  analyticsInstance?.trackPerformance(metric, value, properties);
};

export const trackApiCall = (
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  properties: Record<string, any> = {}
): void => {
  analyticsInstance?.trackApiCall(endpoint, method, statusCode, duration, properties);
};

export const setUserId = (userId: string): void => {
  analyticsInstance?.setUserId(userId);
};

export const setProperty = (key: string, value: any): void => {
  analyticsInstance?.setProperty(key, value);
};

export const setProperties = (properties: Record<string, any>): void => {
  analyticsInstance?.setProperties(properties);
};

export const flushAnalytics = (): Promise<void> => {
  return analyticsInstance?.flush() || Promise.resolve();
};

export const destroyAnalytics = (): void => {
  analyticsInstance?.destroy();
  analyticsInstance = null;
};
