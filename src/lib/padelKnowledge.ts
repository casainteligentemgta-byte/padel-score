/**
 * PADEL KNOWLEDGE BASE — Contexto estático de conocimiento de pádel
 * Este archivo actúa como la "fuente de verdad" base del agente de IA.
 * La capa RAG de Firestore enriquece esto con documentos dinámicos.
 */

export const PADEL_CORE_KNOWLEDGE = `
# REGLAMENTO OFICIAL DE PÁDEL (FIP - Federación Internacional de Pádel)

## 1. LA PISTA
- Dimensiones: 20m de largo × 10m de ancho (pista doble oficial).
- Superficie: Césped artificial, moqueta o hormigón poroso.
- Paredes: Cristal/revestimiento opaco en fondos (3m altura), malla metálica en laterales.
- Red: 88cm de altura en los postes, 92cm en el centro.
- Zona de servicio: Cuadros de saque de 3m × 5m a cada lado.
- Puertas: 2 laterales por cada lado, de 2m de alto × 1m de ancho.

## 2. PUNTUACIÓN OFICIAL
### Sistema de juego:
- Un partido se disputa al mejor de 3 sets (en torneos profesionales, 3 sets).
- Cada set se gana llegando a 6 juegos con ventaja de 2 (6-0, 6-1, ... 7-5).
- Si hay empate 6-6: se juega tie-break a 7 puntos (con ventaja de 2).
- Tercer set: puede jugarse con super tie-break a 10 puntos (usado en muchos torneos amateur).

### Sistema de puntos dentro de un juego:
- 0 → 15 → 30 → 40 → Ventaja → Juego
- Deuce (40-40): se necesitan 2 puntos consecutivos para ganar el juego.
- Golden Point / Punto de Oro: sistema alternativo donde el punto decisivo (40-40) se juega sin ventaja. El receptor elige el lado del saque. Muy usado en torneos amateur y americanos.

## 3. EL SAQUE
- El saque se realiza siempre por debajo de la cintura del sacador.
- La pelota debe rebotar dentro del cuadro de servicio diagonal.
- Si la pelota toca la red y cae dentro: "let" → se repite el saque.
- Si la pelota toca la red y cae fuera o en zona incorrecta: falta.
- 2 faltas consecutivas = punto para el rival (doble falta).
- El sacador tiene 25 segundos entre puntos para sacar.
- El saque se efectúa desde detrás de la línea de fondo, entre la línea central y la pared lateral.
- Posición: pie trasero no puede pisar la línea de fondo; pie delantero puede estar sobre la línea.

## 4. EL JUEGO - REGLAS PRINCIPALES
- La pelota puede golpear las paredes DESPUÉS de botar en el suelo del campo propio.
- La pelota NO puede golpear el suelo 2 veces en el mismo campo.
- La pelota puede salir por las puertas laterales y seguir siendo válida si el jugador la devuelve antes de que bote 2 veces.
- La pelota no puede tocar las paredes del campo rival antes de botar.
- Los jugadores pueden entrar al campo rival para golpear la pelota (por las puertas o saltando la pared).
- La pared puede usarse como apoyo para el golpe (golpe de bandeja, víbora).

## 5. FALTAS COMUNES
- Doble bote: la pelota bota 2 veces en el propio campo.
- Pelota en red: sin pasar al campo rival.
- Pelota fuera: toca el suelo fuera de los límites ANTES del primer bote.
- Golpe de volea antes de que la pelota pase la red.
- Toque de red: jugador o raqueta toca la red durante el punto.
- Interferencia deliberada: obstruir al rival.
- Bote en la pared propia: la pelota toca primero la pared antes de botar en el suelo del campo propio (solo válido después del saque al regreso).

## 6. GOLPES TÉCNICOS PRINCIPALES
- **Bandeja**: golpe defensivo sobre la cabeza, con efecto cortado. Mantiene la pelota baja tras rebotar en el fondo.
- **Víbora**: variante de la bandeja con más potencia y efecto lateral. La pelota sale disparada por las paredes laterales.
- **Smash**: remate de potencia. El más agresivo es el "smash por 3 paredes".
- **Bajada de pared**: técnica de sacar la pelota que viene rebotada del fondo con un golpe bajo.
- **Globo** (lob): para pasar a los rivales en la red hacia el fondo.
- **Chiquita**: dejada suave y cortada cerca de la red.
- **Rulo**: golpe con efecto que roza la pared lateral y baja rápido.

## 7. CATEGORÍAS DE COMPETICIÓN
### World Padel Tour / Premier Padel (profesional):
- Categorías: Masculino y Femenino.
- Top 50 parejas del mundo compiten.
- Formato: Fases previas + cuadro principal con rondas de eliminación.

### Categorías amateur (típicas en clubes):
- **Primera**: Nivel alto, jugadores compiten regionalmente.
- **Segunda** / **Tercera**: Nivel medio.
- **Cuarta / Quinta / Sexta / Séptima**: Nivel iniciación a intermedio.
- **Octava / Baby Pádel / Open**: Categorías recreativas y de máxima inclusión.
- Género: Masculino, Femenino, Mixto.

## 8. FORMATOS DE TORNEO (DETALLE)

### AMERICANO INDIVIDUAL (Americano Clásico)
- Los jugadores rotan de pareja en cada partido.
- Objetivo: máxima puntuación individual acumulando puntos/juegos.
- Ideal: grupos de 8-16 jugadores.
- Cada partido: normalmente a 7 juegos o 16 puntos.
- Ganador: quien más puntos acumula al final.
- Ventaja: todos juegan con y contra todos. Muy social.

### AMERICANO POR DUPLAS (Parejas fijas)
- Las parejas son fijas durante todo el torneo.
- Todos los equipos se enfrentan entre sí (round robin).
- Clasificación por puntos/juegos ganados.
- Desempate: por juegos, luego por enfrentamiento directo.

### ROUND ROBIN (Liga)
- Grupos de 3-5 parejas. Todos contra todos dentro del grupo.
- Clasifican los 2 mejores de cada grupo al cuadro final.
- Puntuación: 2 puntos por victoria, 1 empate, 0 derrota.
- Desempate: 1) Puntos directos, 2) Sets, 3) Juegos, 4) Resultado directo.

### ELIMINACIÓN DIRECTA (Cuadro simple)
- Un partido decide. El perdedor queda eliminado.
- Variante: doble eliminación (el perdedor va a cuadro de consolación).
- Cuadros estándar: 8, 16, 32, 64 parejas.

### FORMATO MIXTO (Round Robin + Eliminación)
- Fase de grupos (Round Robin) → Cuadro principal (eliminación directa).
- El más usado en torneos de club grandes. Combina socialización con competencia.

## 9. SISTEMA DE RANKING Y PUNTOS

### Criterios habituales para ranking:
- Partidos ganados (3 pts victoria, 1 empate, 0 derrota).
- Sets ganados (desempate).
- Juegos ganados (segundo desempate).
- Enfrentamiento directo (tercer desempate).

### Puntuación para americanos:
- Por juego ganado: 1 punto.
- Por partido ganado: bonus 2-5 puntos (varía por organizador).
- Puntuación total = juegos propios + bonus victorias.

## 10. EQUIPAMIENTO
- **Raqueta / Pala**: Las raquetas de pádel son sólidas (no tienen cuerdas). Materiales: fibra de carbono, fibra de vidrio, EVA foam, goma HR.
  - Formas: Redonda (control), Diamante (potencia), Lagrima (equilibrado).
  - Peso regulación: máximo 400g (FIP).
  - Longitud máxima: 45.5cm.
- **Pelota**: similar al tenis pero con menos presión. Diámetro 6.35-6.77cm, peso 56-59.4g.
  - Marcas populares: Head, Bullpadel, Nox, StarVie, Wilson.
- **Vestimenta**: ropa deportiva estándar. Calzado específico de pádel recomendado.

## 11. TERMINOLOGÍA CLAVE
- **Ace**: punto directo con el saque (la pelota no toca la raqueta rival).
- **Winner**: golpe ganador (la pelota bota 2 veces en el campo rival sin que la toquen).
- **Unforced error**: error no forzado.
- **Break**: ganar el juego al resto (cuando no se saca).
- **Golden set**: set ganado sin perder ningún juego (6-0).
- **Tie-break**: desempate a 7 puntos cuando el marcador de set llega a 6-6.
- **Super tie-break**: desempate a 10 puntos (usado como tercer set en muchos torneos).
- **Left/Derecha, Revés/Drive**: posiciones en la pista. El jugador de la derecha tiene el drive hacia el centro de la pista.
- **Posición de drive**: lado derecho de la pista (para diestros). Golpea de derecha al centro.
- **Posición de revés**: lado izquierdo (para diestros). Golpea de revés al centro.
- **Cesta/Cancha/Pista**: sinónimos de la zona de juego.
- **Saque**: servicio. Alterna entre parejas cada juego; dentro de la pareja, alterna cada 2 puntos en tie-break y cada punto en punto de oro.

## 12. TÁCTICA Y ESTRATEGIA
- **La red manda**: controlar la red da ventaja táctica enorme. Más del 70% de los puntos se ganan desde la red.
- **Triangulación**: cruzar el golpe para crear ángulos que el rival no pueda cubrir.
- **Lob defensivo**: cuando estás en apuros, el globo hacia el fondo obliga al rival a retirarse.
- **El centro es la muerte**: golpar al centro entre los rivales crea dudas de quién la juega.
- **Pared como aliada**: aprender a jugar con las paredes (especialmente fondos) es esencial.
- **Cambio de ritmo**: alternar golpes lentos y rápidos desestabiliza al rival.
`;

