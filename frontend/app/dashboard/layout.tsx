"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api";

export default function DashboardLayout({children}: { children: React.ReactNode }) {
  
  const router = useRouter();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.push("/");
    }
  }, [router]);
  
  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-[220px] min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}