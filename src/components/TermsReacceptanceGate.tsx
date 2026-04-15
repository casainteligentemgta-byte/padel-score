'use client';

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
    const { user, profile, profileLoading } = useAuth();

    if (!user || profileLoading || shouldBypassTermsGate(pathname)) {
        return <>{children}</>;
    }

    const stale = isProfileTermsStale(profile?.acceptedTermsVersion);
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
