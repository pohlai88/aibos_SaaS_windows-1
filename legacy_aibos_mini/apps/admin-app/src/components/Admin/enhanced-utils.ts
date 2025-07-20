// Enhanced AdminConfig Utilities
// Comprehensive utility functions for admin operations

import { cacheService } from './services/CacheService';
import { adminSDK } from './admin-sdk';
import type { AdminUser, SystemModule, SecurityPolicy, Notification, AuditLog } from './types';

// Date and Time Utilities
export class DateUtils {
  static formatDate(date: Date | string, format: 'short' | 'long' | 'relative' | 'iso' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString();
      case 'long':
        return d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'relative':
        return this.getRelativeTime(d);
      case 'iso':
        return d.toISOString();
      default:
        return d.toLocaleDateString();
    }
  }

  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  static getDaysBetween(date1: Date, date2: Date): number {
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  static isThisWeek(date: Date): boolean {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return date >= weekStart && date <= weekEnd;
  }

  static isThisMonth(date: Date): boolean {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character');
    
    return { valid: errors.length === 0, errors };
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidIpAddress(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  }

  static validateObject(obj: any, schema: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${key} must be of type ${rules.type}`);
        }
        
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters long`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${key} must be no more than ${rules.maxLength} characters long`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} format is invalid`);
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}

// Formatting Utilities
export class FormatUtils {
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatNumber(num: number, options: {
    decimals?: number;
    currency?: string;
    locale?: string;
  } = {}): string {
    const { decimals = 2, currency, locale = 'en-US' } = options;
    
    if (currency) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    }
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  static formatPercentage(value: number, total: number, decimals: number = 1): string {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return `${percentage.toFixed(decimals)}%`;
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  static formatFileSize(bytes: number): string {
    return this.formatBytes(bytes);
  }

  static truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Export Utilities
export class ExportUtils {
  static async exportToCSV<T>(data: T[], filename: string): Promise<void> {
    try {
      if (data.length === 0) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(data[0] as object);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = (row as any)[header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      throw error;
    }
  }

  static async exportToJSON<T>(data: T[], filename: string): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      throw error;
    }
  }

  static async exportToPDF(content: string, filename: string): Promise<void> {
    try {
      // This would require a PDF library like jsPDF
      // For now, we'll create a simple HTML export
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  static generateReport(data: any[], type: 'summary' | 'detailed' | 'analytics'): string {
    try {
      switch (type) {
        case 'summary':
          return this.generateSummaryReport(data);
        case 'detailed':
          return this.generateDetailedReport(data);
        case 'analytics':
          return this.generateAnalyticsReport(data);
        default:
          throw new Error(`Unknown report type: ${type}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private static generateSummaryReport(data: any[]): string {
    const total = data.length;
    const summary = {
      total,
      categories: {} as Record<string, number>,
      dateRange: {
        start: null as Date | null,
        end: null as Date | null,
      },
    };

    data.forEach(item => {
      // Count by category if available
      if (item.category) {
        summary.categories[item.category] = (summary.categories[item.category] || 0) + 1;
      }

      // Track date range if available
      if (item.created_at) {
        const date = new Date(item.created_at);
        if (!summary.dateRange.start || date < summary.dateRange.start) {
          summary.dateRange.start = date;
        }
        if (!summary.dateRange.end || date > summary.dateRange.end) {
          summary.dateRange.end = date;
        }
      }
    });

    return `
      <h2>Summary Report</h2>
      <p><strong>Total Items:</strong> ${summary.total}</p>
      <p><strong>Date Range:</strong> ${summary.dateRange.start ? DateUtils.formatDate(summary.dateRange.start) : 'N/A'} - ${summary.dateRange.end ? DateUtils.formatDate(summary.dateRange.end) : 'N/A'}</p>
      ${Object.keys(summary.categories).length > 0 ? `
        <h3>Categories:</h3>
        <ul>
          ${Object.entries(summary.categories).map(([category, count]) => 
            `<li>${category}: ${count} (${FormatUtils.formatPercentage(count, total)}%)</li>`
          ).join('')}
        </ul>
      ` : ''}
    `;
  }

  private static generateDetailedReport(data: any[]): string {
    if (data.length === 0) return '<p>No data available</p>';

    const headers = Object.keys(data[0]);
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        if (value instanceof Date) {
          return DateUtils.formatDate(value);
        }
        return value || 'N/A';
      })
    );

    return `
      <h2>Detailed Report</h2>
      <table>
        <thead>
          <tr>${headers.map(header => `<th>${FormatUtils.toTitleCase(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  private static generateAnalyticsReport(data: any[]): string {
    // This would include charts and analytics
    // For now, return a basic analytics summary
    return `
      <h2>Analytics Report</h2>
      <p>Analytics report generation not yet implemented.</p>
      <p>Total records: ${data.length}</p>
    `;
  }
}

// Notification Utilities
export class NotificationUtils {
  static async sendSystemNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    targetUsers?: string[]
  ): Promise<void> {
    try {
      await adminSDK.sendNotification({
        title,
        message,
        type,
        priority: 'medium',
        target_type: targetUsers ? 'user' : 'global',
        target_ids: targetUsers || [],
      });
    } catch (error) {
      console.error('Error sending system notification:', error);
      throw error;
    }
  }

  static async sendBulkNotification(
    notifications: Array<{
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      targetUsers: string[];
    }>
  ): Promise<void> {
    try {
      const promises = notifications.map(notification =>
        this.sendSystemNotification(
          notification.title,
          notification.message,
          notification.type,
          notification.targetUsers
        )
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  static createNotificationTemplate(
    name: string,
    titleTemplate: string,
    messageTemplate: string,
    variables: string[]
  ): any {
    return {
      name,
      title_template: titleTemplate,
      message_template: messageTemplate,
      type: 'info',
      priority: 'medium',
      target_type: 'global',
      is_active: true,
      variables,
    };
  }
}

// Security Utilities
export class SecurityUtils {
  static generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static hashPassword(password: string): string {
    // This is a simple hash for demonstration
    // In production, use a proper hashing library like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  static validatePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  } {
    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Common patterns check
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeated characters');
    }

    if (/123|abc|qwe/i.test(password)) {
      score -= 1;
      feedback.push('Avoid common patterns');
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    if (score <= 2) {
      strength = 'weak';
      feedback.push('Password is too weak');
    } else if (score <= 4) {
      strength = 'medium';
      feedback.push('Password could be stronger');
    } else if (score <= 6) {
      strength = 'strong';
    } else {
      strength = 'very_strong';
    }

    return { score, feedback, strength };
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  static validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}

// Data Manipulation Utilities
export class DataUtils {
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static filterBy<T>(array: T[], filters: Partial<T>): T[] {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        return item[key as keyof T] === value;
      });
    });
  }

  static paginate<T>(array: T[], page: number, limit: number): {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  } {
    const total = array.length;
    const total_pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = array.slice(start, end);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    };
  }

  static deduplicate<T>(array: T[], key?: keyof T): T[] {
    if (key) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  static flatten<T>(array: T[][]): T[] {
    return array.reduce((flat, item) => flat.concat(item), [] as T[]);
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => this.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  }

  static merge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.merge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }

  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }
}

// Cache Utilities
export class CacheUtils {
  static async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<T> {
    return cacheService.getOrSetAsync(key, fetchFn, options);
  }

  static async invalidateByPattern(pattern: string): Promise<number> {
    return cacheService.deletePattern(pattern);
  }

  static async invalidateByTags(tags: string[]): Promise<number> {
    return cacheService.invalidateByTags(tags);
  }

  static getCacheStatistics() {
    return cacheService.getStatistics();
  }

  static getCacheHealth() {
    return cacheService.getHealth();
  }
}

// Performance Utilities
export class PerformanceUtils {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static measureTime<T>(fn: () => T): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  static async measureTimeAsync<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }
}

// Export all utilities
export const AdminUtils = {
  Date: DateUtils,
  Validation: ValidationUtils,
  Format: FormatUtils,
  Export: ExportUtils,
  Notification: NotificationUtils,
  Security: SecurityUtils,
  Data: DataUtils,
  Cache: CacheUtils,
  Performance: PerformanceUtils,
}; 