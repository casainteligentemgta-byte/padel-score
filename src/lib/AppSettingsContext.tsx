'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataService, type AdminSettings } from './dataService';

const DEFAULTS = { appTitle: 'Smart Padel', clubName: 'El Bodeguero' };

type AppSettingsContextValue = {
    appTitle: string;
    clubName: string;
    timezone: string;
    loading: boolean;
    refresh: () => Promise<void>;
};

const AppSettingsContext = createContext<AppSettingsContextValue>({
    ...DEFAULTS,
    timezone: '',
    loading: true,
    refresh: async () => { },
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Partial<AdminSettings>>(DEFAULTS);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const timeout = new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
        try {
            const data = await Promise.race([dataService.getAdminSettings(), timeout]);
            setSettings({
                appTitle: data?.appTitle || DEFAULTS.appTitle,
                clubName: data?.clubName ?? DEFAULTS.clubName,
                timezone: data?.timezone ?? ''
            });
        } catch {
            setSettings(DEFAULTS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const fallback = setTimeout(() => setLoading(false), 6000);
        return () => clearTimeout(fallback);
    }, []);

    const value: AppSettingsContextValue = {
        appTitle: settings.appTitle ?? DEFAULTS.appTitle,
        clubName: settings.clubName ?? DEFAULTS.clubName,
        timezone: settings.timezone ?? '',
        loading,
        refresh: load
    };

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettings() {
    const ctx = useContext(AppSettingsContext);
    if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
    return ctx;
}
