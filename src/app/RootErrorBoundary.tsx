'use client';

import React from 'react';

export default class RootErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('RootErrorBoundary:', error, info);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (typeof document !== 'undefined') {
                const el = document.getElementById('root-loading');
                if (el) el.style.display = 'none';
            }
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        background: '#0a0a0a',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    <h1 style={{ fontSize: 20, marginBottom: 12 }}>Algo falló al cargar la aplicación</h1>
                    <p style={{ fontSize: 14, color: '#888', maxWidth: 400, marginBottom: 16 }}>
                        {this.state.error.message}
                    </p>
                    <p style={{ fontSize: 12, color: '#666' }}>
                        Si ya reiniciaste el servidor (npm run dev), intenta refrescar la página
                        o limpia el caché del navegador.
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            marginTop: 16,
                            padding: '10px 20px',
                            background: '#ccff00',
                            color: '#000',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
