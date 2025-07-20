import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { 
  IntercompanyTransaction,
  IntercompanyLine,
  IntercompanyEntity,
  IntercompanyElimination,
  IntercompanyConsolidation,
  IntercompanyStatus,
  IntercompanyType,
  IntercompanyBalance
} from '../../types';

// ============================================================================
// VALIDATION SCHEMAS (Enterprise-Grade)
// ============================================================================

const CurrencySchema = z.string().length(3).regex(/^[A-Z]{3}$/);
const AmountSchema = z.number().min(-999999999999.99).max(999999999999.99).multipleOf(0.01);
const DateSchema = z.string().datetime().or(z.date());
const UUIDSchema = z.string().uuid();

const IntercompanyLineSchema = z.object({
  accountId: UUIDSchema,
  description: z.string().min(1).max(500),
  debitAmount: AmountSchema.default(0),
  creditAmount: AmountSchema.default(0),
  lineNumber: z.number().int().positive(),
  entitySide: z.enum(['from', 'to']),
  eliminationAccount: UUIDSchema.optional()
}).refine(
  (data) => (data.debitAmount === 0) !== (data.creditAmount === 0),
  { message: 'Each line must have either debit or credit amount, not both' }
);

const IntercompanyTransactionSchema = z.object({
  transactionNumber: z.string().min(1).max(50).regex(/^[A-Z0-9\-_]+$/),
  transactionDate: DateSchema,
  description: z.string().min(1).max(1000),
  transactionType: z.enum(['sale', 'purchase', 'loan', 'investment', 'expense_allocation']),
  fromEntityId: UUIDSchema,
  toEntityId: UUIDSchema,
  totalAmount: AmountSchema.positive(),
  currency: CurrencySchema,
  status: z.enum(['draft', 'pending', 'approved', 'posted', 'cancelled']),
  eliminationStatus: z.enum(['pending', 'eliminated', 'reversed']).default('pending'),
  consolidationStatus: z.enum(['pending', 'consolidated', 'excluded']).default('pending'),
  reference: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  lines: z.array(IntercompanyLineSchema).min(2)
}).refine(
  (data) => data.fromEntityId !== data.toEntityId,
  { message: 'From and to entities must be different' }
).refine(
  (data) => {
    const totalDebits = data.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredits = data.lines.reduce((sum, line) => sum + line.creditAmount, 0);
    return Math.abs(totalDebits - totalCredits) < 0.01;
  },
  { message: 'Transaction must be balanced (total debits = total credits)' }
).refine(
  (data) => {
    const lineTotal = data.lines.reduce((sum, line) => sum + line.debitAmount + line.creditAmount, 0);
    return Math.abs(lineTotal - data.totalAmount) < 0.01;
  },
  { message: 'Total amount must equal sum of line amounts' }
);

const IntercompanyEntitySchema = z.object({
  entityName: z.string().min(1).max(255),
  entityCode: z.string().min(1).max(20).regex(/^[A-Z0-9\-_]+$/),
  entityType: z.enum(['subsidiary', 'branch', 'division', 'joint_venture']),
  country: z.string().length(2).regex(/^[A-Z]{2}$/),
  currency: CurrencySchema,
  taxId: z.string().max(50).optional(),
  eliminationAccount: UUIDSchema.optional(),
  consolidationPercentage: z.number().min(0).max(100).default(100),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().max(2000).optional()
});

// ============================================================================
// ERROR HANDLING (Enterprise-Grade)
// ============================================================================

