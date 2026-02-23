import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, limit, orderBy, getDocs } from 'firebase/firestore';

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface SystemLog {
    level: LogLevel;
    module: string;
    message: string;
    userId?: string;
    details?: any;
    timestamp: any;
}

export const systemMonitor = {
    /**
     * Registra un evento en el sistema de vigilancia.
     */
    async log(level: LogLevel, module: string, message: string, userId?: string, details?: any) {
        console.log(`[VIGILANCIA] [${level}] [${module}] ${message}`);
        try {
            await addDoc(collection(db, 'system_logs'), {
                level,
                module,
                message,
                userId: userId || 'system',
                details: details || {},
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('[VIGILANCIA] Error al guardar log:', error);
        }
    },

    async getRecentLogs(count = 50) {
        const q = query(
            collection(db, 'system_logs'),
            orderBy('timestamp', 'desc'),
            limit(count)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
