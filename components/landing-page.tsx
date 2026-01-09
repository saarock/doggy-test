"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStackApp } from "@stackframe/stack";
import {
  MapPin,
  MessageCircle,
  Shield,
  Users,
  AlertCircle,
  Copy,
  Check,
  Dog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function LandingPage() {
  const app = useStackApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showDomainHelper, setShowDomainHelper] = useState(false);
  const [currentDomain, setCurrentDomain] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentDomain(window.location.origin);
  }, []);

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      if (mode === "signup") {
        const result = await app.sendMagicLinkEmail(email);
        if (result.status === "error") {
          if (result.error.message.includes("Redirect URL not whitelisted")) {
            setShowDomainHelper(true);
          }
          setError(result.error.message);
          setIsLoading(false);
          return;
        }
        setError("Check your email to verify your account!");
      } else {
        const result = await app.signInWithCredential({
          email,
          password,
        });
        if (result.status === "error") {
          if (result.error.message.includes("Redirect URL not whitelisted")) {
            setShowDomainHelper(true);
          }
          setError(result.error.message);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in";
      if (errorMessage.includes("Redirect URL not whitelisted")) {
        setShowDomainHelper(true);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await app.signInWithOAuth("google");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Google OAuth is not configured";
      if (errorMessage.includes("Redirect URL not whitelisted")) {
        setShowDomainHelper(true);
      }
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,_var(--color-accent)_0%,_transparent_50%),_radial-gradient(circle_at_20%_80%,_var(--color-primary)_0%,_transparent_50%),_radial-gradient(circle_at_50%_50%,_var(--color-secondary)_0%,_transparent_60%)] opacity-40 animate-pulse-slow" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <nav className="relative container mx-auto px-4 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer transition-all hover:scale-105">
            <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-xl shadow-primary/30 rotate-3 group-hover:rotate-12 transition-transform">
              <Dog className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">Doggy</span>
          </div>
        </nav>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance mb-8 leading-[0.9]">
              Meet your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary drop-shadow-2xl animate-gradient">neighborhood</span>
            </h1>
            <p className="text-xl md:text-3xl text-muted-foreground/80 max-w-2xl mx-auto text-pretty font-bold leading-tight">
              Discover and chat with amazing people right where you live. Fun, safe, and super colorful! 🌈✨
            </p>
          </div>

          {showDomainHelper && (
            <div className="max-w-md mx-auto mb-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-semibold text-amber-600 dark:text-amber-400">
                        Setup Required
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add this domain to your Stack Auth trusted domains:
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background px-3 py-2 rounded-lg text-sm font-mono break-all border">
                        {currentDomain}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyDomain}
                        className="shrink-0 bg-transparent"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>
                        Go to{" "}
                        <a
                          href="https://app.stack-auth.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          app.stack-auth.com
                        </a>
                      </li>
                      <li>Select your project</li>
                      <li>
                        Go to <strong>Domains</strong> settings
                      </li>
                      <li>Add the domain above and save</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auth Form */}
          <div className="max-w-md mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-25" />
            <div className="relative bg-card/60 backdrop-blur-3xl border-4 border-primary/20 rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(var(--color-primary),0.2)]">
              <div className="flex p-1.5 bg-secondary rounded-[1.5rem] mb-10 border-2 border-primary/5">
                <Button
                  variant={mode === "signin" ? "default" : "ghost"}
                  className={cn(
                    "flex-1 h-12 rounded-xl transition-all duration-500 font-black tracking-wide",
                    mode === "signin" ? "bg-primary text-primary-foreground shadow-xl scale-100" : "hover:bg-primary/5 text-primary/60"
                  )}
                  onClick={() => setMode("signin")}
                >
                  SIGN IN
                </Button>
                <Button
                  variant={mode === "signup" ? "default" : "ghost"}
                  className={cn(
                    "flex-1 h-12 rounded-xl transition-all duration-500 font-black tracking-wide",
                    mode === "signup" ? "bg-primary text-primary-foreground shadow-xl scale-100" : "hover:bg-primary/5 text-primary/60"
                  )}
                  onClick={() => setMode("signup")}
                >
                  SIGN UP
                </Button>
              </div>

              {error && !showDomainHelper && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${error.includes("Check your email")
                    ? "bg-green-500/10 text-green-600"
                    : "bg-destructive/10 text-destructive"
                    }`}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" className="w-full h-14 text-xl font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary to-primary/80" disabled={isLoading}>
                  {isLoading
                    ? "WAIT A SEC..."
                    : mode === "signin"
                      ? "LET'S GO! 🚀"
                      : "JOIN THE FUN! ✨"}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-14 gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-600"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="mt-4 text-xs text-center text-muted-foreground">
                18+ only. Location required.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-32 bg-secondary/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent)_0%,_transparent_70%)] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-20 tracking-tighter animate-slide-up">
            Why you&apos;ll <span className="text-primary italic">love</span> Doggy
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="animate-slide-up stagger-1">
              <FeatureCard
                icon={<MapPin className="w-8 h-8" />}
                title="Location-Based"
                description="See people within your chosen radius. Your exact location stays private."
              />
            </div>
            <div className="animate-slide-up stagger-2">
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Discover Nearby"
                description="Browse profiles of people near you on an interactive map."
              />
            </div>
            <div className="animate-slide-up stagger-3">
              <FeatureCard
                icon={<MessageCircle className="w-8 h-8" />}
                title="Start Chatting"
                description="Connect directly with one-on-one messaging. No groups, no noise."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Your safety matters
            </h2>
            <p className="text-muted-foreground mb-8">
              We prioritize your privacy and safety. Block or report users at
              any time. Your approximate location is shown, never your exact
              address.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="px-4 py-2 rounded-full bg-muted">
                18+ verified
              </span>
              <span className="px-4 py-2 rounded-full bg-muted">
                Text-only chat
              </span>
              <span className="px-4 py-2 rounded-full bg-muted">
                Block & report
              </span>
              <span className="px-4 py-2 rounded-full bg-muted">
                Approximate location
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-muted py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg">
              <Dog className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">Doggy</span>
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Made with 🌈✨ for friendly neighbors.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group text-center p-10 rounded-[3rem] bg-card/40 backdrop-blur-xl border-4 border-muted hover:border-primary/40 transition-all hover-lift">
      <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-8 text-primary group-hover:scale-125 group-hover:rotate-6 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground font-bold leading-relaxed">{description}</p>
    </div>
  );
}
