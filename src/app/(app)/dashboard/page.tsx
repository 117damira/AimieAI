"use client";

import { useUserProfile } from "@/lib/profile/UserProfileContext";
import { DelfDashboardPage } from "@/components/delf/DelfDashboardPage";
import { TopikDashboard } from "@/components/topik/TopikDashboard";

export default function DashboardPage() {
  const { profile } = useUserProfile();
  if (!profile) return null;
  return profile.examId === "topik" ? <TopikDashboard /> : <DelfDashboardPage />;
}
