"use client";

import { Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/i18n";

const pathToTitleKey: Record<string, keyof (typeof translations.pt.nav)> = {
  "/dashboard": "overview",
  "/dashboard/finances": "finances",
  "/dashboard/habits": "habits",
  "/dashboard/goals": "goals",
  "/dashboard/settings": "settings",
};

export function Header() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language].nav;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  const titleKey = pathToTitleKey[pathname];
  const pageTitle = pathname === "/dashboard" ? "" : (titleKey ? t[titleKey] : "");

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <div className="flex items-center gap-3 lg:ml-0 ml-12">
        <FileText className="h-5 w-5 text-muted-foreground" />
        {pageTitle && (
          <span className="text-sm font-medium text-foreground">
            {pageTitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary" />
        </Button> */}

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user?.name?.charAt(0) || ""}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.name || ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}