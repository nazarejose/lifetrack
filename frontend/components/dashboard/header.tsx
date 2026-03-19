"use client";

import { Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "",
  "/dashboard/finances": "Finance Overview",
  "/dashboard/habits": "Habits",
  "/dashboard/goals": "Goals",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const user = api.getUser();
  const pageTitle = pageTitles[pathname] || "";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#1e293b] bg-[#0a0e1a]/95 backdrop-blur px-6">
      <div className="flex items-center gap-3 lg:ml-0 ml-12">
        <FileText className="h-5 w-5 text-muted-foreground" />
        {pageTitle && (
          <span className="text-sm font-medium text-foreground">
            {pageTitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {user?.name?.charAt(0) || "A"}S
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {user?.name || "Alex Silva"}
            </p>
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary text-xs px-1.5 py-0 h-4"
            >
              Pro
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
