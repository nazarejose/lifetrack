"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/components/language-provider";
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
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";

// ─── Toast simples ────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

function Toast({ toast }: { toast: ToastState }) {
  if (!toast.visible) return null;
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all",
        toast.type === "success"
          ? "bg-[#22c55e] text-white"
          : "bg-[#ef4444] text-white"
      )}
    >
      {toast.type === "success" ? (
        <Check className="h-4 w-4 flex-shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      )}
      {toast.message}
    </div>
  );
}

// ─── Confirmação de delete ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onConfirm,
  onCancel,
  language,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  language: "pt" | "en";
}) {
  if (!open) return null;
  const t = language === "pt"
    ? {
        title: "Deletar conta",
        desc: "Tem certeza que deseja deletar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos permanentemente.",
        confirm: "Sim, deletar minha conta",
        cancel: "Cancelar",
      }
    : {
        title: "Delete account",
        desc: "Are you sure you want to delete your account? This action is irreversible and all your data will be permanently lost.",
        confirm: "Yes, delete my account",
        cancel: "Cancel",
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-[#ef4444]/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef4444]/20">
            <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{t.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{t.desc}</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-[#1e293b] border-[#334155]"
            onClick={onCancel}
          >
            {t.cancel}
          </Button>
          <Button
            className="flex-1 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white"
            onClick={onConfirm}
          >
            {t.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tipos e traduções ────────────────────────────────────────────────────────

type SettingsTab = "profile" | "appearance" | "language";

const translations = {
  pt: {
    title: "Configurações",
    subtitle: "Gerencie sua conta e preferências",
    profile: "Perfil",
    appearance: "Aparência",
    language: "Idioma e Região",
    signOut: "Sair",
    profileInfo: "Informações do Perfil",
    fullName: "Nome completo",
    email: "E-mail",
    saveChanges: "Salvar alterações",
    saving: "Salvando...",
    dangerZone: "Zona de Perigo",
    dangerDesc: "Ações irreversíveis para sua conta",
    deleteAccount: "Deletar conta",
    deleteDesc: "Exclui permanentemente sua conta e todos os dados",
    delete: "Deletar",
    appearanceTitle: "Aparência",
    appearanceSubtitle: "Escolha o tema da interface",
    dark: "Escuro",
    light: "Claro",
    languageTitle: "Idioma e Região",
    languageSubtitle: "Escolha o idioma da interface",
    savedSuccess: "Perfil atualizado com sucesso!",
    savedError: "Erro ao atualizar perfil.",
  },
  en: {
    title: "Settings",
    subtitle: "Manage your account and preferences",
    profile: "Profile",
    appearance: "Appearance",
    language: "Language & Region",
    signOut: "Sign Out",
    profileInfo: "Profile Information",
    fullName: "Full name",
    email: "Email address",
    saveChanges: "Save changes",
    saving: "Saving...",
    dangerZone: "Danger Zone",
    dangerDesc: "Irreversible actions for your account",
    deleteAccount: "Delete account",
    deleteDesc: "Permanently delete your account and all data",
    delete: "Delete",
    appearanceTitle: "Appearance",
    appearanceSubtitle: "Choose the interface theme",
    dark: "Dark",
    light: "Light",
    languageTitle: "Language & Region",
    languageSubtitle: "Choose the interface language",
    savedSuccess: "Profile updated successfully!",
    savedError: "Error updating profile.",
  },
};

// ─── SettingsPage ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    visible: false,
  });

  const t = translations[language];

  useEffect(() => {
    const u = api.getUser();
    setUser(u);
    if (u?.name) setName(u.name);
    if (u?.email) setEmail(u.email);
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({ name, email });
      setUser(updated);
      showToast(t.savedSuccess, "success");
    } catch {
      showToast(t.savedError, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeChange = (t: "dark" | "light") => {
    setTheme(t);
  };

  const handleLanguageChange = (l: "pt" | "en") => {
    setLanguage(l);
  };

  const handleLogout = () => {
    api.logout();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      router.push("/");
    } catch {
      setShowDeleteConfirm(false);
      showToast(
        language === "pt" ? "Erro ao deletar conta." : "Error deleting account.",
        "error"
      );
    }
  };

  const settingsTabs = [
    { id: "profile" as const, name: t.profile, icon: UserIcon },
    { id: "appearance" as const, name: t.appearance, icon: Palette },
    { id: "language" as const, name: t.language, icon: Globe },
  ];

  return (
    <>
      <Toast toast={toast} />
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        language={language}
      />

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <Card className="bg-[#111827] border-[#1e293b] h-fit">
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
                        : "text-muted-foreground hover:bg-[#1e293b] hover:text-foreground"
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
                  {t.signOut}
                </button>
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="flex flex-col gap-6">

            {/* ── Perfil ── */}
            {activeTab === "profile" && (
              <>
                <Card className="bg-[#111827] border-[#1e293b]">
                  <CardHeader>
                    <CardTitle className="text-foreground">{t.profileInfo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                          {name?.charAt(0) || user?.name?.charAt(0) || ""}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                          {t.fullName}
                        </Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-[#1e293b] border-[#334155]"
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
                          className="bg-[#1e293b] border-[#334155]"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={isSaving}
                        >
                          {isSaving ? t.saving : t.saveChanges}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="bg-[#111827] border-[#ef4444]/30">
                  <CardHeader>
                    <CardTitle className="text-foreground">{t.dangerZone}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t.dangerDesc}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                      <div>
                        <p className="font-medium text-foreground">{t.deleteAccount}</p>
                        <p className="text-sm text-muted-foreground">{t.deleteDesc}</p>
                      </div>
                      <Button
                        variant="destructive"
                        className="bg-[#ef4444] hover:bg-[#ef4444]/90"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        {t.delete}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── Aparência ── */}
            {activeTab === "appearance" && (
              <Card className="bg-[#111827] border-[#1e293b]">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.appearanceTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.appearanceSubtitle}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={cn(
                        "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        theme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-[#334155] bg-[#1e293b] hover:border-[#475569]"
                      )}
                    >
                      {theme === "dark" && (
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
                        theme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-[#334155] bg-[#1e293b] hover:border-[#475569]"
                      )}
                    >
                      {theme === "light" && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="w-full rounded-lg bg-white p-3 space-y-1.5">
                        <div className="h-2 w-3/4 rounded bg-gray-200" />
                        <div className="h-2 w-1/2 rounded bg-gray-200" />
                        <div className="h-6 w-full rounded bg-gray-100 mt-2" />
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
              <Card className="bg-[#111827] border-[#1e293b]">
                <CardHeader>
                  <CardTitle className="text-foreground">{t.languageTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.languageSubtitle}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {[
                      { id: "pt" as const, label: "Português (Brasil)", flag: "🇧🇷" },
                      { id: "en" as const, label: "English (US)", flag: "🇺🇸" },
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left",
                          language === lang.id
                            ? "border-primary bg-primary/10"
                            : "border-[#334155] bg-[#1e293b] hover:border-[#475569]"
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
    </>
  );
}