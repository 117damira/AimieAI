import { NextRequest, NextResponse } from "next/server";
import { getEmailClient, VERIFICATION_EMAIL_FROM } from "@/lib/email/resend";
import { generateCode, storeCode } from "@/lib/auth/verificationStore";

/**
 * Sends a 4-digit email verification code (used by forgot-password). Sends
 * a real message when RESEND_API_KEY is configured. The code is NEVER
 * included in this response or shown in the UI — without a provider
 * configured, it's only visible in this server's own console log, for
 * local debugging.
 */
interface SendCodeRequest {
  email: string;
}

export async function POST(req: NextRequest) {
  let body: SendCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email } = body;
  if (!email || !email.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const code = generateCode();
  storeCode(email, code);

  const client = getEmailClient();
  if (client) {
    try {
      await client.emails.send({
        from: VERIFICATION_EMAIL_FROM,
        to: email,
        subject: "Your AimieAI verification code",
        text: `Your verification code is ${code}. It expires in 10 minutes.`,
      });
      return NextResponse.json({ sent: true });
    } catch (err) {
      console.error("Resend email send failed", err);
    }
  }

  console.log(`[dev-only, server logs] No email provider configured — code for ${email}: ${code}`);
  return NextResponse.json({ sent: true });
}
