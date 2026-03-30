import { resolveCategoryPodium, type CategoryPodium } from '@/lib/tournamentPodium';
import { formatCategory, formatGender } from '@/app/tournaments/event/utils';

export type EventPodiumRow = {
    id: string;
    title: string;
    podium: CategoryPodium | null;
    tournament: any;
};

/** Misma orden y títulos que `EventPodiumView` (campeón/subcampeón por categoría). */
export function buildEventPodiumRows(tournaments: Record<string, any>): EventPodiumRow[] {
    return Object.values(tournaments)
        .filter((t: any) => t?.id)
        .map((t: any) => {
            const matches = Array.isArray(t.matches) ? t.matches : [];
            const podium = resolveCategoryPodium(matches, t);
            const cat = formatCategory(t.category);
            const gen = formatGender(t.gender);
            const title = [cat, gen].filter(Boolean).join(' · ') || 'Categoría';
            return { id: String(t.id), title, podium, tournament: t };
        })
        .sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
}
