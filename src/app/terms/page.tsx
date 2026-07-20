import Link from "next/link";
import { APP_NAME } from "@/config/app";

export const metadata = { title: `Terms and Conditions — ${APP_NAME}` };

export default function TermsPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <Link href="/register" className="text-sm font-medium text-primary-600 hover:underline">
          ← Back
        </Link>
      </div>
      <h1 className="font-display text-3xl font-semibold text-foreground">Terms and Conditions</h1>
      <div className="flex flex-col gap-5 text-sm leading-6 text-muted">
        <p>
          These Terms and Conditions govern your use of {APP_NAME}, an AI-assisted exam preparation
          platform. By creating an account, you agree to these terms.
        </p>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">1. Your account</h2>
          <p>
            You&apos;re responsible for keeping your login credentials secure and for all activity
            under your account. Provide accurate information when registering, and keep it up to
            date.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">2. Using the service</h2>
          <p>
            {APP_NAME} provides AI-generated and automated feedback for exam preparation purposes.
            This feedback is a study aid, not a guarantee of exam results. Don&apos;t misuse the
            service — including attempting to disrupt it, scrape it at scale, or use it for anything
            unlawful.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">3. Your content</h2>
          <p>
            Sentences, essays, and recordings you submit for feedback are used only to generate that
            feedback and to track your own learning progress within your account.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">4. Changes</h2>
          <p>
            We may update these terms as the product evolves. Continuing to use {APP_NAME} after a
            change means you accept the updated terms.
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
          <p>Questions about these terms can be sent to the {APP_NAME} team through the app.</p>
        </section>
      </div>
    </div>
  );
}
