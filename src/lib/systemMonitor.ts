import { getSupabaseClient } from './supabase/client';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface SystemLog {
    id?: string;
    level: LogLevel;
    module: string;
    message: string;
    userId?: string;
    details?: any;
    timestamp: string;
}

const TABLE_NAME = 'system_logs';

export const systemMonitor = {
    /**
     * Registra un evento en el sistema de vigilancia.
     */
    async log(level: LogLevel, module: string, message: string, userId?: string, details?: any) {
        console.log(`[VIGILANCIA] [${level}] [${module}] ${message}`);
        try {
            const client = getSupabaseClient();
            if (!client) return;

            await client.from(TABLE_NAME).insert({
                level,
                module,
                message,
                user_id: userId || 'system',
                details: details || {},
            });
        } catch (error) {
            console.error('[VIGILANCIA] Error al guardar log:', error);
        }
    },

    async getRecentLogs(count = 50): Promise<SystemLog[]> {
        try {
            const client = getSupabaseClient();
            if (!client) return [];

            const { data, error } = await client
                .from(TABLE_NAME)
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(count);

            if (error) throw error;
            return (data || []).map(d => ({
                id: d.id,
                level: d.level,
                module: d.module,
                message: d.message,
                userId: d.user_id,
                details: d.details,
                timestamp: d.timestamp
            }));
        } catch (error) {
            console.error('[VIGILANCIA] Error fetching logs:', error);
            return [];
        }
    }
};
