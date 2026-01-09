"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-xl bg-muted/50 relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 space-y-4 rounded-[2rem] border-4 border-muted bg-card animate-fade-in">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export function SkeletonUserCard() {
  return (
    <div className="p-4 flex items-center gap-4 border-l-4 border-l-transparent">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function SkeletonChatMessage({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
      {!isOwn && <Skeleton className="w-6 h-6 rounded-full" />}
      <Skeleton className={cn("h-16 rounded-[1.5rem]", isOwn ? "w-48" : "w-56")} />
    </div>
  )
}

export function SkeletonMapMarker() {
  return (
    <div className="absolute">
      <Skeleton className="w-12 h-12 rounded-2xl" />
    </div>
  )
}
