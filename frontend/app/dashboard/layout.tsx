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
    <div className="flex min-h-screen bg-[#0a0e1a]">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-[220px]">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
