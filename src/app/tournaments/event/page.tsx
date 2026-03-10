'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw, Trophy, ArrowLeft, Tv, FileText, Share2, Calendar, Clock
} from 'lucide-react';
import { onSnapshot, doc, updateDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { MatchStatus } from '@/types/tournament';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Components
import { TournamentHeader } from './components/TournamentHeader';
import { GroupsView } from './components/GroupsView';
import { RulesView } from './components/RulesView';
import { MatchList } from './components/MatchList';
import { ShareModal, SponsorModal, RulesModal } from './components/Modals';

// Utilities
import {
    formatCategory, formatHHMM, toMs, toMinute, TABS, KNOWN_COMPLEXES
} from './utils';

// ── Main component (wrapped in Suspense below) ──────────────────────────────
function EventView() {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids') ?? '';
    const tournamentIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

    // Persistir ids del evento para que el botón Atrás en marcador/torneo vuelva aquí
    useEffect(() => {
        if (idsParam) {
            try {
                sessionStorage.setItem('padel_event_ids', idsParam);
            } catch (_) { }
        }
    }, [idsParam]);

    const { user, isAdmin } = useAuth();
    const [tournaments, setTournaments] = useState<Record<string, any>>({});
    const canManageTournament = isAdmin || (user && Object.values(tournaments).some((t: any) => t.owners?.includes(user.email)));

    const [allMatches, setAllMatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showShareModal, setShowShareModal] = useState(false);
    const [isSponsorEditOpen, setIsSponsorEditOpen] = useState(false);
    const [isEventRulesEditOpen, setIsEventRulesEditOpen] = useState(false);

    // Drafts
    const [eventRulesDraft, setEventRulesDraft] = useState('');
    const [savingEventRules, setSavingEventRules] = useState(false);
    const [sponsorLogoDraft, setSponsorLogoDraft] = useState('');
    const [sponsorNameDraft, setSponsorNameDraft] = useState('');
    const [sponsorLinkDraft, setSponsorLinkDraft] = useState('');
    const [savingSponsor, setSavingSponsor] = useState(false);

    const generateMatchesPDF = () => {
        const doc = new jsPDF() as any;
        const firstT = Object.values(tournaments)[0];
        const eventName = firstT?.eventName ?? firstT?.name ?? firstT?.complexName ?? 'Evento de Padel';
        const eventDate = firstT?.startDate
            ? new Date(firstT.startDate).toLocaleDateString('es-ES')
            : '';

        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(204, 255, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(eventName.toUpperCase(), 15, 14);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(`PLANILLA DE JUEGOS - ${eventDate}`, 150, 14);

        const tableData = allMatches.map(m => [
            formatHHMM(m.scheduledTime),
            `Pista ${m.court}`,
            formatCategory(m._category),
            m.team1.name,
            m.team2.name,
            m.status === MatchStatus.FINISHED ? `${m.score1} - ${m.score2}` : (m.status === MatchStatus.LIVE ? 'En Vivo' : 'Pendiente')
        ]);

        autoTable(doc, {
            startY: 25,
            head: [['Hora', 'Pista', 'Categoría', 'Equipo 1', 'Equipo 2', 'Resultado']],
            body: tableData,
            styles: { fontSize: 8, font: 'helvetica', cellPadding: 4, valign: 'middle' },
            headStyles: { fillColor: [0, 0, 0], textColor: [204, 255, 0], fontStyle: 'bold', minCellHeight: 10 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 15, right: 15 },
            theme: 'striped'
        });

        doc.save(`Planilla_${eventName.replace(/\s+/g, '_')}.pdf`);
    };

    const handleShare = (type: 'whatsapp' | 'email' | 'download') => {
        const firstT = Object.values(tournaments)[0];
        const eventName = firstT?.eventName ?? firstT?.name ?? firstT?.complexName ?? 'Evento de Padel';
        const shareUrl = window.location.href;
        const text = `Te comparto la planilla de juegos del evento *${eventName}*.\nPuedes ver los resultados en tiempo real aquí: ${shareUrl}`;

        if (type === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } else if (type === 'email') {
            window.open(`mailto:?subject=${encodeURIComponent(`Planilla Padel - ${eventName}`)}&body=${encodeURIComponent(text)}`, '_blank');
        } else if (type === 'download') {
            generateMatchesPDF();
        }
        setShowShareModal(false);
    };

    // Subscribe to all tournaments and their matches in parallel via onSnapshot
    useEffect(() => {
        if (tournamentIds.length === 0) { setLoading(false); return; }

        const loaded: Record<string, boolean> = {};
        const unsubs: (() => void)[] = [];

        tournamentIds.forEach(tid => {
            loaded[tid] = false;

            // 1. Suscripción al Torneo (Metadatos)
            const tRef = doc(db, 'tournaments', tid);
            const unsubT = onSnapshot(tRef, snap => {
                setTournaments(prev => {
                    const next = { ...prev };
                    if (snap.exists()) {
                        const existing = next[tid] || {};
                        next[tid] = { ...existing, id: tid, ...snap.data() };
                    } else {
                        delete next[tid];
                    }
                    return next;
                });
                loaded[tid] = true;
                if (Object.values(loaded).every(Boolean)) setLoading(false);
            });
            unsubs.push(unsubT);

            // 2. Suscripción a la Sub-colección de Partidos
            const mRef = collection(db, 'tournaments', tid, 'matches');
            const unsubM = onSnapshot(mRef, snap => {
                const tournamentMatches = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setTournaments(prev => ({
                    ...prev,
                    [tid]: { ...(prev[tid] || {}), id: tid, matches: tournamentMatches }
                }));
            });
            unsubs.push(unsubM);
        });

        return () => unsubs.forEach(u => u());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsParam]);

    // Flatten + enrich all matches
    useEffect(() => {
        const flat: any[] = [];
        Object.values(tournaments).forEach((t: any) => {
            if (!t.matches) return;
            t.matches.forEach((m: any) => {
                let team1Obj: any = null;
                let team2Obj: any = null;

                if (m.team1 && (m.team1.p1 || m.team1.p1Name || m.team1.isTBD || m.team1.teamLabel)) {
                    team1Obj = m.team1;
                } else if (m.team1Index != null && t.teams) {
                    team1Obj = t.teams[m.team1Index - 1] ?? null;
                }

                if (m.team2 && (m.team2.p1 || m.team2.p1Name || m.team2.isTBD || m.team2.teamLabel)) {
                    team2Obj = m.team2;
                } else if (m.team2Index != null && t.teams) {
                    team2Obj = t.teams[m.team2Index - 1] ?? null;
                }

                const buildTeam = (obj: any, idx: number | undefined, matchTeamName?: string) => {
                    if (!obj && !matchTeamName) return { name: idx != null ? `Pareja ${idx}` : '?', p1Name: idx != null ? `Pareja ${idx}` : '?', p2Name: '' };
                    if (obj?.isTBD || obj?.teamLabel) return { ...obj, name: obj.teamLabel || obj.p1?.name || '?' };
                    const p1n = (obj?.p1Name || obj?.p1?.name || '').trim();
                    const p2n = (obj?.p2Name || obj?.p2?.name || '').trim();
                    const nameStr = (p1n && p2n) ? `${p1n} / ${p2n}` : (p1n || matchTeamName || (idx != null ? `Pareja ${idx}` : '?'));
                    return { ...obj, name: nameStr, p1Name: p1n || (idx != null ? `J${(idx - 1) * 2 + 1}` : '?'), p2Name: p2n };
                };

                const genderValue = t.gender || (['MALE', 'FEMALE', 'MIXED'].includes(String(t.category)) ? t.category : undefined);
                flat.push({
                    ...m,
                    _tournamentId: t.id,
                    _tournamentName: t.name,
                    _category: t.category,
                    _gender: genderValue,
                    court: m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : '-'),
                    team1: buildTeam(team1Obj, m.team1Index, m.team1Name),
                    team2: buildTeam(team2Obj, m.team2Index, m.team2Name),
                    team1Name: m.team1Name,
                    team2Name: m.team2Name,
                });
            });
        });

        flat.sort((a, b) => {
            const td = toMs(a.scheduledTime) - toMs(b.scheduledTime);
            if (td !== 0) return td;
            return (a.courtIndex ?? 0) - (b.courtIndex ?? 0);
        });

        setAllMatches(flat);
    }, [tournaments]);

    const numCanchas = (() => {
        const t = Object.values(tournaments)[0];
        const fromComplex = t?.complexName ? (KNOWN_COMPLEXES[t.complexName] ?? 0) : 0;
        if (fromComplex > 0) return fromComplex;

        const toMinuteInner = (v: any) => Math.floor(toMs(v) / 60000);
        const sortedAll = [...allMatches].sort((a, b) => toMs(a.scheduledTime) - toMs(b.scheduledTime));
        if (sortedAll.length > 0) {
            const firstMinute = toMinuteInner(sortedAll[0].scheduledTime);
            const firstSlot = sortedAll.filter(m => toMinuteInner(m.scheduledTime) === firstMinute);
            const uniqueCourts = new Set(firstSlot.map(m => Number(m.court ?? m.courtIndex ?? -1)).filter(n => n >= 0));
            if (uniqueCourts.size > 0) return uniqueCourts.size;
        }

        const fromTotal = Number(t?.totalCourts ?? 0);
        if (fromTotal > 0) return fromTotal;

        const fromArray = Array.isArray(t?.courtNames) && t.courtNames.length > 0 ? t.courtNames.length : 0;
        if (fromArray > 0) return fromArray;

        return 1;
    })();

    const allPending = allMatches.filter(m => m.status === MatchStatus.PENDING);
    const numSlotsPorComenzar = Math.min(numCanchas, allPending.length);
    const nextUpMatches = allPending.slice(0, numSlotsPorComenzar);

    const effectiveLiveMatches = allMatches
        .filter(m => m.status === MatchStatus.LIVE)
        .sort((a, b) => Number(a.court ?? 99) - Number(b.court ?? 99))
        .slice(0, numCanchas);

    const nextUpIds = new Set(nextUpMatches.map(m => m.id));
    const effectiveLiveIds = new Set(effectiveLiveMatches.map(m => m.id));

    const liveCnt = Math.min(numCanchas, allMatches.filter(m => m.status === MatchStatus.LIVE).length);
    const pendCnt = allMatches.filter(m => m.status === MatchStatus.PENDING).length;
    const finCnt = allMatches.filter(m => m.status === MatchStatus.FINISHED).length;

    const filtered = allMatches.filter(m => {
        if (activeTab === 'all') return true;
        if (activeTab === 'groups' || activeTab === 'rules') return false;
        return m.status === activeTab;
    });

    const handleSaveSponsor = async () => {
        setSavingSponsor(true);
        try {
            await Promise.all(tournamentIds.map(tid =>
                updateDoc(doc(db, 'tournaments', tid), {
                    sponsorLogoUrl: sponsorLogoDraft || null,
                    sponsorName: sponsorNameDraft || null,
                    sponsorLink: sponsorLinkDraft || null,
                })
            ));
            setIsSponsorEditOpen(false);
        } catch (e) {
            console.error('[saveSponsor]', e);
            alert('Error al guardar el patrocinante.');
        } finally {
            setSavingSponsor(false);
        }
    };

    const handleSaveEventRules = async () => {
        setSavingEventRules(true);
        try {
            const first = Object.values(tournaments)[0];
            const manuals = first?.rules?.manuals ?? [];
            await Promise.all(tournamentIds.map(tid =>
                updateDoc(doc(db, 'tournaments', tid), {
                    'rules.content': eventRulesDraft,
                    'rules.manuals': manuals
                })
            ));
            setIsEventRulesEditOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingEventRules(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    if (tournamentIds.length === 0) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
                <Trophy className="w-16 h-16 text-[#ccff00]/20" />
                <p className="text-gray-500 uppercase tracking-widest text-sm">No se especificaron torneos</p>
                <Link href="/tournaments" className="text-[#ccff00] text-sm font-bold uppercase tracking-widest">← Volver</Link>
            </div>
        );
    }

    const firstT = Object.values(tournaments)[0];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit flex flex-col">
            <TournamentHeader
                eventName={(() => {
                    const raw = firstT?.eventName ?? firstT?.name ?? firstT?.complexName ?? 'Evento';
                    return raw;
                })()}
                complexName={firstT?.complexName}
                eventDate={firstT?.startDate}
                allMatchesCount={allMatches.length}
                liveCnt={liveCnt}
                pendCnt={pendCnt}
                finCnt={finCnt}
                sponsorLogoUrl={firstT?.sponsorLogoUrl}
                sponsorName={firstT?.sponsorName}
                sponsorLink={firstT?.sponsorLink}
                canManageTournament={!!canManageTournament}
                onEditSponsor={() => {
                    setSponsorLogoDraft(firstT?.sponsorLogoUrl ?? '');
                    setSponsorNameDraft(firstT?.sponsorName ?? '');
                    setSponsorLinkDraft(firstT?.sponsorLink ?? '');
                    setIsSponsorEditOpen(true);
                }}
                onEditRules={() => {
                    setEventRulesDraft(firstT?.rules?.content ?? '');
                    setIsEventRulesEditOpen(true);
                }}
                onShare={() => setShowShareModal(true)}
            />

            <div className="flex-shrink-0 px-2 sm:px-3 py-3 flex gap-2 overflow-x-auto hide-scrollbar border-b border-[#ccff00]/10 w-full">
                {TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex-shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.value
                            ? 'bg-[#ccff00] text-black'
                            : 'bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-4 pb-24 relative w-full">
                {activeTab === 'groups' ? (
                    <GroupsView tournaments={tournaments} />
                ) : activeTab === 'rules' ? (
                    <RulesView tournaments={tournaments} canManage={!!canManageTournament} />
                ) : (
                    <MatchList
                        activeTab={activeTab}
                        nextUpMatches={nextUpMatches}
                        effectiveLiveMatches={effectiveLiveMatches}
                        filteredMatches={filtered}
                        allMatches={allMatches}
                        effectiveLiveIds={effectiveLiveIds}
                        nextUpIds={nextUpIds}
                        numCanchas={numCanchas}
                        numSlotsPorComenzar={numSlotsPorComenzar}
                        tournaments={tournaments}
                        canManageTournament={!!canManageTournament}
                        onEditRules={() => {
                            setEventRulesDraft(firstT?.rules?.content ?? '');
                            setIsEventRulesEditOpen(true);
                        }}
                    />
                )}
            </div>

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                onShare={handleShare}
            />

            <SponsorModal
                isOpen={isSponsorEditOpen}
                onClose={() => setIsSponsorEditOpen(false)}
                logoDraft={sponsorLogoDraft}
                setLogoDraft={setSponsorLogoDraft}
                nameDraft={sponsorNameDraft}
                setNameDraft={setSponsorNameDraft}
                linkDraft={sponsorLinkDraft}
                setLinkDraft={setSponsorLinkDraft}
                onSave={handleSaveSponsor}
                saving={savingSponsor}
            />

            <RulesModal
                isOpen={isEventRulesEditOpen}
                onClose={() => setIsEventRulesEditOpen(false)}
                rulesDraft={eventRulesDraft}
                setRulesDraft={setEventRulesDraft}
                onSave={handleSaveEventRules}
                saving={savingEventRules}
            />
        </div>
    );
}

export default function EventPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-[#ccff00] animate-spin" />
            </div>
        }>
            <EventView />
        </Suspense>
    );
}