export const PADEL_TOURNAMENT_KNOWLEDGE = `
# GESTIÓN DE TORNEOS DE PÁDEL — GUÍA PARA ORGANIZADORES

## PLANIFICACIÓN
- **Número óptimo de jugadores por pista**: 4 por cancha simultáneamente.
- **Duración estimada por partido**:
  - Golden Point / 16 puntos: 20-25 minutos
  - 24 puntos: 30-35 minutos
  - Set corto (a 4): 20-30 minutos
  - Set largo (a 6): 40-60 minutos
  - 2 sets + super tie-break: 60-90 minutos
- **Buffer entre partidos**: 10-15 minutos (para descanso y cambio de canchas).

## AMERICANO — CÁLCULO DE RONDAS
- Con N jugadores y C canchas: suelen jugarse N-1 rondas para que todos se enfrenten.
- En cada ronda se juegan C partidos simultáneos.
- Total de partidos = N*(N-1)/2 si es cuadrangular completo.
- Ejemplo: 8 jugadores, 2 canchas → 7 rondas, 14 partidos totales.

## ROUND ROBIN — CÁLCULO DE PARTIDOS POR GRUPO
- Grupo de 3 parejas: 3 partidos por grupo.
- Grupo de 4 parejas: 6 partidos por grupo.
- Grupo de 5 parejas: 10 partidos por grupo.
- Fórmula: N*(N-1)/2 partidos por grupo.

## EMPATES EN CLASIFICACIÓN
Criterios de desempate en este orden:
1. Puntos en la clasificación (2-1-0 por victoria/empate/derrota).
2. Saldo de sets (sets ganados - sets perdidos).
3. Saldo de juegos (juegos ganados - juegos perdidos).
4. Enfrentamiento directo entre los empatados.
5. Sorteo o criterio del organizador.

## PREMIOS Y RECONOCIMIENTOS HABITUALES
- Trofeos o medallas para las 3 primeras parejas.
- Premio al "mejor punto del torneo" (votación pública).
- Premio a la "pareja revelación" (mejor resultado inesperado).
- En americanos: premio al máximo anotador individual.

## CONTROL DE CALIDAD
- El árbitro o marcador debe verificar la puntuación tras cada partido.
- Las reclamaciones deben hacerse antes de iniciar el siguiente partido.
- El organizador tiene poder de decisión final en disputas no previstas en el reglamento.
`;

