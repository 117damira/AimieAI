import Link from "next/link";
import { APP_NAME } from "@/config/app";

export const metadata = { title: `Privacy Policy — ${APP_NAME}` };

export default function PrivacyPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <Link href="/register" className="text-sm font-medium text-primary-600 hover:underline">
          ← Back
        </Link>
      </div>
      <h1 className="font-display text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <div className="flex flex-col gap-5 text-sm leading-6 text-muted">
        <p>
          This Privacy Policy explains what information {APP_NAME} collects and how it&apos;s used.
        </p>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">1. What we collect</h2>
          <p>
            Your name and email address when you register, your exam preparation preferences (target
            level, exam date), and the practice content you submit (written responses, spoken
            transcripts, vocabulary sentences) so we can generate feedback and track your progress.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">2. How it&apos;s used</h2>
          <p>
            To provide the feedback and progress-tracking features you use directly, and to send you
            a verification code when you register or reset your password. We don&apos;t sell your
            data.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">3. Where it&apos;s stored</h2>
          <p>
            Your account and progress data live in your own browser&apos;s local storage under your
            account, protected by a hashed (not plaintext) password.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">4. Your choices</h2>
          <p>
            You can update your profile at any time, and delete your account and all associated data
            from your Profile settings.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
          <p>Questions about this policy can be sent to the {APP_NAME} team through the app.</p>
        </section>
      </div>
    </div>
  );
}
