'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LegalContainer } from '@/components/legal/LegalContainer';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function TermsReacceptanceOverlay() {
    const { user, refreshProfile } = useAuth();
    const [accepted, setAccepted] = useState(false);
    const uid = user?.uid;

    if (accepted) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-md p-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111] border border-green-500/30 p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl shadow-green-500/10"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-500/20 p-4 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">¡Términos Aceptados!</h2>
                    <p className="text-zinc-400 mb-8">Tu registro ha sido actualizado correctamente. Ya puedes acceder a todas las funciones.</p>
                    
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Ingresar a la App
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <p className="mt-4 text-xs text-zinc-500 italic">
                        Redirigiendo automáticamente...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="smart-legal-title">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                <span id="smart-legal-title" className="sr-only">
                    Actualización de términos y condiciones
                </span>
                <LegalContainer
                    type="inscription"
                    userId={uid}
                    onAccept={async (p) => {
                        if (!uid) return;
                        console.log('[TermsOverlay] Aceptando términos...', p.version);
                        try {
                            await dataService.updateProfileLegalAcceptance(uid, {
                                acceptedTermsVersion: p.version,
                                signaturePath: p.signaturePath,
                                biometricPhotoPath: p.biometricPath,
                            });
                            console.log('[TermsOverlay] Guardado en DB exitoso. Refrescando perfil...');
                            await refreshProfile();
                            console.log('[TermsOverlay] Perfil refrescado. Marcando como aceptado.');
                            setAccepted(true);
                            
                            // Autoredirect fallback after 1.5s if gate doesn't catch it
                            setTimeout(() => {
                                if (window.location.pathname === '/' || window.location.pathname === '/login') {
                                    window.location.href = '/dashboard';
                                }
                            }, 2000);
                        } catch (err: any) {
                            console.error('[TermsOverlay] Error en onAccept:', err);
                            const isMissingCol = String(err.message).includes('COLUMNA_FALTANTE');
                            if (isMissingCol) {
                                alert('ATENCIÓN: Se guardó tu firma pero la base de datos no tiene la columna "accepted_terms_version". Por favor, pide al administrador que ejecute la migración 051 en Supabase.');
                                setAccepted(true); // Permitimos avanzar si al menos se guardó la firma
                            } else {
                                throw err; // Re-throw para que LegalContainer lo muestre
                            }
                        }
                    }}
                />
            </motion.div>
        </div>
    );
}
