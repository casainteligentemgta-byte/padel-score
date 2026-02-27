# Criterios unificados: tamaños y colores de texto

Todo el texto de la app sigue esta escala. Las variables y clases están en `src/app/globals.css`.

---

## Tamaños de letra

| Token   | Tamaño | Uso |
|--------|--------|-----|
| `--text-xs`   | 10px | Meta, chips, "Pista X" en listas |
| `--text-sm`   | 12px | Labels pequeños, botones |
| `--text-base` | 14px | Cuerpo de texto |
| `--text-md`   | 16px | Inputs, cuerpo destacado |
| `--text-lg`   | 18px | Nombre de pista, título de sección |
| `--text-xl`   | 24px | Título de página |
| `--text-2xl`  | 36px | Hero (pantalla score, display TV) |

**Clases de utilidad:** `.text-size-xs`, `.text-size-sm`, `.text-size-base`, `.text-size-md`, `.text-size-lg`, `.text-size-xl`, `.text-size-2xl`

---

## Colores de texto

| Token   | Uso |
|--------|-----|
| **Primary** (blanco) | Títulos y contenido principal |
| **Secondary** (gray-400) | Texto secundario |
| **Muted** (gray-500) | Meta, subtítulos, hints |
| **Accent** (padel-primary) | Destacado, marca, CTAs |

**Clases de utilidad:** `.text-type-primary`, `.text-type-secondary`, `.text-type-muted`, `.text-type-accent`

---

## Clases semánticas (recomendadas)

| Clase | Tamaño | Color | Uso |
|-------|--------|-------|-----|
| `.title-page` | xl (24px) | primary | Título principal de página |
| `.title-section` | lg (18px) | primary | Título de sección |
| `.subtitle-page` | xs (10px) | muted | Subtítulo bajo un título |
| `.label-cancha` | lg (18px) | primary | Nombre de pista destacado |
| `.label-cancha-hero` | 2xl (36px) | primary | Nombre de pista en pantalla grande |
| `.label-cancha-meta` | xs (10px) | muted | "Pista X" en listas/chips |

Para cambiar el criterio de toda la app, basta con ajustar las variables en `:root` en `globals.css`.
