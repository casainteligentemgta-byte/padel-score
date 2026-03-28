-- Si ya aplicaste 023 antes del GRANT a anon, ejecutar esto asegura el caso QA "sin sesión" → JSON not_authenticated (no error PostgREST).
GRANT EXECUTE ON FUNCTION public.finalizar_partido_y_liberar_cancha(text, uuid, text, jsonb) TO anon;
