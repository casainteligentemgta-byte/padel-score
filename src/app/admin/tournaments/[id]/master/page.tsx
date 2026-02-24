'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import AdminTournamentMasterView from '@/components/AdminTournamentMasterView';
import { ShieldAlert, Zap } from 'lucide-react';

export default function TournamentMasterPage() {
    const params = useParams();
    const id = params.id as string;
    const { isAdmin, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Zap className="w-12 h-12 text-[#ccff00] animate-pulse" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
                <div className="max-w-md text-center">
                    <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-4">Acceso Denegado</h2>
                    <p className="text-gray-500">Este panel es de uso exclusivo para Administradores del Sistema.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#080808] min-h-screen">
            <AdminTournamentMasterView tournamentId={id} isAdmin={isAdmin} />
        </div>
    );
}
