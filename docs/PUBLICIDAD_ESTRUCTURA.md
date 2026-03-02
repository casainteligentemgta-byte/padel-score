# Estructura Next.js – Sistema de publicidad y pantallas (Supabase)

## Estructura de carpetas

```
src/
├── app/
│   ├── admin/
│   │   └── publicidad/
│   │       ├── page.tsx              # Panel admin: contenido, tira, selector pantallas
│   │       ├── layout.tsx            # (opcional) Layout con Sidebar
│   │       └── componentes locales   # Formularios, Dropzone, gestor tira
│   │
│   └── display/
│       └── [id]/
│           └── page.tsx              # Vista pantalla completa (Fullscreen) por ID de pantalla
│
├── components/
│   └── publicidad/                   # Componentes reutilizables
│       ├── DropzoneMedia.tsx         # Subida de archivos a Supabase Storage
│       ├── TiraInformativaMarquee.tsx # Tira deslizante (marquee) inferior
│       ├── ReproductorPrincipal.tsx   # Video (react-player) o carrusel imágenes
│       └── LogosSponsors.tsx         # Esquina superior logos
│
└── lib/
    └── supabase/
        ├── client.ts                 # createBrowserClient (Supabase)
        ├── publicidad.ts             # Tipos TS y helpers (media_content, pantallas, etc.)
        └── realtime.ts               # Suscripción a display_estado por pantalla_id
```

## Rutas

| Ruta | Uso |
|------|-----|
| `/admin/publicidad` | Panel administrador: cargar contenido, tira informativa, lanzar a pantallas |
| `/display/[id]` | Vista pantalla (fullscreen). `id` = UUID de `pantallas.id` |

## Dependencias sugeridas

- `@supabase/supabase-js` – cliente y Realtime
- `react-dropzone` – Dropzone para subir archivos
- `react-player` – YouTube/Vimeo con autoplay y mute

```bash
npm install @supabase/supabase-js react-dropzone react-player
```

## Variables de entorno

En `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Flujo de datos

1. **Admin** sube contenido → `media_content` (y archivos en Storage bucket `publicidad`).
2. **Admin** asigna contenido a pantalla(s) o “Modo Global” → `configuracion_display` y/o `display_estado`.
3. **Pantalla** (`/display/[id]`) suscrita a Realtime en `display_estado` (y opcionalmente `tira_informativa`) y actualiza la UI sin recargar.