export class IntercompanyError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public httpStatus: number = 400
  ) {
    super(message);
    this.name = 'IntercompanyError';
  }

  static duplicateTransaction(transactionNumber: string): IntercompanyError {
    return new IntercompanyError(
      'DUPLICATE_TRANSACTION',
      `Transaction number ${transactionNumber} already exists`,
      { transactionNumber },
      409
    );
  }

  static invalidBalance(actual: number, expected: number): IntercompanyError {
    return new IntercompanyError(
      'INVALID_BALANCE',
      'Transaction is not balanced',
      { actual, expected, difference: Math.abs(actual - expected) },
      400
    );
  }

  static entityNotFound(entityId: string): IntercompanyError {
    return new IntercompanyError(
      'ENTITY_NOT_FOUND',
      `Entity with ID ${entityId} not found`,
      { entityId },
      404
    );
  }

  static insufficientPermissions(operation: string): IntercompanyError {
    return new IntercompanyError(
      'INSUFFICIENT_PERMISSIONS',
      `Insufficient permissions for operation: ${operation}`,
      { operation },
      403
    );
  }

  static validationError(errors: z.ZodError): IntercompanyError {
    return new IntercompanyError(
      'VALIDATION_ERROR',
      'Input validation failed',
      { errors: errors.errors },
      400
    );
  }

  static internalError(originalError?: any): IntercompanyError {
    return new IntercompanyError(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      { originalError: originalError?.message },
      500
    );
  }
}

// ============================================================================
// CACHE MANAGEMENT (Performance Optimization)
// ============================================================================

class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// AUDIT LOGGING (Compliance & Security)
// ============================================================================

interface AuditLogEntry {
  action: string;
  tableName: string;
  recordId: string;
  userId: string;
  organizationId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

class AuditLogger {
  constructor(private supabase: SupabaseClient) {}

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          ...entry,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging failure shouldn't break main operations
    }
  }
}

// ============================================================================
// SECURITY & ACCESS CONTROL
// ============================================================================

interface UserPermissions {
  canViewIntercompany: boolean;
  canCreateIntercompany: boolean;
  canEditIntercompany: boolean;
  canDeleteIntercompany: boolean;
  canApproveIntercompany: boolean;
  canEliminateIntercompany: boolean;
  canConsolidateIntercompany: boolean;
}

class SecurityManager {
  constructor(private supabase: SupabaseClient) {}

  async validateAccess(
    userId: string,
    organizationId: string,
    requiredPermissions: (keyof UserPermissions)[]
  ): Promise<UserPermissions> {
    const { data: permissions, error } = await this.supabase
      .from('user_permissions')
      .select('*')
      .eq('userId', userId)
      .eq('organizationId', organizationId)
      .single();

    if (error || !permissions) {
      throw IntercompanyError.insufficientPermissions('access validation');
    }

    const userPermissions: UserPermissions = {
      canViewIntercompany: permissions.can_view_intercompany || false,
      canCreateIntercompany: permissions.can_create_intercompany || false,
      canEditIntercompany: permissions.can_edit_intercompany || false,
      canDeleteIntercompany: permissions.can_delete_intercompany || false,
      canApproveIntercompany: permissions.can_approve_intercompany || false,
      canEliminateIntercompany: permissions.can_eliminate_intercompany || false,
      canConsolidateIntercompany: permissions.can_consolidate_intercompany || false
    };

    for (const permission of requiredPermissions) {
      if (!userPermissions[permission]) {
        throw IntercompanyError.insufficientPermissions(permission);
      }
    }

    return userPermissions;
  }

  async validateEntityAccess(
    userId: string,
    organizationId: string,
    entityId: string
  ): Promise<boolean> {
    const { data: access, error } = await this.supabase
      .from('entity_access')
      .select('can_access')
      .eq('userId', userId)
      .eq('organizationId', organizationId)
      .eq('entity_id', entityId)
      .single();

    return !error && access?.can_access === true;
  }
}

// ============================================================================
// MAIN INTERCOMPANY SERVICE (Enterprise-Grade)
// ============================================================================

