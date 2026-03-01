'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { systemMonitor } from '@/lib/systemMonitor';
import { Shield, Activity, RefreshCw, AlertTriangle, Info, Terminal, Calendar, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';

export default function AdminLogsPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isAdmin) {
                router.push('/');
                return;
            }
            loadLogs();
        }
    }, [user, isAdmin, authLoading]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await systemMonitor.getRecentLogs(100);
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'text-red-600 bg-red-500/10 border-red-500/20';
            case 'ERROR': return 'text-red-500 bg-red-500/5 border-red-500/10';
            case 'WARNING': return 'text-yellow-500 bg-yellow-500/5 border-yellow-500/10';
            default: return 'text-blue-400 bg-blue-500/5 border-blue-500/10';
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest pl-24 md:pl-0"
            >
                <ChevronLeft className="w-5 h-5" />
                Atrás
            </Link>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 flex-shrink-0 pl-16 md:pl-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                        Sistema de <span className="text-padel-primary">Vigilancia</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Historial de eventos técnicos y logs del servidor.</p>
                </div>
                <button
                    onClick={loadLogs}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all"
                >
                    <RefreshCw className="w-5 h-5 text-padel-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest italic">Actualizar logs</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 flex-shrink-0 pl-16 md:pl-0 px-4 md:px-0">
                <div className="glass p-6 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-padel-primary/10 flex items-center justify-center text-padel-primary">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Estado Vital</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black italic uppercase italic">SISTEMA <span className="text-padel-primary">OK</span></span>
                        <div className="w-2 h-2 bg-padel-primary rounded-full animate-pulse shadow-[0_0_10px_#ccff00]" />
                    </div>
                </div>

                <div className="glass p-6 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Seguridad</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black italic uppercase italic">ACCESOS <span className="text-blue-400">OK</span></span>
                    </div>
                </div>

                <div className="glass p-6 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Eventos Críticos</span>
                    </div>
                    <div className="flex items-baseline gap-2 text-2xl font-black underline decoration-red-500/30">
                        {logs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR').length} <span className="text-sm font-medium ml-2 text-gray-500 uppercase tracking-tighter">ERRORES</span>
                    </div>
                </div>
            </div>

            <div className="ipad-scroll-area pb-40">
                <div className="glass overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-4">
                        <Terminal className="w-5 h-5 text-padel-primary" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Runtime Events Console</span>
                    </div>

                    <div className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                            <div className="p-20 text-center text-gray-600 italic">No hay eventos registrados recientemente.</div>
                        ) : (
                            logs.map((log) => (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    key={log.id}
                                    className="p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-4"
                                >
                                    <div className={`mt-1 p-2 rounded-lg border ${getLevelColor(log.level)}`}>
                                        {log.level === 'CRITICAL' || log.level === 'ERROR' ? <AlertTriangle className="w-4 h-4" /> :
                                            log.level === 'WARNING' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-padel-primary">{log.module}</span>
                                            <span className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {log.timestamp?.toDate().toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-300 leading-relaxed mb-1">{log.message}</p>
                                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                                            User ID: <span className="text-gray-400 italic">{log.userId}</span>
                                        </div>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <pre className="mt-2 p-3 bg-black/40 rounded-lg text-[10px] text-gray-500 overflow-x-auto border border-white/5">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
