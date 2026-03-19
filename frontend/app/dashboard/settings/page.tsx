"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  ChevronRight,
  LogOut,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type SettingsTab =
  | "profile"
  | "notifications"
  | "security"
  | "appearance"
  | "language"
  | "billing";

const settingsTabs = [
  { id: "profile" as const, name: "Profile", icon: User },
  { id: "notifications" as const, name: "Notifications", icon: Bell },
  { id: "security" as const, name: "Security", icon: Shield },
  { id: "appearance" as const, name: "Appearance", icon: Palette },
  { id: "language" as const, name: "Language & Region", icon: Globe },
  { id: "billing" as const, name: "Billing & Plan", icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const user = api.getUser();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Navigation */}
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
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors mt-2">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex flex-col gap-6">
          {activeTab === "profile" && (
            <>
              <Card className="bg-[#111827] border-[#1e293b]">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                        {user?.name?.charAt(0) || "A"}S
                      </div>
                      <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {user?.name || "Alex Silva"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email || "alex.silva@email.com"}
                      </p>
                      <Badge className="mt-1 bg-primary/20 text-primary border-0">
                        Pro Plan
                      </Badge>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        First Name
                      </Label>
                      <Input
                        defaultValue="Alex"
                        className="bg-[#1e293b] border-[#334155]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Last Name
                      </Label>
                      <Input
                        defaultValue="Silva"
                        className="bg-[#1e293b] border-[#334155]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </Label>
                    <Input
                      defaultValue="alex.silva@email.com"
                      className="bg-[#1e293b] border-[#334155]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                      Bio
                    </Label>
                    <Textarea
                      defaultValue="Personal finance enthusiast and habit tracker"
                      className="bg-[#1e293b] border-[#334155] resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-[#111827] border-[#ef4444]/30">
                <CardHeader>
                  <CardTitle className="text-foreground">Danger Zone</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Irreversible actions for your account
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
                    <div>
                      <p className="font-medium text-foreground">
                        Delete Account
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-[#ef4444] hover:bg-[#ef4444]/90"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "notifications" && (
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {[
                  {
                    title: "Habit Reminders",
                    description: "Receive reminders to complete your habits",
                    enabled: true,
                  },
                  {
                    title: "Spending Alerts",
                    description: "Get notified when you reach spending limits",
                    enabled: true,
                  },
                  {
                    title: "Weekly Reports",
                    description: "Receive a weekly summary by email",
                    enabled: false,
                  },
                  {
                    title: "Goal Progress",
                    description: "Updates on your goal achievements",
                    enabled: true,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-[#1e293b] last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors cursor-pointer",
                        item.enabled ? "bg-primary" : "bg-[#1e293b]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform",
                          item.enabled && "translate-x-5"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Current Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    className="bg-[#1e293b] border-[#334155]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="bg-[#1e293b] border-[#334155]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-[#1e293b] border-[#334155]"
                  />
                </div>
                <Button className="self-start bg-primary text-primary-foreground">
                  Update Password
                </Button>

                <div className="pt-4 border-t border-[#1e293b]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" className="bg-[#1e293b] border-[#334155]">
                      Enable
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === "appearance" ||
            activeTab === "language" ||
            activeTab === "billing") && (
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardHeader>
                <CardTitle className="text-foreground capitalize">
                  {activeTab === "billing"
                    ? "Billing & Plan"
                    : activeTab === "language"
                    ? "Language & Region"
                    : activeTab}{" "}
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {activeTab} settings coming soon...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
