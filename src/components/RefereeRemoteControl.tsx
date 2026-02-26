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
    onUndo?: () => void;
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
                triggerActionFeedback('Team A +1 Point');
            } else if (key === '2' || key === 'B') {
                onTeamBPoint();
                triggerActionFeedback('Team B +1 Point');
            } else if (key === '3' || key === 'C') {
                if (onUndo) {
                    onUndo();
                    triggerActionFeedback('Undo Action');
                }
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
            triggerActionFeedback('Remote Linked');
        } catch (error) {
            console.error("Error Bluetooth:", error);
            setBtConnected(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => connectBluetooth()}
                className={`h-12 flex items-center gap-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${btConnected
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:border-white/20'
                    }`}
            >
                {btConnected ? <BluetoothConnected className="w-4 h-4" /> : <Bluetooth className="w-4 h-4" />}
                {btConnected ? 'Remote Active' : 'Link Remote'}
            </motion.button>

            <AnimatePresence>
                {lastAction && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="bg-padel-primary text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 shadow-[0_10px_30px_rgba(204,255,0,0.2)] border-b-2 border-black/10"
                    >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {lastAction}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
