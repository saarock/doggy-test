"use client"

import type React from "react"

import type { User } from "@/lib/db/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, MessageCircle, UserIcon, LogOut, Dog } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStackApp } from "@stackframe/stack"
import { cn } from "@/lib/utils"
import UserbackWidget from "./user-back-widget"

interface AppLayoutProps {
  children: React.ReactNode
  user: User
}

export function AppLayout({ children, user }: AppLayoutProps) {
  const pathname = usePathname()
  const app = useStackApp()

  const navigation = [
    { name: "Discover", href: "/discover", icon: MapPin },
    { name: "Chats", href: "/chats", icon: MessageCircle },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {
        <UserbackWidget
          userId={user?.id}
          name={user.name}
          email={user?.email ?? undefined}
        />
      }
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b-4 border-primary/10 bg-background/40 backdrop-blur-2xl transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-xl shadow-primary/30 rotate-3 group-hover:rotate-12 transition-transform">
              <Dog className="w-8 h-8 text-white" />
            </div>
            <span className="font-black text-3xl tracking-tighter hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">Doggy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "h-11 gap-2.5 rounded-[1.25rem] transition-all duration-500 focus-ring-vibrant",
                    pathname === item.href
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/20 scale-105 font-black px-6"
                      : "font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary px-5"
                  )}
                  aria-label={`Navigate to ${item.name}`}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <item.icon className={cn("w-5 h-5", pathname === item.href && "animate-pulse")} aria-hidden="true" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => app.signOut()}
                className="text-destructive cursor-pointer font-bold hover:bg-destructive/10 focus:bg-destructive/10 gap-3 py-3"
              >
                <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-8 left-6 right-6 z-50" aria-label="Mobile navigation">
        <div className="bg-background/40 backdrop-blur-3xl border-4 border-primary/20 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(var(--color-primary),0.3)] overflow-hidden">
          <div className="flex items-center justify-around h-24">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-2 px-8 py-4 rounded-2xl transition-all duration-300 active:scale-75 focus-ring-vibrant",
                  pathname === item.href
                    ? "text-primary scale-125 drop-shadow-[0_0_12px_rgba(var(--color-primary),0.5)]"
                    : "text-muted-foreground/60 hover:text-primary hover:bg-primary/5"
                )}
                aria-label={`Navigate to ${item.name}`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <item.icon className={cn("w-7 h-7", pathname === item.href && "animate-bounce-gentle")} aria-hidden="true" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
