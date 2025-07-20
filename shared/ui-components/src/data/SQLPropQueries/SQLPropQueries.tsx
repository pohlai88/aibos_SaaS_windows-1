import React, { useState, useCallback, useMemo } from 'react';
import { auditLog } from '../../utils/auditLogger';

// SQL Query types
export interface SQLQuery {
  query: string;
  parsed: ParsedQuery;
  result: QueryResult;
  executionTime: number;
  timestamp: Date
}

export interface ParsedQuery {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  fields: string[];
  table: string;
  where?: WhereCondition[];
  orderBy?: OrderByClause[];
  limit?: number;
  offset?: number;
  groupBy?: string[];
  having?: WhereCondition[]
}

export interface WhereCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';
  value: any;
  logicalOperator?: 'AND' | 'OR'
}

export interface OrderByClause {
  field: string;
  direction: 'ASC' | 'DESC'
}

export interface QueryResult {
  data: any[];
  totalRows: number;
  affectedRows: number;
  fields: string[];
  executionTime: number;
  error?: string
}

export interface DataSource {
  name: string;
  data: any[];
  schema: DataSchema;
  metadata: DataMetadata
}

export interface DataSchema {
  fields: SchemaField[];
  primaryKey?: string;
  indexes?: string[]
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required: boolean;
  defaultValue?: any;
  description?: string
}

export interface DataMetadata {
  totalRows: number;
  lastUpdated: Date;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  source: string;
  version: string
}

// SQL Parser
class SQLParser {
  private static parseSelect(query: string): ParsedQuery {
    const selectRegex = /SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?/i;
    const match = query.match(selectRegex);

    if (!match) {
      throw new Error('Invalid SELECT query syntax')
}

    const [, fields, table, whereClause, orderByClause, limit, offset] = match;

    return {
      type: 'SELECT',
  fields: fields.split(',').map(f => f.trim()),
      table: table.trim(),
      where: whereClause ? this.parseWhereClause(whereClause) : undefined,
      orderBy: orderByClause ? this.parseOrderByClause(orderByClause) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    }
}

  private static parseWhereClause(whereClause: string): WhereCondition[] {
    const conditions: WhereCondition[] = [];
    const parts = whereClause.split(/\s+(AND|OR)\s+/i);

    for (let i = 0; i < parts.length; i += 2) {
      const condition = parts[i];
      const logicalOperator = parts[i + 1] as 'AND' | 'OR' | undefined;

      // Parse condition: field operator value
      const conditionRegex = /(\w+)\s*(=|!=|>|<|>=|<=|LIKE|IN|NOT IN|IS NULL|IS NOT NULL)\s*(.+)/i;
      const conditionMatch = condition.match(conditionRegex);

      if (conditionMatch) {
        const [, field, operator, value] = conditionMatch;
        conditions.push({
          field: field.trim(),
          operator: operator.toUpperCase() as any,
          value: this.parseValue(value.trim()),
          logicalOperator
        })
}
    }

    return conditions
}

  private static parseOrderByClause(orderByClause: string): OrderByClause[] {
    return orderByClause.split(',').map(clause => {
      const [field, direction] = clause.trim().split(/\s+/);
      return {
        field: field.trim(),
        direction: (direction || 'ASC').toUpperCase() as 'ASC' | 'DESC'
      }
})
}

  private static parseValue(value: string): any {
    // Remove quotes if present
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      return value.slice(1, -1)
}

    // Parse numbers
    if (!isNaN(Number(value))) {
      return Number(value)
}

    // Parse booleans
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return value.toLowerCase() === 'true'
}

    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      return JSON.parse(value)
}

    return value
}

  static parse(query: string): ParsedQuery {
    const trimmedQuery = query.trim();

    if (trimmedQuery.toUpperCase().startsWith('SELECT')) {
      return this.parseSelect(trimmedQuery)
}

    throw new Error('Unsupported query type. Only SELECT queries are supported.')
}
}

