# La página no se ve — pasos exactos

## 1. Abrir terminal en la carpeta del proyecto

En PowerShell (o CMD):

```powershell
cd "c:\Users\matal\Desktop\ANTIGRAVITY\Padel Score"
```

## 2. Borrar caché de Next

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

## 3. Arrancar el servidor

```powershell
npm run dev
```

**No cierres esta ventana.** Deja la terminal abierta.

## 4. Esperar el mensaje de Next.js

En la terminal debe aparecer algo como:

```
▲ Next.js 16.x.x
- Local:    http://localhost:3000
```

Anota el puerto (3000, 3001, 3003…).

## 5. Abrir en el navegador

- Abre **Chrome** o **Edge**.
- En la barra de direcciones escribe **exactamente** (cambia el puerto si es otro):

```
http://localhost:3000
```

- Pulsa **Enter**.

No uses “localhost” sin puerto. No uses `https://`. No abras un archivo desde el disco (no debe ser `file://...`).

## 6. Qué deberías ver

- Si todo va bien: pantalla oscura con el texto **“Smart Padel”** y debajo *“Si ves este texto, el servidor está respondiendo.”*
- Si no ves nada: la barra de direcciones debe ser `http://localhost:XXXX` (con el mismo número que en la terminal).

## Si sigue sin verse

1. Prueba otra ruta: `http://localhost:3000/ping` (con tu puerto).
2. Comprueba que en la terminal no haya líneas en rojo (errores).
3. Prueba en otra ventana de incógnito (por si hay extensiones bloqueando).
4. Comprueba que no tengas otro programa usando el puerto 3000 (cierra otras terminales con `npm run dev` o `next dev`).
