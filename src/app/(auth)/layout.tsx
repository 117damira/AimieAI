import { CenteredShell } from "@/components/layout/CenteredShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CenteredShell>{children}</CenteredShell>;
}