// SQL Query Executor
class SQLQueryExecutor {
  static execute(query: string,
  dataSource: DataSource): QueryResult {
    const startTime = performance.now();

    try {
      const parsedQuery = SQLParser.parse(query);
      let result = [...dataSource.data];

      // Apply WHERE conditions
      if (parsedQuery.where) {
        result = this.applyWhereConditions(result, parsedQuery.where)
}

      // Apply ORDER BY
      if (parsedQuery.orderBy) {
        result = this.applyOrderBy(result, parsedQuery.orderBy)
}

      // Apply LIMIT and OFFSET
      if (parsedQuery.offset) {
        result = result.slice(parsedQuery.offset)
}
      if (parsedQuery.limit) {
        result = result.slice(0, parsedQuery.limit)
}

      // Select fields
      if (parsedQuery.fields[0] !== '*') {
        result = result.map(row => {
          const selectedRow: any = {};
          parsedQuery.fields.forEach(field => {
            if (row.hasOwnProperty(field)) {
              selectedRow[field] = row[field]
}
          });
          return selectedRow
})
}

      const executionTime = performance.now() - startTime;

      return {
        data: result,
  totalRows: result.length,
        affectedRows: result.length,
        fields: parsedQuery.fields[0] === '*' ? Object.keys(dataSource.data[0] || {}) : parsedQuery.fields,
        executionTime
      }
} catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        data: [],
        totalRows: 0,
  affectedRows: 0,
        fields: [],
        executionTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
}
  }

  private static applyWhereConditions(data: any[], conditions: WhereCondition[]): any[] {
    return data.filter(row => {
      return conditions.every((condition, index) => {
        const result = this.evaluateCondition(row, condition);

        if (index === 0) return result;

        const prevCondition = conditions[index - 1];
        if (prevCondition.logicalOperator === 'OR') {
          return result || this.evaluateCondition(row, prevCondition)
} else {
          return result && this.evaluateCondition(row, prevCondition)
}
      })
})
}

  private static evaluateCondition(row: any,
  condition: WhereCondition): boolean {
    const fieldValue = row[condition.field];

    switch (condition.operator) {
      case '=':
        return fieldValue === condition.value;
      case '!=':
        return fieldValue !== condition.value;
      case '>':
        return fieldValue > condition.value;
      case '<':
        return fieldValue < condition.value;
      case '>=':
        return fieldValue >= condition.value;
      case '<=':
        return fieldValue <= condition.value;
      case 'LIKE':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          const pattern = condition.value.replace(/%/g, '.*').replace(/_/g, '.');
          return new RegExp(pattern, 'i').test(fieldValue)
}
        return false;
      case 'IN':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'NOT IN':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'IS NULL':
        return fieldValue === null || fieldValue === undefined;
      case 'IS NOT NULL':
        return fieldValue !== null && fieldValue !== undefined;
      default:
        return false
}
  }

  private static applyOrderBy(data: any[], orderBy: OrderByClause[]): any[] {
    return [...data].sort((a, b) => {
      for (const clause of orderBy) {
        const aValue = a[clause.field];
        const bValue = b[clause.field];

        if (aValue < bValue) {
          return clause.direction === 'ASC' ? -1 : 1
}
        if (aValue > bValue) {
          return clause.direction === 'ASC' ? 1 : -1
}
      }
      return 0
})
}
}

