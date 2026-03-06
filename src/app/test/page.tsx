/**
 * Ruta de prueba: si ves "OK" al abrir /test, Next está sirviendo bien.
 * Útil cuando en / no se ve nada.
 */
export default function TestPage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0a0a0a',
                color: '#ccff00',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                fontFamily: 'system-ui',
            }}
        >
            <h1 style={{ fontSize: 32, marginBottom: 16 }}>OK</h1>
            <p style={{ color: '#888' }}>Si ves esto, Next.js está respondiendo. La app principal está en /</p>
        </div>
    );
}
