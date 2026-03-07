# Proceso de inscripción – Smart Padel

Documento que describe el flujo de inscripción a torneos desde el registro del jugador hasta la validación del pago por parte del administrador.

---

## 1. Resumen del flujo

```
[Jugador] → Registro de datos (opcional) → [Participante]
     ↓
[Admin/Organizador] crea torneo y categorías
     ↓
[Inscripción] = Participante + Torneo + Categoría + Pago
     ↓
[Comprobante] → Subida y/o OCR → [Validación admin] → Estado: pending | paid | alert
```

---

## 2. Registro del jugador (datos personales y deportivos)

**Ruta:** `/players/register`  
**Quién:** Usuario logueado (para guardar bajo su cuenta).  
**Opcional:** Un jugador puede inscribirse a un torneo sin haber pasado antes por este formulario (el admin puede cargar inscripción con nombre/email manual).

### Pasos del formulario de registro (3 bloques)

1. **Datos personales y técnicos**
   - Nombres, apellido, fecha de nacimiento, teléfono/WhatsApp
   - Cédula/DNI, perfil Instagram
   - **Sexo** (Masculino / Femenino)
   - Nivel de juego (1–7), posición habitual (Drive, Revés, Ambos)
   - Foto (cámara o galería)

2. **Información médica y equipación**
   - Grupo sanguíneo, alergias, padecimientos/lesiones
   - Tallas: franela, short, zapato (EU)

3. **Contacto y perfil**
   - WhatsApp, Instagram, correo (opcional)
   - Resumen y foto de perfil
   - Botón **Finalizar registro**

**Guardado:** Se llama a `dataService.addParticipant(...)` con `ownerId = user.uid`. El jugador queda como **participante** asociado al usuario y puede ser usado en torneos e inscripciones.

**Variante “Mis datos”:** Si se entra con `?mis-datos=1`, el mismo formulario sirve para actualizar los datos del jugador/perfil.

---

## 3. Participantes y grupos

**Ruta:** `/participants`  
**Quién:** Usuario logueado (ver y gestionar sus jugadores y grupos).

- **Participantes:** Lista de jugadores registrados por el usuario (`dataService.getMyParticipants(ownerId)`). Se pueden añadir desde el modal o desde `/players/register`.
- **Grupos:** Parejas o equipos definidos por el usuario (`dataService.getMyGroups(ownerId)`), asociados a participantes.

Estos participantes y grupos están disponibles al crear torneos y al generar inscripciones (por ejemplo en admin o en un futuro flujo de auto‑inscripción).

---

## 4. Creación del torneo y categorías

**Ruta:** `/new-tournament`  
**Quién:** Solo admin.

- El admin define nombre, fechas, categorías, precios por categoría, etc.
- Puede asociar **participantes** y **grupos** al torneo (disponibles para emparejar e inscripciones).
- El torneo queda guardado con un `id` que se usa en las inscripciones.

---

## 5. Inscripción a un torneo

Una **inscripción** vincula:

- Un **torneo** (`tournamentId`)
- Una **categoría** (`categoryKey`, `categoryPrice`)
- Un **participante** (por nombre/email o `participantId` si existe)
- **Pago:** monto extraído del comprobante (opcional), URL del comprobante, estado de pago

### Modelo de datos (InscriptionData)

| Campo              | Descripción                                      |
|--------------------|--------------------------------------------------|
| `tournamentId`     | ID del torneo                                   |
| `tournamentName`   | Nombre del torneo (opcional, para listados)     |
| `categoryKey`      | Clave de la categoría (ej. "Primera", "Segunda")|
| `categoryPrice`    | Precio de la categoría                           |
| `participantName`  | Nombre del participante                          |
| `participantEmail` | Email del participante                          |
| `participantId`    | ID del participante (si ya existe en la base)    |
| `amountExtracted`  | Monto leído del comprobante (OCR o manual)      |
| `receiptUrl`       | URL del comprobante subido                      |
| `paymentStatus`    | `pending` \| `paid` \| `alert`                  |
| `alertMessage`     | Mensaje si hay discrepancia (ej. monto ≠ precio)|

**Guardado:** `dataService.addInscription(data, ownerId)` → tabla `inscriptions` en Supabase.

---

## 6. Validación de pagos (admin)

**Ruta:** `/admin/validacion-pagos`  
**Quién:** Solo admin.

Flujo:

1. **Alta de inscripción**
   - Formulario: torneo (ID), nombre torneo, categoría, precio de categoría, nombre y email del participante.
   - Opcional: subir **comprobante** (imagen). Se sube a Firebase Storage y se guarda `receiptUrl`.

2. **OCR del comprobante**
   - Se usa `extractAmountFromReceipt(archivo)` para obtener el monto del comprobante.
   - El monto se compara con el precio de la categoría (`validatePaymentAgainstCategoryPrice`).

3. **Estado de pago**
   - **paid:** monto extraído coincide con el precio de la categoría → inscripción marcada como pagada.
   - **alert:** monto no coincide o falta → se guarda `alertMessage` y la inscripción queda en alerta para revisión.
   - **pending:** sin comprobante o sin validar.

4. **Listado de alertas**
   - Se listan inscripciones con `payment_status = 'alert'`.
   - El admin puede marcar manualmente como **Pagado** (`dataService.updateInscription(id, { paymentStatus: 'paid', alertMessage: null })`).

