'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { BackButton } from '@/components/BackButton';
import {
    LegalContainer,
    type LegalAcceptPayload,
    type LegalContainerRef,
} from '@/components/legal/LegalContainer';
import LegalModal from '@/components/legal/LegalModal';
import PaymentInfo from '@/components/PaymentInfo';
import AutoShrinkName from '@/components/AutoShrinkName';
import { validatePaymentAgainstCategoryPrice } from '@/lib/paymentValidation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { SMART_CONSENT_LEGAL_VERSION, SMART_CONSENT_STATUS_ACCEPTED } from '@/lib/legal/smartConsent';
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Loader2,
    AlertCircle,
    CreditCard,
    Landmark,
    Calendar as CalendarIcon,
    Hash,
    DollarSign,
    Camera,
    Upload,
    X,
    Smartphone,
    Building2,
    Coins,
    Wallet,
    Bitcoin,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    Search,
    RefreshCw,
    Check
} from 'lucide-react';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { TournamentType } from '@/types/tournament';

/** Categorías de inscripción que el organizador puede configurar en el torneo (tournament.inscriptionCategories). */
export type InscriptionCategoryOption = {
    key: string;
    name: string;
    price: number;
    gender?: 'MALE' | 'FEMALE' | 'MIXED';
    /** Edad mínima (años cumplidos) para inscribirse en esta categoría. Opcional. */
    ageMin?: number;
    /** Edad máxima (años cumplidos) para inscribirse en esta categoría. Opcional. */
    ageMax?: number;
    /** Cupo máximo de inscritos en esta categoría. Opcional; si no se define, sin límite. */
    maxSlots?: number;
};

/** Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD o ISO). */
function getAgeFromBirthDate(birthDate: string | null | undefined): number | null {
    if (!birthDate || !birthDate.trim()) return null;
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age >= 0 ? age : null;
}

function filterEligibleCategories(
    categories: InscriptionCategoryOption[],
    playerGender: 'MALE' | 'FEMALE' | null | undefined,
    playerAge: number | null
): InscriptionCategoryOption[] {
    return categories.filter((cat) => {
        const genderOk =
            !cat.gender ||
            cat.gender === 'MIXED' ||
            (playerGender != null && cat.gender === playerGender);
        if (!genderOk) return false;
        if (cat.ageMin == null && cat.ageMax == null) return true;
        if (playerAge == null) return false;
        const min = cat.ageMin ?? 0;
        const max = cat.ageMax ?? 999;
        return playerAge >= min && playerAge <= max;
    });
}

function getCurrency(method: string): string {
    const m = (method || '').toLowerCase();
    if (m.includes('zelle') || m.includes('binance') || m.includes('bitcoin') || m.includes('dollar') || m.includes('dólar')) {
        return '$';
    }
    return 'Bs.';
}

const VENEZUELAN_BANKS = [
    { code: '0102', name: 'Banco de Venezuela' },
    { code: '0105', name: 'Banco Mercantil' },
    { code: '0108', name: 'BBVA Provincial' },
    { code: '0114', name: 'Bancaribe' },
    { code: '0115', name: 'Banco Exterior' },
    { code: '0128', name: 'Banco Caroní' },
    { code: '0134', name: 'Banesco' },
    { code: '0137', name: 'Banco Sofitasa' },
    { code: '0138', name: 'Banco Plaza' },
    { code: '0151', name: 'BFC Banco Fondo Común' },
    { code: '0156', name: '100% Banco' },
    { code: '0157', name: 'DelSur Banco Universal' },
    { code: '0163', name: 'Banco del Tesoro' },
    { code: '0166', name: 'Banco Agrícola de Venezuela' },
    { code: '0168', name: 'Bancrecer' },
    { code: '0169', name: 'Mi Banco' },
    { code: '0171', name: 'Banco Activo' },
    { code: '0172', name: 'Bancamiga' },
    { code: '0174', name: 'Banplus' },
    { code: '0175', name: 'Banco Bicentenario' },
    { code: '0177', name: 'BANFANB' },
    { code: '0191', name: 'BNC Banco Nacional de Crédito' },
];

