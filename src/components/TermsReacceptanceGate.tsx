'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { isProfileTermsStale } from '@/lib/legal/termsVersion';
import { TermsReacceptanceOverlay } from '@/components/legal/TermsReacceptanceOverlay';

const PUBLIC_PATH_PREFIXES = ['/login', '/auth', '/confirmar'];

function shouldBypassTermsGate(pathname: string | null): boolean {
    if (!pathname) return true;
    return PUBLIC_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function TermsReacceptanceGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, profile, profileLoading, isAdmin } = useAuth();

    const resolvedAcceptedVersion =
        profile?.acceptedTermsVersion ??
        profile?.accepted_terms_version ??
        profile?.legalVersion ??
        profile?.legal_version ??
        null;

    useEffect(() => {
        if (user && !profileLoading) {
            const stale = isProfileTermsStale(resolvedAcceptedVersion);
            console.log('[TermsGate] User:', user.email, 'ProfileVersion:', resolvedAcceptedVersion, 'Stale:', stale);
        }
    }, [user, profileLoading, resolvedAcceptedVersion]);

    if (!user || profileLoading || shouldBypassTermsGate(pathname)) {
        return <>{children}</>;
    }

    // Administradores no deben ver el flujo de términos de inscripción / re-aceptación global.
    if (isAdmin) {
        return <>{children}</>;
    }

    const stale = isProfileTermsStale(resolvedAcceptedVersion);
    if (!stale) {
        return <>{children}</>;
    }

    return (
        <div className="relative min-h-dvh w-full">
            <div className="pointer-events-none min-h-dvh select-none opacity-[0.22] blur-[1px]">{children}</div>
            <TermsReacceptanceOverlay />
        </div>
    );
}
