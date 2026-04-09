'use client';

import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { RefreshCw } from 'lucide-react';

export default function AdsDisplayPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentAdIdx, setCurrentAdIdx] = useState(0);

    useEffect(() => {
        const loadAds = async () => {
            try {
                const fetchedAds = (await dataService.getAds()) as any[];
                // We filter ads to only include active ones
                setAds(fetchedAds.filter((ad: any) => ad.active));
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };
        loadAds();
    }, []);

    if (loading) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
                <RefreshCw className="w-12 h-12 text-padel-primary animate-spin" />
                <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Cargando Publicidad...</p>
            </div>
        );
    }

    if (ads.length === 0) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                    SMART <span className="text-padel-primary">PADEL</span>
                </h1>
                <p className="text-gray-500 mt-4 uppercase tracking-widest text-xs">No hay publicidad activa</p>
                <div className="mt-8 flex items-center justify-center gap-2 text-padel-primary/20 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-current" />
                    <span className="font-black uppercase tracking-widest text-[10px]">Esperando Contenido...</span>
                </div>
            </div>
        );
    }

    const currentAd = ads[currentAdIdx];

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative">
            {currentAd.type === 'video' ? (
                <video
                    key={currentAd.id}
                    src={currentAd.imageUrl}
                    autoPlay
                    muted
                    onEnded={() => setCurrentAdIdx((prev) => (prev + 1) % ads.length)}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div
                    className="w-full h-full bg-center bg-contain bg-no-repeat transition-all duration-1000"
                    style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
                />
            )}

            {/* Auto-cycle images based on custom duration */}
            {currentAd.type !== 'video' && (
                <AutoCycle
                    duration={currentAd.duration || 10}
                    onCycle={() => setCurrentAdIdx((prev) => (prev + 1) % ads.length)}
                />
            )}

            {/* Premium Branding Overlay */}
            <div className="absolute top-10 right-10 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10">
                <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: currentAd.themeColor || '#ccff00' }}
                />
                <span className="text-sm font-black uppercase italic tracking-[0.3em] text-white">Publicidad Smart Padel</span>
            </div>

            <div className="absolute bottom-10 left-10">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white/20">
                    SMART <span style={{ color: `${currentAd.themeColor || '#ccff00'}33` }}>PADEL</span>
                </h1>
            </div>
        </div>
    );
}

function AutoCycle({ onCycle, duration }: { onCycle: () => void; duration: number }) {
    useEffect(() => {
        const timer = setTimeout(onCycle, duration * 1000);
        return () => clearTimeout(timer);
    }, [onCycle, duration]);
    return null;
}
