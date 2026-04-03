import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AppSettingsProvider } from "@/lib/AppSettingsContext";
import RootErrorBoundary from "./RootErrorBoundary";
import { InstallAppBanner } from "@/components/InstallAppBanner";

export const metadata: Metadata = {
    title: "Smart Padel | Tournament Manager",
    description: "La plataforma inteligente para gestionar torneos de pádel.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Padel Score",
    },
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
};

export const viewport: Viewport = {
    themeColor: "#0a0a0a",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" suppressHydrationWarning style={{ background: "#0a0a0a" }}>
            <body suppressHydrationWarning style={{ margin: 0, backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
                <RootErrorBoundary>
                    <AuthProvider>
                        <AppSettingsProvider>
                            <main className="min-h-screen w-full flex flex-col" style={{ minHeight: "100vh" }}>
                                {children}
                            </main>
                            <InstallAppBanner />
                        </AppSettingsProvider>
                    </AuthProvider>
                </RootErrorBoundary>
            </body>
        </html>
    );
}
