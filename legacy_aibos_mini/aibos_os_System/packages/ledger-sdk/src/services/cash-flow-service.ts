// Cash Flow Service (Enterprise Grade)
// Handles cash flow forecasting, actuals, and reporting. Integrates with Treasury and Intercompany services.

import { EventEmitter } from 'events';

export interface CashFlowForecast {
  entityId: string;
  period: string;
  forecast: Array<{ date: string; inflow: number; outflow: number; balance: number; note?: string }>;

}

export interface CashFlowActual {
  entityId: string;
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  source: string;
  referenceId?: string;
}

export interface CashFlowEvent {
  type: string;
  entityId: string;
  amount: number;
  currency: string;
  date: string;
  direction: 'inflow' | 'outflow';
  source: string;
  referenceId?: string;
  meta?: any;
}

export class CashFlowService {
  private eventBus: EventEmitter;
  private actuals: CashFlowActual[] = [];
  private forecasts: CashFlowForecast[] = [];
  private auditLog: any[] = [];

  constructor(eventBus: EventEmitter) {
    this.eventBus = eventBus;
    // Listen for treasury/intercompany events
    this.eventBus.on('TreasuryTransaction', this.handleTreasuryTransaction.bind(this));
    this.eventBus.on('IntercompanyTransfer', this.handleIntercompanyTransfer.bind(this));
  }

  // Forecast cash flow for an entity and period
  forecast(entityId: string, period: string): CashFlowForecast {
    // TODO: Implement robust forecast logic using actuals, budgets, and scheduled transactions
    // For now, return a stub
    const forecast: CashFlowForecast = {
      entityId,
      period,
      forecast: []
    };
    this.forecasts.push(forecast);
    this.logAudit('forecast_generated', { entityId, period });
    return forecast;
  }

  // Record an actual cash flow event
  recordActual(actual: CashFlowActual) {
    // Validate input
    if (!actual.entityId || !actual.date || typeof actual.inflow !== 'number' || typeof actual.outflow !== 'number') {
      throw new Error('Invalid actual cash flow data');
    }
    this.actuals.push(actual);
    this.logAudit('actual_recorded', actual);
  }

  // Handle treasury transaction event
  private handleTreasuryTransaction(event: CashFlowEvent) {
    // Update actuals, recalculate forecast
    const actual: CashFlowActual = {
      entityId: event.entityId,
      date: event.date,
      inflow: event.direction === 'inflow' ? event.amount : 0,
      outflow: event.direction === 'outflow' ? event.amount : 0,
      balance: 0, // To be calculated
      source: event.source,
      referenceId: event.referenceId
    };
    this.recordActual(actual);
    // TODO: Recalculate forecast for entity
  }

  // Handle intercompany transfer event
  private handleIntercompanyTransfer(event: CashFlowEvent) {
    // Update actuals, recalculate forecast
    const actual: CashFlowActual = {
      entityId: event.entityId,
      date: event.date,
      inflow: event.direction === 'inflow' ? event.amount : 0,
      outflow: event.direction === 'outflow' ? event.amount : 0,
      balance: 0, // To be calculated
      source: event.source,
      referenceId: event.referenceId
    };
    this.recordActual(actual);
    // TODO: Recalculate forecast for entity
  }

  // Get actuals for an entity
  getActuals(entityId: string): CashFlowActual[] {
    return this.actuals.filter(a => a.entityId === entityId);
  }

  // Get forecast for an entity and period
  getForecast(entityId: string, period: string): CashFlowForecast | undefined {
    return this.forecasts.find(f => f.entityId === entityId && f.period === period);
  }

  // Audit logging
  private logAudit(event: string, details: any) {
    this.auditLog.push({ event, details, timestamp: new Date().toISOString() });
    // In production, write to persistent audit log
  }

  // Get audit log
  getAuditLog() {
    return this.auditLog;
  }

  // Authorization stub (to be integrated with auth service)
  private checkPermission(userId: string, action: string, entityId: string): boolean {
    // TODO: Integrate with auth/role service
    return true;
  }
}
