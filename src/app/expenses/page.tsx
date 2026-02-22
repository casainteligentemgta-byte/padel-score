'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import {
    DollarSign,
    Plus,
    Calendar,
    Tag,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Trash2,
    PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpensesPage() {
    const { user, loading: authLoading } = useAuth();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'Insumos', // Insumos, Premios, Alquiler, Otros
        date: new Date().toISOString().split('T')[0]
    });

    const categories = ['Insumos', 'Premios', 'Alquiler', 'Marketing', 'Personal', 'Otros'];

    useEffect(() => {
        const loadExpenses = async () => {
            if (user) {
                try {
                    const data = await dataService.getMyExpenses(user.uid);
                    setExpenses(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        if (!authLoading && user) loadExpenses();
        else if (!authLoading && !user) setLoading(false);
    }, [user, authLoading]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await dataService.addExpense({
                ...newExpense,
                amount: parseFloat(newExpense.amount),
            }, user.uid);

            // Refresh list
            const data = await dataService.getMyExpenses(user.uid);
            setExpenses(data);
            setIsAddModalOpen(false);
            setNewExpense({
                description: '',
                amount: '',
                category: 'Insumos',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            alert('Error al agregar gasto');
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
                <DollarSign className="w-20 h-20 text-padel-primary/20 mb-8" />
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Control de Gastos</h1>
                <p className="text-gray-500 max-w-md mb-8">Inicia sesión para llevar una contabilidad precisa de tus torneos.</p>
                {/* LoginButton is already available in the project */}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-outfit">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                            Gestión de <span className="text-padel-primary">Gastos</span>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Control financiero detallado de tus eventos de Padel.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-padel-primary text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-transform uppercase italic"
                    >
                        REGISTRAR GASTO <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* Cards Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass p-8 border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-padel-primary/5 group-hover:text-padel-primary/10 transition-colors">
                            <TrendingDown className="w-24 h-24" />
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Total Egresos</p>
                        <h2 className="text-4xl font-black italic">${totalExpenses.toLocaleString()}</h2>
                    </div>

                    <div className="glass p-8 border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-padel-primary/5 group-hover:text-padel-primary/10 transition-colors">
                            <PieChart className="w-24 h-24" />
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Gastos este mes</p>
                        <h2 className="text-4xl font-black italic">${totalExpenses.toLocaleString()}</h2>
                    </div>

                    <div className="glass p-8 border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-padel-primary/5 group-hover:text-padel-primary/10 transition-colors">
                            <Tag className="w-24 h-24" />
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Categorías Activas</p>
                        <h2 className="text-4xl font-black italic">{new Set(expenses.map(e => e.category)).size}</h2>
                    </div>
                </div>

                {/* Expenses Table/List */}
                <div className="glass border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-black uppercase tracking-widest text-sm italic">Historial de Transacciones</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-white/5">
                                    <th className="px-8 py-6">Fecha</th>
                                    <th className="px-8 py-6">Descripción</th>
                                    <th className="px-8 py-6">Categoría</th>
                                    <th className="px-8 py-6 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-gray-500 italic">
                                            No hay gastos registrados. Haz clic en "Registrar Gasto" para empezar.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((exp, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={exp.id}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6 text-xs text-gray-400">
                                                {new Date(exp.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-bold text-sm tracking-tight">{exp.description}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-padel-primary">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black italic text-lg">
                                                ${exp.amount?.toLocaleString()}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass max-w-lg w-full p-10 border-white/10"
                        >
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">
                                Nuevo <span className="text-padel-primary">Gasto</span>
                            </h2>

                            <form onSubmit={handleAddExpense} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Descripción</label>
                                    <input
                                        required
                                        type="text"
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                        placeholder="Ej: Compra de bolas Wilson"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-padel-primary outline-none transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Monto ($)</label>
                                        <input
                                            required
                                            type="number"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-padel-primary outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Fecha</label>
                                        <input
                                            required
                                            type="date"
                                            value={newExpense.date}
                                            onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-padel-primary outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Categoría</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-padel-primary outline-none transition-colors appearance-none"
                                    >
                                        {categories.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-xl font-bold uppercase text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-padel-primary text-black p-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform"
                                    >
                                        Guardar Gasto
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
