# Storage: bucket "patrocinantes" y políticas RLS

Si al subir el logo del patrocinante ves **"new row violates row-level security policy"**, el bucket existe pero las políticas de Storage no permiten la subida.

## Opción 1: Desde el Dashboard de Supabase

1. Entra en **Supabase** → tu proyecto → **Storage**.
2. Abre el bucket **patrocinantes**.
3. Ve a la pestaña **Policies**.
4. Pulsa **"New policy"**.
5. Elige **"For full customization"** (o "Get started quickly" y luego edita).
6. Crea **dos políticas** (o una que permita INSERT y SELECT):

### Política 1: Permitir subida (INSERT)

- **Policy name:** `Allow uploads to patrocinantes`
- **Allowed operation:** `INSERT`
- **Target roles:** marca **anon** y **authenticated**
- **USING expression:** (deja vacío para INSERT)
- **WITH CHECK expression:** `bucket_id = 'patrocinantes'`

### Política 2: Permitir lectura (SELECT) – para URLs públicas

- **Policy name:** `Allow public read patrocinantes`
- **Allowed operation:** `SELECT`
- **Target roles:** **anon** y **authenticated**
- **USING expression:** `bucket_id = 'patrocinantes'`

Guarda ambas. Vuelve a intentar subir el logo.

---

## Opción 2: Con SQL en el Editor de Supabase

En **SQL Editor** ejecuta:

```sql
-- Permitir subir archivos al bucket patrocinantes (usuarios autenticados y anon)
CREATE POLICY "Allow uploads to patrocinantes"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'patrocinantes');

-- Permitir leer (para que las URLs de las imágenes funcionen)
CREATE POLICY "Allow public read patrocinantes"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'patrocinantes');
```

Si ya tienes políticas por defecto que den error al crear, puedes usar nombres distintos (ej. `patrocinantes_insert`, `patrocinantes_select`) o borrar políticas viejas que afecten a este bucket.

---

## Comprobar

- El bucket **patrocinantes** debe existir y estar marcado como **Public bucket** si quieres que las URLs de los logos se vean sin login.
- Después de guardar las políticas, prueba de nuevo **Subir logo** en el Generador Maestro.
