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

export const DOSSIER_SHARE_EMAIL_SUBJECT = "Smart Padel — Dossier comercial para tu club";

export type DossierShareEmailProps = {
  recipientName: string;
  dossierUrl: string;
};

const accent = "#ccff00";
const bg = "#050505";

export const DossierShareEmail = ({ recipientName, dossierUrl }: DossierShareEmailProps) => {
  const name = recipientName.trim() || "Hola";
  const preview = "Te compartimos el dossier comercial de Smart Padel";

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            margin: 0,
            padding: 0,
            backgroundColor: bg,
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          }}
        >
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "28px 20px" }}>
            <Section
              style={{
                borderRadius: "18px",
                border: "1px solid rgba(204,255,0,0.35)",
                background: "rgba(12,12,12,0.96)",
                padding: "28px 24px",
              }}
            >
              <Text style={{ color: accent, fontSize: "11px", letterSpacing: "0.14em", fontWeight: 700, margin: "0 0 8px" }}>
                SMART PADEL · VENTAS
              </Text>
              <Text style={{ color: "#fafafa", fontSize: "22px", fontWeight: 800, fontStyle: "italic", margin: "0 0 14px" }}>
                {name}, aquí tienes el dossier
              </Text>
              <Text style={{ color: "#a1a1aa", fontSize: "15px", lineHeight: 1.65, margin: "0 0 22px" }}>
                En el enlace encontrarás el material comercial y referencias para llevar Smart Padel a tu club: torneos,
                pantallas, hub de jugadores y experiencia PRO en pista.
              </Text>
              <Section style={{ textAlign: "center", marginBottom: "20px" }}>
                <Button
                  href={dossierUrl}
                  style={{
                    backgroundColor: accent,
                    color: "#050505",
                    borderRadius: "999px",
                    padding: "14px 28px",
                    fontWeight: 800,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    fontStyle: "italic",
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  Abrir dossier en Drive
                </Button>
              </Section>
              <Text style={{ color: "#71717a", fontSize: "11px", lineHeight: 1.55, margin: 0 }}>
                Si no ves el botón, copia y pega esta URL en tu navegador: {dossierUrl}
              </Text>
            </Section>
            <Text style={{ color: "#52525b", fontSize: "11px", marginTop: "18px", textAlign: "center" }}>
              Smart Padel — correo interno de ventas. Responde a este hilo si necesitas una demo en vivo.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DossierShareEmail;
