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
import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { seedIdentity } = useUserProfile();
  const { t } = useLanguage();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Real registration is not implemented yet — seed the profile locally
    // and send the user through onboarding to pick exam/level/goal.
    const formData = new FormData(event.currentTarget);
    seedIdentity({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
    });
    router.push("/onboarding");
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
          <Button type="submit" className="mt-2 w-full">
            {t.auth.register.submit}
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
