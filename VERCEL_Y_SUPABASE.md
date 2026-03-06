# Login en local y en Vercel (Supabase)

## Si en local no se ve nada

1. **Prueba la ruta de diagnóstico**: abre **http://localhost:3000/test**  
   - Si ves "OK", Next.js está bien; el fallo está en la página principal (/).  
   - Si tampoco ves nada, revisa que el servidor esté en marcha (`npm run dev`) y que uses esa URL.

2. **Variables de entorno**: en la raíz del proyecto crea o edita `.env.local` con:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
   (Valores en Supabase → Project Settings → API.)

3. **Consola del navegador**: F12 → pestaña Console. Si hay errores en rojo, copia el mensaje.

---

## Para que el login funcione en Vercel

1. **Variables en Vercel**  
   En el proyecto de Vercel: **Settings → Environment Variables** y añade:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase  
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key  

   Luego **redeploy** (Deployments → ⋮ en el último deploy → Redeploy).

2. **URLs en Supabase**  
   En **Supabase → Authentication → URL Configuration**:
   - **Site URL**: pon la URL de tu app en Vercel, p. ej. `https://tu-proyecto.vercel.app`
   - **Redirect URLs**: añade (una por línea):
     - `https://tu-proyecto.vercel.app/**`
     - `http://localhost:3000/**`  
   Guarda los cambios.

Sin estos pasos, el login puede fallar o no redirigir bien en Vercel.
