import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  RecurringTransaction,
  RecurringTransactionLine,
  RecurringSchedule,
  RecurringExecution,
  RecurringTemplate,
  RecurringStatus,
  AmountCalculation,
  ScheduleType
} from '../../types';
import { safeEvaluateFormula } from '../../utils/safeFormula';
import { logAudit } from '../../utils/auditLog';

// Example validation and access control stubs
function validateRecurringTransactionInput(input: any): void {
  // TODO: Replace with zod or custom validation
  if (!input.templateName || typeof input.templateName !== 'string') {
    throw new Error('Invalid templateName');
  }
  // ...add more validation as needed...
}

function checkAccess(userId: string, organizationId: string): void {
  // TODO: Integrate with your auth system
  if (!userId || !organizationId) {
    throw new Error('Access denied');
  }
}

export class RecurringTransactionsService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create recurring transaction template (enterprise-grade)
   */
  async createRecurringTransaction(
    organizationId: string,
    templateData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<{ template: RecurringTransaction | null; error: any }> {
    try {
      checkAccess(userId, organizationId);
      validateRecurringTransactionInput(templateData);

      // Create recurring transaction record
      const { data: template, error } = await this.supabase
        .from('recurring_transactions')
        .insert({
          organizationId: organizationId,
          template_name: templateData.templateName,
          description: templateData.description,
          schedule_type: templateData.schedule.type,
          schedule_config: templateData.schedule.config,
          next_execution_date: templateData.nextExecutionDate,
          last_execution_date: templateData.lastExecutionDate,
          total_executions: templateData.totalExecutions,
          max_executions: templateData.maxExecutions,
          status: templateData.status,
          amount_calculation: templateData.amountCalculation,
          auto_approve: templateData.autoApprove,
          reference_template: templateData.referenceTemplate
        })
        .select()
        .single();

      if (error) throw error;

      // Create recurring transaction lines
      if (templateData.lines && templateData.lines.length > 0) {
        const lines = templateData.lines.map(line => ({
          recurring_transaction_id: template.id,
          account_id: line.accountId,
          description: line.description,
          debit_amount: line.debitAmount,
          credit_amount: line.creditAmount,
          line_number: line.lineNumber,
          tax_rate: line.taxRate,
          tax_amount: line.taxAmount
        }));

        const { error: linesError } = await this.supabase
          .from('recurring_transaction_lines')
          .insert(lines);

        if (linesError) throw linesError;
      }

      // Get complete template with lines
      const { template: completeTemplate, error: fetchError } = await this.getRecurringTransactionById(template.id);
      if (fetchError) throw fetchError;

      await logAudit(this.supabase, {
        organizationId,
        userId,
        action: 'create',
        entity: 'recurring_transaction',
        entityId: template.id,
        details: templateData
      });

      return { template: completeTemplate, error: null };

    } catch (error) {
      return { template: null, error };
    }
  }

  /**
   * Get recurring transaction by ID
   */
  async getRecurringTransactionById(templateId: string): Promise<{ template: RecurringTransaction | null; error: any }> {
    try {
      const { data: template, error } = await this.supabase
        .from('recurring_transactions')
        .select(`
          *,
          lines:recurring_transaction_lines(*)
        `)
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return { template: this.formatRecurringTransaction(template), error: null };

    } catch (error) {
      return { template: null, error };
    }
  }

  /**
   * Get recurring transactions with filtering
   */
  async getRecurringTransactions(
    organizationId: string,
    status?: RecurringStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{ templates: RecurringTransaction[]; total: number; error: any }> {
    try {
      let query = this.supabase
        .from('recurring_transactions')
        .select(`
          *,
          lines:recurring_transaction_lines(*)
        `, { count: 'exact' })
        .eq('organizationId', organizationId);

      if (status) {
        query = query.eq('status', status);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by next execution date
      query = query.order('next_execution_date', { ascending: true });

      const { data: templates, error, count } = await query;

      if (error) throw error;

      const formattedTemplates = templates?.map(template => this.formatRecurringTransaction(template)) || [];

      return { templates: formattedTemplates, total: count || 0, error: null };

    } catch (error) {
      return { templates: [], total: 0, error };
    }
  }

  /**
   * Update recurring transaction status
   */
  async updateRecurringTransactionStatus(
    templateId: string,
    status: RecurringStatus,
    userId: string,
    organizationId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      checkAccess(userId, organizationId);
      const { error } = await this.supabase
        .from('recurring_transactions')
        .update({ 
          status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;

      await logAudit(this.supabase, {
        organizationId,
        userId,
        action: 'update_status',
        entity: 'recurring_transaction',
        entityId: templateId,
        details: { status }
      });

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Execute recurring transactions (should be called by scheduler)
   */
  async executeRecurringTransactions(
    organizationId: string,
    executionDate: string = new Date().toISOString().split('T')[0],
    userId: string
  ): Promise<{ executions: RecurringExecution[]; error: any }> {
    try {
      checkAccess(userId, organizationId);

      // Get due recurring transactions
      const { data: dueTemplates, error: fetchError } = await this.supabase
        .from('recurring_transactions')
        .select(`
          *,
          lines:recurring_transaction_lines(*)
        `)
        .eq('organizationId', organizationId)
        .eq('status', 'active')
        .lte('next_execution_date', executionDate);

      if (fetchError) throw fetchError;

      const executions: RecurringExecution[] = [];

      for (const template of dueTemplates || []) {
        // Check if max executions reached
        if (template.max_executions && template.total_executions >= template.max_executions) {
          await this.updateRecurringTransactionStatus(template.id, 'completed', userId, organizationId);
          continue;
        }

        // Idempotency: skip if already executed for this date
        const { data: existingExec } = await this.supabase
          .from('recurring_executions')
          .select('id')
          .eq('recurring_transaction_id', template.id)
          .eq('execution_date', executionDate)
          .single();
        if (existingExec) continue;

        // Calculate next execution date
        const nextExecutionDate = this.calculateNextExecutionDate(
          template.schedule_type,
          template.schedule_config,
          executionDate
        );

        // Create journal entry
        const journalEntry = await this.createJournalEntryFromTemplate(template, executionDate);
        if (!journalEntry) continue;

        // Create execution record
        const { data: execution, error: execError } = await this.supabase
          .from('recurring_executions')
          .insert({
            recurring_transaction_id: template.id,
            execution_date: executionDate,
            journal_entry_id: journalEntry.id,
            status: 'completed',
            createdAt: new Date().toISOString()
          })
          .select()
          .single();

        if (execError) throw execError;

        // Update template
        await this.supabase
          .from('recurring_transactions')
          .update({
            last_execution_date: executionDate,
            next_execution_date: nextExecutionDate,
            total_executions: template.total_executions + 1,
            updatedAt: new Date().toISOString()
          })
          .eq('id', template.id);

        await logAudit(this.supabase, {
          organizationId,
          userId,
          action: 'execute',
          entity: 'recurring_transaction',
          entityId: template.id,
          details: { executionDate }
        });

        executions.push(execution);
      }

      return { executions, error: null };

    } catch (error) {
      return { executions: [], error };
    }
  }

  /**
   * Get execution history for a template
   */
  async getExecutionHistory(
    templateId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ executions: RecurringExecution[]; total: number; error: any }> {
    try {
      let query = this.supabase
        .from('recurring_executions')
        .select(`
          *,
          journal_entry:journal_entries(*)
        `, { count: 'exact' })
        .eq('recurring_transaction_id', templateId);

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by execution date
      query = query.order('execution_date', { ascending: false });

      const { data: executions, error, count } = await query;

      if (error) throw error;

      return { executions: executions || [], total: count || 0, error: null };

    } catch (error) {
      return { executions: [], total: 0, error };
    }
  }

  /**
   * Create journal entry from template
   */
  private async createJournalEntryFromTemplate(
    template: any,
    executionDate: string
  ): Promise<any> {
    try {
      // Calculate amounts based on calculation rules
      const calculatedLines = template.lines.map((line: any) => {
        let debitAmount = line.debit_amount;
        let creditAmount = line.credit_amount;

        // Apply amount calculation rules
        if (template.amount_calculation) {
          const calculation = template.amount_calculation;
          if (calculation.type === 'percentage') {
            debitAmount = debitAmount * (calculation.value / 100);
            creditAmount = creditAmount * (calculation.value / 100);
          } else if (calculation.type === 'formula') {
            // Apply formula calculation
            debitAmount = this.evaluateFormula(calculation.formula, executionDate);
            creditAmount = this.evaluateFormula(calculation.formula, executionDate);
          }
        }

        return {
          account_id: line.account_id,
          description: line.description,
          debit_amount: debitAmount,
          credit_amount: creditAmount,
          tax_rate: line.tax_rate,
          tax_amount: line.tax_amount
        };
      });

      // Create journal entry
      const { data: journalEntry, error } = await this.supabase
        .from('journal_entries')
        .insert({
          organizationId: template.organizationId,
          entry_number: await this.generateEntryNumber(template.organizationId),
          entry_date: executionDate,
          description: template.description,
          entry_type: 'recurring',
          reference: template.reference_template,
          total: calculatedLines.reduce((sum: number, line: any) => 
            sum + (line.debit_amount || 0), 0
          ),
          currency: 'USD',
          status: template.auto_approve ? 'approved' : 'pending',
          createdAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create journal entry lines
      const entryLines = calculatedLines.map((line: any, index: number) => ({
        journal_entry_id: journalEntry.id,
        account_id: line.account_id,
        description: line.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        tax_rate: line.tax_rate,
        tax_amount: line.tax_amount,
        line_number: index + 1
      }));

      const { error: linesError } = await this.supabase
        .from('journal_entry_lines')
        .insert(entryLines);

      if (linesError) throw linesError;

      return journalEntry;

    } catch (error) {
      console.error('Error creating journal entry from template:', error);
      return null;
    }
  }

  /**
   * Calculate next execution date based on schedule
   */
  private calculateNextExecutionDate(
    scheduleType: ScheduleType,
    scheduleConfig: any,
    currentDate: string
  ): string {
    const current = new Date(currentDate);
    let next = new Date(current);

    switch (scheduleType) {
      case 'daily':
        next.setDate(current.getDate() + (scheduleConfig.interval || 1));
        break;
      case 'weekly':
        next.setDate(current.getDate() + (7 * (scheduleConfig.interval || 1)));
        break;
      case 'monthly':
        next.setMonth(current.getMonth() + (scheduleConfig.interval || 1));
        break;
      case 'yearly':
        next.setFullYear(current.getFullYear() + (scheduleConfig.interval || 1));
        break;
      case 'custom':
        // Handle custom schedule logic
        if (scheduleConfig.daysOfWeek) {
          // Find next occurrence of specified days
          const targetDays = scheduleConfig.daysOfWeek;
          let found = false;
          let daysToAdd = 1;
          
          while (!found && daysToAdd <= 7) {
            next.setDate(current.getDate() + daysToAdd);
            if (targetDays.includes(next.getDay())) {
              found = true;
            }
            daysToAdd++;
          }
        }
        break;
    }

    return next.toISOString().split('T')[0];
  }

  /**
   * Evaluate formula for amount calculation (enterprise-grade)
   */
  private evaluateFormula(formula: string, executionDate: string): number {
    try {
      const date = new Date(executionDate);
      const variables = {
        YEAR: date.getFullYear(),
        MONTH: date.getMonth() + 1,
        DAY: date.getDate()
      };
      return safeEvaluateFormula(formula, variables);
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 0;
    }
  }

  /**
   * Generate entry number
   */
  private async generateEntryNumber(organizationId: string): Promise<string> {
    const { data: lastEntry, error } = await this.supabase
      .from('journal_entries')
      .select('entry_number')
      .eq('organizationId', organizationId)
      .order('entry_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const currentYear = new Date().getFullYear();
    const prefix = `REC-${currentYear}-`;

    if (!lastEntry) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastEntry.entry_number.replace(prefix, ''));
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Get recurring transaction summary
   */
  async getRecurringTransactionSummary(organizationId: string): Promise<{ summary: any; error: any }> {
    try {
      const { data: templates, error } = await this.supabase
        .from('recurring_transactions')
        .select('status, total_executions, next_execution_date')
        .eq('organizationId', organizationId);

      if (error) throw error;

      const summary = {
        totalTemplates: templates?.length || 0,
        activeTemplates: templates?.filter(t => t.status === 'active').length || 0,
        pausedTemplates: templates?.filter(t => t.status === 'paused').length || 0,
        completedTemplates: templates?.filter(t => t.status === 'completed').length || 0,
        totalExecutions: templates?.reduce((sum, t) => sum + (t.total_executions || 0), 0) || 0,
        dueToday: templates?.filter(t => 
          t.status === 'active' && 
          t.next_execution_date === new Date().toISOString().split('T')[0]
        ).length || 0
      };

      return { summary, error: null };

    } catch (error) {
      return { summary: null, error };
    }
  }

  // Helper methods
  private formatRecurringTransaction(templateData: any): RecurringTransaction {
    return {
      id: templateData.id,
      organizationId: templateData.organizationId,
      templateName: templateData.template_name,
      description: templateData.description,
      schedule: {
        type: templateData.schedule_type,
        config: templateData.schedule_config
      },
      nextExecutionDate: templateData.next_execution_date,
      lastExecutionDate: templateData.last_execution_date,
      totalExecutions: templateData.total_executions,
      maxExecutions: templateData.max_executions,
      status: templateData.status,
      amountCalculation: templateData.amount_calculation,
      autoApprove: templateData.auto_approve,
      referenceTemplate: templateData.reference_template,
      lines: templateData.lines?.map((line: any) => ({
        id: line.id,
        recurringTransactionId: line.recurring_transaction_id,
        accountId: line.account_id,
        description: line.description,
        debitAmount: line.debit_amount,
        creditAmount: line.credit_amount,
        lineNumber: line.line_number,
        taxRate: line.tax_rate,
        taxAmount: line.tax_amount
      })) || [],
      createdAt: templateData.createdAt,
      updatedAt: templateData.updatedAt
    };
  }
}