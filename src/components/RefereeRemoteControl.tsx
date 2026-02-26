'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bluetooth,
    BluetoothConnected,
    Zap,
} from 'lucide-react';

interface RefereeRemoteControlProps {
    onTeamAPoint: () => void;
    onTeamBPoint: () => void;
    onUndo: () => void;
}

export default function RefereeRemoteControl({
    onTeamAPoint,
    onTeamBPoint,
    onUndo
}: RefereeRemoteControlProps) {
    const [isListening, setIsListening] = useState(true);
    const [btConnected, setBtConnected] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [showStatus, setShowStatus] = useState(false);

    // Keyboard HID Support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isListening) return;

            const key = e.key.toUpperCase();
            if (key === '1' || key === 'A') {
                onTeamAPoint();
                triggerActionFeedback('Equipo A +1');
            } else if (key === '2' || key === 'B') {
                onTeamBPoint();
                triggerActionFeedback('Equipo B +1');
            } else if (key === '3' || key === 'C') {
                onUndo();
                triggerActionFeedback('Deshacer');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isListening, onTeamAPoint, onTeamBPoint, onUndo]);

    const triggerActionFeedback = (action: string) => {
        setLastAction(action);
        setTimeout(() => setLastAction(null), 1500);
    };

    // Web Bluetooth API (Simulación / Estructura)
    const connectBluetooth = async () => {
        try {
            // Nota: navigator.bluetooth solo funciona en HTTPS y Chrome/Edge
            if (!('bluetooth' in navigator)) {
                alert('Web Bluetooth no está soportado en este navegador.');
                return;
            }

            // Aquí se buscaría un dispositivo específico o genérico de padel
            // const device = await (navigator as any).bluetooth.requestDevice({
            //     acceptAllDevices: true,
            //     optionalServices: ['battery_service']
            // });

            // console.log("Dispositivo vinculado:", device.name);
            setBtConnected(true);
            triggerActionFeedback('Bluetooth Vinculado');
        } catch (error) {
            console.error("Error Bluetooth:", error);
            setBtConnected(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => connectBluetooth()}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${btConnected ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10'}`}
                >
                    {btConnected ? <BluetoothConnected className="w-4 h-4" /> : <Bluetooth className="w-4 h-4" />}
                    {btConnected ? 'Remoto Conectado' : 'Link Bluetooth'}
                </button>
            </div>

            <AnimatePresence>
                {lastAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="bg-padel-primary text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-2xl"
                    >
                        <Zap className="w-3 h-3 fill-current" />
                        Comando: {lastAction}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
