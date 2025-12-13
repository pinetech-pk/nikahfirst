import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name?: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  name = "there",
  loginUrl = "https://nikahfirst.com/login",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to NikahFirst - Your journey begins here!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>NikahFirst</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Welcome to NikahFirst!</Heading>
            <Text style={text}>
              Assalamu Alaikum {name},
            </Text>
            <Text style={text}>
              We&apos;re thrilled to have you join the NikahFirst community! Your email has
              been verified, and your account is now active.
            </Text>

            <Text style={text}>
              NikahFirst is dedicated to helping Muslims find their life partner in a
              halal, respectful, and privacy-conscious environment.
            </Text>

            <Section style={ctaContainer}>
              <Button style={button} href={loginUrl}>
                Complete Your Profile
              </Button>
            </Section>

            <Text style={text}>
              <strong>What&apos;s next?</strong>
            </Text>
            <Text style={listItem}>1. Complete your profile with accurate information</Text>
            <Text style={listItem}>2. Add photos to increase your visibility</Text>
            <Text style={listItem}>3. Start browsing and connecting with potential matches</Text>

            <Hr style={hr} />

            <Text style={footerText}>
              If you have any questions, our support team is here to help at
              support@nikahfirst.com
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              NikahFirst - Find Your Perfect Match
            </Text>
            <Text style={footerText}>
              This is an automated message, please do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#16a34a",
  padding: "20px",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
};

const logo = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "0 0 8px 8px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const listItem = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 8px",
  paddingLeft: "8px",
};

const ctaContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  padding: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
};

export default WelcomeEmail;
