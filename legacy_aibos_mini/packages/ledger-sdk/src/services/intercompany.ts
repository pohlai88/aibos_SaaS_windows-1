// Shared types/interfaces for Intercompany & Treasury module (Enterprise Grade)

export interface IntercompanyTransfer {
  id: string;
  fromEntity: string;
  toEntity: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  meta?: any;
}

export interface IntercompanyBalance {
  fromEntity: string;
  toEntity: string;
  balance: number;
  currency: string;
}

export interface AuditLogEntry {
  event: string;
  details: any;
  timestamp: string;
  userId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
