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

export default function RegisterPage() {
  const router = useRouter();
  const { seedIdentity } = useUserProfile();

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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start your personalized DELF preparation in a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              name="firstName"
              placeholder="Amina"
              autoComplete="given-name"
              required
            />
            <Input
              label="Last name"
              name="lastName"
              placeholder="Haddad"
              autoComplete="family-name"
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Button type="submit" className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
