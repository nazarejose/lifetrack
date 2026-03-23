"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/i18n";
import {
  User as UserIcon,
  Palette,
  Globe,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@/lib/types";

type SettingsTab = "profile" | "appearance" | "language";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language].settings;
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const u = api.getUser();
    setUser(u);
    if (u?.name) setName(u.name);
    if (u?.email) setEmail(u.email);
  }, []);

  const resolvedTheme = (theme === "light" ? "light" : "dark") as "dark" | "light";

  const handleThemeChange = (val: "dark" | "light") => setTheme(val);
  const handleLanguageChange = (l: "pt" | "en") => setLanguage(l);
  const handleLogout = () => { api.logout(); router.push("/"); };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ name, email });
      setUser(api.getUser());
      toast.success(language === "pt" ? "Perfil atualizado com sucesso!" : "Profile updated successfully!");
    } catch {
      toast.error(language === "pt" ? "Erro ao atualizar perfil." : "Error updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      router.push("/");
    } catch {
      toast.error(language === "pt" ? "Erro ao deletar conta." : "Error deleting account.");
      setIsDeleting(false);
    }
  };

  const settingsTabs: { id: SettingsTab; icon: typeof UserIcon; label: string }[] = [
    { id: "profile", icon: UserIcon, label: t.profile },
    { id: "appearance", icon: Palette, label: t.appearance },
    { id: "language", icon: Globe, label: t.language },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
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
                    {tab.label}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors mt-2"
              >
                <LogOut className="h-5 w-5" />
                {t.logout}
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
                  <CardTitle className="text-foreground">{t.profileInfo}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                      {user?.name?.charAt(0) || ""}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user?.name || ""}</p>
                      <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t.fullName}
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        {t.email}
                      </Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary border-border"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isSaving}
                      >
                        {isSaving ? "..." : t.saveChanges}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-card border-[#ef4444]/30">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.dangerZone}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.dangerZoneDesc}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                    <div>
                      <p className="font-medium text-foreground">{t.deleteAccount}</p>
                      <p className="text-sm text-muted-foreground">{t.deleteAccountDesc}</p>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-[#ef4444] hover:bg-[#ef4444]/90"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "..." : t.delete}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
                      {language === "pt" ? "Deletar conta" : "Delete account"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      {language === "pt"
                        ? "Tem certeza que deseja deletar sua conta? Esta ação é irreversível e todos os dados serão perdidos permanentemente."
                        : "Are you sure you want to delete your account? This action is irreversible and all your data will be permanently lost."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-border">
                      {language === "pt" ? "Cancelar" : "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white"
                      onClick={handleDeleteAccount}
                    >
                      {language === "pt" ? "Sim, deletar" : "Yes, delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {/* ── Aparência ── */}
          {activeTab === "appearance" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t.appearance}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.chooseTheme}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      resolvedTheme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-[#475569]"
                    )}
                  >
                    {resolvedTheme === "dark" && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="w-full rounded-lg bg-[#0a0e1a] p-3 space-y-1.5">
                      <div className="h-2 w-3/4 rounded bg-[#1e293b]" />
                      <div className="h-2 w-1/2 rounded bg-[#1e293b]" />
                      <div className="h-6 w-full rounded bg-[#111827] mt-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Moon className="h-4 w-4" />
                      {t.dark}
                    </div>
                  </button>

                  <button
                    onClick={() => handleThemeChange("light")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      resolvedTheme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-[#475569]"
                    )}
                  >
                    {resolvedTheme === "light" && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="w-full rounded-lg bg-[#f1f5f9] p-3 space-y-1.5">
                      <div className="h-2 w-3/4 rounded bg-[#e2e8f0]" />
                      <div className="h-2 w-1/2 rounded bg-[#e2e8f0]" />
                      <div className="h-6 w-full rounded bg-white mt-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sun className="h-4 w-4" />
                      {t.light}
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
                <CardTitle className="text-foreground">{t.language}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.chooseLanguage}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {[
                    { id: "pt" as const, label: t.portuguese, flag: "🇧🇷" },
                    { id: "en" as const, label: t.english, flag: "🇺🇸" },
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
                        <span className="text-sm font-medium text-foreground">{lang.label}</span>
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