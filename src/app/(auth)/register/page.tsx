"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
} from "@/components/ui";
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { isValidPassword } from "@/lib/utils/password";
import { cn } from "@/lib/utils/cn";

type Step = "email" | "verify" | "details";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useUserProfile();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendNotice, setResendNotice] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function sendCode(targetEmail: string) {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
    setDevCode(data.devCode ?? null);
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await sendCode(email);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!data.valid) {
        setError(t.auth.register.invalidCodeError);
        return;
      }
      setStep("details");
    } catch {
      setError(t.common.somethingWentWrong);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendNotice(false);
    try {
      await sendCode(email);
      setResendNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    }
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");

    if (!isValidPassword(password)) {
      setError(t.auth.register.passwordRequirement);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.common.passwordsDoNotMatchError);
      return;
    }
    if (!termsAccepted) {
      setError(t.auth.register.termsRequiredError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({ firstName, lastName, email }, password);
      if (!result.ok) {
        // An account with this email already exists — send the user to
        // Sign In with the email prefilled rather than letting them retry
        // registration here, so a duplicate account can never be created.
        router.push(`/login?email=${encodeURIComponent(email)}&reason=duplicate`);
        return;
      }
      router.push("/onboarding");
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordValid = password.length > 0 && isValidPassword(password);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{step === "verify" ? t.auth.register.verifyStepTitle : t.auth.register.title}</CardTitle>
        <CardDescription>
          {step === "email" && t.auth.register.emailStepDescription}
          {step === "verify" && t.auth.register.verifyStepDescription(email)}
          {step === "details" && t.auth.register.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
            <Input
              label={t.auth.register.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.register.emailPlaceholder}
              autoComplete="email"
              required
            />
            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.register.continueButton}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form className="flex flex-col gap-4" onSubmit={handleVerifySubmit}>
            {devCode && (
              <div className="rounded-xl bg-warning-50 p-3 text-sm text-warning-600">
                {t.auth.register.devModeCodeNotice(devCode)}
              </div>
            )}
            <Input
              label={t.auth.register.codeLabel}
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder={t.auth.register.codePlaceholder}
              required
            />
            {resendNotice && !error && <p className="text-sm text-success-600">{t.auth.register.codeResent}</p>}
            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 4}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.register.verifyButton}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              className="self-center text-sm font-medium text-primary-600 hover:underline"
            >
              {t.auth.register.resendCode}
            </button>
          </form>
        )}

        {step === "details" && (
          <form className="flex flex-col gap-4" onSubmit={handleDetailsSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.auth.register.firstName}
                name="firstName"
                placeholder={t.auth.register.firstNamePlaceholder}
                autoComplete="given-name"
                required
              />
              <Input
                label={t.auth.register.lastName}
                name="lastName"
                placeholder={t.auth.register.lastNamePlaceholder}
                autoComplete="family-name"
                required
              />
            </div>
            <Input label={t.auth.register.email} type="email" value={email} disabled />
            <div className="flex flex-col gap-1.5">
              <Input
                label={t.auth.register.password}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.register.passwordPlaceholder}
                autoComplete="new-password"
                required
              />
              {password.length > 0 && (
                <p className={cn("text-xs", passwordValid ? "text-success-600" : "text-danger-600")}>
                  {t.auth.register.passwordRequirement}
                </p>
              )}
            </div>
            <Input
              label={t.auth.register.confirmPassword}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.auth.register.confirmPasswordPlaceholder}
              autoComplete="new-password"
              required
            />
            <label className="flex items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary-600 focus:ring-primary-400"
              />
              <span>
                {t.auth.register.termsPrefix}{" "}
                <Link href="/terms" target="_blank" className="text-primary-600 hover:underline">
                  {t.auth.register.termsAndConditions}
                </Link>{" "}
                {t.auth.register.termsMiddle}{" "}
                <Link href="/privacy" target="_blank" className="text-primary-600 hover:underline">
                  {t.auth.register.privacyPolicy}
                </Link>
                .
              </span>
            </label>
            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.register.submit}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {t.auth.register.haveAccount}{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            {t.auth.register.logIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
