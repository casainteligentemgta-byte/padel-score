'use client';

/**
 * Captura errores en la raíz de la app (incl. layout).
 * Si ves "Internal Server Error", el mensaje real debería aparecer aquí o en la terminal.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="es">
            <body style={{ margin: 0, background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui', minHeight: '100vh', padding: 24 }}>
                <div style={{ maxWidth: 560 }}>
                    <h1 style={{ fontSize: 20, marginBottom: 12 }}>Error en la aplicación</h1>
                    <p style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>
                        {error?.message || 'Error desconocido'}
                    </p>
                    {error?.digest && (
                        <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
                            Código: {error.digest}
                        </p>
                    )}
                    <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>
                        Comprueba la terminal donde ejecutaste <code style={{ background: '#222', padding: '2px 6px' }}>npm run dev</code> para ver el detalle.
                        Asegúrate de tener <code style={{ background: '#222', padding: '2px 6px' }}>.env.local</code> con
                        <code style={{ background: '#222', padding: '2px 6px' }}>NEXT_PUBLIC_SUPABASE_URL</code> y
                        <code style={{ background: '#222', padding: '2px 6px' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                    </p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        style={{
                            padding: '12px 24px',
                            background: '#ccff00',
                            color: '#000',
                            border: 'none',
                            borderRadius: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            </body>
        </html>
    );
}
