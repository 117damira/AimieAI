"use client";

import { type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Placeholder only — real authentication is not implemented yet.
    router.push("/dashboard");
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
          <Input
            label={t.auth.login.password}
            type="password"
            name="password"
            placeholder={t.auth.login.passwordPlaceholder}
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="mt-2 w-full">
            {t.auth.login.submit}
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
