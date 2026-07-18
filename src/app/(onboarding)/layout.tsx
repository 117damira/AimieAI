import { CenteredShell } from "@/components/layout/CenteredShell";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CenteredShell>{children}</CenteredShell>;
}
