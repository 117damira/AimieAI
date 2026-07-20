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

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useUserProfile();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t.common.passwordTooShortError);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.common.passwordsDoNotMatchError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await register({ firstName, lastName, email }, password);
      if (!result.ok) {
        setError(t.common.duplicateEmailError);
        return;
      }
      router.push("/onboarding");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.auth.register.title}</CardTitle>
        <CardDescription>
          {t.auth.register.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
          <Input
            label={t.auth.register.email}
            type="email"
            name="email"
            placeholder={t.auth.register.emailPlaceholder}
            autoComplete="email"
            required
          />
          <Input
            label={t.auth.register.password}
            type="password"
            name="password"
            placeholder={t.auth.register.passwordPlaceholder}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <Input
            label={t.auth.register.confirmPassword}
            type="password"
            name="confirmPassword"
            placeholder={t.auth.register.confirmPasswordPlaceholder}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          {error && (
            <p className="text-sm text-danger-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t.auth.register.submit
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {t.auth.register.haveAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline"
          >
            {t.auth.register.logIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
