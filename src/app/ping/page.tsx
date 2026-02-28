/** Ruta de prueba: si ves este texto, el servidor y Next funcionan. */
export default function PingPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ccff00', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'system-ui', fontSize: 18 }}>
            <p>OK — Smart Padel está funcionando. <a href="/" style={{ color: '#fff', marginLeft: 8 }}>Ir al inicio</a></p>
        </div>
    );
}
