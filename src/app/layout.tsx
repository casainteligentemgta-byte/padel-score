import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AppSettingsProvider } from "@/lib/AppSettingsContext";
import RootErrorBoundary from "./RootErrorBoundary";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { TermsReacceptanceGate } from "@/components/TermsReacceptanceGate";
import { DevServiceWorkerReset } from "@/components/DevServiceWorkerReset";
import { ToastHost } from "@/components/AppToast";
import { PUBLIC_APP_ORIGIN } from "@/lib/brand";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    metadataBase: new URL(PUBLIC_APP_ORIGIN),
    title: "Smart Padel | Tournament Manager",
    description: "La plataforma inteligente para gestionar torneos de pádel.",
    manifest: "/manifest.json",
    openGraph: {
        title: "Smart Padel",
        description: "Gestiona torneos de pádel en vivo: inscripciones, marcador y TV.",
        url: PUBLIC_APP_ORIGIN,
        siteName: "Smart Padel",
        locale: "es_VE",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Smart Padel",
        description: "Gestiona torneos de pádel en vivo: inscripciones, marcador y TV.",
    },
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
    themeColor: "#CCFF00",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="es"
            suppressHydrationWarning
            className={`h-full min-h-0 ${inter.variable}`}
            style={{ background: "#0a0a0a" }}
        >
            <body
                suppressHydrationWarning
                className={`${inter.className} flex min-h-dvh min-h-0 flex-col`}
                style={{ margin: 0, backgroundColor: "#0a0a0a", color: "#fff" }}
            >
                <RootErrorBoundary>
                    <AuthProvider>
                        <TermsReacceptanceGate>
                            <AppSettingsProvider>
                                <DevServiceWorkerReset />
                                <main className="flex min-h-0 w-full flex-1 flex-col">
                                    {children}
                                </main>
                                <InstallAppBanner />
                                <ToastHost />
                            </AppSettingsProvider>
                        </TermsReacceptanceGate>
                    </AuthProvider>
                </RootErrorBoundary>
            </body>
        </html>
    );
}
