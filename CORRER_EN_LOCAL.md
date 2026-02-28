# Ver la app en local

## Si la página no carga o no se ve nada

1. **Cierra cualquier otra instancia de Next.js**
   - Cierra terminales donde tengas `npm run dev` o `next dev` corriendo.
   - En el Administrador de tareas (Ctrl+Mayús+Esc) revisa si hay procesos `node` y termínalos si están usando el puerto.

2. **Borra la carpeta `.next` y el lock**
   - En la raíz del proyecto (Padel Score), borra la carpeta `.next` (o al menos `.next/dev/lock` si existe).
   - Vuelve a ejecutar el servidor.

3. **Arranca el servidor de desarrollo**
   - En PowerShell:
     ```powershell
     cd "c:\Users\matal\Desktop\ANTIGRAVITY\Padel Score"
     npm run dev
     ```
   - **Fíjate en el puerto** que muestra Next.js al arrancar. Por ejemplo:
     - `Local: http://localhost:3000` → abre **http://localhost:3000**
     - Si dice `using port 3003` → abre **http://localhost:3003**

4. **Abre esa URL en el navegador**
   - Usa exactamente la que salga en la terminal (ej. `http://localhost:3000` o `http://localhost:3003`).

5. **Si usas un archivo `.env.local`**
   - Asegúrate de que existe y tiene las variables que pide el proyecto (por ejemplo Firebase). Sin ellas, la app puede quedarse en blanco o fallar al cargar.

## Resumen rápido

```powershell
cd "c:\Users\matal\Desktop\ANTIGRAVITY\Padel Score"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Luego abre en el navegador la URL que indique la terminal (normalmente `http://localhost:3000`).

**Comprobar que el servidor responde:** abre `http://localhost:3000/ping` (o el mismo puerto que uses). Si ves "OK — Smart Padel está funcionando", el servidor y Next están bien; si la página principal sigue en blanco, el fallo está en la app (auth, Firebase o consola del navegador).
