# Checklist: Probar en producción (Vercel)

Usa esta lista para verificar que login, inscripción e "Inscribirme" funcionan en el despliegue de Vercel.

---

## Antes de probar

- [ ] **URL de producción:** Anota la URL de tu proyecto en Vercel (ej. `padel-score-xxx.vercel.app`).
- [ ] **Variables de entorno en Vercel:** En el proyecto → Settings → Environment Variables, confirma que existan:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Supabase – Redirect URLs:** En Supabase → Authentication → URL Configuration:
  - **Site URL:** tu URL de producción (ej. `https://padel-score-xxx.vercel.app`)
  - **Redirect URLs:** incluir `https://padel-score-xxx.vercel.app/**` y `https://tu-dominio.com/**` si usas dominio propio.

---

## 1. Login

- [ ] Abrir la URL de producción.
- [ ] Deberías ver la pantalla de login (email/contraseña y opción Google si está configurada).
- [ ] Iniciar sesión con **email y contraseña** (una cuenta ya creada en Supabase).
- [ ] Tras el login, redirige a `/tournaments` o al listado de torneos.
- [ ] Cerrar sesión y comprobar que vuelves a la pantalla de login.

**Si falla:** Revisar consola del navegador (F12) y que las variables de entorno estén bien en Vercel y que la URL de producción esté en Redirect URLs de Supabase.

---

## 2. Registro de jugador (formulario 3 bloques)

- [ ] Con la sesión iniciada, ir a **Jugadores** (o la ruta donde esté el enlace a registro, ej. `/players` o desde el menú).
- [ ] Entrar en **Registrarse** o **Registro de jugador** (ruta tipo `/players/register`).
- [ ] Comprobar que ves los **3 bloques**: datos personales y técnicos (nombre, apellido, **sexo**, nivel, posición…), información médica y equipación, contacto y perfil.
- [ ] Rellenar al menos nombre y apellido, elegir sexo, y hacer scroll hasta el final para ver el botón **Finalizar registro**.
- [ ] Pulsar **Finalizar registro** y comprobar que se guarda y te lleva a la lista de jugadores o mensaje de éxito.

**Si falla:** Revisar que Supabase tenga la tabla `participants` (o la que use tu `dataService`) y que el usuario esté autenticado.

---

## 3. Inscribirme (varias categorías)

- [ ] Ir al **listado de torneos** (`/tournaments`).
- [ ] Abrir un torneo que **no seas tú el organizador** (o usar una cuenta de jugador).
- [ ] En la cabecera del torneo debe aparecer el botón **Inscribirme**.
- [ ] Pulsar **Inscribirme** → deberías ir a `/tournaments/[id]/inscribirme`.
- [ ] Comprobar que se muestran **categorías de inscripción** (si el torneo tiene `inscriptionCategories`; si no, puede salir el mensaje de que no hay categorías configuradas).
- [ ] Marcar **una o varias categorías**, marcar la casilla de **aceptar términos** y pulsar **Inscribirme en X categoría(s)**.
- [ ] Debe mostrarse mensaje de éxito y opción de volver al torneo.

**Si no hay categorías:** El torneo se creó sin categorías de inscripción. Crea un torneo nuevo desde **Nuevo torneo** (Paso 1) y añade al menos una categoría en "Categorías de inscripción", o edita el torneo si tienes esa opción.

---

## 4. Resumen rápido

| Qué probar        | Dónde                    | Qué comprobar                                      |
|-------------------|--------------------------|----------------------------------------------------|
| Login             | `/` o `/login`           | Entrar con email/contraseña y llegar a torneos     |
| Registro jugador  | `/players/register`      | 3 bloques, sexo, guardar y ver éxito                |
| Inscribirme       | Torneo → Inscribirme     | Ver categorías, elegir varias, aceptar términos, OK |

---

Cuando termines, anota qué falló (pantalla, mensaje de error o consola) para poder afinar el siguiente paso.