---

## 7. Términos y condiciones de inscripción

**Ruta:** `/terminos-inscripcion`  
**Contenido (resumen):**

- Al inscribirse en un torneo, el usuario acepta estos términos.
- **Comprobantes:** Declaración de veracidad; comprobantes falsos pueden anular la inscripción.
- **Datos personales:** Uso para gestión del torneo, comunicación y fines permitidos; referencia a Política de Privacidad (Venezuela).
- **Conducta:** Respeto al reglamento y normas del torneo.

Es recomendable que, en cualquier flujo donde el usuario formalice una inscripción (por ejemplo un futuro “Inscribirme a este torneo”), se muestre un enlace o checkbox a estos términos antes de confirmar.

---

## 8. Rutas y permisos

| Ruta                      | Rol      | Descripción                              |
|---------------------------|----------|------------------------------------------|
| `/players/register`       | Cualquiera (logueado) | Registro de jugador (3 bloques, incl. sexo) |
| `/participants`           | Cualquiera (logueado) | Ver/gestionar participantes y grupos   |
| `/tournaments/[id]/inscribirme` | Jugador (logueado) | Inscribirse en una o varias categorías; se evitan choques de horario |
| `/new-tournament`         | Admin    | Crear torneo y categorías de inscripción |
| `/admin/validacion-pagos` | Admin    | Alta de inscripciones y validación pago  |
| `/terminos-inscripcion`   | Público  | Lectura de términos de inscripción      |

---

## 9. Auto-inscripción del jugador (implementado)

- **Ruta:** `/tournaments/[id]/inscribirme`. Botón "Inscribirme" en la cabecera del torneo (solo para no propietarios).
- El torneo debe tener **`inscriptionCategories`**: array de `{ key, name, price, gender? }`. El jugador elige una o varias categorías, acepta términos y se crea una inscripción por categoría.
- **Evitar choques:** El `MasterScheduleEngine` usa `canPlay()` para no asignar a un mismo jugador dos partidos en el mismo slot, aunque esté en varias categorías.

## 10. Posibles extensiones del proceso

- **Auto‑inscripción desde la app:** Pantalla “Inscribirme” en un torneo: elegir categoría, aceptar términos, subir comprobante y crear inscripción (con `paymentStatus: pending` o validación automática si hay OCR).
- **Email al inscribir:** Envío de confirmación o enlace al comprobante al email del participante.
- **Cupos por categoría:** Límite de plazas por categoría y comprobación antes de guardar la inscripción.
- **Pago en línea:** Integración con pasarela de pago y marcar `paid` automáticamente al confirmar el pago.

---

## 11. Directrices de elegibilidad (sexo y edad)

**Regla:** No se debe permitir inscribir a un jugador en una categoría que no corresponda a su **sexo** ni a su **edad**.

### 11.1 Sexo

- Cada categoría de inscripción puede tener **género:** `MALE` (masculino), `FEMALE` (femenino) o `MIXED` (mixto).
- El jugador solo puede inscribirse en categorías donde el género de la categoría coincida con el suyo, o la categoría sea **MIXED**.
- El sexo del jugador se toma de su **ficha de jugador** (participante en `/players/register`, campo `gender`). Si no tiene ficha o no tiene sexo, solo se le muestran categorías **MIXED** (o se le pide completar la ficha).

### 11.2 Edad

- Las categorías pueden definir **rango de edad** opcional: `ageMin` y `ageMax` (años cumplidos).
- El jugador solo puede inscribirse en categorías cuya franja de edad incluya su edad actual (calculada desde `birthDate` del participante). Si la categoría no tiene `ageMin`/`ageMax`, cualquier edad puede inscribirse.
- Si el jugador no tiene fecha de nacimiento, solo se le muestran categorías **sin restricción de edad** (o se le pide completar la ficha).

### 11.3 Resumen

| Categoría | Jugador | ¿Puede inscribirse? |
|-----------|---------|---------------------|
| MALE / FEMALE / MIXED | Mismo sexo o MIXED | Sí |
| MALE | Sexo femenino | No |
| ageMin–ageMax | birthDate y edad en rango | Sí |
| ageMin–ageMax | Sin birthDate o edad fuera | No |
| Sin edad | Cualquiera | Sí |

La pantalla `/tournaments/[id]/inscribirme` filtra las categorías y valida al enviar para cumplir estas directrices.

### 11.4 Cupos por categoría

- Al crear una categoría, el organizador indica el **nº de parejas** (ej. 8). Los cupos se crean automáticamente: **maxSlots = parejas × 2** (cada pareja = 2 plazas). Si no indica parejas, no hay límite.
- Al inscribirse, se cuentan las inscripciones existentes por categoría (tabla `inscriptions`, `tournament_id` + `category_key`). Si el número de inscritos alcanza el cupo, la categoría se muestra como **Completo** y no se puede seleccionar.
- En la pantalla "Inscribirme" se muestra "X / N plazas" cuando la categoría tiene cupo. Si todas las categorías elegibles están completas, se muestra un mensaje y no se puede enviar.

---

*Última actualización: 2025. Incluye auto-inscripción, sexo en registro de jugador, evitación de cruces de horarios, directrices de elegibilidad por sexo y edad, y cupos por categoría.*
