import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OTPVerificationEmailProps {
  otp: string;
  name?: string;
  type?: "registration" | "password_reset" | "email_change";
  expiresInMinutes?: number;
}

export function OTPVerificationEmail({
  otp,
  name = "there",
  type = "registration",
  expiresInMinutes = 10,
}: OTPVerificationEmailProps) {
  const getSubjectAndHeading = () => {
    switch (type) {
      case "registration":
        return {
          subject: "Verify your email - NikahFirst",
          heading: "Welcome to NikahFirst!",
          description: "Please use the verification code below to complete your registration.",
        };
      case "password_reset":
        return {
          subject: "Reset your password - NikahFirst",
          heading: "Password Reset Request",
          description: "Please use the verification code below to reset your password.",
        };
      case "email_change":
        return {
          subject: "Verify your new email - NikahFirst",
          heading: "Email Change Verification",
          description: "Please use the verification code below to verify your new email address.",
        };
      default:
        return {
          subject: "Verification Code - NikahFirst",
          heading: "Verification Required",
          description: "Please use the verification code below.",
        };
    }
  };

  const { heading, description } = getSubjectAndHeading();

  return (
    <Html>
      <Head />
      <Preview>{heading} - Your verification code is {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>NikahFirst</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>{heading}</Heading>
            <Text style={text}>
              Assalamu Alaikum{name ? ` ${name}` : ""},
            </Text>
            <Text style={text}>{description}</Text>

            {/* OTP Box */}
            <Section style={otpContainer}>
              <Text style={otpCode}>{otp}</Text>
            </Section>

            <Text style={text}>
              This code will expire in <strong>{expiresInMinutes} minutes</strong>.
            </Text>

            <Text style={text}>
              If you didn&apos;t request this code, please ignore this email or contact
              our support team if you have concerns.
            </Text>

            <Hr style={hr} />

            <Text style={footerText}>
              Need help? Contact us at support@nikahfirst.com
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

const otpContainer = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const otpCode = {
  color: "#16a34a",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  margin: "0",
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

export default OTPVerificationEmail;