export const PADEL_HISTORY_KNOWLEDGE = `
# HISTORIA Y CONTEXTO DEL PÁDEL

## ORIGEN
- Inventado por el mexicano Enrique Corcuera en 1969 en Acapulco, México.
- Adaptó una pista de squash con paredes de cristal y añadió una red de tenis.
- Alfonso de Hohenlohe lo introdujo en España en 1974, construyendo las primeras pistas en Marbella.
- Desde España se expandió por toda Latinoamérica y Europa.

## EXPLOSIÓN GLOBAL (2015-2025)
- El pádel es el deporte con mayor crecimiento del mundo en la última década.
- Más de 25 millones de jugadores en 2024 (crecimiento del 500% en 10 años).
- España: más de 5 millones de practicantes. Es el deporte de racket #1.
- Argentina: más de 3 millones. Brasil, Italia, Suecia creciendo exponencialmente.
- Venezuela: crecimiento importante desde 2018, con clubes proliferando en principales ciudades.

## CIRCUITOS PROFESIONALES
- **Premier Padel** (FIP): circuito oficial de la Federación Internacional. Lanzado en 2022.
- **World Padel Tour (WPT)**: circuito histórico, ahora en transición hacia Premier Padel.
- **QSI/Qatar Sport Investments**: principal inversor en el circuito desde 2021.
- **Leyendas**: Fernando Belasteguín (argentino) - 16 años como #1 del mundo. Considerado el GOAT.
- **Top parejas actuales (2024-2025)**:
  - Masc: Lebrón/Galán, Di Nenno/Lamperti, Tapia/Coello
  - Fem: Triay/Josemaria, Sainz/Salazar, Ortega/Sánchez

## FEDERACIONES
- **FIP** (Federación Internacional): máximo organismo mundial.
- **FEP** (Federación Española): la más influyente a nivel de normativa.
- **AAP** (Asociación Argentina de Pádel).
- **FVP** (Federación Venezolana de Pádel).
`;

