import { stackServerApp } from "@/lib/auth/stack-auth"
import { userService } from "@/lib/services/user-service"
import { redirect, notFound } from "next/navigation"
import { ReportForm } from "@/components/report-form"

export default async function ReportPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const authUser = await stackServerApp.getUser()

  if (!authUser) {
    redirect("/")
  }

  if (userId === authUser.id) {
    redirect("/profile")
  }

  const user = await userService.getUserById(userId)
  if (!user) {
    notFound()
  }

  return <ReportForm user={user} />
}
