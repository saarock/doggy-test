import type React from "react";
import { stackServerApp } from "@/lib/auth/stack-auth";
import { redirect } from "next/navigation";
import { userService } from "@/lib/services/user-service";
import { AppLayout } from "@/components/app-layout";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/");
  }

  // Check if user has completed onboarding
  const dbUser = await userService.getUserById(user.id);
  if (!dbUser || !dbUser.age_confirmed || !dbUser.goals || dbUser.goals.length <= 0) {
    redirect("/onboarding");
  }

  return <AppLayout user={dbUser}>{children}</AppLayout>;
}
