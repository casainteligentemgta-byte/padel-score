# Smart Pádel

App Next.js con **Social Auth (Google)**, **perfil de usuario** (fecha de nacimiento desde Google si está disponible, editable después) y **lógica de cruce de horarios** para el check-in.

## Configuración

1. Copia `.env.example` a `.env.local` y rellena las variables de Supabase.
2. En el dashboard de Supabase: **Authentication → Providers** activa Google y configura el cliente OAuth.
3. Crea las tablas (por ejemplo con las migraciones que tengas para `profiles`). Si `birth_date` es `NOT NULL`, en el primer login sin fecha desde Google tendrás que usar un valor por defecto o hacer la columna nullable hasta que el usuario la complete en el perfil.

## Uso

- **Login**: `/login` — botón "Continuar con Google".
- **Perfil**: `/perfil` — editar nombre, fecha de nacimiento y teléfono (la fecha se rellena desde Google si el proveedor la envía).
- **Demo check-in**: `/check-in-demo` — prueba el algoritmo que evita asignar dos partidos a la misma hora a un mismo jugador.

## Cruce de horarios (check-in)

En `src/lib/scheduleConflicts.ts`:

- **`hasScheduleConflict(candidateSlot, existingMatches)`**: devuelve `true` si asignar ese partido haría que algún jugador tenga dos partidos solapados.
- **`canAssignMatch(candidateSlot, existingMatches)`**: devuelve `true` si se puede asignar sin conflicto.
- **`getConflictingMatches(candidateSlot, existingMatches)`**: devuelve los partidos existentes con los que habría conflicto.

Úsalas antes de confirmar un check-in o al generar la programación para no asignar el mismo jugador a dos partidos a la misma hora.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build
- `npm run start` — producción
