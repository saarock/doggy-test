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
} from "lucide-react";
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
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <nav className="relative container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Nearby</span>
          </div>
        </nav>

        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
              Connect with people
              <span className="block text-primary">near you</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
              Discover and chat with people in your area. Whether you&apos;re
              looking for new friends, networking opportunities, or just a
              casual conversation.
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
          <div className="max-w-sm mx-auto">
            <div className="bg-card border rounded-2xl p-6 shadow-lg">
              <div className="flex gap-2 mb-6">
                <Button
                  variant={mode === "signin" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMode("signin")}
                >
                  Sign In
                </Button>
                <Button
                  variant={mode === "signup" ? "default" : "ghost"}
                  className="flex-1"
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </Button>
              </div>

              {error && !showDomainHelper && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    error.includes("Check your email")
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? "Loading..."
                    : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
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
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <p className="mt-4 text-xs text-center text-muted-foreground">
                18+ only. Location required.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<MapPin className="w-6 h-6" />}
              title="Location-Based"
              description="See people within your chosen radius. Your exact location stays private."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Discover Nearby"
              description="Browse profiles of people near you on an interactive map."
            />
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="Start Chatting"
              description="Connect directly with one-on-one messaging. No groups, no noise."
            />
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
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Nearby Connect</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect with people near you. All rights reserved.
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
    <div className="text-center p-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
