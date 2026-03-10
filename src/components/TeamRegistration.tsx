'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Plus, Search, Check, X, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamRegistrationProps {
    onSuccess?: () => void;
}

export default function TeamRegistration({ onSuccess }: TeamRegistrationProps) {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [partnerCode, setPartnerCode] = useState<string>('');
    const [searching, setSearching] = useState(false);
    const [foundPartner, setFoundPartner] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const data = await dataService.listAllTournaments();
                setTournaments(data.filter((t: any) => t.status === 'active' || t.status === 'registration_open'));
            } catch (err) {
                console.error('Error fetching tournaments:', err);
            }
        };
        fetchTournaments();
    }, []);

    const selectedT = tournaments.find(t => t.id === selectedTournament);
    const categories = selectedT ? (selectedT.categories || []) : [];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTournament || !selectedCategory || partnerCode.length !== 6) {
            setError('Por favor complete todos los campos y use un código de 6 dígitos.');
            return;
        }

        setSearching(true);
        setError(null);
        setFoundPartner(null);

        try {
            const profile = await dataService.getUserByUniqueCode(partnerCode);
            if (profile) {
                if (profile.id === user?.uid) {
                    setError('No puedes invitarte a ti mismo.');
                } else {
                    setFoundPartner(profile);
                    setShowModal(true);
                }
            } else {
                setError('Jugador no encontrado. Verifique el código.');
            }
        } catch (err) {
            setError('Error al buscar el jugador.');
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleConfirm = async () => {
        if (!foundPartner || !selectedTournament || !selectedCategory) return;

        try {
            await dataService.createTeamInvitation(
                selectedTournament,
                selectedCategory,
                user!.uid,
                foundPartner.id
            );
            setSuccessMessage(`¡Invitación enviada a ${foundPartner.name}!`);
            setShowModal(false);
            setPartnerCode('');
            setSelectedCategory('');
            setFoundPartner(null);
            if (onSuccess) onSuccess();

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Error al enviar la invitación.');
            setShowModal(false);
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm self-start">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#ccff00]/20 flex items-center justify-center">
                    <Plus className="text-[#ccff00]" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Inscribirse en Pareja</h2>
                    <p className="text-zinc-400 text-sm">Crea un equipo para el próximo torneo</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Seleccionar Torneo</label>
                    <select
                        value={selectedTournament}
                        onChange={(e) => setSelectedTournament(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="">Elegir torneo...</option>
                        {tournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.data?.name || `Torneo ${t.id}`}</option>
                        ))}
                    </select>
                </div>

                {selectedTournament && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Categoría</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="">Elegir categoría...</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id || cat.name} value={cat.id || cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Código del Compañero (6 dígitos)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={partnerCode}
                            onChange={(e) => setPartnerCode(e.target.value.toUpperCase().slice(0, 6))}
                            placeholder="Ej: PX45T2"
                            className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 pl-11 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ccff00]/50 transition-all uppercase tracking-widest font-mono"
                            required
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        <ShieldAlert size={16} />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                        <Check size={16} />
                        {successMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={searching || !selectedCategory}
                    className="w-full bg-[#ccff00] text-black font-bold py-3 rounded-xl hover:bg-[#b8e600] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(204,255,0,0.15)] flex items-center justify-center gap-2"
                >
                    {searching ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Buscar Compañero'
                    )}
                </button>
            </form>

            {/* Modal de Confirmación */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 flex items-center justify-center mb-2">
                                    <Award className="text-[#ccff00]" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">¿Confirmar Pareja?</h3>
                                <p className="text-zinc-400">
                                    Estás por invitar a:
                                    <span className="block text-xl font-bold text-white mt-1">{foundPartner?.name}</span>
                                    <span className="text-sm text-zinc-500 block">{foundPartner?.email}</span>
                                </p>
                                <div className="py-2 px-4 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300">
                                    Categoría: <span className="font-bold text-[#ccff00]">{selectedCategory}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 transition-all"
                                    >
                                        <X size={18} />
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b8e600] transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                                    >
                                        <Check size={18} />
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
