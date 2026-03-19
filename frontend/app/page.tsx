"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (api.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Email ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Gradient Background */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#3b82f6] via-[#6366f1] to-[#1e3a5f]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">LifeTrack</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white text-balance">
            Manage your life and finances in one place.
          </h1>
          <p className="text-lg text-white/80">
            Join thousands of users who have simplified their daily tracking and
            financial planning with our professional tools.
          </p>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-5 py-3 w-fit">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-400 border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-400 border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white">
                B
              </div>
              <div className="h-8 w-8 rounded-full bg-red-400 border-2 border-white/20 flex items-center justify-center text-xs font-bold text-white">
                C
              </div>
            </div>
            <span className="text-sm text-white">
              Trusted by over 10k users worldwide
            </span>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-white">10k+</p>
            <p className="text-sm text-white/70">Active Users</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-white">250k+</p>
            <p className="text-sm text-white/70">Tracked Goals</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between bg-[#0f172a] p-8 lg:p-16">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            LifeTrack
          </span>
        </div>

        <div className="flex flex-col justify-center flex-1 max-w-md mx-auto w-full">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">
              Please enter your details to sign in to your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#1e293b] border-[#334155] h-12 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-[#1e293b] border-[#334155] h-12 text-foreground placeholder:text-muted-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#334155] bg-[#1e293b] accent-primary"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#334155]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0f172a] px-3 text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 bg-[#1e293b] border-[#334155] hover:bg-[#334155] text-foreground"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
              Google
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-[#1e293b] border-[#334155] hover:bg-[#334155] text-foreground"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Not a member?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; 2024 LifeTrack Inc. All rights reserved.{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>{" "}
          &middot;{" "}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
