# Checklist – Cierre antes de marzo

Lista mínima para dejar la app lista para uso en producción.

---

## Hecho en código (ya aplicado)

- [x] Claves en `.env.local` (no en git); rotar si se filtraron.
- [x] Dejar de guardar contraseñas en texto plano; botón “Limpiar contraseñas guardadas” en Admin → Ajustes.
- [x] APIs protegidas (auth opcional hasta configurar `FIREBASE_SERVICE_ACCOUNT_KEY`).
- [x] Validación de entradas en APIs (tournaments, matches, ai).
- [x] Rate limit en `/api/ai` (40 req/min por IP).
- [x] Botón/link **Nuevo torneo** en Torneos y en el menú lateral.
- [x] Si ya estás logueado, **/** y **/login** te redirigen a **/tournaments**.
- [x] Tras login correcto (email o Google) se va a **/tournaments** (no a inicio).
- [x] Pantalla de carga mientras se comprueba la sesión en inicio, login y nuevo torneo.
- [x] En **/tournaments**, el botón/link "Nuevo torneo" y "Crear mi primer torneo" solo se muestran a usuarios con rol **admin**.

---

## Tú debes hacer (una vez)

1. **Limpiar contraseñas en Firestore**  
   Admin → Ajustes → pestaña Gestión de usuarios → “Limpiar contraseñas guardadas”. Ejecutar una vez.

2. **Activar protección de APIs (opcional pero recomendado)**  
   - Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada.  
   - En `.env.local` (y en Vercel/hosting):  
     `FIREBASE_SERVICE_ACCOUNT_KEY=<pegado del JSON en una línea>`.

3. **Reglas de Firebase**  
   En Firebase Console → Firestore y Realtime Database → Reglas:  
   - Solo lectura/escritura para usuarios autenticados donde corresponda.  
   - No dejar `read, write: if true` en producción.  
   - Para que todos los usuarios vean el título y nombre del club (Ajustes → General): permitir **lectura** del documento `admin/settings` a usuarios autenticados; **escritura** solo para admins.

4. **Deploy**  
   - Configurar en Vercel (o tu hosting) todas las variables de `.env.local` (incl. `FIREBASE_SERVICE_ACCOUNT_KEY` si la usas).  
   - `npm run build` debe pasar sin errores.

5. **Dominio y HTTPS**  
   Dejar el sitio en HTTPS y, si usas dominio propio, apuntarlo en el hosting.

---

## Opcional (si da tiempo)

- Probar flujo completo: registro → login → nuevo torneo → partidos → marcador → pantalla TV.
- Revisar que las pantallas de display/pizarra funcionen en el dispositivo final (tablet/TV).
- Añadir una página 404 amigable (`src/app/not-found.tsx`).

---

## Para después (diseño / consistencia)

- **Revisión tipografía y estilos**: unificar en toda la app la misma fuente, tamaño y color para:
  - Títulos de sección (ej. nombre de torneo, nombre de pista “Pista 1”, “Pista 2”, etc.).
  - Subtítulos y etiquetas.
  - Objetivo: que todos los títulos del mismo tipo (p. ej. “Pista X”) tengan el mismo estilo, color y tamaño y guarden relación en toda la aplicación.

Cuando termines los puntos de “Tú debes hacer”, la app queda cerrada para marzo a nivel funcional y de seguridad básica.
