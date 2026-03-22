'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '@/lib/dataService';

/**
 * Sponsor interface based on the sponsor_carousel table
 */
interface Sponsor {
    id: string;
    tournament_id: string;
    name: string;
    url: string;
    duration_seconds?: number;
    is_active: boolean;
    display_order: number;
}

interface SponsorCarouselProps {
    tournamentId: string;
    className?: string;
    fallbackDuration?: number;
}

export default function SponsorCarousel({
    tournamentId,
    className = "",
    fallbackDuration = 8
}: SponsorCarouselProps) {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadSponsors = async () => {
        if (!tournamentId) return;
        try {
            const data = await dataService.getSponsorsByTournament(tournamentId);
            // Type cast if necessary as dataService might return any[]
            setSponsors(data as Sponsor[]);
        } catch (error) {
            console.error('[SponsorCarousel] Error loading sponsors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSponsors();

        // Refresh sponsors list every 2 minutes
        const interval = setInterval(loadSponsors, 120000);
        return () => clearInterval(interval);
    }, [tournamentId]);

    useEffect(() => {
        if (sponsors.length <= 1) return;

        const currentSponsor = sponsors[currentIndex];
        const duration = (currentSponsor.duration_seconds || fallbackDuration) * 1000;

        const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % sponsors.length);
        }, duration);

        return () => clearTimeout(timer);
    }, [currentIndex, sponsors, fallbackDuration]);

    if (loading || sponsors.length === 0) return null;

    return (
        <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={sponsors[currentIndex].id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: -20 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    className="w-full h-full flex items-center justify-center p-4"
                >
                    <img
                        src={sponsors[currentIndex].url}
                        alt={sponsors[currentIndex].name}
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        style={{ maxHeight: '100%' }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Optional Premium Progress Bar */}
            {sponsors.length > 1 && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                    <motion.div
                        key={`progress-${currentIndex}-${sponsors[currentIndex].id}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: sponsors[currentIndex].duration_seconds || fallbackDuration,
                            ease: "linear"
                        }}
                        className="h-full bg-padel-primary shadow-[0_0_10px_#ccff00]"
                    />
                </div>
            )}

            {/* Elegant Badge (Optional) */}
            <div className="absolute top-2 right-4 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-padel-primary animate-pulse" />
                <span className="text-[8px] font-black text-white/50 uppercase tracking-widest italic">Sponsor</span>
            </div>
        </div>
    );
}
