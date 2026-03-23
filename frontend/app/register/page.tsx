"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      await api.register(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.");
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

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white text-balance">
            Gerencie sua vida e suas finanças em um só lugar.
          </h1>
          <p className="text-lg text-white/80">
            Simplifique seu acompanhamento diário e planejamento financeiro com nossas ferramentas profissionais.
          </p>
        </div>

        {/* Stats — descomente se quiser exibir novamente
        <div className="flex gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-white">10k+</p>
            <p className="text-sm text-white/70">Usuários ativos</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-6 py-4">
            <p className="text-3xl font-bold text-white">250k+</p>
            <p className="text-sm text-white/70">Metas registradas</p>
          </div>
        </div>
        */}

        <div />
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col justify-between bg-sidebar p-8 lg:p-16">
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground">LifeTrack</span>
        </div>

        <div className="flex flex-col justify-center flex-1 max-w-md mx-auto w-full">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-foreground">Criar conta</h2>
            <p className="text-muted-foreground">
              Digite seus dados para criar sua conta.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-secondary border-border h-12 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border h-12 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-secondary border-border h-12 text-foreground placeholder:text-muted-foreground"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link href="/" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; 2026 LifeTrack Inc. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}