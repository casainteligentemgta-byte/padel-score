import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { CURRENT_TERMS_VERSION } from "@/lib/legal/termsVersion";

export const PUNTITO_LEGAL_UPDATE_EMAIL_SUBJECT =
  "🎾 ¡Actualización importante de Puntito! Necesitamos tu firma PRO";

export type PuntitoLegalUpdateEmailProps = {
  /** Nombre para saludar (nombre de perfil o «Jugador»). */
  playerName: string;
  /** URL absoluta del CTA (ej. /mi-cuenta o origen de la app). */
  profileSignUrl: string;
  /** Versión mostrada en el cuerpo (por defecto la canónica de Smart-Legal). */
  termsVersionLabel?: string;
};

const primaryColor = "#ccff00";
const backgroundColor = "#050505";
const cardBackground = "rgba(12,12,12,0.96)";

export const PuntitoLegalUpdateEmail = ({
  playerName,
  profileSignUrl,
  termsVersionLabel = CURRENT_TERMS_VERSION,
}: PuntitoLegalUpdateEmailProps) => {
  const previewText = `Puntito: actualización del Contrato Pro Smart (${termsVersionLabel})`;
  const safeName = playerName.trim() || "Jugador";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                "padel-primary": primaryColor,
              },
            },
          },
        }}
      >
        <Body
          style={{
            margin: 0,
            padding: 0,
            width: "100%",
            backgroundColor,
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 20px" }}>
            <Section style={{ marginBottom: "18px" }}>
              <Text
                style={{
                  color: primaryColor,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontSize: "11px",
                  fontWeight: 700,
                  margin: "0 0 6px",
                }}
              >
                Smart Padel · Puntito 🤖
              </Text>
              <Text
                style={{
                  color: "#fafafa",
                  fontSize: "22px",
                  fontWeight: 800,
                  fontStyle: "italic",
                  lineHeight: "1.25",
                  margin: 0,
                }}
              >
                ¡Actualización importante!
              </Text>
            </Section>

            <Section
              style={{
                background: cardBackground,
                borderRadius: "18px",
                border: "1px solid rgba(204,255,0,0.35)",
                boxShadow: "0 0 48px rgba(204,255,0,0.14)",
                padding: "28px 24px 26px",
              }}
            >
              <Text
                style={{
                  color: "#e4e4e7",
                  fontSize: "16px",
                  lineHeight: "1.55",
                  margin: "0 0 14px",
                }}
              >
                Hola, <span style={{ color: primaryColor, fontWeight: 700 }}>{safeName}</span>!
              </Text>

              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  margin: "0 0 16px",
                }}
              >
                Espero que estés listo para el próximo partido. Por aquí Puntito reportándose. 🤖
              </Text>

              <Text
                style={{
                  color: "#d4d4d8",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  margin: "0 0 18px",
                }}
              >
                Te escribo porque hemos actualizado nuestro{" "}
                <span style={{ color: primaryColor, fontWeight: 700 }}>Contrato Pro Smart</span> (
                {termsVersionLabel}). En Smart Padel nos tomamos muy en serio tu seguridad y la transparencia en las
                transmisiones de tus mejores jugadas.
              </Text>

              <Text
                style={{
                  color: "#fafafa",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 10px",
                }}
              >
                ¿Qué hay de nuevo en esta versión?
              </Text>

              <Section style={{ marginBottom: "18px" }}>
                <Text style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.65", margin: "0 0 8px" }}>
                  • <span style={{ color: "#e4e4e7", fontWeight: 600 }}>Mejor protección de datos:</span> blindamos aún
                  más tu información personal.
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.65", margin: "0 0 8px" }}>
                  • <span style={{ color: "#e4e4e7", fontWeight: 600 }}>Broadcasting Pro:</span> optimizamos los
                  términos para que tu imagen en las pizarras del club y streamings luzca de nivel profesional.
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.65", margin: 0 }}>
                  • <span style={{ color: "#e4e4e7", fontWeight: 600 }}>Seguridad en pista:</span> reforzamos las
                  cláusulas de exoneración para que tú y el club jueguen con total tranquilidad.
                </Text>
              </Section>

              <Text
                style={{
                  color: "#fafafa",
                  fontSize: "14px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 10px",
                }}
              >
                ¿Qué debes hacer?
              </Text>

              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  margin: "0 0 22px",
                }}
              >
                La próxima vez que entres a la app, verás que te pido una firma digital rápida. Solo te tomará 15
                segundos y podrás seguir disfrutando de todas las funciones PRO.
              </Text>

              <Section style={{ textAlign: "center", marginBottom: "22px" }}>
                <Button
                  href={profileSignUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: primaryColor,
                    color: "#050505",
                    borderRadius: "999px",
                    padding: "14px 28px",
                    fontSize: "13px",
                    fontWeight: 800,
                    fontStyle: "italic",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    boxShadow: "0 0 24px rgba(204,255,0,0.35)",
                  }}
                >
                  Ir a mi perfil y firmar
                </Button>
              </Section>

              <Text
                style={{
                  color: "#fbbf24",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "0 0 18px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(251,191,36,0.08)",
                  border: "1px solid rgba(251,191,36,0.25)",
                }}
              >
                Si no firmas la nueva versión, algunas funciones del Hub podrían quedar limitadas temporalmente. ¡No te
                quedes fuera del ranking!
              </Text>

              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "15px",
                  lineHeight: "1.65",
                  margin: "0 0 4px",
                }}
              >
                Nos vemos en la cancha,
              </Text>
              <Text
                style={{
                  color: "#fafafa",
                  fontSize: "15px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                El Equipo de Smart Padel
              </Text>
            </Section>

            <Section style={{ paddingTop: "22px" }}>
              <Text
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Recibes este correo porque tienes cuenta en Smart Padel y aplica una actualización legal. Si ya
                firmaste la versión vigente en la app, puedes ignorar este mensaje.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PuntitoLegalUpdateEmail;
