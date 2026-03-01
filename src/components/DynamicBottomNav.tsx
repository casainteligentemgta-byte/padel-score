'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRTDBRole } from '@/lib/useRTDBRole';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Trophy, Users, Settings,
    RadioTower, Megaphone, Home, User
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
}

/**
 * DynamicBottomNav – Menú inferior adaptado al rol del usuario:
 *  • admin   → Dashboard, Torneos, Usuarios, Publicidad, Config
 *  • marker  → Mi Cancha (URL dinámica), Live
 *  • usuario → Home, Partidos, Perfil
 */
export function DynamicBottomNav() {
    const { user, isAdmin } = useAuth();
    const { rol, canchaAsignada, loading } = useRTDBRole(user?.uid);
    const pathname = usePathname();
    const router = useRouter();

    // No mostrar en páginas de display/pizarra, login ni dentro de un torneo específico
    const hiddenPaths = ['/login', '/display', '/score'];
    // Ocultar en rutas de torneo individual /tournaments/[id]/... pero NO en /tournaments (listado)
    const isTournamentDetail = /^\/tournaments\/[^/]+/.test(pathname);
    if (hiddenPaths.some(p => pathname.includes(p)) || isTournamentDetail) return null;
    if (!user) return null;

    // ── Determinar menú según rol ─────────────────────────────────────────
    let navItems: NavItem[] = [];

    if (isAdmin) {
        navItems = [
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/tournaments', label: 'Torneos', icon: Trophy },
            { href: '/admin/users', label: 'Usuarios', icon: Users },
            { href: '/admin/publicidad', label: 'Publicidad', icon: Megaphone },
        ];
    } else if (rol === 'marker' && !loading) {
        const myCanchaId = canchaAsignada ? canchaAsignada.replace('cancha_', '') : '1';
        navItems = [
            { href: `/marker/${myCanchaId}`, label: 'Mi Cancha', icon: RadioTower },
            { href: '/tournaments', label: 'Torneos', icon: Trophy },
        ];
    } else {
        // Usuario estándar: Live apagado (solo admin/propietario)
        navItems = [
            { href: '/', label: 'Inicio', icon: Home },
            { href: '/tournaments', label: 'Torneos', icon: Trophy },
            { href: '/profile', label: 'Perfil', icon: User },
        ];
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-black/80 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl pointer-events-auto overflow-hidden"
            >
                <div className="flex items-center">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                        return (
                            <button
                                key={href}
                                onClick={() => router.push(href)}
                                className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 transition-all relative group ${isActive ? 'text-padel-primary' : 'text-gray-600 hover:text-gray-400'}`}
                            >
                                {/* Indicador activo */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute inset-x-2 top-0 h-0.5 bg-padel-primary rounded-full shadow-[0_0_8px_rgba(204,255,0,0.8)]"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-padel-primary/10' : 'group-hover:bg-white/5'}`}
                                >
                                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                                </motion.div>

                                <span className="text-[9px] font-black uppercase tracking-widest truncate leading-none">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </nav>
    );
}
