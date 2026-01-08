"use client"

import { useUser } from "@stackframe/stack"

export function useAuthUser() {
  const user = useUser()
  return user
}
