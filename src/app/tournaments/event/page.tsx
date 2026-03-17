'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RefreshCw, Trophy, ArrowLeft, Tv, FileText, Share2, Calendar, Clock
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
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

function getFaseLabel(match: any): string {
    if (!match) return '';
    if (match.stage === 'GROUP_STAGE') return 'Fase de grupos';
    if (match.stage !== 'MAIN_DRAW') return 'Eliminatoria';
    if (match.roundName) {
        const name = String(match.roundName).toUpperCase();
        if (name.includes('SEMIFINAL')) return 'Semifinales';
        if (name.includes('CUARTOS')) return 'Cuartos';
        if (name.includes('OCTAVOS') || name.includes('8VO')) return 'Octavos';
        if (name.includes('FINAL') && !name.includes('SEMI') && !name.includes('CUARTOS') && !name.includes('OCTAVOS')) return 'Final';
        return match.roundName;
    }
    return 'Eliminatoria';
}

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

    // Fechas únicas con partidos (para selector de día)
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        allMatches.forEach((m) => {
            const raw = m.scheduledTime || m.time || '';
            const datePart = typeof raw === 'string' ? raw.split('T')[0] : (raw && new Date(raw).toISOString().split('T')[0]);
            if (datePart) dates.add(datePart);
        });
        return Array.from(dates).sort();
    }, [allMatches]);
    const [selectedDate, setSelectedDate] = useState<string>(availableDates[0] ?? '');
    useEffect(() => {
        if (availableDates.length > 0 && !availableDates.includes(selectedDate)) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

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

        doc.setFillColor(10, 10, 10);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(204, 255, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(eventName.toUpperCase(), 15, 14);

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text('PLANILLA DE JUEGOS', 150, 14);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 15, 22);

        const formatFecha = (v: any) => {
            if (v == null || v === '') return '-';
            const d = typeof v === 'string' ? new Date(v) : (v?.toDate ? v.toDate() : new Date(v));
            return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };
        // Una fila por partido (todas las categorías): 3 categorías × 7 partidos = 21 filas. Solo se evitan duplicados reales (mismo torneo + mismo id).
        const seenMatchKeys = new Set<string>();
        const list: any[] = [];
        for (const m of allMatches) {
            const matchKey = `${m._tournamentId ?? ''}_${m.id ?? m.matchId ?? ''}`;
            if (seenMatchKeys.has(matchKey)) continue;
            seenMatchKeys.add(matchKey);
            list.push(m);
        }
        list.sort((a, b) => toMs(a.scheduledTime) - toMs(b.scheduledTime) || (Number(a.court ?? a.courtIndex ?? 0) - Number(b.court ?? b.courtIndex ?? 0)));
        const tableData: string[][] = [];
        for (const m of list) {
            const hora = formatHHMM(m.scheduledTime ?? m.time);
            const pista = String(m.court ?? m.courtIndex ?? '-').trim();
            tableData.push([
                hora,
                pista === '-' ? '-' : `Pista ${pista}`,
                formatCategory(m._category),
                getFaseLabel(m),
                m.team1?.name ?? m.team1Name ?? '?',
                m.team2?.name ?? m.team2Name ?? '?'
            ]);
        }

        autoTable(doc, {
            startY: 28,
            head: [['Hora', 'Pista', 'Categoría', 'Fase', 'Equipo 1', 'Equipo 2']],
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

    // Subscribe to all tournaments and their matches in parallel via dataService
    useEffect(() => {
        if (tournamentIds.length === 0) { setLoading(false); return; }

        // Reset al entrar (o al cambiar ids) para no mostrar 14 partidos de una visita anterior
        setTournaments({});
        setAllMatches([]);
        setLoading(true);

        const loaded: Record<string, boolean> = {};
        const unsubs: (() => void)[] = [];

        tournamentIds.forEach(tid => {
            loaded[tid] = false;

            // 1. Suscripción al Torneo (Metadatos)
            const unsubT = dataService.subscribeToTournament(tid, (tourneyData) => {
                if (!tourneyData) {
                    setTournaments(prev => {
                        const next = { ...prev };
                        delete next[tid];
                        return next;
                    });
                } else {
                    setTournaments(prev => ({
                        ...prev,
                        [tid]: { ...(prev[tid] || {}), ...tourneyData, id: tid }
                    }));
                }
                loaded[tid] = true;
                if (Object.values(loaded).every(Boolean)) setLoading(false);
            });
            unsubs.push(unsubT);

            // 2. Suscripción a los Partidos
            const unsubM = dataService.subscribeToMatches(tid, (tournamentMatches) => {
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

    // Flatten + enrich all matches (sin duplicados: un partido por torneo solo una vez)
    useEffect(() => {
        const flat: any[] = [];
        const seenKeys = new Set<string>();
        // Solo torneos que pidió la URL, para no arrastrar datos viejos de otra visita
        const tournamentsToList = Object.values(tournaments).filter((t: any) => t.id && tournamentIds.includes(t.id));
        tournamentsToList.forEach((t: any) => {
            if (!t.matches) return;
            t.matches.forEach((m: any) => {
                const matchKey = `${t.id}_${m.id ?? m.matchId ?? ''}`;
                if (seenKeys.has(matchKey)) return;
                seenKeys.add(matchKey);

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
                const court = m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : '-');
                flat.push({
                    ...m,
                    _tournamentId: t.id,
                    _tournamentName: t.name,
                    _category: t.category,
                    _gender: genderValue,
                    court: typeof court === 'number' ? court : (Number(court) || court),
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
            return (a.courtIndex ?? Number(a.court) ?? 0) - (b.courtIndex ?? Number(b.court) ?? 0);
        });

        setAllMatches(flat);
    }, [tournaments, tournamentIds]);

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

    const isMatchLive = (status: any) => status === 'LIVE' || status === 'IN_PROGRESS' || status === 'STARTED';
    const isMatchPending = (status: any) => status === 'PENDING' || !status;
    const isMatchFinished = (status: any) => status === 'FINISHED' || status === 'COMPLETED';

    const allPending = allMatches.filter(m => isMatchPending(m.status));
    const numSlotsPorComenzar = Math.min(numCanchas, allPending.length);
    const nextUpMatches = allPending.slice(0, numSlotsPorComenzar);

    const effectiveLiveMatches = allMatches
        .filter(m => isMatchLive(m.status))
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
        if (activeTab === 'live') return isMatchLive(m.status);
        if (activeTab === MatchStatus.PENDING) return isMatchPending(m.status);
        if (activeTab === MatchStatus.FINISHED) return isMatchFinished(m.status);
        return m.status === activeTab;
    });

    const handleSaveSponsor = async () => {
        setSavingSponsor(true);
        try {
            await Promise.all(tournamentIds.map(tid => {
                const existing = tournaments[tid] || {};
                return dataService.updateTournament(tid, {
                    ...existing,
                    sponsorLogoUrl: sponsorLogoDraft || null,
                    sponsorName: sponsorNameDraft || null,
                    sponsorLink: sponsorLinkDraft || null,
                });
            }));
            setIsSponsorEditOpen(false);
        } catch (e) {
            console.error('[saveSponsor]', e);
            alert('Error al guardar el patrocinante.');
        } finally {
            setSavingSponsor(false);
        }
    };

    const handleUploadSponsorLogo = async (file: File) => {
        const path = `logos/${Date.now()}_${file.name}`;
        return await dataService.uploadFile(file, path, 'patrocinantes');
    };


    const handleSaveEventRules = async () => {
        setSavingEventRules(true);
        try {
            const first = Object.values(tournaments)[0];
            const manuals = first?.rules?.manuals ?? [];
            await Promise.all(tournamentIds.map(tid => {
                const existing = tournaments[tid] || {};
                return dataService.updateTournament(tid, {
                    ...existing,
                    rules: {
                        ...(existing.rules || {}),
                        content: eventRulesDraft,
                        manuals: manuals
                    }
                });
            }));
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
                category={firstT?.category}
                gender={firstT?.gender}
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
                        availableDates={availableDates}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
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
                onUpload={handleUploadSponsorLogo}
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