export class IntercompanyService {
  private supabase: SupabaseClient;
  private cache: CacheManager;
  private auditLogger: AuditLogger;
  private securityManager: SecurityManager;
  private currentUserId: string;
  private currentOrganizationId: string;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    currentUserId: string,
    currentOrganizationId: string
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.cache = new CacheManager();
    this.auditLogger = new AuditLogger(this.supabase);
    this.securityManager = new SecurityManager(this.supabase);
    this.currentUserId = currentUserId;
    this.currentOrganizationId = currentOrganizationId;
  }

  // ============================================================================
  // TRANSACTION MANAGEMENT (CRUD Operations)
  // ============================================================================

  /**
   * Create intercompany transaction with comprehensive validation
   */
  async createIntercompanyTransaction(
    transactionData: Omit<IntercompanyTransaction, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>
  ): Promise<{ transaction: IntercompanyTransaction; error: null } | { transaction: null; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canCreateIntercompany']
      );

      // 2. Validate input data
      const validation = IntercompanyTransactionSchema.safeParse(transactionData);
      if (!validation.success) {
        throw IntercompanyError.validationError(validation.error);
      }

      const validatedData = validation.data;

      // 3. Validate entity access
      const fromEntityAccess = await this.securityManager.validateEntityAccess(
        this.currentUserId,
        this.currentOrganizationId,
        validatedData.fromEntityId
      );
      const toEntityAccess = await this.securityManager.validateEntityAccess(
        this.currentUserId,
        this.currentOrganizationId,
        validatedData.toEntityId
      );

      if (!fromEntityAccess || !toEntityAccess) {
        throw IntercompanyError.insufficientPermissions('entity access');
      }

      // 4. Check for duplicate transaction number
      const { data: existing } = await this.supabase
        .from('intercompany_transactions')
        .select('id')
        .eq('organizationId', this.currentOrganizationId)
        .eq('transaction_number', validatedData.transactionNumber)
        .single();

      if (existing) {
        throw IntercompanyError.duplicateTransaction(validatedData.transactionNumber);
      }

      // 5. Validate entities exist and are active
      const { data: entities, error: entityError } = await this.supabase
        .from('intercompany_entities')
        .select('id, status')
        .in('id', [validatedData.fromEntityId, validatedData.toEntityId])
        .eq('organizationId', this.currentOrganizationId);

      if (entityError || entities.length !== 2) {
        throw IntercompanyError.entityNotFound('one or more entities');
      }

      if (entities.some(e => e.status !== 'active')) {
        throw new IntercompanyError('INACTIVE_ENTITY', 'All entities must be active');
      }

      // 6. Create transaction with database transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .rpc('create_intercompany_transaction', {
          p_organizationId: this.currentOrganizationId,
          p_transaction_data: validatedData
        });

      if (transactionError) throw transactionError;

      // 7. Log audit trail
      await this.auditLogger.log({
        action: 'CREATE',
        tableName: 'intercompany_transactions',
        recordId: transaction.id,
        userId: this.currentUserId,
        organizationId: this.currentOrganizationId,
        newValues: validatedData
      });

      // 8. Invalidate cache
      this.cache.invalidate(`transactions_${this.currentOrganizationId}`);

      // 9. Return formatted result
      const formattedTransaction = this.formatIntercompanyTransaction(transaction);
      return { transaction: formattedTransaction, error: null };

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { transaction: null, error };
      }
      return { transaction: null, error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Get intercompany transaction by ID with caching
   */
  async getIntercompanyTransactionById(
    transactionId: string
  ): Promise<{ transaction: IntercompanyTransaction; error: null } | { transaction: null; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canViewIntercompany']
      );

      // 2. Check cache first
      const cacheKey = `transaction_${transactionId}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return { transaction: cached, error: null };
      }

      // 3. Fetch from database
      const { data: transaction, error } = await this.supabase
        .from('intercompany_transactions')
        .select(`
          *,
          lines:intercompany_lines(*),
          from_entity:intercompany_entities!from_entity_id(*),
          to_entity:intercompany_entities!to_entity_id(*)
        `)
        .eq('id', transactionId)
        .eq('organizationId', this.currentOrganizationId)
        .single();

      if (error || !transaction) {
        throw new IntercompanyError('TRANSACTION_NOT_FOUND', 'Transaction not found', { transactionId }, 404);
      }

      // 4. Cache result
      const formattedTransaction = this.formatIntercompanyTransaction(transaction);
      this.cache.set(cacheKey, formattedTransaction, 10 * 60 * 1000); // 10 minutes

      return { transaction: formattedTransaction, error: null };

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { transaction: null, error };
      }
      return { transaction: null, error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Get intercompany transactions with advanced filtering and pagination
   */
  async getIntercompanyTransactions(
    filters: {
      status?: IntercompanyStatus;
      entityId?: string;
      dateFrom?: string;
      dateTo?: string;
      transactionType?: IntercompanyType;
      currency?: string;
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<{ transactions: IntercompanyTransaction[]; total: number; error: null } | { transactions: []; total: 0; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canViewIntercompany']
      );

      // 2. Build cache key
      const cacheKey = `transactions_${this.currentOrganizationId}_${JSON.stringify(filters)}_${pagination.page}_${pagination.limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // 3. Build query
      let query = this.supabase
        .from('intercompany_transactions')
        .select(`
          *,
          lines:intercompany_lines(*),
          from_entity:intercompany_entities!from_entity_id(*),
          to_entity:intercompany_entities!to_entity_id(*)
        `, { count: 'exact' })
        .eq('organizationId', this.currentOrganizationId);

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.entityId) query = query.or(`from_entity_id.eq.${filters.entityId},to_entity_id.eq.${filters.entityId}`);
      if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
      if (filters.dateTo) query = query.lte('date', filters.dateTo);
      if (filters.transactionType) query = query.eq('transaction_type', filters.transactionType);
      if (filters.currency) query = query.eq('currency', filters.currency);

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.range(offset, offset + pagination.limit - 1);

      // Order by transaction date
      query = query.order('date', { ascending: false });

      const { data: transactions, error, count } = await query;

      if (error) throw error;

      // 4. Format and cache results
      const formattedTransactions = transactions?.map(transaction => this.formatIntercompanyTransaction(transaction)) || [];
      const result = { transactions: formattedTransactions, total: count || 0, error: null };
      
      this.cache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes

      return result;

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { transactions: [], total: 0, error };
      }
      return { transactions: [], total: 0, error: IntercompanyError.internalError(error) };
    }
  }

  // ============================================================================
  // ENTITY MANAGEMENT
  // ============================================================================

  /**
   * Create intercompany entity with validation
   */
  async createIntercompanyEntity(
    entityData: Omit<IntercompanyEntity, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>
  ): Promise<{ entity: IntercompanyEntity; error: null } | { entity: null; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canCreateIntercompany']
      );

      // 2. Validate input data
      const validation = IntercompanyEntitySchema.safeParse(entityData);
      if (!validation.success) {
        throw IntercompanyError.validationError(validation.error);
      }

      const validatedData = validation.data;

      // 3. Check for duplicate entity code
      const { data: existing } = await this.supabase
        .from('intercompany_entities')
        .select('id')
        .eq('organizationId', this.currentOrganizationId)
        .eq('entity_code', validatedData.entityCode)
        .single();

      if (existing) {
        throw new IntercompanyError('DUPLICATE_ENTITY_CODE', `Entity code ${validatedData.entityCode} already exists`);
      }

      // 4. Create entity
      const { data: entity, error } = await this.supabase
        .from('intercompany_entities')
        .insert({
          organizationId: this.currentOrganizationId,
          entity_name: validatedData.entityName,
          entity_code: validatedData.entityCode,
          entity_type: validatedData.entityType,
          country: validatedData.country,
          currency: validatedData.currency,
          tax_id: validatedData.taxId,
          elimination_account: validatedData.eliminationAccount,
          consolidation_percentage: validatedData.consolidationPercentage,
          status: validatedData.status,
          notes: validatedData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // 5. Log audit trail
      await this.auditLogger.log({
        action: 'CREATE',
        tableName: 'intercompany_entities',
        recordId: entity.id,
        userId: this.currentUserId,
        organizationId: this.currentOrganizationId,
        newValues: validatedData
      });

      // 6. Invalidate cache
      this.cache.invalidate(`entities_${this.currentOrganizationId}`);

      return { entity: this.formatIntercompanyEntity(entity), error: null };

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { entity: null, error };
      }
      return { entity: null, error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Get intercompany entities with caching
   */
  async getIntercompanyEntities(
    status?: string
  ): Promise<{ entities: IntercompanyEntity[]; error: null } | { entities: []; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canViewIntercompany']
      );

      // 2. Check cache
      const cacheKey = `entities_${this.currentOrganizationId}_${status || 'all'}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // 3. Build query
      let query = this.supabase
        .from('intercompany_entities')
        .select('*')
        .eq('organizationId', this.currentOrganizationId);

      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('entity_name', { ascending: true });

      const { data: entities, error } = await query;

      if (error) throw error;

      // 4. Format and cache results
      const formattedEntities = entities?.map(entity => this.formatIntercompanyEntity(entity)) || [];
      const result = { entities: formattedEntities, error: null };
      
      this.cache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes

      return result;

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { entities: [], error };
      }
      return { entities: [], error: IntercompanyError.internalError(error) };
    }
  }

  // ============================================================================
  // ELIMINATION & CONSOLIDATION (Advanced Features)
  // ============================================================================

  /**
   * Generate elimination entries with comprehensive validation
   */
  async generateEliminationEntries(
    periodStart: string,
    periodEnd: string
  ): Promise<{ eliminations: IntercompanyElimination[]; error: null } | { eliminations: []; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canEliminateIntercompany']
      );

      // 2. Validate date range
      if (new Date(periodStart) >= new Date(periodEnd)) {
        throw new IntercompanyError('INVALID_DATE_RANGE', 'Start date must be before end date');
      }

      // 3. Get pending transactions for the period
      const { data: transactions, error: fetchError } = await this.supabase
        .from('intercompany_transactions')
        .select(`
          *,
          lines:intercompany_lines(*)
        `)
        .eq('organizationId', this.currentOrganizationId)
        .gte('date', periodStart)
        .lte('date', periodEnd)
        .eq('elimination_status', 'pending')
        .eq('status', 'posted');

      if (fetchError) throw fetchError;

      if (!transactions || transactions.length === 0) {
        return { eliminations: [], error: null };
      }

      // 4. Generate eliminations in batch
      const eliminations: IntercompanyElimination[] = [];
      const batchSize = 50;
      
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        
        const batchEliminations = await Promise.all(
          batch.map(transaction => this.createEliminationEntry(transaction, periodEnd))
        );
        
        eliminations.push(...batchEliminations.filter(e => e !== null));
      }

      // 5. Update transaction statuses in batch
      const transactionIds = transactions.map(t => t.id);
      await this.supabase
        .from('intercompany_transactions')
        .update({ 
          elimination_status: 'eliminated',
          updatedAt: new Date().toISOString()
        })
        .in('id', transactionIds);

      // 6. Log audit trail
      await this.auditLogger.log({
        action: 'ELIMINATE_BATCH',
        tableName: 'intercompany_transactions',
        recordId: 'batch',
        userId: this.currentUserId,
        organizationId: this.currentOrganizationId,
        newValues: { 
          periodStart, 
          periodEnd, 
          eliminatedCount: eliminations.length 
        }
      });

      // 7. Invalidate cache
      this.cache.invalidate(`transactions_${this.currentOrganizationId}`);
      this.cache.invalidate(`eliminations_${this.currentOrganizationId}`);

      return { eliminations, error: null };

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { eliminations: [], error };
      }
      return { eliminations: [], error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Generate consolidation report with advanced calculations
   */
  async generateConsolidationReport(
    periodStart: string,
    periodEnd: string
  ): Promise<{ consolidation: IntercompanyConsolidation; error: null } | { consolidation: null; error: IntercompanyError }> {
    try {
      // 1. Validate access permissions
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canConsolidateIntercompany']
      );

      // 2. Validate date range
      if (new Date(periodStart) >= new Date(periodEnd)) {
        throw new IntercompanyError('INVALID_DATE_RANGE', 'Start date must be before end date');
      }

      // 3. Get all active entities
      const { entities } = await this.getIntercompanyEntities('active');
      if (entities.length === 0) {
        throw new IntercompanyError('NO_ACTIVE_ENTITIES', 'No active entities found for consolidation');
      }

      // 4. Get intercompany balances
      const { balances } = await this.getIntercompanyBalances(periodEnd);

      // 5. Calculate consolidation metrics
      const totalIntercompanyAmount = balances.reduce((sum, balance) => sum + Math.abs(balance.balance), 0);
      const eliminationAmount = totalIntercompanyAmount / 2; // Each transaction affects two entities
      const consolidationPercentage = entities.reduce((sum, entity) => sum + (entity.consolidationPercentage || 0), 0) / entities.length;

      // 6. Create consolidation record
      const consolidation = {
        id: `CONS-${periodEnd}`,
        organizationId: this.currentOrganizationId,
        periodStart,
        periodEnd,
        consolidationDate: new Date().toISOString().split('T')[0],
        entities: entities.length,
        totalIntercompanyAmount,
        eliminationAmount,
        consolidationPercentage,
        status: 'completed' as const,
        createdAt: new Date().toISOString()
      };

      // 7. Save to database
      const { error } = await this.supabase
        .from('intercompany_consolidations')
        .insert({
          organizationId: this.currentOrganizationId,
          period_start: periodStart,
          period_end: periodEnd,
          consolidation_date: consolidation.consolidationDate,
          entities_count: consolidation.entities,
          total_intercompany_amount: consolidation.totalIntercompanyAmount,
          elimination_amount: consolidation.eliminationAmount,
          consolidation_percentage: consolidation.consolidationPercentage,
          status: consolidation.status,
          createdAt: consolidation.createdAt
        });

      if (error) throw error;

      // 8. Log audit trail
      await this.auditLogger.log({
        action: 'CONSOLIDATE',
        tableName: 'intercompany_consolidations',
        recordId: consolidation.id,
        userId: this.currentUserId,
        organizationId: this.currentOrganizationId,
        newValues: consolidation
      });

      return { consolidation, error: null };

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { consolidation: null, error };
      }
      return { consolidation: null, error: IntercompanyError.internalError(error) };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async createEliminationEntry(
    transaction: any,
    eliminationDate: string
  ): Promise<IntercompanyElimination | null> {
    try {
      // Create elimination record
      const { data: elimination, error } = await this.supabase
        .from('intercompany_eliminations')
        .insert({
          intercompany_transaction_id: transaction.id,
          elimination_date: eliminationDate,
          elimination_type: 'intercompany',
          description: `Elimination for ${transaction.transaction_number}`,
          totalAmount: transaction.totalAmount,
          status: 'posted',
          createdAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create elimination journal entry
      const journalEntry = await this.createEliminationJournalEntry(transaction, elimination.id);
      if (!journalEntry) return null;

      return {
        id: elimination.id,
        intercompanyTransactionId: elimination.intercompany_transaction_id,
        eliminationDate: elimination.elimination_date,
        eliminationType: elimination.elimination_type,
        description: elimination.description,
        totalAmount: elimination.totalAmount,
        status: elimination.status,
        journalEntryId: journalEntry.id,
        createdAt: elimination.createdAt
      };

    } catch (error) {
      console.error('Error creating elimination entry:', error);
      return null;
    }
  }

  private async createEliminationJournalEntry(
    transaction: any,
    eliminationId: string
  ): Promise<any> {
    try {
      // Create journal entry for elimination
      const { data: journalEntry, error } = await this.supabase
        .from('journal_entries')
        .insert({
          organizationId: this.currentOrganizationId,
          entry_number: await this.generateEliminationEntryNumber(),
          entry_date: new Date().toISOString().split('T')[0],
          description: `Elimination Entry - ${transaction.transaction_number}`,
          entry_type: 'elimination',
          reference: `ELIM-${eliminationId}`,
          total: transaction.totalAmount,
          currency: transaction.currency,
          status: 'approved',
          createdAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create elimination lines
      const eliminationLines = transaction.lines.map((line: any) => ({
        journal_entry_id: journalEntry.id,
        account_id: line.elimination_account || line.account_id,
        description: `Elimination - ${line.description}`,
        debit_amount: line.credit_amount, // Reverse the amounts
        credit_amount: line.debit_amount,
        line_number: line.line_number,
        elimination_reference: eliminationId
      }));

      const { error: linesError } = await this.supabase
        .from('journal_entry_lines')
        .insert(eliminationLines);

      if (linesError) throw linesError;

      return journalEntry;

    } catch (error) {
      console.error('Error creating elimination journal entry:', error);
      return null;
    }
  }

  private async generateEliminationEntryNumber(): Promise<string> {
    const { data: lastEntry, error } = await this.supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('organizationId', this.currentOrganizationId)
      .like('entry_number', 'ELIM-%')
      .order('entry_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const currentYear = new Date().getFullYear();
    const prefix = `ELIM-${currentYear}-`;

    if (!lastEntry) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastEntry.entry_number.replace(prefix, ''));
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  private formatIntercompanyTransaction(transactionData: any): IntercompanyTransaction {
    return {
      id: transactionData.id,
      organizationId: transactionData.organizationId,
      transactionNumber: transactionData.transaction_number,
      transactionDate: transactionData.date,
      description: transactionData.description,
      transactionType: transactionData.transaction_type,
      fromEntityId: transactionData.from_entity_id,
      toEntityId: transactionData.to_entity_id,
      totalAmount: transactionData.totalAmount,
      currency: transactionData.currency,
      status: transactionData.status,
      eliminationStatus: transactionData.elimination_status,
      consolidationStatus: transactionData.consolidation_status,
      reference: transactionData.reference,
      notes: transactionData.notes,
      lines: transactionData.lines?.map((line: any) => ({
        id: line.id,
        intercompanyTransactionId: line.intercompany_transaction_id,
        accountId: line.account_id,
        description: line.description,
        debitAmount: line.debit_amount,
        creditAmount: line.credit_amount,
        lineNumber: line.line_number,
        entitySide: line.entity_side,
        eliminationAccount: line.elimination_account
      })) || [],
      fromEntity: transactionData.from_entity ? this.formatIntercompanyEntity(transactionData.from_entity) : null,
      toEntity: transactionData.to_entity ? this.formatIntercompanyEntity(transactionData.to_entity) : null,
      createdAt: transactionData.createdAt,
      updatedAt: transactionData.updatedAt
    };
  }

  private formatIntercompanyEntity(entityData: any): IntercompanyEntity {
    return {
      id: entityData.id,
      organizationId: entityData.organizationId,
      entityName: entityData.entity_name,
      entityCode: entityData.entity_code,
      entityType: entityData.entity_type,
      country: entityData.country,
      currency: entityData.currency,
      taxId: entityData.tax_id,
      eliminationAccount: entityData.elimination_account,
      consolidationPercentage: entityData.consolidation_percentage,
      status: entityData.status,
      notes: entityData.notes,
      createdAt: entityData.createdAt,
      updatedAt: entityData.updatedAt
    };
  }

  // ============================================================================
  // ADDITIONAL ENTERPRISE FEATURES
  // ============================================================================

  /**
   * Get intercompany balances with advanced filtering
   */
  async getIntercompanyBalances(
    asOfDate: string
  ): Promise<{ balances: IntercompanyBalance[]; error: null } | { balances: []; error: IntercompanyError }> {
    try {
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canViewIntercompany']
      );

      const cacheKey = `balances_${this.currentOrganizationId}_${asOfDate}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: balances, error } = await this.supabase
        .from('intercompany_balances')
        .select(`
          *,
          from_entity:intercompany_entities!from_entity_id(*),
          to_entity:intercompany_entities!to_entity_id(*)
        `)
        .eq('organizationId', this.currentOrganizationId)
        .lte('as_of_date', asOfDate)
        .order('as_of_date', { ascending: false });

      if (error) throw error;

      const formattedBalances = balances?.map(balance => ({
        id: balance.id,
        organizationId: balance.organizationId,
        fromEntityId: balance.from_entity_id,
        toEntityId: balance.to_entity_id,
        asOfDate: balance.as_of_date,
        balance: balance.balance,
        currency: balance.currency,
        fromEntity: balance.from_entity ? this.formatIntercompanyEntity(balance.from_entity) : null,
        toEntity: balance.to_entity ? this.formatIntercompanyEntity(balance.to_entity) : null
      })) || [];

      const result = { balances: formattedBalances, error: null };
      this.cache.set(cacheKey, result, 15 * 60 * 1000); // 15 minutes

      return result;

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { balances: [], error };
      }
      return { balances: [], error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Update intercompany transaction status with validation
   */
  async updateIntercompanyTransactionStatus(
    transactionId: string,
    status: IntercompanyStatus
  ): Promise<{ success: boolean; error: null } | { success: false; error: IntercompanyError }> {
    try {
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canEditIntercompany']
      );

      // Get current transaction
      const { transaction } = await this.getIntercompanyTransactionById(transactionId);
      if (!transaction) {
        throw new IntercompanyError('TRANSACTION_NOT_FOUND', 'Transaction not found', { transactionId }, 404);
      }

      // Validate status transition
      const validTransitions: Record<IntercompanyStatus, IntercompanyStatus[]> = {
        draft: ['pending', 'cancelled'],
        pending: ['approved', 'cancelled'],
        approved: ['posted', 'cancelled'],
        posted: ['cancelled'],
        cancelled: []
      };

      if (!validTransitions[transaction.status].includes(status)) {
        throw new IntercompanyError(
          'INVALID_STATUS_TRANSITION',
          `Cannot transition from ${transaction.status} to ${status}`,
          { currentStatus: transaction.status, newStatus: status }
        );
      }

      const { error } = await this.supabase
        .from('intercompany_transactions')
        .update({ 
          status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('organizationId', this.currentOrganizationId);

      if (error) throw error;

      // Log audit trail
      await this.auditLogger.log({
        action: 'UPDATE_STATUS',
        tableName: 'intercompany_transactions',
        recordId: transactionId,
        userId: this.currentUserId,
        organizationId: this.currentOrganizationId,
        oldValues: { status: transaction.status },
        newValues: { status }
      });

      // Invalidate cache
      this.cache.invalidate(`transaction_${transactionId}`);
      this.cache.invalidate(`transactions_${this.currentOrganizationId}`);

      return { success: true, error: null };

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { success: false, error };
      }
      return { success: false, error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Get comprehensive transaction summary with analytics
   */
  async getIntercompanyTransactionSummary(): Promise<{ summary: any; error: null } | { summary: null; error: IntercompanyError }> {
    try {
      await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canViewIntercompany']
      );

      const cacheKey = `summary_${this.currentOrganizationId}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: transactions, error } = await this.supabase
        .from('intercompany_transactions')
        .select('status, totalAmount, elimination_status, consolidation_status, currency, transaction_type')
        .eq('organizationId', this.currentOrganizationId);

      if (error) throw error;

      const summary = {
        totalTransactions: transactions?.length || 0,
        totalAmount: transactions?.reduce((sum, t) => sum + (t.totalAmount || 0), 0) || 0,
        pendingEliminations: transactions?.filter(t => t.elimination_status === 'pending').length || 0,
        pendingConsolidation: transactions?.filter(t => t.consolidation_status === 'pending').length || 0,
        byStatus: transactions?.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        byCurrency: transactions?.reduce((acc, t) => {
          acc[t.currency] = (acc[t.currency] || 0) + (t.totalAmount || 0);
          return acc;
        }, {} as Record<string, number>) || {},
        byType: transactions?.reduce((acc, t) => {
          acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        generatedAt: new Date().toISOString()
      };

      const result = { summary, error: null };
      this.cache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes

      return result;

    } catch (error) {
      if (error instanceof IntercompanyError) {
        return { summary: null, error };
      }
      return { summary: null, error: IntercompanyError.internalError(error) };
    }
  }

  /**
   * Clear cache for performance management
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{ healthy: boolean; details: any }> {
    try {
      // Test database connection
      const { error: dbError } = await this.supabase
        .from('intercompany_transactions')
        .select('id')
        .limit(1);

      // Test permissions
      const permissions = await this.securityManager.validateAccess(
        this.currentUserId,
        this.currentOrganizationId,
        ['canViewIntercompany']
      );

      return {
        healthy: !dbError && permissions.canViewIntercompany,
        details: {
          database: !dbError ? 'connected' : 'error',
          permissions: permissions.canViewIntercompany ? 'valid' : 'invalid',
          cache: 'operational',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
} 