import { NextResponse } from 'next/server';

export function GET() {
    const html = `<!DOCTYPE html>
<html lang="es" style="background:#0a0a0a;color:#fff;margin:0;min-height:100vh;">
<head><meta charset="utf-8"><title>Prueba</title></head>
<body style="background:#0a0a0a;color:#fff;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;">
  <div style="text-align:center;">
    <h1 style="font-size:24px;">Si ves esto en fondo oscuro, el servidor responde bien.</h1>
    <p><a href="/" style="color:#ccff00;">Volver a inicio</a></p>
  </div>
</body>
</html>`;
    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
