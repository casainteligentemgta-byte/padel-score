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
        <html lang="es" suppressHydrationWarning className="h-full min-h-0" style={{ background: "#0a0a0a" }}>
            <body
                suppressHydrationWarning
                className="flex min-h-dvh min-h-0 flex-col"
                style={{ margin: 0, backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}
            >
                <RootErrorBoundary>
                    <AuthProvider>
                        <AppSettingsProvider>
                            <main className="flex min-h-0 w-full flex-1 flex-col">
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
