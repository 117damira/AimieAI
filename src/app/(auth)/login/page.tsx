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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUserProfile();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(t.common.invalidCredentials);
        return;
      }
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.auth.login.title}</CardTitle>
        <CardDescription>
          {t.auth.login.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            label={t.auth.login.email}
            type="email"
            name="email"
            placeholder={t.auth.login.emailPlaceholder}
            autoComplete="email"
            required
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label={t.auth.login.password}
              type="password"
              name="password"
              placeholder={t.auth.login.passwordPlaceholder}
              autoComplete="current-password"
              required
            />
            <Link
              href="/forgot-password"
              className="self-end text-sm font-medium text-primary-600 hover:underline"
            >
              {t.auth.login.forgotPasswordLink}
            </Link>
          </div>
          {error && (
            <p className="text-sm text-danger-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.login.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {t.auth.login.noAccount}{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:underline"
          >
            {t.auth.login.createOne}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
