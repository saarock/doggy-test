import { stackServerApp } from "@/lib/auth/stack-auth"
import { redirect } from "next/navigation"
import { OnboardingForm } from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const user = await stackServerApp.getUser()

  if (!user) {
    redirect("/")
  }

  return <OnboardingForm />
}
