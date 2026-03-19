"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

function PasswordStrength({ password }: { password: string }) {
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {rules.map((rule) => (
        <div key={rule.label} className="flex items-center gap-2">
          {rule.met ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span
            className={`text-xs ${
              rule.met ? "text-[#22c55e]" : "text-muted-foreground"
            }`}
          >
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      await api.register(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error creating account.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#3b82f6] via-[#6366f1] to-[#1e3a5f]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">LifeTrack</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight text-white text-balance">
              Start tracking your life in minutes.
            </h1>
            <p className="text-lg text-white/80">
              Create your account and get full access to habit tracking,
              financial control, and goal management — all in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              "Track unlimited daily habits",
              "Monitor income and expenses",
              "Set and follow personal goals",
              "View detailed progress reports",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-white/90 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-white">10k+</p>
            <p className="text-sm text-white/70">Active Users</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-white">Free</p>
            <p className="text-sm text-white/70">To get started</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
            <h2 className="text-3xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="text-muted-foreground">
              Fill in your details to get started for free.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-[#1e293b] border-[#334155] h-12 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                    passwordsMatch
                      ? "text-[#22c55e]"
                      : passwordMismatch
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-[#1e293b] h-12 text-foreground placeholder:text-muted-foreground ${
                    passwordMismatch
                      ? "border-destructive"
                      : passwordsMatch
                      ? "border-[#22c55e]"
                      : "border-[#334155]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-xs text-destructive">
                  Passwords do not match.
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-[#22c55e]">Passwords match!</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading || passwordMismatch}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/" className="text-primary hover:underline">
              Sign in
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