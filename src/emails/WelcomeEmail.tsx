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

type WelcomeEmailProps = {
  name: string;
  code: string;
};

const primaryColor = "#ccff00";
const backgroundColor = "#050505";
const cardBackground = "rgba(12,12,12,0.96)";

export const WelcomeEmail = ({ name, code }: WelcomeEmailProps) => {
  const previewText = `Bienvenido a Smart Padel, ${name}`;

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
            <Section style={{ marginBottom: 24 }}>
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
                    Smart Padel
                  </Text>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: "22px",
                      fontWeight: 600,
                      margin: 0,
                    }}
                  >
                    Bienvenido al ecosistema de torneos
                  </Text>
                </Column>
                <Column align="right">
                  <Img
                    src="https://smartpadel-assets.s3.amazonaws.com/logo-smart-padel-neon.png"
                    alt="Smart Padel"
                    width={64}
                    height={64}
                    style={{ borderRadius: 999, border: `1px solid ${primaryColor}` }}
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
                padding: "28px 24px 24px",
              }}
            >
              <Text
                style={{
                  color: "#e5e5e5",
                  fontSize: "15px",
                  margin: "0 0 12px",
                }}
              >
                Hola <span style={{ color: primaryColor }}>{name}</span>,
              </Text>
              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 16px",
                }}
              >
                Bienvenido a <span style={{ color: primaryColor }}>Smart Padel</span>, el
                sistema pensado para que tus torneos se sientan como una experiencia
                profesional desde el primer saque.
              </Text>

              <Text
                style={{
                  color: "#fafafa",
                  fontSize: "14px",
                  fontWeight: 500,
                  margin: "0 0 8px",
                }}
              >
                Tu código de jugador:
              </Text>

              <Section
                style={{
                  background:
                    "linear-gradient(120deg, rgba(204,255,0,0.16), rgba(204,255,0,0.02))",
                  borderRadius: "14px",
                  border: "1px solid rgba(204,255,0,0.5)",
                  padding: "14px 16px",
                  marginBottom: "18px",
                }}
              >
                <Text
                  style={{
                    color: primaryColor,
                    fontSize: "24px",
                    letterSpacing: "0.18em",
                    textAlign: "center",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {code}
                </Text>
              </Section>

              <Text
                style={{
                  color: "#a1a1aa",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "0 0 18px",
                }}
              >
                Usa este código para identificarte en los torneos, recibir reportes,
                invitaciones y resultados personalizados.
              </Text>

              <Button
                href="https://smartpadel.app"
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
                }}
              >
                Entrar a Smart Padel
              </Button>
            </Section>

            <Section style={{ paddingTop: 20 }}>
              <Text
                style={{
                  color: "#71717a",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Estás recibiendo este correo porque te registraste en un torneo que usa
                Smart Padel. Si no fuiste tú, puedes ignorar este mensaje.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;

