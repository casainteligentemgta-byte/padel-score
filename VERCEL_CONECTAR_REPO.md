# Vercel sigue construyendo un commit antiguo (c5b24c8)

Tu código en **GitHub** ya está corregido (rama `main` en commit 00037d2).  
Vercel sigue construyendo **c5b24c8**, por eso el build falla. Eso indica que **el proyecto de Vercel está conectado a otro repositorio o a una copia antigua**.

## Qué hacer en Vercel

### 1. Comprobar el repositorio conectado
1. Entra en [vercel.com](https://vercel.com) → tu proyecto **padel-score**.
2. Ve a **Settings** → **Git**.
3. En **Connected Git Repository** debe aparecer exactamente:
   - **casainteligentemgta-byte / padel-score**
   - Rama: **main** (o **production**).

Si aparece **otro autor** (otro usuario u organización), Vercel está construyendo ese otro repo (por ejemplo un fork tuyo que no se actualiza).

### 2. Opción A: Conectar el repo correcto
- Si el repo mostrado **no** es `casainteligentemgta-byte/padel-score`:
  - Haz clic en **Disconnect**.
  - Vuelve a **Connect Git Repository** y elige **GitHub**.
  - Busca y selecciona **casainteligentemgta-byte/padel-score**.
  - Elige la rama **main** como Production Branch.
  - Guarda. Se lanzará un deploy con el código actual (commit 00037d2 o superior).

### 3. Opción B: Si usas un fork
- Si Vercel está conectado a **tu fork** (ej. `tu-usuario/padel-score`):
  - Entra en tu fork en GitHub.
  - **Sync** o **Update branch** desde `casainteligentemgta-byte/padel-score` (upstream),  
    o haz merge de `main` de upstream a la `main` de tu fork.
  - Cuando tu fork tenga los commits 0adcfee / 00037d2, el siguiente deploy en Vercel usará el código corregido.

### 4. Comprobar en GitHub que el código está actualizado
- Abre: https://github.com/casainteligentemgta-byte/padel-score/commits/main  
- El primer commit de la lista debe ser **00037d2** o **0adcfee** (no c5b24c8).

---

**Resumen:** El fallo del `uid` duplicado está corregido en `casainteligentemgta-byte/padel-score`.  
Vercel tiene que construir **ese** repositorio (y la rama `main` o `production`) para que el build pase.
