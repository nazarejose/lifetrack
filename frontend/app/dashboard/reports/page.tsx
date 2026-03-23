"use client";

import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

type SettingsTab = "profile" | "security" | "appearance" | "language";

const settingsTabs = [
  { id: "profile" as const,    name: "Perfil",           icon: UserIcon },
  { id: "security" as const,   name: "Segurança",        icon: Shield },
  { id: "appearance" as const, name: "Aparência",        icon: Palette },
  { id: "language" as const,   name: "Idioma e Região",  icon: Globe },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguage] = useState<"pt" | "en">("pt");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const u = api.getUser();
    setUser(u);
    if (u?.name) setName(u.name);
    if (u?.email) setEmail(u.email);

    // Lê preferências salvas
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const savedLang = localStorage.getItem("language") as "pt" | "en" | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleThemeChange = (t: "dark" | "light") => {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.documentElement.classList.toggle("light", t === "light");
  };

  const handleLanguageChange = (l: "pt" | "en") => {
    setLanguage(l);
    localStorage.setItem("language", l);
  };

  const handleLogout = () => {
    api.logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <Card className="bg-card border-border h-fit">
          <CardContent className="p-2">
            <nav className="flex flex-col gap-1">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="h-5 w-5" />
                    {tab.name}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors mt-2"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex flex-col gap-6">

          {/* ── Perfil ── */}
          {activeTab === "profile" && (
            <>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Informações do Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                      {user?.name?.charAt(0) || ""}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {user?.name || ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>

                  {/* Nome */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Nome completo
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      E-mail
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Salvar alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-card border-[#ef4444]/30">
                <CardHeader>
                  <CardTitle className="text-foreground">Zona de Perigo</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ações irreversíveis para sua conta
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                    <div>
                      <p className="font-medium text-foreground">
                        Deletar conta
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Exclui permanentemente sua conta e todos os dados
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-[#ef4444] hover:bg-[#ef4444]/90"
                    >
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Segurança ── */}
          {activeTab === "security" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Segurança</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Senha atual</Label>
                  <Input type="password" placeholder="Digite a senha atual" className="bg-secondary border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Nova senha</Label>
                  <Input type="password" placeholder="Digite a nova senha" className="bg-secondary border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Confirmar nova senha</Label>
                  <Input type="password" placeholder="Confirme a nova senha" className="bg-secondary border-border" />
                </div>
                <Button className="self-start bg-primary text-primary-foreground">
                  Atualizar senha
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ── Aparência ── */}
          {activeTab === "appearance" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Aparência</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Escolha o tema da interface
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Dark */}
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-[#475569]"
                    )}
                  >
                    {theme === "dark" && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {/* Preview dark */}
                    <div className="w-full rounded-lg bg-background p-3 space-y-1.5">
                      <div className="h-2 w-3/4 rounded bg-secondary" />
                      <div className="h-2 w-1/2 rounded bg-secondary" />
                      <div className="h-6 w-full rounded bg-card mt-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Moon className="h-4 w-4" />
                      Escuro
                    </div>
                  </button>

                  {/* Light */}
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-[#475569]"
                    )}
                  >
                    {theme === "light" && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {/* Preview light */}
                    <div className="w-full rounded-lg bg-white p-3 space-y-1.5">
                      <div className="h-2 w-3/4 rounded bg-gray-200" />
                      <div className="h-2 w-1/2 rounded bg-gray-200" />
                      <div className="h-6 w-full rounded bg-gray-100 mt-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sun className="h-4 w-4" />
                      Claro
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Idioma ── */}
          {activeTab === "language" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Idioma e Região</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Escolha o idioma da interface
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {[
                    { id: "pt" as const, label: "Português (Brasil)", flag: "🇧🇷" },
                    { id: "en" as const, label: "English (US)",        flag: "🇺🇸" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left",
                        language === lang.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary hover:border-[#475569]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-sm font-medium text-foreground">
                          {lang.label}
                        </span>
                      </div>
                      {language === lang.id && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}