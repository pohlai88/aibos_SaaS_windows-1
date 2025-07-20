// Treasury Service (Enterprise Grade)
// Manages bank accounts, liquidity, and executes fund transfers. Emits events for all transactions.

import { EventEmitter } from 'events';

export interface TreasuryTransaction {
  id: string;
  fromEntity: string;
  toEntity: string;
  amount: number;
  currency: string;
  date: string;
  type: 'InternalTransfer' | 'IntercompanyTransfer';
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  meta?: any;
}

export class TreasuryService {
  private eventBus: EventEmitter;
  private transactions: TreasuryTransaction[] = [];
  private auditLog: any[] = [];

  constructor(eventBus: EventEmitter) {
    this.eventBus = eventBus;
  }

  // Execute a fund transfer (internal or intercompany)
  async transferFunds(fromEntity: string, toEntity: string, amount: number, currency: string, meta?: any): Promise<TreasuryTransaction> {
    // Validate input
    if (!fromEntity || !toEntity || amount <= 0 || !currency) {
      throw new Error('Invalid transfer parameters');
    }
    // TODO: Check balances, permissions, and compliance
    const type = fromEntity === toEntity ? 'InternalTransfer' : 'IntercompanyTransfer';
    const transaction: TreasuryTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fromEntity,
      toEntity,
      amount,
      currency,
      date: new Date().toISOString(),
      type,
      status: 'completed',
      meta
    };
    this.transactions.push(transaction);
    this.logAudit('transfer_executed', transaction);
    // Emit event for cash flow and intercompany services
    this.eventBus.emit('TreasuryTransaction', {
      type: 'TreasuryTransaction',
      entityId: fromEntity,
      amount: amount,
      currency,
      date: transaction.date,
      direction: 'outflow',
      source: 'treasury',
      referenceId: transaction.id,
      meta
    });
    this.eventBus.emit('TreasuryTransaction', {
      type: 'TreasuryTransaction',
      entityId: toEntity,
      amount: amount,
      currency,
      date: transaction.date,
      direction: 'inflow',
      source: 'treasury',
      referenceId: transaction.id,
      meta
    });
    if (type === 'IntercompanyTransfer') {
      this.eventBus.emit('IntercompanyTransfer', {
        type: 'IntercompanyTransfer',
        entityId: fromEntity,
        amount: amount,
        currency,
        date: transaction.date,
        direction: 'outflow',
        source: 'treasury',
        referenceId: transaction.id,
        meta
      });
      this.eventBus.emit('IntercompanyTransfer', {
        type: 'IntercompanyTransfer',
        entityId: toEntity,
        amount: amount,
        currency,
        date: transaction.date,
        direction: 'inflow',
        source: 'treasury',
        referenceId: transaction.id,
        meta
      });
    }
    return transaction;
  }

  // Get all transactions
  getTransactions(): TreasuryTransaction[] {
    return this.transactions;
  }

  // Audit logging
  private logAudit(event: string, details: any) {
    this.auditLog.push({ event, details, timestamp: new Date().toISOString() });
    // In production, write to persistent audit log
  }

  getAuditLog() {
    return this.auditLog;
  }

  // Authorization stub (to be integrated with auth service)
  private checkPermission(userId: string, action: string, entityId: string): boolean {
    // TODO: Integrate with auth/role service
    return true;
  }
}
