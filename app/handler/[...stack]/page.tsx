import { StackHandler } from "@stackframe/stack"
import { stackServerApp } from "@/lib/auth/stack-auth"

export default async function Handler(props: {
  params: Promise<{ stack: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <StackHandler fullPage app={stackServerApp} params={await props.params} searchParams={await props.searchParams} />
  )
}
