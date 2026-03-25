'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { BackButton } from '@/components/BackButton';
import PaymentInfo from '@/components/PaymentInfo';
import AutoShrinkName from '@/components/AutoShrinkName';
import { validatePaymentAgainstCategoryPrice } from '@/lib/paymentValidation';
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
    ArrowRightLeft,
    ChevronDown,
    ChevronUp,
    Search,
    RefreshCw
} from 'lucide-react';
import { useRouteSegment } from '@/lib/useRouteSegment';

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
    const { user, profile, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [acceptTerms, setAcceptTerms] = useState(false);
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

    const handlePartnerSearch = async () => {
        if (partnerCode.length !== 6) {
            setPartnerError('El código debe ser de 6 dígitos.');
            return;
        }

        // Llave maestra de pruebas: permite continuar el flujo sin validar jugador real
        if (partnerCode === '999999') {
            setFoundPartner({
                id: null,
                name: 'Compañero Demo',
                email: 'demo@smartpadel.local',
            });
            setPartnerError(null);
            return;
        }

        setSearchingPartner(true);
        setPartnerError(null);
        setFoundPartner(null);

        try {
            const profile = await dataService.getUserByUniqueCode(partnerCode);
            if (profile) {
                if (profile.id === user?.uid) {
                    setPartnerError('No puedes invitarte a ti mismo.');
                } else {
                    setFoundPartner(profile);
                }
            } else {
                setPartnerError('Jugador no encontrado. Verifique el código.');
            }
        } catch (err) {
            setPartnerError('Error al buscar el jugador.');
            console.error(err);
        } finally {
            setSearchingPartner(false);
        }
    };

    const totalPrice = Array.from(selectedCategories).reduce((acc, key) => {
        const cat = categories.find(c => c.key === key);
        return acc + (cat?.price || 0);
    }, 0);

    const handleSubmit = async () => {
        if (!user?.uid || !tournament) return;
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

        if (selectedCategories.size > 0 && !currentPartner) {
            setError(partnerError || 'Debes buscar y confirmar a tu pareja usando su código de 6 dígitos.');
            return;
        }
        if (!acceptTerms) {
            setError('Debes aceptar los términos de inscripción.');
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
                        partnerName: currentPartner?.name
                    },
                    user.uid
                );
                createdInscriptionIds.push(inscriptionId);

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
                if (currentPartner && currentPartner.id) {
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
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />
            <div className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-24">
                <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10 py-4">
                    <div className="max-w-md mx-auto px-4 flex items-center justify-between">
                        <BackButton href={`/tournaments/${tournamentId}`} />
                        <h1 className="text-lg font-black italic uppercase tracking-tighter">Inscribirme</h1>
                        <div className="w-10" />
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-8">
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
                                <>
                                    <section className="mb-8">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-4">
                                            Elige una o varias categorías (según tu edad y sexo)
                                        </h2>
                                        <p className="text-[10px] text-gray-500 mb-4">
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
                                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${full ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-70' : 'cursor-pointer'
                                                            } ${selectedCategories.has(cat.key)
                                                                ? 'bg-[#ccff00]/10 border-[#ccff00]/40'
                                                                : !full ? 'bg-white/5 border-white/10 hover:border-white/20' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.has(cat.key)}
                                                                onChange={() => toggleCategory(cat.key)}
                                                                disabled={full}
                                                                className="w-5 h-5 rounded border-2 border-[#ccff00] text-[#ccff00] focus:ring-[#ccff00] disabled:opacity-50"
                                                            />
                                                            <span className={`font-bold ${full ? 'text-gray-500' : ''}`}>{cat.name}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1.5">
                                                                {cat.gender && (
                                                                    <span>{cat.gender === 'MALE' ? 'Masc' : cat.gender === 'FEMALE' ? 'Fem' : 'Mixto'}</span>
                                                                )}
                                                                {(cat.ageMin != null || cat.ageMax != null) && (
                                                                    <span>({cat.ageMin ?? '—'}–{cat.ageMax ?? '—'} años)</span>
                                                                )}
                                                                {full && <span className="text-amber-500 font-bold">Completo</span>}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {slotsLabel && (
                                                                <span className="text-[10px] text-gray-500">{slotsLabel}</span>
                                                            )}
                                                            {cat.price > 0 && (
                                                                <span className={`text-sm font-black ${full ? 'text-gray-500' : 'text-[#ccff00]'}`}>
                                                                    ${cat.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {selectedCategories.size > 0 && (
                                        <section className="mb-8 space-y-4">
                                            <h2 className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-2">
                                                Datos del Compañero
                                            </h2>
                                            <div className="mb-4 min-w-0">
                                                <AutoShrinkName
                                                    name="Ingresa el código de 6 dígitos de tu pareja para completar el equipo."
                                                    style={{ fontSize: '10px' }}
                                                    className="text-gray-500 uppercase"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                        <Search className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={partnerCode}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 6);
                                                            setPartnerCode(val);
                                                            if (foundPartner) setFoundPartner(null);
                                                            if (partnerError) setPartnerError(null);
                                                        }}
                                                        placeholder="CÓDIGO (EJ: PX45T2)"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white font-bold outline-none focus:border-[#ccff00]/50 transition-all uppercase tracking-widest font-mono"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handlePartnerSearch}
                                                    disabled={searchingPartner || partnerCode.length !== 6}
                                                    className="px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
                                                >
                                                    {searchingPartner ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BUSCAR'}
                                                </button>
                                            </div>

                                            {partnerError && (
                                                <div className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 mt-1">
                                                    <AlertCircle size={12} />
                                                    {partnerError}
                                                </div>
                                            )}

                                            {foundPartner && (
                                                <div className="p-4 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] text-[#ccff00] font-black uppercase tracking-tighter">Compañero Confirmado</p>
                                                            <p className="text-white font-bold">{foundPartner.name}</p>
                                                            <p className="text-[10px] text-gray-500">{foundPartner.email}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setFoundPartner(null);
                                                                setPartnerCode('');
                                                            }}
                                                            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    {selectedCategories.size > 0 && (
                                        <section className="mb-8 space-y-6">
                                            {/* Sección: Maneras de Pago - Solo si hay monto que pagar */}
                                            {totalPrice > 0 ? (
                                                <>
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
                                                                            <option value="Mercado Pago" className="bg-[#111]">Mercado Pago</option>
                                                                            <option value="Zelle" className="bg-[#111]">Zelle</option>
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
                                                </>
                                            ) : (
                                                <div className="rounded-2xl bg-[#ccff00]/5 border border-[#ccff00]/20 p-6 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-6 h-6 text-[#ccff00]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black uppercase text-sm">Inscripción Gratuita</h3>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">No se requiere información de pago para esta categoría.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    )}

                                    <section className="mb-8">
                                        <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-2 border-[#ccff00] text-[#ccff00]"
                                            />
                                            <span className="text-sm text-gray-300">
                                                Acepto los{' '}
                                                <Link href="/terminos-inscripcion" target="_blank" className="text-[#ccff00] font-bold underline">
                                                    Términos y Condiciones de Inscripción
                                                </Link>
                                                , incluida la veracidad del comprobante de pago si aplica.
                                            </span>
                                        </label>
                                    </section>

                                    {error && (
                                        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                            <p className="text-sm text-red-200">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting || selectedCategories.size === 0 || !acceptTerms}
                                        className="w-full py-4 rounded-2xl bg-[#ccff00] text-black font-black uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Inscribirme en {selectedCategories.size} categoría(s)</>
                                        )}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
