/**
 * Supabase Database Connection
 * Centralized database connection and utilities
 */

const { createClient } = require('@supabase/supabase-js');
const { Logger } = require('./logger');

class Database {
    constructor() {
        this.logger = new Logger('Database');
        this.supabase = null;
        this.connected = false;
    }

    async connect() {
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
            }

            this.supabase = createClient(supabaseUrl, supabaseKey);
            
            // Test connection
            const { data, error } = await this.supabase.from('modules').select('count').limit(1);
            
            if (error) {
                this.logger.warn('Database connection test failed, but continuing...', error.message);
            } else {
                this.logger.info('✅ Supabase connection established');
            }
            
            this.connected = true;
            
        } catch (error) {
            this.logger.error('❌ Failed to connect to Supabase:', error.message);
            throw error;
        }
    }

    // Module operations
    async getModules() {
        try {
            const { data, error } = await this.supabase
                .from('modules')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            this.logger.error('Failed to get modules:', error.message);
            return [];
        }
    }

    async createModule(moduleData) {
        try {
            const { data, error } = await this.supabase
                .from('modules')
                .insert([moduleData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Failed to create module:', error.message);
            throw error;
        }
    }

    async updateModule(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('modules')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Failed to update module:', error.message);
            throw error;
        }
    }

    async deleteModule(id) {
        try {
            const { error } = await this.supabase
                .from('modules')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            this.logger.error('Failed to delete module:', error.message);
            throw error;
        }
    }

    // Task operations
    async getTasks() {
        try {
            const { data, error } = await this.supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            this.logger.error('Failed to get tasks:', error.message);
            return [];
        }
    }

    async createTask(taskData) {
        try {
            const { data, error } = await this.supabase
                .from('tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Failed to create task:', error.message);
            throw error;
        }
    }

    async updateTask(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('tasks')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Failed to update task:', error.message);
            throw error;
        }
    }

    async deleteTask(id) {
        try {
            const { error } = await this.supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            this.logger.error('Failed to delete task:', error.message);
            throw error;
        }
    }

    // Upload operations
    async createUpload(uploadData) {
        try {
            const { data, error } = await this.supabase
                .from('uploads')
                .insert([uploadData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            this.logger.error('Failed to create upload record:', error.message);
            throw error;
        }
    }

    async getUploads() {
        try {
            const { data, error } = await this.supabase
                .from('uploads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            this.logger.error('Failed to get uploads:', error.message);
            return [];
        }
    }

    // System operations
    async getSystemStats() {
        try {
            const [modulesResult, tasksResult, uploadsResult] = await Promise.all([
                this.supabase.from('modules').select('*', { count: 'exact' }),
                this.supabase.from('tasks').select('*', { count: 'exact' }),
                this.supabase.from('uploads').select('*', { count: 'exact' })
            ]);

            return {
                totalModules: modulesResult.count || 0,
                totalTasks: tasksResult.count || 0,
                totalUploads: uploadsResult.count || 0,
                activeModules: modulesResult.data?.filter(m => m.status === 'active').length || 0,
                installedModules: modulesResult.data?.filter(m => m.status === 'installed').length || 0
            };
        } catch (error) {
            this.logger.error('Failed to get system stats:', error.message);
            return {
                totalModules: 0,
                totalTasks: 0,
                totalUploads: 0,
                activeModules: 0,
                installedModules: 0
            };
        }
    }

    // Health check
    async healthCheck() {
        try {
            const { data, error } = await this.supabase
                .from('modules')
                .select('count')
                .limit(1);

            return { healthy: !error, error: error?.message };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }
}

// Create singleton instance
const database = new Database();

module.exports = database; 