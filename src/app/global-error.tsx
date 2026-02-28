'use client';

export default function GlobalError(props: { error: Error; reset: () => void }) {
    const { error, reset } = props;
    return (
        <html lang="es">
            <body style={{ margin: 0, minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ textAlign: 'center', maxWidth: 480 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Algo ha fallado</h1>
                    <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{error?.message || 'Error desconocido'}</p>
                    <button onClick={() => reset()} style={{ background: '#ccff00', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        Reintentar
                    </button>
                </div>
            </body>
        </html>
    );
}
