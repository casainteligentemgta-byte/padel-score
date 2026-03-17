import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type NewTournamentEmailProps = {
  playerName: string;
  tournamentName: string;
  clubName: string;
  startDate: string;
  categories: string[];
  ctaUrl: string;
};

const primaryColor = "#ccff00";
const backgroundColor = "#050505";
const cardBackground = "rgba(12,12,12,0.96)";

export const NewTournamentEmail = ({
  playerName,
  tournamentName,
  clubName,
  startDate,
  categories,
  ctaUrl,
}: NewTournamentEmailProps) => {
  const previewText = `Nuevo torneo en ${clubName}: ${tournamentName}`;

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
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, -system-ui, sans-serif',
          }}
        >
          <Container
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              padding: "32px 20px",
            }}
          >
            <Section style={{ marginBottom: 20 }}>
              <Row>
                <Column align="left">
                  <Text
                    style={{
                      color: primaryColor,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    Smart Padel · Nuevo Torneo
                  </Text>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: "22px",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    {tournamentName}
                  </Text>
                  <Text
                    style={{
                      color: "#a1a1aa",
                      fontSize: "13px",
                      marginTop: 4,
                    }}
                  >
                    {clubName} · Inicio {startDate}
                  </Text>
                </Column>
                <Column align="right">
                  <Img
                    src="https://smartpadel-assets.s3.amazonaws.com/tournament-banner-dark.png"
                    alt="Smart Padel Tournament"
                    width={120}
                    style={{
                      borderRadius: "14px",
                      border: "1px solid rgba(204,255,0,0.4)",
                    }}
                  />
                </Column>
              </Row>
            </Section>

            <Section
              style={{
                background: cardBackground,
                borderRadius: "18px",
                border: "1px solid rgba(204,255,0,0.3)",
                boxShadow: "0 0 50px rgba(204,255,0,0.16)",
                padding: "24px 22px 22px",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: "#e5e5e5",
                  fontSize: "15px",
                  margin: "0 0 10px",
                }}
              >
                Hola <span style={{ color: primaryColor }}>{playerName}</span>,
              </Text>
              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "0 0 16px",
                }}
              >
                Estás invitado a formar parte de un nuevo torneo gestionado con{" "}
                <span style={{ color: primaryColor }}>Smart Padel</span>. Todo el fixture,
                resultados en vivo y estadísticas estarán sincronizados en tiempo real.
              </Text>

              <Section style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    color: "#fafafa",
                    fontSize: "13px",
                    fontWeight: 500,
                    margin: "0 0 8px",
                  }}
                >
                  Categorías disponibles:
                </Text>
                <Row>
                  {categories.map((cat) => (
                    <Column key={cat} style={{ paddingRight: 6, paddingBottom: 6 }}>
                      <Section
                        style={{
                          borderRadius: 999,
                          border: "1px solid rgba(204,255,0,0.5)",
                          padding: "6px 10px",
                          background:
                            "linear-gradient(135deg, rgba(204,255,0,0.15), rgba(204,255,0,0.02))",
                        }}
                      >
                        <Text
                          style={{
                            color: primaryColor,
                            fontSize: "11px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            margin: 0,
                          }}
                        >
                          {cat}
                        </Text>
                      </Section>
                    </Column>
                  ))}
                </Row>
              </Section>

              <Button
                href={ctaUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: primaryColor,
                  color: "#050505",
                  borderRadius: "999px",
                  padding: "10px 22px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Ver detalles e inscribirme
              </Button>

              <Text
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Cupos limitados por categoría. Tu inscripción quedará confirmada una vez
                que completes los datos de tu pareja en la plataforma.
              </Text>
            </Section>

            <Section>
              <Text
                style={{
                  color: "#52525b",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Este correo fue enviado por Smart Padel en nombre de {clubName}. No
                respondas a este mensaje; para dudas contacta directamente con la
                organización del torneo.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NewTournamentEmail;

