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
import { cn } from "@/lib/utils/cn";
import { readOnboardingDraft, clearOnboardingDraft, type OnboardingAnswers } from "@/lib/onboarding/draftStore";

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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    if (!draft) return; // guarded by the redirect effect above; never reached

    setIsSubmitting(true);
    try {
      const result = await register(
        { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() },
        password,
        draft
      );
      if (!result.ok) {
        setError(t.common.duplicateEmailError);
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
        <CardTitle>{t.auth.register.title}</CardTitle>
        <CardDescription>{t.auth.register.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t.auth.register.firstName}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <Input
              label={t.auth.register.lastName}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
          <Input
            label={t.auth.register.email}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.register.emailPlaceholder}
            autoComplete="email"
            required
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
          {error && (
            <p className="text-sm text-danger-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.register.submit}
          </Button>
        </form>

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
