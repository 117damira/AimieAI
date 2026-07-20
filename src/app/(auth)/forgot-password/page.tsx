"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Info, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  buttonVariants,
} from "@/components/ui";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { createResetToken } from "@/lib/auth/accountStore";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResetToken(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    setIsSubmitting(true);
    try {
      const result = createResetToken(email);
      if (!result.ok) {
        setError(t.auth.forgotPassword.notFoundError);
        return;
      }
      setResetToken(result.token);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.auth.forgotPassword.title}</CardTitle>
        <CardDescription>{t.auth.forgotPassword.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {resetToken ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 rounded-xl bg-primary-50 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {t.auth.forgotPassword.simulatedNoticeTitle}
                </span>
                <span className="text-sm text-muted">
                  {t.auth.forgotPassword.simulatedNoticeDescription}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {t.auth.forgotPassword.resetLinkLabel}
              </span>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="flex items-center gap-1 break-all text-sm text-primary-600 hover:underline"
              >
                /reset-password?token={resetToken}
              </Link>
            </div>
            <Link
              href={`/reset-password?token=${resetToken}`}
              className={buttonVariants({ className: "w-full" })}
            >
              {t.auth.forgotPassword.continueButton}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label={t.auth.forgotPassword.email}
              type="email"
              name="email"
              placeholder={t.auth.forgotPassword.emailPlaceholder}
              autoComplete="email"
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
                t.auth.forgotPassword.submit
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            {t.auth.forgotPassword.backToLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
