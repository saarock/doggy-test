import { stackServerApp } from "@/lib/auth/stack-auth";
import { redirect } from "next/navigation";
import LandingPageWrapper from "@/components/landing-page-wrapper";

export default async function Home() {
  const user = await stackServerApp.getUser();
  console.log("[v0] Home page - user:", user ? user.id : "not authenticated");

  if (user) {
    redirect("/discover");
  }

  return <LandingPageWrapper />;
}
