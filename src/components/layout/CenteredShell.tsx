import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 py-12">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-semibold text-foreground">
          Examly
        </span>
      </Link>
      {children}
    </div>
  );
}
