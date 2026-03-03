'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2, Mail, Download, X, Save, RefreshCw
} from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (type: 'whatsapp' | 'email' | 'download') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onShare }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 text-center space-y-6">
                            <div className="space-y-2">
                                <div className="w-16 h-16 bg-[#ccff00]/10 rounded-3xl flex items-center justify-center mx-auto">
                                    <Share2 className="w-8 h-8 text-[#ccff00]" />
                                </div>
                                <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Compartir Planilla</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Selecciona el medio de envío</p>
                            </div>

                            <div className="grid gap-3">
                                <button
                                    onClick={() => onShare('whatsapp')}
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.553 4.197 1.603 6.034L0 24l6.113-1.603a11.845 11.845 0 005.937 1.603h.005c6.637 0 12.05-5.414 12.05-12.05 0-3.217-1.252-6.242-3.523-8.513z" /></svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black uppercase italic tracking-tight text-white mb-0.5">WhatsApp</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Enlace directo al chat</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => onShare('email')}
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black uppercase italic tracking-tight text-white mb-0.5">E-mail</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Enviar por correo</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => onShare('download')}
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] hover:bg-[#ccff00]/20 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-[#ccff00]/10 flex items-center justify-center">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black uppercase italic tracking-tight text-white mb-0.5">Descargar PDF</p>
                                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Archivo para impresión</p>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-white transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface SponsorModalProps {
    isOpen: boolean;
    onClose: () => void;
    logoDraft: string;
    setLogoDraft: (val: string) => void;
    nameDraft: string;
    setNameDraft: (val: string) => void;
    linkDraft: string;
    setLinkDraft: (val: string) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

export const SponsorModal: React.FC<SponsorModalProps> = ({
    isOpen, onClose, logoDraft, setLogoDraft, nameDraft, setNameDraft, linkDraft, setLinkDraft, onSave, saving
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black uppercase italic tracking-tight text-[#ccff00]">
                                    Logo del patrocinante
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => !saving && onClose()}
                                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Configura el logo principal del evento. Pega una URL de imagen (JPG, PNG, etc.) o un enlace de Firebase/Supabase.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                        URL del logo
                                    </label>
                                    <input
                                        type="text"
                                        value={logoDraft}
                                        onChange={(e) => setLogoDraft(e.target.value)}
                                        placeholder="https://.../logo.jpg"
                                        className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-[#ccff00] outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                            Nombre del patrocinante
                                        </label>
                                        <input
                                            type="text"
                                            value={nameDraft}
                                            onChange={(e) => setNameDraft(e.target.value)}
                                            placeholder="Ej. TORNEO VERDE"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-[#ccff00] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                            Enlace (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={linkDraft}
                                            onChange={(e) => setLinkDraft(e.target.value)}
                                            placeholder="https://www.patrocinante.com"
                                            className="w-full rounded-2xl bg-black/40 border border-white/10 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-[#ccff00] outline-none"
                                        />
                                    </div>
                                </div>

                                {logoDraft && (
                                    <div className="mt-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                                            Vista previa
                                        </p>
                                        <div className="w-32 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={logoDraft}
                                                alt={nameDraft || 'Patrocinante'}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={onSave}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#ccff00] text-black font-black text-xs uppercase tracking-widest hover:bg-[#ccff00]/90 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar logo
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-2xl bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    rulesDraft: string;
    setRulesDraft: (val: string) => void;
    onSave: () => Promise<void>;
    saving: boolean;
}

export const RulesModal: React.FC<RulesModalProps> = ({
    isOpen, onClose, rulesDraft, setRulesDraft, onSave, saving
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-black uppercase italic tracking-tight text-[#ccff00]">Reglas del evento</h2>
                                <button
                                    type="button"
                                    onClick={() => !saving && onClose()}
                                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Reglas generales para todas las categorías y géneros</p>
                            <textarea
                                value={rulesDraft}
                                onChange={(e) => setRulesDraft(e.target.value)}
                                placeholder="Introduce las reglas (puntos de oro, duración, etc.)..."
                                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:border-[#ccff00] outline-none resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={onSave}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#ccff00] text-black font-black text-xs uppercase tracking-widest hover:bg-[#ccff00]/90 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar reglas
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-2xl bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