export default function InscribirmePage() {
    const tournamentId = useRouteSegment('id');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [smartConsentAccepted, setSmartConsentAccepted] = useState(false);
    const [smartConsentModalOpen, setSmartConsentModalOpen] = useState(false);
    const [smartConsentSaving, setSmartConsentSaving] = useState(false);
    const [legalArtifacts, setLegalArtifacts] = useState<{
        signaturePath: string | null;
        biometricPath: string | null;
        version: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [playerProfile, setPlayerProfile] = useState<{ gender?: 'MALE' | 'FEMALE'; birthDate?: string } | null>(null);
    const [inscriptionCountByCategory, setInscriptionCountByCategory] = useState<Record<string, number>>({});
    const [paymentData, setPaymentData] = useState({
        method: '',
        bank: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        reference: '',
        receiptUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [availableMethods, setAvailableMethods] = useState<any[]>([]);

    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const is1600OrLater = now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() >= 0);
    const registrationStatus = tournament?.registrationStatus || 'open';
    const isIndividual = tournament?.type === TournamentType.AMERICANO_INDIVIDUAL;
    const inscriptionClosed = registrationStatus === 'closed' || (tournament?.startDate && (tournament.startDate < todayStr || (tournament.startDate === todayStr && is1600OrLater)));

    // Partner search state (puede venir de URL ?code= cuando se llega desde Hub / compañeros recientes)
    const codeFromUrl = searchParams.get('code') ?? '';
    const [partnerCode, setPartnerCode] = useState<string>(codeFromUrl.length === 6 ? codeFromUrl : '');
    const [searchingPartner, setSearchingPartner] = useState(false);
    const [foundPartner, setFoundPartner] = useState<any>(null);
    const [partnerError, setPartnerError] = useState<string | null>(null);
    const [showPartnerConfirm, setShowPartnerConfirm] = useState(false);
    const [pendingInvitation, setPendingInvitation] = useState<any | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');
    /** Asistente por pasos antes de «Inscripción enviada». */
    const [wizardStep, setWizardStep] = useState(0);
    /** Un solo scroll (contenedor principal); no hay región interna fija + scroll. */
    const inscribirmeScrollRef = useRef<HTMLDivElement>(null);
    const legalInscriptionRef = useRef<LegalContainerRef | null>(null);

    // Retorno de Mercado Pago (mp=success | failure | pending)
    useEffect(() => {
        const mp = searchParams.get('mp');
        if (!mp) return;
        if (mp === 'success') {
            setSuccess(true);
            router.replace(`/tournaments/${tournamentId}/inscribirme`, { scroll: false });
        } else if (mp === 'failure') {
            setError('El pago fue rechazado o cancelado. Tu inscripción quedó pendiente; puedes volver a intentar el pago desde Validación de pagos.');
            router.replace(`/tournaments/${tournamentId}/inscribirme`, { scroll: false });
        } else if (mp === 'pending') {
            setSuccess(true);
            setError(null);
            router.replace(`/tournaments/${tournamentId}/inscribirme`, { scroll: false });
        }
    }, [searchParams, tournamentId, router]);

    // Sincronizar código de pareja desde URL (cuando se llega desde Hub / compañeros recientes)
    useEffect(() => {
        if (codeFromUrl.length === 6 && codeFromUrl !== partnerCode) {
            setPartnerCode(codeFromUrl);
        }
    }, [codeFromUrl]);

    // Auto-search partner when code is 6 chars
    useEffect(() => {
        if (partnerCode.length === 6 && !foundPartner && !searchingPartner) {
            handlePartnerSearch();
        }
    }, [partnerCode]);

    useEffect(() => {
        if (!tournamentId || authLoading) return;
        let cancelled = false;
        dataService.getTournament(tournamentId).then((t) => {
            if (!cancelled) {
                setTournament(t);
                setLoading(false);
            }
        }).catch(() => {
            if (!cancelled) {
                setLoading(false);
                setError('No se pudo cargar el torneo.');
            }
        });
        return () => { cancelled = true; };
    }, [tournamentId, authLoading]);

    useEffect(() => {
        if (!user?.uid) return;
        let cancelled = false;
        dataService.getMyParticipants(user.uid).then((list) => {
            if (cancelled) return;
            const first = list?.[0];
            if (first) {
                const gender = first.gender === 'MALE' || first.gender === 'FEMALE' ? first.gender : undefined;
                const birthDate = typeof first.birthDate === 'string' ? first.birthDate : undefined;
                setPlayerProfile({ gender, birthDate });
            } else {
                setPlayerProfile(null);
            }
        }).catch(() => {
            if (!cancelled) setPlayerProfile(null);
        });
        return () => { cancelled = true; };
    }, [user?.uid]);

    // Smart Consent: si el usuario ya aceptó, precargamos el checkbox.
    useEffect(() => {
        const ok = profile?.status_legal === 'accepted' || profile?.statusLegal === 'accepted';
        if (ok) setSmartConsentAccepted(true);
    }, [profile?.status_legal, profile?.statusLegal]);

    useEffect(() => {
        if (!tournamentId) return;
        let cancelled = false;

        async function loadCounts() {
            try {
                // Si el torneo tiene categorías, cargamos el cupo real (ocupado + pendiente no expirado)
                if (tournament?.inscriptionCategories?.length) {
                    const counts: Record<string, number> = {};
                    for (const cat of tournament.inscriptionCategories) {
                        const count = await dataService.getOccupiedSlots(tournamentId, cat.key);
                        counts[cat.key] = count;
                    }
                    if (!cancelled) setInscriptionCountByCategory(counts);
                } else {
                    // Fallback antiguo si no hay categorías definidas formalmente
                    const list = await dataService.getInscriptionsByTournament(tournamentId);
                    if (cancelled) return;
                    const counts: Record<string, number> = {};
                    (list || []).forEach((ins) => {
                        const k = ins.categoryKey ?? '';
                        counts[k] = (counts[k] ?? 0) + 1;
                    });
                    if (!cancelled) setInscriptionCountByCategory(counts);
                }
            } catch (err) {
                console.error("Error loading slot counts:", err);
            }
        }

        loadCounts();
        return () => { cancelled = true; };
    }, [tournamentId, tournament?.inscriptionCategories]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?from=inscribirme');
        }
    }, [user, authLoading, router]);

    // Consultar si yo envié alguna invitación pendiente en este torneo
    useEffect(() => {
        if (!user?.uid || !tournamentId) return;
        dataService.getSentInvitations(tournamentId, user.uid).then(invs => {
            if (invs.length > 0) {
                setPendingInvitation(invs[0]);
            }
        });
    }, [user?.uid, tournamentId]);

    // Timer para el countdown de la reserva
    useEffect(() => {
        if (!pendingInvitation?.expires_at) return;

        const interval = setInterval(() => {
            const now = new Date();
            const expiry = new Date(pendingInvitation.expires_at);
            const diff = expiry.getTime() - now.getTime();

            if (diff <= 0) {
                setPendingInvitation(null);
                clearInterval(interval);
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [pendingInvitation]);

    useEffect(() => {
        let cancelled = false;
        async function fetchPaymentMethods() {
            try {
                const methods = await dataService.getPaymentMethods();
                if (!cancelled && methods && methods.length > 0) {
                    setAvailableMethods(methods);
                    setPaymentData(prev => ({ ...prev, method: methods[0].name }));
                }
            } catch (error) {
                console.error("Error fetching payment methods:", error);
            }
        }
        fetchPaymentMethods();
        return () => { cancelled = true; };
    }, []);

    const categories: InscriptionCategoryOption[] = (Array.isArray(tournament?.inscriptionCategories) && tournament.inscriptionCategories.length > 0)
        ? tournament.inscriptionCategories
        : (tournament ? [{
            key: 'GENERAL',
            name: `${tournament.category || 'Categoría Única'} ${tournament.gender === 'MALE' ? 'Masculino' : tournament.gender === 'FEMALE' ? 'Femenino' : 'Mixto'}`,
            price: tournament.inscriptionPrice || 0,
            gender: tournament.gender || undefined,
        }] : []);

    const playerAge = getAgeFromBirthDate(playerProfile?.birthDate);
    const eligibleCategories = filterEligibleCategories(
        categories,
        playerProfile?.gender ?? null,
        playerAge
    );
    const isCategoryFull = (cat: InscriptionCategoryOption) => {
        if (cat.maxSlots == null) return false;
        const count = inscriptionCountByCategory[cat.key] ?? 0;
        return count >= cat.maxSlots;
    };
    const availableCategories = eligibleCategories.filter((cat) => !isCategoryFull(cat));
    const needsProfileForEligibility =
        categories.length > 0 &&
        eligibleCategories.length === 0 &&
        (playerProfile == null || !playerProfile.gender || !playerProfile.birthDate);

    const toggleCategory = (key: string) => {
        const cat = eligibleCategories.find((c) => c.key === key);
        if (cat && isCategoryFull(cat)) return;
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            const path = `inscriptions/receipts/${user.uid}_${Date.now()}_${file.name}`;
            const url = await dataService.uploadFile(file, path, 'inscripciones');
            setPaymentData(prev => ({ ...prev, receiptUrl: url }));
        } catch (err: any) {
            setError('Error al subir el comprobante: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePartnerSearch = async (): Promise<boolean> => {
        if (partnerCode.length !== 6) {
            setPartnerError('El código debe ser de 6 dígitos.');
            return false;
        }

        // Llave maestra de pruebas: permite continuar el flujo sin validar jugador real
        if (partnerCode === '999999') {
            setFoundPartner({
                id: null,
                name: 'Compañero Demo',
                email: 'demo@smartpadel.local',
            });
            setPartnerError(null);
            return true;
        }

        setSearchingPartner(true);
        setPartnerError(null);
        setFoundPartner(null);

        try {
            const profile = await dataService.getUserByUniqueCode(partnerCode);
            if (profile) {
                if (profile.id === user?.uid) {
                    setPartnerError('No puedes invitarte a ti mismo.');
                    return false;
                }
                setFoundPartner(profile);
                return true;
            }
            setPartnerError('Jugador no encontrado. Verifique el código.');
            return false;
        } catch (err) {
            setPartnerError('Error al buscar el jugador.');
            console.error(err);
            return false;
        } finally {
            setSearchingPartner(false);
        }
    };

    const totalPrice = Array.from(selectedCategories).reduce((acc, key) => {
        const cat = categories.find(c => c.key === key);
        return acc + (cat?.price || 0);
    }, 0);

    /** Paso final: términos + enviar (índice 3 si hay pago, 2 si es gratis). */
    const termsStepIndex = totalPrice > 0 ? 3 : 2;

    useEffect(() => {
        setWizardStep((prev) => Math.min(prev, termsStepIndex));
    }, [termsStepIndex]);

    useEffect(() => {
        inscribirmeScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [wizardStep]);

    useEffect(() => {
        if (selectedCategories.size === 0) setWizardStep(0);
    }, [selectedCategories.size]);

    const prevWizardForLegal = useRef(wizardStep);
    useEffect(() => {
        if (wizardStep === termsStepIndex && prevWizardForLegal.current !== termsStepIndex) {
            setAcceptTerms(false);
            setLegalArtifacts(null);
        }
        prevWizardForLegal.current = wizardStep;
    }, [wizardStep, termsStepIndex]);

    const handleWizardNext = async () => {
        setError(null);
        if (wizardStep === 0) {
            if (selectedCategories.size === 0) {
                setError('Selecciona al menos una categoría.');
                return;
            }
            if (isIndividual) {
                setWizardStep(2); // Saltar paso de pareja
            } else {
                setWizardStep(1);
            }
            return;
        }
        if (wizardStep === 1) {
            let ok = !!foundPartner;
            if (!ok && partnerCode.length === 6) {
                ok = await handlePartnerSearch();
            }
            if (!ok) {
                setError('Debes buscar y confirmar a tu pareja usando su código de 6 dígitos.');
                return;
            }
            setWizardStep(2);
            return;
        }
        if (wizardStep === 2 && totalPrice > 0) {
            setWizardStep(3);
        }
    };

    const handleWizardPrev = () => {
        setError(null);
        if (wizardStep === 2 && isIndividual) {
            setWizardStep(0);
        } else {
            setWizardStep((s) => Math.max(0, s - 1));
        }
    };

    const showWizardNext =
        wizardStep === 0 ||
        wizardStep === 1 ||
        (wizardStep === 2 && totalPrice > 0);

    const handleSubmit = async () => {
        if (!tournament) return;
        if (!user?.uid) {
            setError('Debes iniciar sesión para inscribirte. Si ya iniciaste, recarga la página e intenta de nuevo.');
            return;
        }
        if (selectedCategories.size === 0) {
            setError('Selecciona al menos una categoría.');
            return;
        }
        const eligibleKeys = new Set(eligibleCategories.map((c) => c.key));
        const invalidKeys = [...selectedCategories].filter((k) => !eligibleKeys.has(k));
        if (invalidKeys.length > 0) {
            setError('Algunas categorías seleccionadas no son válidas para tu perfil (edad o sexo). Desmárcalas e intenta de nuevo.');
            return;
        }
        const fullKeys = eligibleCategories.filter((c) => isCategoryFull(c)).map((c) => c.key);
        const selectedFull = [...selectedCategories].filter((k) => fullKeys.includes(k));
        if (selectedFull.length > 0) {
            setError('Una o más categorías ya están completas. Desmárcalas e intenta de nuevo.');
            return;
        }

        // Auto-search one last time if code is present but no partner found
        let currentPartner = foundPartner;
        if (selectedCategories.size > 0 && !currentPartner && partnerCode.length === 6) {
            setError('Buscando pareja...');
            try {
                const profile = await dataService.getUserByUniqueCode(partnerCode);
                if (profile && profile.id !== user.uid) {
                    currentPartner = profile;
                    setFoundPartner(profile);
                }
            } catch (err) {
                // Ignore silent error here, will be caught by !foundPartner check below
            }
        }

        if (!isIndividual && selectedCategories.size > 0 && !currentPartner) {
            setError(partnerError || 'Debes buscar y confirmar a tu pareja usando su código de 6 dígitos.');
            return;
        }

        let fromPad: LegalAcceptPayload | null = null;
        try {
            fromPad = (await legalInscriptionRef.current?.submitSignature()) ?? null;
        } catch (e: any) {
            setError(e?.message || 'Error al guardar la firma o el consentimiento legal.');
            return;
        }
        const effectiveLegal =
            fromPad != null
                ? {
                      signaturePath: fromPad.signaturePath,
                      biometricPath: fromPad.biometricPath,
                      version: fromPad.version,
                  }
                : legalArtifacts;
        if (!effectiveLegal) {
            setError('Debes completar firmar digitalmente o la validación facial, y aceptar el contrato (Smart Consent), antes de inscribirte.');
            return;
        }
        if (!fromPad && !smartConsentAccepted) {
            setError('Debes aceptar el Contrato de Adhesión (Smart Consent) antes de inscribirte.');
            return;
        }

        const needsRef = totalPrice > 0 && (paymentData.method === 'Pago Móvil' || paymentData.method === 'Transferencia Bancaria');
        if (needsRef && !paymentData.reference?.trim()) {
            setError('Indica la referencia o número de confirmación del pago (aparece en tu comprobante de Pago Móvil o transferencia).');
            return;
        }

        setError(null);
        setSubmitting(true);
        const isMercadoPago = paymentData.method === 'Mercado Pago';

        try {
            const participantName = profile?.name || user.displayName || user.email || 'Jugador';
            const participantEmail = user.email || undefined;
            const myParticipants = await dataService.getMyParticipants(user.uid);
            const participantRecord = myParticipants?.[0];
            const participantId = participantRecord?.id ?? undefined;

            const createdInscriptionIds: string[] = [];

            for (const key of selectedCategories) {
                const cat = categories.find((c) => c.key === key);
                if (!cat) continue;

                const amountPaid = paymentData.amount ? parseFloat(String(paymentData.amount).replace(',', '.')) : undefined;
                const verification = !isMercadoPago && cat.price > 0 && amountPaid != null
                    ? validatePaymentAgainstCategoryPrice({ amountExtracted: amountPaid, categoryPrice: cat.price })
                    : cat.price === 0 ? { paymentStatus: 'paid' as const, alertMessage: null } : { paymentStatus: 'pending' as const, alertMessage: null };

                const { id: inscriptionId } = await dataService.addInscription(
                    {
                        tournamentId,
                        tournamentName: tournament.name,
                        categoryKey: cat.key,
                        categoryPrice: cat.price,
                        participantName,
                        participantEmail,
                        participantId,
                        paymentStatus: isMercadoPago ? 'pending' : (cat.price === 0 ? 'paid' : verification.paymentStatus),
                        alertMessage: verification.alertMessage || undefined,
                        paymentMethod: paymentData.method,
                        paymentBank: paymentData.bank,
                        paymentDate: paymentData.date,
                        paymentAmount: amountPaid,
                        paymentReference: paymentData.reference,
                        receiptUrl: paymentData.receiptUrl || undefined,
                        partnerId: currentPartner?.id,
                        partnerName: currentPartner?.name,
                        legalSignaturePath: effectiveLegal.signaturePath,
                        legalBiometricPath: effectiveLegal.biometricPath,
                        acceptedTermsVersion: effectiveLegal.version,
                    },
                    user.uid
                );
                createdInscriptionIds.push(inscriptionId);

                if (!isIndividual && currentPartner?.id && !isMercadoPago) {
                    try {
                        await dataService.setInscriptionAwaitingPartnerConfirmation(
                            inscriptionId,
                            currentPartner.id
                        );
                    } catch (markErr) {
                        console.error('No se pudo marcar la inscripción para confirmación del compañero:', markErr);
                    }
                }

                if (isMercadoPago) continue;

                // Sincronizar equipos del torneo (solo si no es Mercado Pago; con MP el webhook lo hará al aprobar)
                // Se guarda el id del equipo del torneo para enlazarlo con la invitación (código del compañero)
                let tournamentTeamId: string | null = null;
                if (participantId) {
                    const participantInfo = {
                        id: participantId,
                        name: participantRecord?.name || participantName,
                        lastName: participantRecord?.lastName || '',
                    };

                    let partnerInfo: { id: string; name: string; lastName?: string } | null = null;
                    if (currentPartner && currentPartner.id) {
                        partnerInfo = {
                            id: currentPartner.id,
                            name: currentPartner.name,
                            lastName: (currentPartner as any).lastName || '',
                        };
                    }

                    try {
                        tournamentTeamId = await dataService.syncTeamsFromInscription(
                            tournamentId,
                            participantInfo,
                            partnerInfo
                        );
                    } catch (syncErr) {
                        console.error('Error syncing teams from inscription:', syncErr);
                    }
                }

                // Also create a team record/invitation (solo si el compañero tiene id real), enlazando el equipo del torneo
                if (!isIndividual && currentPartner && currentPartner.id) {
                    const inv = await dataService.createTeamInvitation(
                        tournamentId,
                        cat.key,
                        user.uid,
                        currentPartner.id,
                        tournamentTeamId ?? undefined
                    );
                    setPendingInvitation({
                        ...inv,
                        partner_name: currentPartner.name
                    });
                }
            }

            // --- Pago con Mercado Pago: redirigir al checkout ---
            if (isMercadoPago && createdInscriptionIds.length > 0 && totalPrice > 0) {
                try {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    const res = await fetch('/api/mercadopago/create-preference', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            inscriptionIds: createdInscriptionIds,
                            amount: totalPrice,
                            title: `Inscripción: ${tournament.name}`,
                            payerEmail: participantEmail,
                            tournamentId,
                            baseUrl,
                            successUrl: `${baseUrl}/tournaments/${tournamentId}/inscribirme?mp=success`,
                            failureUrl: `${baseUrl}/tournaments/${tournamentId}/inscribirme?mp=failure`,
                            pendingUrl: `${baseUrl}/tournaments/${tournamentId}/inscribirme?mp=pending`,
                        }),
                    });
                    const data = await res.json();
                    if (data.initPoint) {
                        window.location.href = data.initPoint;
                        return;
                    }
                    setError(data.error || 'No se pudo abrir el pago con Mercado Pago.');
                } catch (mpErr: any) {
                    setError(mpErr?.message || 'Error al conectar con Mercado Pago.');
                } finally {
                    setSubmitting(false);
                }
                return;
            }

            // --- EMAIL NOTIFICATION (aviso al club) ---
            try {
                const selectedCatNames = categories
                    .filter(c => selectedCategories.has(c.key))
                    .map(c => c.name)
                    .join(', ');
                const baseUrl =
                    typeof window !== 'undefined'
                        ? window.location.origin
                        : process.env.NEXT_PUBLIC_APP_URL || '';

                const emailRes = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'NEW_INSCRIPTION',
                        data: {
                            participantName: profile?.name || user.displayName || user.email || 'Jugador',
                            participantEmail: user.email || undefined,
                            tournamentName: tournament.name,
                            categoryName: selectedCatNames,
                            amount: paymentData.amount || '0',
                            paymentMethod: paymentData.method || 'No especificado',
                            paymentReference: paymentData.reference || 'N/A',
                            receiptUrl: paymentData.receiptUrl || undefined,
                            tournamentUrl: baseUrl ? `${baseUrl}/tournaments/${tournamentId}` : undefined
                        }
                    })
                });
                if (!emailRes.ok) {
                    const err = await emailRes.json().catch(() => ({}));
                    console.warn('Aviso por email (inscripción) no enviado:', err?.error || emailRes.statusText);
                }
            } catch (emailError) {
                console.error('Error sending inscription notification email:', emailError);
            }

            setSuccess(true);
        } catch (e: any) {
            setError(e?.message || 'Error al registrar la inscripción.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleProfileClick = async () => {
        if (!user?.uid) {
            router.push('/login');
            return;
        }
        const participants = await dataService.getMyParticipants(user.uid);
        if (participants.length > 0) {
            router.push('/mi-cuenta');
        } else {
            router.push('/players/register');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="ipad-screen-container bg-[#0a0a0a] text-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="ipad-screen-container !max-w-none !px-0 !pt-2 !pb-0 sm:!px-4 sm:!pt-4 sm:!pb-0 md:!p-6 bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar menuOpensUserHub={!!pendingInvitation} />
            <div
                ref={inscribirmeScrollRef}
                className="ipad-scroll-area flex min-h-0 w-full min-w-0 max-w-[100vw] flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:pl-4 sm:pr-4 md:pl-24 md:pr-4"
            >
                <header className="z-10 shrink-0 border-b border-white/10 bg-[#0a0a0a]/95 pb-3 pt-[max(5.25rem,calc(env(safe-area-inset-top,0px)+4.25rem))] backdrop-blur sm:pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
                    {/* Móvil: debajo del menú hamburguesa fijo; sm+: una sola fila */}
                    <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-2 px-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-1 sm:pt-0">
                        <BackButton href={`/tournaments/${tournamentId}`} className="shrink-0 self-start sm:self-center" />
                        <h1 className="min-w-0 w-full text-center text-base font-black uppercase italic tracking-tighter sm:flex-1 sm:text-lg">
                            Inscribirme
                        </h1>
                        <div className="hidden w-10 shrink-0 sm:block" aria-hidden />
                    </div>
                </header>

                <main className="mx-auto flex w-full min-w-0 max-w-md shrink-0 flex-col px-3 py-4 sm:px-4 sm:py-6">
                    {success ? (
                        <div className="rounded-3xl bg-[#ccff00]/10 border border-[#ccff00]/30 p-8 text-center space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-[#ccff00] mx-auto" />
                            <h2 className="text-xl font-black uppercase">Inscripción enviada</h2>
                            <p className="text-sm text-gray-400">
                                Te has inscrito en {selectedCategories.size} categoría(s). El organizador validará el pago si aplica.
                            </p>
                            <Link
                                href={`/tournaments/${tournamentId}`}
                                className="inline-block px-6 py-3 bg-[#ccff00] text-black font-black rounded-2xl uppercase text-sm"
                            >
                                Volver al torneo
                            </Link>
                        </div>
                    ) : inscriptionClosed ? (
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-8 text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                            <h2 className="text-lg font-black uppercase">Inscripciones cerradas</h2>
                            <p className="text-sm text-gray-400">
                                Las inscripciones cierran a las 16:00 del día del evento. Ya no es posible inscribirse en este torneo.
                            </p>
                            <Link
                                href={`/tournaments/${tournamentId}`}
                                className="inline-block mt-4 px-6 py-3 bg-[#ccff00] text-black font-black rounded-2xl uppercase text-sm"
                            >
                                Volver al torneo
                            </Link>
                        </div>
                    ) : pendingInvitation ? (
                        /* VISTA JUGADOR A: INVITACIÓN PENDIENTE */
                        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                                <RefreshCw className="w-10 h-10 text-amber-500 animate-[spin_3s_linear_infinite]" />
                            </div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter text-amber-400">Invitación pendiente</h2>
                            <p className="text-gray-400 text-sm">
                                Has invitado a <span className="text-white font-bold">{pendingInvitation.partner_name}</span>.
                                Cuando acepte, el equipo quedará <strong className="text-white">confirmado</strong> y se asignará automáticamente a un grupo del torneo.
                            </p>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">Tu lugar se liberará en:</p>
                                <p className="text-4xl font-mono font-black text-[#ccff00]">{timeLeft || '00:00'}</p>
                            </div>
                            <p className="text-[10px] text-amber-500 uppercase font-black tracking-widest px-4">
                                Tienes un lugar reservado por 2 horas para asegurar tu cupo.
                            </p>
                            <Link
                                href={`/tournaments/${tournamentId}`}
                                className="block w-full py-4 rounded-2xl bg-white/10 text-white font-black uppercase text-sm"
                            >
                                Salir por ahora
                            </Link>
                        </div>
                    ) : (
                        <>
                            {tournament && (
                                <p className="text-sm text-gray-500 mb-6">
                                    {tournament.name}
                                </p>
                            )}

                            {categories.length === 0 ? (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        Este torneo no tiene categorías de inscripción configuradas. Contacta al organizador.
                                    </p>
                                    <Link href={`/tournaments/${tournamentId}`} className="mt-4 inline-block text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
) : needsProfileForEligibility ? (
                                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-300 text-sm font-bold mb-2">Completa tu ficha de jugador</p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Para inscribirte, necesitamos tu <strong>sexo</strong> y <strong>fecha de nacimiento</strong>. Así solo verás categorías que correspondan a tu perfil (edad y género).
                                    </p>
                                    <button
                                        onClick={handleProfileClick}
                                        className="inline-block px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-black text-sm uppercase"
                                    >
                                        Ir a Mis datos / Registrar jugador
                                    </button>
                                    <Link href={`/tournaments/${tournamentId}`} className="block mt-3 text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : eligibleCategories.length === 0 ? (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        No hay categorías disponibles para tu perfil (edad o sexo) en este torneo.
                                    </p>
                                    <Link href={`/tournaments/${tournamentId}`} className="mt-4 inline-block text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : availableCategories.length === 0 ? (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        Todas las categorías disponibles para tu perfil están completas (cupo lleno).
                                    </p>
                                    <Link href={`/tournaments/${tournamentId}`} className="mt-4 inline-block text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        Paso {(isIndividual && wizardStep >= 2) ? wizardStep : wizardStep + 1} de {isIndividual ? termsStepIndex : termsStepIndex + 1}
                                    </p>
                                    <div className="flex flex-col pr-0.5">
                                    {error && (
                                        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                                            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                                            <p className="text-sm text-red-200">{error}</p>
                                        </div>
                                    )}
                                    {wizardStep === 0 && (
                                    <section className="mb-8">
                                        <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-[#ccff00]">
                                            Elige una o varias categorías (según tu edad y sexo)
                                        </h2>
                                        <p className="mb-4 text-[11px] leading-snug text-gray-500 sm:text-[10px]">
                                            Solo se muestran categorías que corresponden a tu perfil. Puedes inscribirte en varias; el horario evitará choques.
                                        </p>
                                        <div className="space-y-3">
                                            {eligibleCategories.map((cat) => {
                                                const full = isCategoryFull(cat);
                                                const count = inscriptionCountByCategory[cat.key] ?? 0;
                                                const slotsLabel = cat.maxSlots != null ? ` ${count}/${cat.maxSlots} plazas` : '';
                                                return (
                                                    <label
                                                        key={cat.key}
                                                        className={`flex flex-col gap-3 rounded-2xl border p-3 transition-all sm:flex-row sm:items-start sm:justify-between sm:p-4 ${full ? 'cursor-not-allowed bg-white/5 opacity-70 border-white/5' : 'cursor-pointer'} ${
                                                            selectedCategories.has(cat.key)
                                                                ? 'border-[#ccff00]/40 bg-[#ccff00]/10'
                                                                : !full
                                                                  ? 'border-white/10 bg-white/5 hover:border-white/20'
                                                                  : ''
                                                        }`}
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.has(cat.key)}
                                                                onChange={() => toggleCategory(cat.key)}
                                                                disabled={full}
                                                                className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-[#ccff00] text-[#ccff00] focus:ring-[#ccff00] disabled:opacity-50"
                                                            />
                                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                                <span className={`block break-words text-sm font-bold leading-snug sm:text-base ${full ? 'text-gray-500' : ''}`}>
                                                                    {cat.name}
                                                                </span>
                                                                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase text-gray-500">
                                                                    {cat.gender && (
                                                                        <span>{cat.gender === 'MALE' ? 'Masc' : cat.gender === 'FEMALE' ? 'Fem' : 'Mixto'}</span>
                                                                    )}
                                                                    {(cat.ageMin != null || cat.ageMax != null) && (
                                                                        <span>
                                                                            ({cat.ageMin ?? '—'}–{cat.ageMax ?? '—'} años)
                                                                        </span>
                                                                    )}
                                                                    {full && <span className="font-bold text-amber-500">Completo</span>}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
                                                            {slotsLabel && (
                                                                <span className="text-[10px] text-gray-500">{slotsLabel}</span>
                                                            )}
                                                            {cat.price > 0 && (
                                                                <span className={`text-base font-black sm:text-sm ${full ? 'text-gray-500' : 'text-[#ccff00]'}`}>
                                                                    ${cat.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </section>
                                    )}

                                    {wizardStep === 1 && (
                                        <section className="mb-8 w-full min-w-0 max-w-full space-y-3 sm:space-y-4">
                                            <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-[#ccff00]">
                                                Datos del Compañero
                                            </h2>
                                            <div className="mb-2 min-w-0 sm:mb-4">
                                                <AutoShrinkName
                                                    name="Ingresa el código de 6 dígitos de tu pareja para completar el equipo."
                                                    style={{ fontSize: '11px' }}
                                                    className="text-gray-500 uppercase leading-relaxed [text-wrap:balance]"
                                                />
                                            </div>

                                            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                                                <div className="relative min-w-0 flex-1">
                                                    <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 sm:left-4">
                                                        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        inputMode="text"
                                                        autoCapitalize="characters"
                                                        autoCorrect="off"
                                                        spellCheck={false}
                                                        autoComplete="off"
                                                        value={partnerCode}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 6);
                                                            setPartnerCode(val);
                                                            if (foundPartner) setFoundPartner(null);
                                                            if (partnerError) setPartnerError(null);
                                                        }}
                                                        placeholder="Código (6)"
                                                        className="box-border w-full max-w-full min-h-[52px] rounded-2xl border border-white/10 bg-white/5 py-3 pl-[2.35rem] pr-2.5 text-center text-[clamp(1rem,5.5vw,1.25rem)] font-bold uppercase tracking-[0.06em] text-white outline-none transition-all focus:border-[#ccff00]/50 min-[400px]:tracking-[0.12em] sm:min-h-0 sm:px-4 sm:py-4 sm:pl-12 sm:text-left sm:text-sm sm:tracking-widest"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handlePartnerSearch}
                                                    disabled={searchingPartner || partnerCode.length !== 6}
                                                    className="min-h-[48px] w-full shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/10 disabled:opacity-50 sm:w-auto sm:min-h-0 sm:min-w-[7rem] sm:px-6 sm:py-4"
                                                >
                                                    {searchingPartner ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'BUSCAR'}
                                                </button>
                                            </div>

                                            {partnerError && (
                                                <div className="mt-1 flex items-start gap-1.5 text-[10px] font-bold uppercase text-red-500">
                                                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                                    <span className="min-w-0 break-words leading-snug">{partnerError}</span>
                                                </div>
                                            )}

                                            {foundPartner && (
                                                <div className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/10 p-4">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black uppercase tracking-tighter text-[#ccff00]">
                                                                Compañero confirmado
                                                            </p>
                                                            <p className="break-words font-bold text-white">{foundPartner.name}</p>
                                                            <p className="break-all text-[10px] text-gray-500">{foundPartner.email}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFoundPartner(null);
                                                                setPartnerCode('');
                                                            }}
                                                            className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-white/5 text-gray-400 hover:text-white sm:self-center"
                                                            aria-label="Quitar compañero"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {wizardStep === 2 && totalPrice > 0 && (
                                        <section className="mb-8 space-y-6">
                                            <div className="mb-8">
                                                        <PaymentInfo />
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                                                            <CreditCard className="w-5 h-5 text-[#ccff00]" />
                                                        </div>
                                                        <h2 className="text-lg font-black uppercase italic tracking-tighter">
                                                            Datos de Pago
                                                        </h2>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Metodo de Pago</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={paymentData.method}
                                                                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#ccff00]/50 transition-all appearance-none cursor-pointer"
                                                                >
                                                                    {availableMethods.length > 0 ? (
                                                                        availableMethods.map((m) => (
                                                                            <option key={m.id} value={m.name} className="bg-[#111]">
                                                                                {m.name}
                                                                            </option>
                                                                        ))
                                                                    ) : (
                                                                        <>
                                                                            <option value="Pago Móvil" className="bg-[#111]">Pago Móvil</option>
                                                                            <option value="Transferencia Bancaria" className="bg-[#111]">Transferencia Bancaria</option>
                                                                            <option value="Zelle" disabled className="bg-[#111] opacity-50">Zelle (Próximamente)</option>
                                                                        </>
                                                                    )}
                                                                </select>
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ccff00] pointer-events-none">
                                                                    <ChevronDown className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Banco Emisor</label>
                                                            <div className="relative">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                                                    <Landmark className="w-5 h-5" />
                                                                </div>
                                                                <select
                                                                    value={paymentData.bank}
                                                                    onChange={(e) => setPaymentData({ ...paymentData, bank: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-[#ccff00]/50 transition-all appearance-none cursor-pointer"
                                                                >
                                                                    <option value="" disabled className="bg-[#111]">Seleccione un banco</option>
                                                                    {VENEZUELAN_BANKS.map((bank) => (
                                                                        <option key={bank.code} value={`${bank.code} - ${bank.name}`} className="bg-[#111]">
                                                                            {bank.code} - {bank.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ccff00] pointer-events-none">
                                                                    <ChevronDown className="w-5 h-5" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Fecha del Pago</label>
                                                            <div className="relative">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                                    <CalendarIcon className="w-5 h-5" />
                                                                </div>
                                                                <input
                                                                    type="date"
                                                                    value={paymentData.date}
                                                                    onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-[#ccff00]/50 transition-all"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">
                                                                Monto Pagado ({getCurrency(paymentData.method)})
                                                            </label>
                                                            <div className="relative">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 flex items-center justify-center w-5 h-5 font-bold">
                                                                    {getCurrency(paymentData.method) === '$' ? (
                                                                        <DollarSign className="w-5 h-5" />
                                                                    ) : (
                                                                        <span className="text-[12px] font-black">Bs</span>
                                                                    )}
                                                                </div>
                                                                <input
                                                                    type="number"
                                                                    value={paymentData.amount}
                                                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                                                    placeholder={getCurrency(paymentData.method) === '$' ? (totalPrice > 0 ? totalPrice.toString() : "0.00") : "0.00"}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-[#ccff00]/50 transition-all"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Referencia / Confirmación {(paymentData.method === 'Pago Móvil' || paymentData.method === 'Transferencia Bancaria') && totalPrice > 0 && <span className="text-amber-400">*</span>}</label>
                                                            <div className="relative">
                                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                                    <Hash className="w-5 h-5" />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={paymentData.reference}
                                                                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                                                    placeholder={(paymentData.method === 'Pago Móvil' || paymentData.method === 'Transferencia Bancaria') ? 'Ej.: REF123456 o el número del comprobante' : 'Número de referencia'}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-[#ccff00]/50 transition-all"
                                                                />
                                                            </div>
                                                            {(paymentData.method === 'Pago Móvil' || paymentData.method === 'Transferencia Bancaria') && (
                                                                <p className="text-[10px] text-white/50 mt-1">El club conciliará tu pago con esta referencia. Cópiala tal cual del comprobante.</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Comprobante (Foto/Captura)</label>
                                                        <div className="relative">
                                                            {paymentData.receiptUrl ? (
                                                                <div className="relative rounded-2xl overflow-hidden border-2 border-[#ccff00]/30 aspect-video">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={paymentData.receiptUrl} alt="Comprobante" className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={() => setPaymentData({ ...paymentData, receiptUrl: '' })}
                                                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => document.getElementById('receipt-upload')?.click()}
                                                                        className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#ccff00]/30 transition-all gap-2"
                                                                        disabled={uploading}
                                                                    >
                                                                        {uploading ? (
                                                                            <Loader2 className="w-8 h-8 text-[#ccff00] animate-spin" />
                                                                        ) : (
                                                                            <>
                                                                                <Upload className="w-8 h-8 text-gray-500" />
                                                                                <span className="text-[10px] font-black uppercase text-gray-500">Subir Archivo</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <input
                                                                        id="receipt-upload"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={handleFileUpload}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                        </section>
                                    )}

                                    {wizardStep === 2 && totalPrice === 0 && (
                                        <section className="mb-8">
                                            <div className="rounded-2xl bg-[#ccff00]/5 border border-[#ccff00]/20 p-6 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="w-6 h-6 text-[#ccff00]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black uppercase text-sm">Inscripción gratuita</h3>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">No se requiere información de pago para esta categoría.</p>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {wizardStep === termsStepIndex && (
                                        <section className="mb-4 min-w-0">
                                            <div className="mb-6 rounded-2xl bg-white/5 p-4 border border-white/10">
                                                <div className="flex items-start gap-4">
                                                    <div 
                                                        onClick={() => {
                                                            if (!smartConsentAccepted) {
                                                                setSmartConsentModalOpen(true);
                                                            } else {
                                                                setSmartConsentAccepted(false);
                                                            }
                                                        }}
                                                        className={`mt-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 transition-all ${
                                                            smartConsentAccepted 
                                                                ? 'border-[#ccff00] bg-[#ccff00] text-black' 
                                                                : 'border-white/20 bg-transparent'
                                                        }`}
                                                    >
                                                        {smartConsentAccepted && <Check size={14} strokeWidth={4} />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium leading-relaxed text-white/80">
                                                            Confirmo que he leído y acepto los <span className="text-[#ccff00] underline font-bold cursor-pointer" onClick={() => setSmartConsentModalOpen(true)}>Términos y Condiciones</span> y la <span className="text-[#ccff00] underline font-bold cursor-pointer" onClick={() => setSmartConsentModalOpen(true)}>Política de Privacidad</span> de Padel Score Pro.
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSmartConsentModalOpen(true)}
                                                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#ccff00] border-2 border-[#ccff00] hover:bg-[#ccff00]/10 transition-all"
                                                        >
                                                            <FileText size={14} />
                                                            Ver contrato completo
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <LegalContainer
                                                ref={legalInscriptionRef}
                                                type="inscription"
                                                userId={user?.uid}
                                                className="border-[#ccff00]/25"
                                                showPrimaryButton={false}
                                                onAccept={async (p) => {
                                                    if (!user?.uid) return;
                                                    await dataService.updateProfileLegalAcceptance(user.uid, {
                                                        acceptedTermsVersion: p.version,
                                                        signaturePath: p.signaturePath,
                                                        biometricPhotoPath: p.biometricPath,
                                                    });
                                                    setLegalArtifacts({
                                                        signaturePath: p.signaturePath,
                                                        biometricPath: p.biometricPath,
                                                        version: p.version,
                                                    });
                                                    setAcceptTerms(true);
                                                    // Auto-accept smart consent when signing the inscription (direct client update)
                                                    if (!smartConsentAccepted && user?.uid) {
                                                        try {
                                                            const supabase = getSupabaseClient();
                                                            if (supabase) {
                                                                await supabase.from('profiles').update({
                                                                    status_legal: SMART_CONSENT_STATUS_ACCEPTED,
                                                                    legal_version: SMART_CONSENT_LEGAL_VERSION,
                                                                    legal_timestamp: new Date().toISOString(),
                                                                    updated_at: new Date().toISOString(),
                                                                }).eq('id', user.uid);
                                                            }
                                                            setSmartConsentAccepted(true);
                                                        } catch (e) {
                                                            console.error('Auto-accept error:', e);
                                                        }
                                                    }
                                                }}
                                            >
                                                <div className="text-center py-4">
                                                    <p className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                                                        Firma de Inscripción
                                                    </p>
                                                    <p className="mt-2 text-[10px] text-white/50">
                                                        Al firmar a continuación, confirmas tu inscripción y la aceptación de los términos visualizados anteriormente.
                                                    </p>
                                                </div>
                                            </LegalContainer>

                                            <LegalModal
                                                open={smartConsentModalOpen}
                                                onClose={() => setSmartConsentModalOpen(false)}
                                                loading={smartConsentSaving}
                                                footerMode="dismiss"
                                                onAccept={async () => {
                                                    if (!user?.uid) {
                                                        setError('Debes iniciar sesión para aceptar el contrato.');
                                                        return;
                                                    }
                                                    setSmartConsentSaving(true);
                                                    try {
                                                        // Direct Supabase client update — bypasses Bearer token / API route entirely
                                                        const supabase = getSupabaseClient();
                                                        if (!supabase) throw new Error('Cliente Supabase no disponible.');
                                                        const { error: sbError } = await supabase.from('profiles').update({
                                                            status_legal: SMART_CONSENT_STATUS_ACCEPTED,
                                                            legal_version: SMART_CONSENT_LEGAL_VERSION,
                                                            legal_timestamp: new Date().toISOString(),
                                                            updated_at: new Date().toISOString(),
                                                        }).eq('id', user.uid);
                                                        if (sbError) throw new Error(sbError.message);
                                                        setSmartConsentAccepted(true);
                                                        setSmartConsentModalOpen(false);
                                                        setError(null);
                                                        await refreshProfile();
                                                    } catch (err: any) {
                                                        setError(err?.message || 'Error al guardar el consentimiento.');
                                                    } finally {
                                                        setSmartConsentSaving(false);
                                                    }
                                                }}
                                            />
                                        </section>
                                    )}
                                    </div>

                                    <div className="mt-2 border-t border-white/10 bg-[#0a0a0a]/95 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                            {wizardStep > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleWizardPrev}
                                                    disabled={submitting}
                                                    className="order-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 py-3.5 text-sm font-black uppercase text-white transition hover:bg-white/5 disabled:opacity-50 sm:order-1 sm:w-auto sm:min-w-[140px]"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Atrás
                                                </button>
                                            )}
                                            <div className="order-1 flex w-full flex-col gap-2 sm:order-2 sm:ml-auto sm:flex-1 sm:flex-row sm:justify-end">
                                                {showWizardNext && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleWizardNext()}
                                                        disabled={submitting}
                                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ccff00] py-3.5 text-sm font-black uppercase text-black transition hover:bg-[#b8e600] disabled:opacity-50 sm:w-auto sm:min-w-[180px]"
                                                    >
                                                        Siguiente
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {wizardStep === termsStepIndex && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleSubmit()}
                                                        disabled={submitting || selectedCategories.size === 0}
                                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ccff00] py-3.5 text-sm font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
                                                    >
                                                        {submitting ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <>Inscribirme en {selectedCategories.size} categoría(s)</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
