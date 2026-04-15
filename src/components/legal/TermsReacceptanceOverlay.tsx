'use client';

import { LegalContainer } from '@/components/legal/LegalContainer';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';

export function TermsReacceptanceOverlay() {
    const { user, refreshProfile } = useAuth();
    const uid = user?.uid;

    return (
        <div
            className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0a0a0a] p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="smart-legal-title"
        >
            <div className="flex max-h-[min(92dvh,880px)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-[28px] border-2 border-[#ccff00]/40 shadow-[0_0_60px_rgba(204,255,0,0.12)]">
                <span id="smart-legal-title" className="sr-only">
                    Actualización de términos y condiciones
                </span>
                <LegalContainer
                    type="inscription"
                    userId={uid}
                    className="max-h-[min(92dvh,880px)] rounded-[26px] border-0"
                    onAccept={async (p) => {
                        if (!uid) return;
                        await dataService.updateProfileLegalAcceptance(uid, {
                            acceptedTermsVersion: p.version,
                            signaturePath: p.signaturePath,
                            biometricPhotoPath: p.biometricPath,
                        });
                        await refreshProfile();
                    }}
                />
            </div>
        </div>
    );
}
