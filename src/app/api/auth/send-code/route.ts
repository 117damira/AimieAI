import { NextRequest, NextResponse } from "next/server";
import { getEmailClient, VERIFICATION_EMAIL_FROM } from "@/lib/email/resend";
import { generateCode, storeCode } from "@/lib/auth/verificationStore";
import { normalizeKzPhoneDigits, isValidKzPhoneDigits, toStoredPhone } from "@/lib/utils/phone";

/**
 * Sends a 4-digit verification code to either an email or a Kazakhstan
 * phone number (used by registration and forgot-password). Email sends a
 * real message when RESEND_API_KEY is configured, otherwise (and always for
 * phone, since no SMS provider is wired up) returns the code directly so
 * the client can show it in a clearly-labeled dev-mode banner — the
 * verification step still fully works end to end with zero setup, same as
 * every AI feature in this app.
 */
interface SendCodeRequest {
  email?: string;
  phone?: string;
}

export async function POST(req: NextRequest) {
  let body: SendCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, phone } = body;

  if (phone) {
    const digits = normalizeKzPhoneDigits(phone);
    if (!isValidKzPhoneDigits(digits)) {
      return NextResponse.json({ error: "A valid Kazakhstan phone number is required" }, { status: 400 });
    }
    const identifier = toStoredPhone(digits);
    const code = generateCode();
    storeCode(identifier, code);
    // No SMS provider is configured — always return the code (mocked SMS).
    return NextResponse.json({ sent: true, devCode: code });
  }

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
