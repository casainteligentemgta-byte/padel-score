export default function Loading() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: '#0a0a0a',
                color: '#ccff00',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                fontSize: 20,
                fontWeight: 700,
            }}
        >
            <span>Smart Padel</span>
            <span style={{ fontSize: 14, color: '#888' }}>Cargando…</span>
        </div>
    );
}
