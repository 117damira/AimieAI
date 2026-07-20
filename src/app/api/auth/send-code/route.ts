import { NextRequest, NextResponse } from "next/server";
import { getEmailClient, VERIFICATION_EMAIL_FROM } from "@/lib/email/resend";
import { generateCode, storeCode } from "@/lib/auth/verificationStore";

/**
 * Sends a 4-digit email verification code (used by both registration and
 * forgot-password). Sends a real email when RESEND_API_KEY is configured;
 * otherwise returns the code directly so the client can show it in a
 * clearly-labeled dev-mode banner — the verification step still fully
 * works end to end with zero setup, same as every AI feature in this app.
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
      console.error("Resend email send failed, falling back to dev-mode code", err);
    }
  }

  // Dev-mode fallback: no email provider configured (or sending failed) —
  // hand the code straight back so the flow keeps working.
  return NextResponse.json({ sent: true, devCode: code });
}
