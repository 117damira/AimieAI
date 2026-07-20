"use client";

import { type FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { resetPasswordWithToken } from "@/lib/auth/accountStore";
import { isValidPassword } from "@/lib/utils/password";
import { cn } from "@/lib/utils/cn";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

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
      const result = await resetPasswordWithToken(token, newPassword);
      if (!result.ok) {
        setError(
          result.reason === "expired-token"
            ? t.auth.resetPassword.expiredTokenError
            : t.auth.resetPassword.invalidTokenError
        );
        return;
      }
      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <p className="text-sm text-foreground">{t.auth.resetPassword.success}</p>
        <Button onClick={() => router.push("/login")} className="w-full">
          {t.auth.resetPassword.goToLogin}
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Input
          label={t.auth.resetPassword.newPassword}
          type="password"
          name="newPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t.auth.resetPassword.newPasswordPlaceholder}
          autoComplete="new-password"
          required
        />
        {password.length > 0 && (
          <p
            className={cn(
              "text-xs",
              isValidPassword(password) ? "text-success-600" : "text-danger-600"
            )}
          >
            {t.auth.forgotPassword.passwordRequirement}
          </p>
        )}
      </div>
      <Input
        label={t.auth.resetPassword.confirmPassword}
        type="password"
        name="confirmPassword"
        placeholder={t.auth.resetPassword.confirmPasswordPlaceholder}
        autoComplete="new-password"
        required
      />
      {error && (
        <p className="text-sm text-danger-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.resetPassword.submit}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t.auth.resetPassword.title}</CardTitle>
        <CardDescription>{t.auth.resetPassword.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            {t.auth.resetPassword.goToLogin}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
