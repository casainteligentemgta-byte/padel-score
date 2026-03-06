import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AppSettingsProvider } from "@/lib/AppSettingsContext";
import HideRootLoading from "./HideRootLoading";
import RootErrorBoundary from "./RootErrorBoundary";

export const metadata: Metadata = {
    title: "Smart Padel | Tournament Manager",
    description: "La plataforma inteligente para gestionar torneos de pádel.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            </head>
            <body suppressHydrationWarning style={{ margin: 0, backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
                <RootErrorBoundary>
                    <AuthProvider>
                        <AppSettingsProvider>
                            <main className="min-h-screen">
                                {children}
                            </main>
                        </AppSettingsProvider>
                    </AuthProvider>
                </RootErrorBoundary>
            </body>
        </html>
    );
}
