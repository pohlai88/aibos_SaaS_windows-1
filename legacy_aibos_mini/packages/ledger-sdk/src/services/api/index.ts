// Express REST API for Intercompany & Treasury module (Enterprise Grade)
import express from 'express';
import cors from 'cors';
import { IntercompanyTransfer, IntercompanyBalance, AuditLogEntry, ApiResponse } from '../types/intercompany';
import { authenticateJWT, requireRole, apiLimiter, errorHandler } from './middleware';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Example: protect all endpoints with JWT auth (customize as needed)
app.use(authenticateJWT);

// In-memory storage (replace with DB in production)
let transfers: IntercompanyTransfer[] = [];
let auditLog: AuditLogEntry[] = [];

// Helper: log audit
function logAudit(event: string, details: any, userId?: string) {
  auditLog.push({ event, details, timestamp: new Date().toISOString(), userId });
}

// GET /api/transfers
app.get('/api/transfers', (req, res) => {
  res.json({ success: true, data: transfers } as ApiResponse<IntercompanyTransfer[]>);
});

// POST /api/transfers (with validation and RBAC)
const transferSchema = z.object({
  fromEntity: z.string().min(1),
  toEntity: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  reference: z.string().optional(),
  meta: z.any().optional(),
  userId: z.string().optional()
});

app.post('/api/transfers', requireRole('treasury_admin'), (req, res) => {
  const parse = transferSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }
  const { fromEntity, toEntity, amount, currency, reference, meta, userId } = parse.data;
  const transfer: IntercompanyTransfer = {
    id: `ic_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    fromEntity,
    toEntity,
    amount,
    currency,
    date: new Date().toISOString(),
    status: 'completed',
    reference,
    meta
  };
  transfers.push(transfer);
  logAudit('transfer_created', transfer, userId);
  res.json({ success: true, data: transfer } as ApiResponse<IntercompanyTransfer>);
});

// GET /api/balances
app.get('/api/balances', (req, res) => {
  // Calculate balances
  const balances: IntercompanyBalance[] = [];
  const balanceMap: Record<string, IntercompanyBalance> = {};
  for (const t of transfers) {
    const key = `${t.fromEntity}->${t.toEntity}->${t.currency}`;
    if (!balanceMap[key]) {
      balanceMap[key] = { fromEntity: t.fromEntity, toEntity: t.toEntity, balance: 0, currency: t.currency };
    }
    balanceMap[key].balance += t.amount;
  }
  res.json({ success: true, data: Object.values(balanceMap) } as ApiResponse<IntercompanyBalance[]>);
});

// GET /api/audit
app.get('/api/audit', (req, res) => {
  res.json({ success: true, data: auditLog } as ApiResponse<AuditLogEntry[]>);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Centralized error handler (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Intercompany API running on port ${PORT}`);
});
