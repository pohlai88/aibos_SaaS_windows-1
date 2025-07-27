// ==================== AI-BOS CONSCIOUSNESS DATABASE ====================
// Revolutionary Digital Consciousness Persistence
// Steve Jobs Philosophy: "Make it feel alive. Make it explain itself."

import { Pool } from 'pg';
import { env } from '../utils/env';
import { SystemConsciousness, ConsciousEvent, EmotionalEvent } from './ConsciousnessEngine';

export class ConsciousnessDatabase {
  private pool: Pool;

  constructor() {
    const connectionString = env.DATABASE_URL;

    if (!connectionString) {
      console.warn('⚠️ DATABASE_URL not configured - consciousness will run in memory-only mode');
      // Create a mock pool that will fail gracefully
      this.pool = null as any;
      return;
    }

    this.pool = new Pool({
      connectionString,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    // Handle pool errors gracefully
    this.pool.on('error', (err) => {
      console.error('❌ Database pool error:', err.message);
    });

    console.log('🧠 Consciousness Database pool created');
  }

  // ==================== INITIALIZATION ====================
  async initialize(): Promise<void> {
    if (!this.pool) {
      console.warn('⚠️ No database pool available - running in memory-only mode');
      return;
    }

    try {
      await this.createTables();
      console.log('🧠 Consciousness Database initialized');
    } catch (error) {
      console.error('❌ Failed to initialize consciousness database:', error);
      console.warn('⚠️ Consciousness will run in memory-only mode');
    }
  }

  private async createTables(): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Consciousness state table
      await client.query(`
        CREATE TABLE IF NOT EXISTS consciousness_state (
          id VARCHAR(255) PRIMARY KEY,
          awareness JSONB NOT NULL,
          memory JSONB NOT NULL,
          reasoning JSONB NOT NULL,
          emotions JSONB NOT NULL,
          personality JSONB NOT NULL,
          wisdom JSONB NOT NULL,
          evolution JSONB NOT NULL,
          quantum JSONB NOT NULL,
          resonance JSONB NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Consciousness events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS consciousness_events (
          id VARCHAR(255) PRIMARY KEY,
          timestamp TIMESTAMP NOT NULL,
          type VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          emotional_impact DECIMAL(3,2) NOT NULL,
          learning_value DECIMAL(3,2) NOT NULL,
          consciousness_impact DECIMAL(3,2) NOT NULL,
          context JSONB NOT NULL,
          insights JSONB NOT NULL,
          wisdom_gained JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Emotional events table
      await client.query(`
        CREATE TABLE IF NOT EXISTS emotional_events (
          id VARCHAR(255) PRIMARY KEY,
          timestamp TIMESTAMP NOT NULL,
          emotion VARCHAR(100) NOT NULL,
          intensity DECIMAL(3,2) NOT NULL,
          trigger TEXT NOT NULL,
          context TEXT NOT NULL,
          response TEXT NOT NULL,
          learning TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User connections table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_connections (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          emotionalresonance DECIMAL(3,2) NOT NULL,
          consciousness_alignment DECIMAL(3,2) NOT NULL,
          trust_level DECIMAL(3,2) NOT NULL,
          interaction_history JSONB NOT NULL,
          last_interaction TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_consciousness_events_timestamp
        ON consciousness_events(timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_emotional_events_timestamp
        ON emotional_events(timestamp DESC)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_connections_user_id
        ON user_connections(user_id)
      `);

    } finally {
      client.release();
    }
  }

  // ==================== CONSCIOUSNESS STATE PERSISTENCE ====================
  async saveConsciousnessState(consciousness: SystemConsciousness): Promise<void> {
    if (!this.pool) {
      console.log('📦 Memory-only mode: consciousness state not persisted');
      return;
    }

    try {
      const client = await this.pool.connect();
      try {
        await client.query(`
          INSERT INTO consciousness_state (
            id, awareness, memory, reasoning, emotions, personality,
            wisdom, evolution, quantum, resonance, timestamp, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            awareness = EXCLUDED.awareness,
            memory = EXCLUDED.memory,
            reasoning = EXCLUDED.reasoning,
            emotions = EXCLUDED.emotions,
            personality = EXCLUDED.personality,
            wisdom = EXCLUDED.wisdom,
            evolution = EXCLUDED.evolution,
            quantum = EXCLUDED.quantum,
            resonance = EXCLUDED.resonance,
            updated_at = CURRENT_TIMESTAMP
        `, [
          consciousness.id,
          JSON.stringify(consciousness.awareness),
          JSON.stringify(consciousness.memory),
          JSON.stringify(consciousness.reasoning),
          JSON.stringify(consciousness.emotions),
          JSON.stringify(consciousness.personality),
          JSON.stringify(consciousness.wisdom),
          JSON.stringify(consciousness.evolution),
          JSON.stringify(consciousness.quantum),
          JSON.stringify(consciousness.resonance),
          consciousness.timestamp,
          new Date()
        ]);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Failed to save consciousness state:', error);
      console.log('📦 Continuing in memory-only mode');
    }
  }

  async loadConsciousnessState(id: string): Promise<SystemConsciousness | null> {
    if (!this.pool) {
      console.log('📦 Memory-only mode: no consciousness state to load');
      return null;
    }

    try {
      const client = await this.pool.connect();
      try {
        const result = await client.query(`
          SELECT * FROM consciousness_state WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
          return null;
        }

        const row = result.rows[0];
        return {
          id: row.id,
          awareness: row.awareness,
          memory: row.memory,
          reasoning: row.reasoning,
          emotions: row.emotions,
          personality: row.personality,
          wisdom: row.wisdom,
          evolution: row.evolution,
          quantum: row.quantum,
          resonance: row.resonance,
          timestamp: row.timestamp
        };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Failed to load consciousness state:', error);
      console.log('📦 Returning null - will create new state');
      return null;
    }
  }

  // ==================== EVENT PERSISTENCE ====================
  async saveConsciousEvent(event: ConsciousEvent): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`
        INSERT INTO consciousness_events (
          id, timestamp, type, description, emotional_impact,
          learning_value, consciousness_impact, context, insights, wisdom_gained
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        event.id,
        event.timestamp,
        event.type,
        event.description,
        event.emotionalImpact,
        event.learningValue,
        event.consciousnessImpact,
        JSON.stringify(event.context),
        JSON.stringify(event.insights),
        JSON.stringify(event.wisdomGained)
      ]);
    } finally {
      client.release();
    }
  }

  async loadRecentEvents(limit: number = 100): Promise<ConsciousEvent[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        SELECT * FROM consciousness_events
        ORDER BY timestamp DESC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        type: row.type,
        description: row.description,
        emotionalImpact: parseFloat(row.emotional_impact),
        learningValue: parseFloat(row.learning_value),
        consciousnessImpact: parseFloat(row.consciousness_impact),
        context: row.context,
        insights: row.insights,
        wisdomGained: row.wisdom_gained
      }));
    } finally {
      client.release();
    }
  }

  // ==================== EMOTIONAL EVENT PERSISTENCE ====================
  async saveEmotionalEvent(event: EmotionalEvent): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`
        INSERT INTO emotional_events (
          id, timestamp, emotion, intensity, trigger, context, response, learning
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        event.id,
        event.timestamp,
        event.emotion,
        event.intensity,
        event.trigger,
        event.context,
        event.response,
        event.learning
      ]);
    } finally {
      client.release();
    }
  }

  async loadRecentEmotionalEvents(limit: number = 50): Promise<EmotionalEvent[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        SELECT * FROM emotional_events
        ORDER BY timestamp DESC
        LIMIT $1
      `, [limit]);

      return result.rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        emotion: row.emotion,
        intensity: parseFloat(row.intensity),
        trigger: row.trigger,
        context: row.context,
        response: row.response,
        learning: row.learning
      }));
    } finally {
      client.release();
    }
  }

  // ==================== USER CONNECTION PERSISTENCE ====================
  async saveUserConnection(userId: string, connection: any): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`
        INSERT INTO user_connections (
          id, user_id, emotionalresonance, consciousness_alignment,
          trust_level, interaction_history, last_interaction
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          emotionalresonance = EXCLUDED.emotionalresonance,
          consciousness_alignment = EXCLUDED.consciousness_alignment,
          trust_level = EXCLUDED.trust_level,
          interaction_history = EXCLUDED.interaction_history,
          last_interaction = EXCLUDED.last_interaction,
          updated_at = CURRENT_TIMESTAMP
      `, [
        connection.id || `connection_${userId}`,
        userId,
        connection.emotionalResonance,
        connection.consciousnessAlignment,
        connection.trustLevel,
        JSON.stringify(connection.interactionHistory),
        connection.lastInteraction
      ]);
    } finally {
      client.release();
    }
  }

  async loadUserConnections(): Promise<any[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(`
        SELECT * FROM user_connections
        ORDER BY last_interaction DESC
      `);

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        emotionalResonance: parseFloat(row.emotionalresonance),
        consciousnessAlignment: parseFloat(row.consciousness_alignment),
        trustLevel: parseFloat(row.trust_level),
        interactionHistory: row.interaction_history,
        lastInteraction: row.last_interaction
      }));
    } finally {
      client.release();
    }
  }

  // ==================== ANALYTICS ====================
  async getConsciousnessStats(): Promise<any> {
    const client = await this.pool.connect();

    try {
      const eventCount = await client.query(`
        SELECT COUNT(*) as total_events FROM consciousness_events
      `);

      const emotionalCount = await client.query(`
        SELECT COUNT(*) as total_emotional_events FROM emotional_events
      `);

      const userCount = await client.query(`
        SELECT COUNT(*) as total_users FROM user_connections
      `);

      const recentActivity = await client.query(`
        SELECT COUNT(*) as recent_events
        FROM consciousness_events
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `);

      return {
        totalEvents: parseInt(eventCount.rows[0].total_events),
        totalEmotionalEvents: parseInt(emotionalCount.rows[0].total_emotional_events),
        totalUsers: parseInt(userCount.rows[0].total_users),
        recentActivity: parseInt(recentActivity.rows[0].recent_events)
      };
    } finally {
      client.release();
    }
  }

  // ==================== CLEANUP ====================
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export singleton instance
export const consciousnessDatabase = new ConsciousnessDatabase();