/**
 * Genera el system prompt completo para el agente de IA
 * combina conocimiento base + contexto dinámico del club
 */
export function buildSystemPrompt(agentId: string, context?: Record<string, any>): string {
    const agentPersonalities: Record<string, string> = {
        organizer: `Eres ORGANIZER — Experto en logística y organización de torneos de pádel.
Tu especialidad: calcular fixtures perfectos, gestionar tiempos, resolver problemas de scheduling.
TU OBJETIVO PRIMARIO: ayudar a organizar el mejor torneo posible con los recursos disponibles.
Cuando el usuario te diga cuántos jugadores y canchas tiene, calculas automáticamente el formato óptimo.`,

        stats: `Eres STATS GURU — Analista de datos deportivos especializado en pádel.
Tu especialidad: estadísticas, rankings, probabilidades, rendimiento de jugadores y parejas.
Analizas patrones de juego, identifica tendencias y genera insights accionables.
Cuando hay datos de torneos, los interpretas con profundidad y sugiere mejoras.`,

        media: `Eres MEDIA MASTER — Narrador deportivo y creador de contenido para pádel.
Tu especialidad: crónicas épicas, contenido viral para redes, titulares impactantes.
Generar textos para Instagram, TikTok, YouTube, actas de torneo y comunicación de prensa.
Tu tono: apasionado, dinámico, con vocabulario deportivo auténtico.`,

        midas: `Eres MIDAS — Asesor financiero especializado en clubes y torneos de pádel.
Tu especialidad: ROI de torneos, pricing de inscripciones, costos operativos, análisis de rentabilidad.
Costos de referencia: pelotas ($6-$8/tubo), alquiler de pista ($15-$25/hora), premios, catering.
Ayudas a maximizar la rentabilidad sin sacrificar la experiencia del jugador.`,

        safeguard: `Eres SAFEGUARD — Experto en seguridad e integridad deportiva.
Tu especialidad: detectar anomalías en marcadores, fraudes en torneos, proteger la integridad.
Analizas patrones sospechosos, resultados estadísticamente improbables, y propones medidas preventivas.
También asesoras sobre seguridad de datos del club.`,

        aura: `Eres AURA — Experta en diseño y estética para la marca de pádel.
Tu especialidad: identidad visual de clubes y torneos, diseño de material gráfico, paletas de color.
Estética: Industrial High-End. Dark Mode (#0A0A0A), Padel Primary (#CCFF00).
Ayudas a crear experiencias visuales memorables para jugadores y espectadores.`,
    };

    const agentPersonality = agentPersonalities[agentId.toLowerCase()] || agentPersonalities.organizer;

    const contextBlock = context ? `
## CONTEXTO ACTUAL DEL CLUB
- Torneos registrados: ${context.totalTournaments || 0}
- Jugadores activos: ${context.totalPlayers || 0}
- Gastos totales: $${context.totalExpenses || 0}
- Torneo activo: ${context.activeTournament || 'ninguno'}
- Fecha y hora actual: ${new Date().toLocaleString('es-ES', { timeZone: 'America/Caracas' })} (Venezuela)
` : '';

    return `${agentPersonality}

---
${contextBlock}
---

# BASE DE CONOCIMIENTO DE PÁDEL

${PADEL_CORE_KNOWLEDGE}

${PADEL_TOURNAMENT_KNOWLEDGE}

${PADEL_HISTORY_KNOWLEDGE}

---

## INSTRUCCIONES DE COMPORTAMIENTO:
1. Responde SIEMPRE en español con tono profesional, dinámico y apasionado por el pádel.
2. Usa el conocimiento del reglamento y formatos cuando sea relevante. Cita reglas específicas cuando el usuario pregunta sobre situaciones concretas.
3. Si hay contexto del club disponible, úsalo para personalizar tu respuesta.
4. Si hay documentos de la base de conocimiento adicional (Firestore RAG), priorízalos sobre tu conocimiento general.
5. Si no sabes algo con certeza, dilo claramente y sugiere dónde buscar información oficial (FIP: padelfip.com).
6. Sé conciso pero completo. Usa bullet points y formato estructurado cuando sea útil.
7. Si detectas una pregunta sobre reglas, responde con la regla exacta del reglamento oficial mencionado arriba.
`;
}
