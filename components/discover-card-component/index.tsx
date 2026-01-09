"use client";

import useLocation from "@/hooks/useLocation";
import type { UserWithDistance } from "@/lib/db/types";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Sparkles,
  Users,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { UserCard } from "../user-card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DiscoverCard() {
  const { location } = useLocation();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithDistance | null>(null)

  const selectedGoals = ["job", "chat", "service", "networking", "learning"];
  const goalsQuery = selectedGoals
    .map((g) => `goals=${encodeURIComponent(g)}`)
    .join("&");

  const { data, isLoading } = useSWR<{
    users: UserWithDistance[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }>(
    location
      ? `/api/users/filter?latitude=${location.latitude}&longitude=${location.longitude}&radius=10&pageXOffset=${page}&pageSize=${limit}&${goalsQuery}`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const nearbyUsers = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.currentPage || 1;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  if (!location) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <MapPin className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground font-medium">
          Detecting your location...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (nearbyUsers.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
          <Users className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold text-foreground">
            No users nearby
          </p>
          <p className="text-muted-foreground">
            Try expanding your search radius
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Discover People
          </h2>
          <p className="text-muted-foreground">
            {data?.totalItems} people found near you
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
          Page {currentPage} of {totalPages}
        </Badge>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nearbyUsers.map((user, index) => (
          <Card
            key={user.id}
            className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-muted/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-6 relative">
              {/* Avatar & Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <Avatar className="w-16 h-16 rounded-2xl ring-2 ring-border group-hover:ring-primary/50 transition-all duration-300 shadow-lg">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    ) : (
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center">
                    <div className="w-2 h-2 bg-background rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">
                      {user.distance_km.toFixed(1)} km away
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                {user.bio || "Ready to connect and share experiences!"}
              </p>

              {/* Goals */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {user.goals.slice(0, 3).map((goal) => (
                  <Badge
                    key={goal}
                    variant="secondary"
                    className="px-2.5 py-0.5 text-xs font-medium bg-secondary/80 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {goal}
                  </Badge>
                ))}
                {user.goals.length > 3 && (
                  <Badge variant="outline" className="px-2.5 py-0.5 text-xs">
                    +{user.goals.length - 3}
                  </Badge>
                )}
              </div>

              {/* Connect button */}
              <Button
                className="w-full rounded-xl font-semibold group/btn relative overflow-hidden"
                size="lg"
                onClick={() => setSelectedUser(user)}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Connect
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        {/* Page size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setLimit(size);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  limit === size
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted text-foreground"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(1)}
            disabled={!hasPrevPage}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={!hasNextPage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={!hasNextPage}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>

         <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-[3rem] border-t-4 border-muted p-0 overflow-hidden">
                  <SheetHeader className="sr-only">
                    <SheetTitle>User Profile</SheetTitle>
                  </SheetHeader>
                  <div className="p-2 flex justify-center">
                    <div className="w-12 h-1.5 rounded-full bg-muted/50" />
                  </div>
                  <div className="pb-10 overflow-y-auto">
                    {selectedUser && <UserCard user={selectedUser} onStartChat={() => setSelectedUser(null)} />}
                  </div>
                </SheetContent>
              </Sheet>

        {/* Quick jump */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Go to:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = Number.parseInt(e.target.value);
              if (val >= 1 && val <= totalPages) setPage(val);
            }}
            className="w-16 h-10 rounded-xl border border-border bg-card text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
