"use client";

import { type FormEvent, useEffect, useState } from "react";
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
import { emailExists, phoneExists } from "@/lib/auth/accountStore";
import { normalizeKzPhoneDigits, formatKzPhone, isValidKzPhoneDigits, toStoredPhone } from "@/lib/utils/phone";
import { cn } from "@/lib/utils/cn";
import { readOnboardingDraft, clearOnboardingDraft, type OnboardingAnswers } from "@/lib/onboarding/draftStore";

type Step = "identity" | "verify" | "password";
type Method = "email" | "phone";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useUserProfile();
  const { t } = useLanguage();

  // Registration only ever happens right after onboarding — without a
  // draft in hand there's nothing to register with, so send the visitor
  // back to start that questionnaire instead of showing a broken form.
  const [draft, setDraft] = useState<OnboardingAnswers | null>(null);

  useEffect(() => {
    const found = readOnboardingDraft();
    if (!found) {
      router.replace("/onboarding");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(found);
  }, [router]);

  const [step, setStep] = useState<Step>("identity");
  const [method, setMethod] = useState<Method>("email");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendNotice, setResendNotice] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const identifier = method === "email" ? email.trim() : toStoredPhone(phoneDigits);

  async function sendCode() {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(method === "email" ? { email: email.trim() } : { phone: phoneDigits }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.common.somethingWentWrong);
    setDevCode(data.devCode ?? null);
  }

  async function handleIdentitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) return;

    if (method === "email") {
      if (!email.trim() || !email.includes("@")) return;
      if (emailExists(email.trim())) {
        router.push(`/login?identifier=${encodeURIComponent(email.trim())}&reason=duplicate-email`);
        return;
      }
    } else {
      if (!isValidKzPhoneDigits(phoneDigits)) {
        setError(t.auth.register.invalidPhoneError);
        return;
      }
      if (phoneExists(identifier)) {
        router.push(`/login?identifier=${encodeURIComponent(identifier)}&reason=duplicate-phone`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await sendCode();
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
        body: JSON.stringify(
          method === "email" ? { email: email.trim(), code } : { phone: phoneDigits, code }
        ),
      });
      const data = await res.json();
      if (!data.valid) {
        setError(t.auth.register.invalidCodeError);
        return;
      }
      setStep("password");
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
      await sendCode();
      setResendNotice(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.somethingWentWrong);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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

    if (!draft) return; // guarded by the redirect effect above; never reached

    setIsSubmitting(true);
    try {
      const result = await register(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: method === "email" ? email.trim() : null,
          phone: method === "phone" ? identifier : null,
        },
        password,
        draft
      );
      if (!result.ok) {
        // An account with this identifier already exists — send the user to
        // Sign In rather than letting them retry registration here, so a
        // duplicate account can never be created.
        router.push(`/login?identifier=${encodeURIComponent(identifier)}&reason=${result.reason}`);
        return;
      }
      clearOnboardingDraft();
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordValid = password.length > 0 && isValidPassword(password);

  if (!draft) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{step === "verify" ? t.auth.register.verifyStepTitle : t.auth.register.title}</CardTitle>
        <CardDescription>
          {step === "identity" && t.auth.register.emailStepDescription}
          {step === "verify" && t.auth.register.verifyStepDescription(identifier)}
          {step === "password" && t.auth.register.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "identity" && (
          <form className="flex flex-col gap-5" onSubmit={handleIdentitySubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.auth.register.firstName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.auth.register.firstNamePlaceholder}
                autoComplete="given-name"
                required
              />
              <Input
                label={t.auth.register.lastName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.auth.register.lastNamePlaceholder}
                autoComplete="family-name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">{t.auth.register.methodLabel}</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  aria-pressed={method === "email"}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out",
                    method === "email"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-border bg-background text-muted hover:border-primary-200"
                  )}
                >
                  {t.auth.register.methodEmail}
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  aria-pressed={method === "phone"}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out",
                    method === "phone"
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-border bg-background text-muted hover:border-primary-200"
                  )}
                >
                  {t.auth.register.methodPhone}
                </button>
              </div>
            </div>

            {method === "email" ? (
              <Input
                label={t.auth.register.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.register.emailPlaceholder}
                autoComplete="email"
                required
              />
            ) : (
              <Input
                label={t.auth.register.phone}
                type="tel"
                value={formatKzPhone(phoneDigits)}
                onChange={(e) => setPhoneDigits(normalizeKzPhoneDigits(e.target.value))}
                placeholder={t.auth.register.phonePlaceholder}
                autoComplete="tel"
                required
              />
            )}

            {error && (
              <p className="text-sm text-danger-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.register.continueButton}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form className="flex flex-col gap-5" onSubmit={handleVerifySubmit}>
            {devCode && (
              <div className="rounded-2xl border border-warning-500/20 bg-warning-50 p-3.5 text-sm leading-relaxed text-warning-600">
                {method === "email"
                  ? t.auth.register.devModeCodeNotice(devCode)
                  : t.auth.register.devModeSmsNotice(devCode)}
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
              className="self-center text-sm font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700 hover:underline"
            >
              {t.auth.register.resendCode}
            </button>
          </form>
        )}

        {step === "password" && (
          <form className="flex flex-col gap-5" onSubmit={handlePasswordSubmit}>
            <Input
              label={method === "email" ? t.auth.register.email : t.auth.register.phone}
              value={method === "email" ? email : formatKzPhone(phoneDigits)}
              disabled
            />
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
                <p className={cn("text-xs transition-colors duration-200", passwordValid ? "text-success-600" : "text-danger-600")}>
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
                <Link href="/terms" target="_blank" className="text-primary-600 transition-colors duration-200 hover:text-primary-700 hover:underline">
                  {t.auth.register.termsAndConditions}
                </Link>{" "}
                {t.auth.register.termsMiddle}{" "}
                <Link href="/privacy" target="_blank" className="text-primary-600 transition-colors duration-200 hover:text-primary-700 hover:underline">
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
            <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.register.submit}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          {t.auth.register.haveAccount}{" "}
          <Link href="/login" className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700 hover:underline">
            {t.auth.register.logIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
