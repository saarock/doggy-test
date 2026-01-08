import "server-only"
import { StackServerApp } from "@stackframe/stack"

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
})

export async function getAuthUser() {
  const user = await stackServerApp.getUser()
  return user
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
