import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AppSettingsProvider } from "@/lib/AppSettingsContext";
import RootErrorBoundary from "./RootErrorBoundary";

export const metadata: Metadata = {
    title: "Smart Padel | Tournament Manager",
    description: "La plataforma inteligente para gestionar torneos de pádel.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" suppressHydrationWarning style={{ background: "#0a0a0a" }}>
            <head>
                <style dangerouslySetInnerHTML={{ __html: "html,body{background:#0a0a0a!important;margin:0!important;min-height:100vh!important;color:#fff!important;}" }} />
            </head>
            <body suppressHydrationWarning style={{ margin: 0, backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
                <RootErrorBoundary>
                    <AuthProvider>
                        <AppSettingsProvider>
                            <main className="min-h-screen" style={{ minHeight: "100vh" }}>
                                {children}
                            </main>
                        </AppSettingsProvider>
                    </AuthProvider>
                </RootErrorBoundary>
            </body>
        </html>
    );
}
