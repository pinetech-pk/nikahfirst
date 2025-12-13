import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * GET /api/test-email
 * Simple test endpoint to verify Resend is working
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get("email");

  if (!testEmail) {
    return NextResponse.json(
      { error: "Please provide ?email=your@email.com" },
      { status: 400 }
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "NikahFirst <noreply@contact.nikahfirst.com>",
      to: testEmail,
      subject: "Test Email from NikahFirst",
      html: `
        <h1>Hello from NikahFirst!</h1>
        <p>If you received this email, Resend is working correctly.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