// SQL Query Builder Component
export const SQLQueryBuilder: React.FC<{
  dataSource: DataSource;
  onQueryExecute?: (query: SQLQuery) => void;
  enableAuditLogging?: boolean;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
}> = ({
  dataSource,
  onQueryExecute,
  enableAuditLogging = true,
  dataClassification = 'internal'
}) => {
  const [query, setQuery] = useState<string>('');
  const [queryHistory, setQueryHistory] = useState<SQLQuery[]>([]);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Predefined query templates
  const queryTemplates = useMemo(() => [
    {
      name: 'Select All',
  query: `SELECT * FROM ${dataSource.name} LIMIT 50`
    },
  {
    name: 'Count Records',
  query: `SELECT COUNT(*) FROM ${dataSource.name}`
    },
  {
    name: 'Filter by Status',
  query: `SELECT * FROM ${dataSource.name} WHERE status = 'pending' ORDER BY createdAt DESC LIMIT 20`
    },
  {
    name: 'Group by Category',
  query: `SELECT category, COUNT(*) as count FROM ${dataSource.name} GROUP BY category ORDER BY count DESC`
    }
  ], [dataSource.name]);

  // Execute query
  const executeQuery = useCallback(async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    setError(null);

    try {
      const result = SQLQueryExecutor.execute(query, dataSource);
      const sqlQuery: SQLQuery = {
        query,
        parsed: SQLParser.parse(query),
        result,
        executionTime: result.executionTime,
        timestamp: new Date()
      };

      setCurrentResult(result);
      setQueryHistory(prev => [sqlQuery, ...prev.slice(0, 9)]); // Keep last 10 queries

      if (onQueryExecute) {
        onQueryExecute(sqlQuery)
}

      // Audit logging
      if (enableAuditLogging) {
        auditLog('sql_query_executed', {
          query,
          dataSource: dataSource.name,
          resultRows: result.totalRows,
          executionTime: result.executionTime,
          dataClassification,
          timestamp: sqlQuery.timestamp.toISOString()
        })
}

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setCurrentResult({
        data: [],
        totalRows: 0,
  affectedRows: 0,
        fields: [],
        executionTime: 0,
  error: errorMessage
      })
} finally {
      setIsExecuting(false)
}
  }, [query, dataSource, onQueryExecute, enableAuditLogging, dataClassification]);

  // Load query template
  const loadTemplate = useCallback((templateQuery: string) => {
    setQuery(templateQuery)
}, []);

  // Clear query
  const clearQuery = useCallback(() => {
    setQuery('');
    setCurrentResult(null);
    setError(null)
}, []);

  return (
    <div className="sql-query-builder">
      <div className="query-editor">
        <div className="editor-header">
          <h3>SQL Query Builder</h3>
          <div className="editor-controls">
            <button
              onClick={executeQuery}
              disabled={isExecuting || !query.trim()}
              className="execute-button"
            >
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </button>
            <button onClick={clearQuery} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        <div className="query-templates">
          <h4>Query Templates</h4>
          <div className="template-buttons">
            {queryTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => loadTemplate(template.query)}
                className="template-button"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`SELECT * FROM ${dataSource.name} WHERE status = 'pending' ORDER BY createdAt DESC LIMIT 50`}
          className="query-textarea"
          rows={6}
        />

        {error && (
          <div className="query-error">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {currentResult && (
        <div className="query-results">
          <div className="results-header">
            <h4>Query Results</h4>
            <div className="results-meta">
              <span>Rows: {currentResult.totalRows}</span>
              <span>Time: {currentResult.executionTime.toFixed(2)}ms</span>
              <span>Fields: {currentResult.fields.length}</span>
            </div>
          </div>

          {currentResult.data.length > 0 ? (
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    {currentResult.fields.map(field => (
                      <th key={field}>{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentResult.data.slice(0, 100).map((row, index) => (
                    <tr key={index}>
                      {currentResult.fields.map(field => (
                        <td key={field}>
                          {typeof row[field] === 'object'
                            ? JSON.stringify(row[field])
                            : String(row[field] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {currentResult.data.length > 100 && (
                <div className="results-note">
                  Showing first 100 rows of {currentResult.data.length} total rows
                </div>
              )}
            </div>
          ) : (
            <div className="no-results">
              No results found
            </div>
          )}
        </div>
      )}

      {queryHistory.length > 0 && (
        <div className="query-history">
          <h4>Query History</h4>
          <div className="history-list">
            {queryHistory.map((sqlQuery, index) => (
              <div key={index} className="history-item">
                <div className="history-query">{sqlQuery.query}</div>
                <div className="history-meta">
                  <span>{sqlQuery.result.totalRows} rows</span>
                  <span>{sqlQuery.executionTime.toFixed(2)}ms</span>
                  <span>{sqlQuery.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
};

// Data Grid with SQL Queries
export const SQLDataGrid: React.FC<{
  dataSource: DataSource;
  defaultQuery?: string;
  enableQueryBuilder?: boolean;
  enableAuditLogging?: boolean;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
}> = ({
  dataSource,
  defaultQuery = `SELECT * FROM ${dataSource.name} LIMIT 50`,
  enableQueryBuilder = true,
  enableAuditLogging = true,
  dataClassification = 'internal'
}) => {
  const [currentQuery, setCurrentQuery] = useState<SQLQuery | null>(null);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);

  // Execute default query on mount
  React.useEffect(() => {
    if (defaultQuery) {
      const result = SQLQueryExecutor.execute(defaultQuery, dataSource);
      const sqlQuery: SQLQuery = {
        query: defaultQuery,
  parsed: SQLParser.parse(defaultQuery),
        result,
        executionTime: result.executionTime,
        timestamp: new Date()
      };
      setCurrentQuery(sqlQuery)
}
  }, [defaultQuery, dataSource]);

  const handleQueryExecute = useCallback((query: SQLQuery) => {
    setCurrentQuery(query);
    setShowQueryBuilder(false)
}, []);

  return (
    <div className="sql-data-grid">
      <div className="grid-header">
        <h3>SQL Data Grid - {dataSource.name}</h3>
        <div className="grid-controls">
          {enableQueryBuilder && (
            <button
              onClick={() => setShowQueryBuilder(!showQueryBuilder)}
              className="query-builder-toggle"
            >
              {showQueryBuilder ? 'Hide' : 'Show'} Query Builder
            </button>
          )}
        </div>
      </div>

      {showQueryBuilder && (
        <SQLQueryBuilder
          dataSource={dataSource}
          onQueryExecute={handleQueryExecute}
          enableAuditLogging={enableAuditLogging}
          dataClassification={dataClassification}
        />
      )}

      {currentQuery && (
        <div className="grid-results">
          <div className="results-header">
            <div className="current-query">
              <strong>Current Query:</strong> {currentQuery.query}
            </div>
            <div className="results-meta">
              <span>Rows: {currentQuery.result.totalRows}</span>
              <span>Time: {currentQuery.executionTime.toFixed(2)}ms</span>
              <span>Fields: {currentQuery.result.fields.length}</span>
            </div>
          </div>

          {currentQuery.result.data.length > 0 ? (
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    {currentQuery.result.fields.map(field => (
                      <th key={field}>{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentQuery.result.data.map((row, index) => (
                    <tr key={index}>
                      {currentQuery.result.fields.map(field => (
                        <td key={field}>
                          {typeof row[field] === 'object'
                            ? JSON.stringify(row[field])
                            : String(row[field] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-results">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
};

// HOC to add SQL query capabilities to any data grid
export const withSQLQueries = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    enableQueryBuilder?: boolean;
    enableAuditLogging?: boolean;
    dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted'
}
) => {
  const SQLComponent: React.FC<P> = (props) => {
    return (
      <SQLDataGrid
        {...props as any}
        enableQueryBuilder={options.enableQueryBuilder ?? true}
        enableAuditLogging={options.enableAuditLogging ?? true}
        dataClassification={options.dataClassification ?? 'internal'}
      />
    )
};

  SQLComponent.displayName = `withSQLQueries(${Component.displayName || Component.name})`;
  return SQLComponent
};
