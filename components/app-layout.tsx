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
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Dog className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold hidden sm:inline">Doggy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-2", pathname === item.href && "font-medium")}
                >
                  <item.icon className="w-4 h-4" />
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
              <DropdownMenuItem onClick={() => app.signOut()} className="text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
