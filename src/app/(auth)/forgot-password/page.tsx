"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
} from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { emailExists, createResetToken, resetPasswordWithToken } from "@/lib/auth/accountStore";
import { isValidPassword } from "@/lib/utils/password";
import { cn } from "@/lib/utils/cn";

type Step = "email" | "verify" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendNotice, setResendNotice] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      // Confirm the account exists before sending a code, so the error
      // message matches what the old flow showed for an unknown email.
      if (!emailExists(email)) {
        setError(t.auth.forgotPassword.notFoundError);
        return;
      }
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
        setError(t.auth.forgotPassword.invalidCodeError);
        return;
      }
      setStep("newPassword");
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

  async function handleNewPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidPassword(newPassword)) {
      setError(t.auth.forgotPassword.passwordRequirement);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.common.passwordsDoNotMatchError);
      return;
    }

    setIsSubmitting(true);
    try {
      // The code verification above already proved the request is genuine;
      // this mints a fresh short-lived token and consumes it immediately,
      // reusing the existing, already-working reset logic end to end.
      const tokenResult = createResetToken(email);
      if (!tokenResult.ok) {
        setError(t.auth.forgotPassword.notFoundError);
        return;
      }
      const result = await resetPasswordWithToken(tokenResult.token, newPassword);
      if (!result.ok) {
        setError(t.common.somethingWentWrong);
        return;
      }
      setStep("done");
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordValid = newPassword.length > 0 && isValidPassword(newPassword);

  const titles: Record<Step, string> = {
    email: t.auth.forgotPassword.title,
    verify: t.auth.forgotPassword.verifyStepTitle,
    newPassword: t.auth.forgotPassword.newPasswordStepTitle,
    done: t.auth.forgotPassword.newPasswordStepTitle,
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titles[step]}</CardTitle>
        <CardDescription>
          {step === "email" && t.auth.forgotPassword.description}
          {step === "verify" && t.auth.forgotPassword.verifyStepDescription(email)}
          {step === "newPassword" && t.auth.forgotPassword.newPasswordStepDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" && (
          <form className="flex flex-col gap-5" onSubmit={handleEmailSubmit}>
            <Input
              label={t.auth.forgotPassword.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.forgotPassword.emailPlaceholder}
              autoComplete="email"
              required
            />
            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.forgotPassword.submit}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form className="flex flex-col gap-5" onSubmit={handleVerifySubmit}>
            {devCode && (
              <div className="rounded-2xl border border-warning-500/20 bg-warning-50 p-3.5 text-sm leading-relaxed text-warning-600">
                {t.auth.forgotPassword.devModeCodeNotice(devCode)}
              </div>
            )}
            <Input
              label={t.auth.forgotPassword.codeLabel}
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder={t.auth.forgotPassword.codePlaceholder}
              required
            />
            {resendNotice && !error && (
              <p className="text-sm text-success-600">{t.auth.forgotPassword.codeResent}</p>
            )}
            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 4}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.forgotPassword.verifyButton}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              className="self-center text-sm font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700 hover:underline"
            >
              {t.auth.forgotPassword.resendCode}
            </button>
          </form>
        )}

        {step === "newPassword" && (
          <form className="flex flex-col gap-5" onSubmit={handleNewPasswordSubmit}>
            <div className="flex flex-col gap-1.5">
              <Input
                label={t.auth.forgotPassword.newPassword}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.auth.forgotPassword.newPasswordPlaceholder}
                autoComplete="new-password"
                required
              />
              {newPassword.length > 0 && (
                <p className={cn("text-xs transition-colors duration-200", passwordValid ? "text-success-600" : "text-danger-600")}>
                  {t.auth.forgotPassword.passwordRequirement}
                </p>
              )}
            </div>
            <Input
              label={t.auth.forgotPassword.confirmPassword}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.auth.forgotPassword.confirmPasswordPlaceholder}
              autoComplete="new-password"
              required
            />
            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.forgotPassword.saveButton}
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="text-sm text-foreground">{t.auth.forgotPassword.successMessage}</p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              {t.auth.forgotPassword.goToLogin}
            </Button>
          </div>
        )}

        {step !== "done" && (
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/login" className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700 hover:underline">
              {t.auth.forgotPassword.backToLogin}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
