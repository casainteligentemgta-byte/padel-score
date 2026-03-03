'use client';

import { useState } from 'react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { RefreshCw, Users, Trophy } from 'lucide-react';

export default function SeedPlayersPage() {
    const { user, isAdmin, loading } = useAuth();
    const [seeding, setSeeding] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSeed = async () => {
        if (!user?.uid) {
            setMessage('Debes iniciar sesión para crear jugadores de prueba.');
            return;
        }
        setMessage(null);
        setSeeding(true);
        try {
            const ownerId = user.uid;
            const positions = ['Drive', 'Revés', 'Ambos'];

            for (let i = 1; i <= 80; i++) {
                const level = (Math.floor(Math.random() * 7) + 1);
                const position = positions[Math.floor(Math.random() * positions.length)];
                await dataService.addParticipant(
                    {
                        name: `Jugador Demo ${i}`,
                        lastName: `Test ${i}`,
                        level,
                        position,
                        birthDate: '',
                        bloodType: 'O+',
                        allergies: '',
                        medicalConditions: '',
                        phone: '',
                        email: '',
                        instagram: '',
                        dni: `V${10000000 + i}`,
                        suitSize: 'M',
                        shortSize: 'M',
                        shoeSize: '',
                        photo: '',
                    },
                    ownerId
                );
            }

            setMessage('Se crearon 80 jugadores de prueba correctamente.');
        } catch (error) {
            console.error(error);
            setMessage('Error al crear jugadores de prueba.');
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12 flex items-center justify-center">
                <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-padel-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter">
                                Simulación jugadores
                            </h1>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                                Crear 80 jugadores demo para torneos de prueba
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Verificando sesión...
                        </div>
                    ) : !user ? (
                        <p className="text-sm text-gray-400">
                            Inicia sesión para usar la simulación de jugadores.
                        </p>
                    ) : !isAdmin ? (
                        <p className="text-sm text-gray-400">
                            Solo un administrador puede crear jugadores de prueba.
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-gray-400">
                                Este módulo creará 80 jugadores en la colección <span className="font-mono text-gray-300">participants</span> asociados a tu cuenta.
                                Úsalo solo en entornos de prueba.
                            </p>
                            <button
                                type="button"
                                disabled={seeding}
                                onClick={handleSeed}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-padel-primary text-black font-black text-xs uppercase tracking-widest hover:bg-padel-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                {seeding ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Creando jugadores...
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-4 h-4" />
                                        Crear 80 jugadores demo
                                    </>
                                )}
                            </button>
                            <Link
                                href="/dev/simulate-tournament"
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-padel-primary/40 bg-padel-primary/5 text-padel-primary font-black text-xs uppercase tracking-widest hover:bg-padel-primary hover:text-black transition-colors"
                            >
                                <Trophy className="w-4 h-4" />
                                Simular torneo (hasta la final)
                            </Link>
                        </>
                    )}

                    {message && (
                        <p className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                            {message}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

