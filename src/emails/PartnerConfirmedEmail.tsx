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

type PartnerConfirmedEmailProps = {
  guestName: string;
  tournamentName: string;
  hubUrl: string;
};

const primaryColor = "#ccff00";
const backgroundColor = "#050505";
const cardBackground = "rgba(12,12,12,0.96)";

export const PartnerConfirmedEmail = ({
  guestName,
  tournamentName,
  hubUrl,
}: PartnerConfirmedEmailProps) => {
  const previewText = `Equipo confirmado: ${guestName} aceptó tu invitación`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body
          style={{
            margin: 0,
            padding: 0,
            width: "100%",
            backgroundColor,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, -system-ui, sans-serif',
          }}
        >
          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 20px" }}>
            <Section
              style={{
                background: cardBackground,
                borderRadius: "18px",
                border: "1px solid rgba(204,255,0,0.35)",
                boxShadow: "0 0 52px rgba(204,255,0,0.16)",
                padding: "26px 24px 24px",
              }}
            >
              <Text
                style={{
                  color: primaryColor,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: "11px",
                  margin: "0 0 8px",
                }}
              >
                Smart Padel · Confirmación de Pareja
              </Text>

              <Text
                style={{
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                  margin: "0 0 10px",
                }}
              >
                🎾 ¡EQUIPO CONFIRMADO!
              </Text>

              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  margin: "0 0 18px",
                }}
              >
                Tu pareja <span style={{ color: primaryColor }}>{guestName}</span> ha aceptado la invitación para el torneo{" "}
                <span style={{ color: "#f4f4f5" }}>{tournamentName}</span>. Ya pueden ver su lugar en el cuadro principal.
              </Text>

              <Button
                href={hubUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: primaryColor,
                  color: "#050505",
                  borderRadius: "999px",
                  padding: "10px 22px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Ver mi Equipo
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PartnerConfirmedEmail;

