# Estimación: migrar todo de Firebase a Supabase

## Qué ya está en Supabase

- **Auth:** login, registro, sesión, recuperar contraseña.
- **Datos principales:** torneos, partidos, perfiles, participantes, grupos, gastos, anuncios, inscripciones, admin_settings (vía `dataService`).
- **APIs:** protección con JWT de Supabase y rol desde `profiles`.

---

## Qué sigue usando Firebase

| Área | Uso | Archivos aprox. |
|------|-----|------------------|
| **Firestore** | Lectura/escritura y **realtime** (onSnapshot) de torneos y partidos | ~15 archivos (control, score, event, live, display, monitor, broadcasting, ads, etc.) |
| **Realtime Database (RTDB)** | Estado en vivo: marcador por cancha, banners, pantallas TV | ~8 archivos (rtdb.ts, rtdbService, useRTDBRole, useAdBanner, marker, display, score) |
| **Storage** | Subida de comprobantes (validación de pagos) | 1–2 archivos |
| **API /api/insights** | Lectura de torneos/gastos/participantes para informes | 1 archivo |
| **authServer (Firebase Admin)** | Ya no se usa en las APIs (usan Supabase); se puede eliminar | 1 módulo |

---

## Complejidad por parte

1. **Storage**  
   Sustituir por Supabase Storage (upload + URL pública).  
   **Esfuerzo:** bajo (0,5–1 día).

2. **API /api/insights**  
   Usar `dataService` o consultas Supabase en lugar de Firestore.  
   **Esfuerzo:** bajo (0,5 día).

3. **Firestore (sin realtime)**  
   Donde solo haya getDoc/updateDoc/addDoc sin onSnapshot, pasar a `dataService` o Supabase client.  
   **Esfuerzo:** medio (2–4 días), según cantidad de pantallas y lógica.

4. **Firestore con realtime (onSnapshot)**  
   Sustituir por **Supabase Realtime** (suscribirse a cambios en tablas `tournaments` / `tournament_matches`). Implica:
   - Un canal o suscripción por torneo/partido.
   - Adaptar la forma de actualizar estado en la UI (Supabase devuelve payloads distintos a Firestore).
   **Esfuerzo:** alto (1–2 semanas), con pruebas de sincronización entre varias pestañas/canchas.

5. **RTDB (Realtime Database)**  
   Usado para estado “en vivo” (marcador, banners, pantallas). Opciones:
   - **Supabase Realtime (Broadcast/Presence)** para estado volátil por cancha.
   - O una tabla en Postgres (ej. `live_state`) y suscripción Realtime a esa tabla.
   **Esfuerzo:** alto (1–2 semanas), porque toca flujos críticos (marcador, TV).

6. **Eliminar Firebase y limpieza**  
   Quitar `firebase`, `firebase-admin`, `authServer.ts`, `rtdb.ts`, y todas las importaciones.  
   **Esfuerzo:** bajo–medio (1–2 días).

---

## Estimación global

| Escenario | Tiempo (1 dev, a tiempo completo) |
|-----------|-----------------------------------|
| **Solo Storage + insights + authServer** | **3–5 días** |
| **Todo lo anterior + Firestore sin realtime** | **1–2 semanas** |
| **Migración completa (incl. realtime Firestore y RTDB)** | **3–5 semanas** |

En **días-persona** (por si repartes tareas):

- **Mínimo (solo lo fácil):** ~5 días.
- **Completo (sin Firebase en nada):** ~20–25 días.

---

## Orden recomendado si migras todo

1. Storage + `/api/insights` + quitar uso de `authServer` (si ya no lo usas).
2. Pantallas que solo lean/escriban torneos/partidos sin depender de onSnapshot (sustituir por `dataService` o Supabase).
3. Sustituir **onSnapshot** por Supabase Realtime en torneos/partidos (control, score, event, live, display, etc.).
4. Sustituir **RTDB** por Supabase Realtime (broadcast/tabla) en marker, display, banners.
5. Eliminar Firebase del proyecto y ajustar tests/documentación.

Si quieres una cifra única para planificar: **migrar todo de Firebase suele llevar del orden de 3–5 semanas** con una persona, incluyendo pruebas y algún margen para imprevistos.
