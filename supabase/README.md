# Supabase – Publicidad y pantallas

## Despliegue del esquema

1. En el [Dashboard de Supabase](https://app.supabase.com) → tu proyecto → **SQL Editor**.
2. Pega y ejecuta el contenido de `migrations/001_publicidad_pantallas.sql`.

## Bucket de Storage "publicidad"

Para que las URLs de archivos subidos (videos/imágenes) funcionen:

1. Ve a **Storage** en el Dashboard.
2. **New bucket** → nombre: `publicidad`.
3. Marca **Public bucket** (para que las URLs sean accesibles sin auth).
4. Crea el bucket.

Opcional: en **Policies** del bucket, permite `INSERT`/`UPDATE` para usuarios autenticados y `SELECT` para todos si es público.

## Realtime

Para que las pantallas se actualicen al instante cuando cambies el contenido desde el admin:

1. **Database** → **Replication**.
2. En la publicación `supabase_realtime`, añade la tabla `display_estado`.
