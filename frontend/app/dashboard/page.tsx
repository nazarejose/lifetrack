"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Plus,
  ShoppingCart,
  CreditCard,
  Utensils,
  Zap,
  Fuel,
  Droplets,
  BookOpen,
  Dumbbell,
  Brain,
  Globe,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { TransactionSummary, Habit, Transaction } from "@/lib/types";

// ─── Ícones por categoria ─────────────────────────────────────────────────────

const transactionIcons: Record<string, typeof ShoppingCart> = {
  Food: Utensils,
  Salary: CreditCard,
  Freelance: CreditCard,
  Utilities: Zap,
  Transport: Fuel,
  Health: Dumbbell,
  Shopping: ShoppingCart,
};

const habitIcons: Record<string, typeof Dumbbell> = {
  workout: Dumbbell,
  meditation: Brain,
  reading: BookOpen,
  water: Droplets,
  language: Globe,
};

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, habitsData, transactionsData] = await Promise.all([
        api.getTransactionSummary(),
        api.getHabits(),
        api.getTransactions(),
      ]);
      setSummary(summaryData);
      setHabits(habitsData);
      setTransactions(transactionsData.slice(0, 5));
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(api.getUser());
    fetchData();
  }, [fetchData]);

  const completedHabits = habits.filter((h) => h.isCheckedToday).length;
  const totalHabits = habits.length;

  const handleToggleHabit = async (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, isCheckedToday: !h.isCheckedToday } : h
      )
    );
    try {
      await api.toggleHabit(habitId);
    } catch {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, isCheckedToday: !h.isCheckedToday } : h
        )
      );
    }
  };

  // Gera dados reais pro gráfico de gastos semanais
  const weeklySpending = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals: Record<string, number> = {};
    days.forEach((d) => (totals[d] = 0));

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      if (date >= weekAgo && tx.transactionType === "EXPENSE") {
        const day = days[date.getDay()];
        totals[day] = (totals[day] || 0) + tx.amount;
      }
    });

    return days.map((day) => ({ day, value: totals[day] }));
  })();

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || ""}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your goals today.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="flex flex-col gap-6">
          {/* Total Balance Card */}
          <Card className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] border-0 overflow-hidden">
            <CardContent className="p-6">
              <p className="text-sm text-white/80 mb-1">Total Balance</p>
              <p className="text-4xl font-bold text-white mb-2">
                {isLoading ? "—" : formatCurrency(summary?.balance ?? 0)}
              </p>
              <div className="flex items-center gap-1 text-sm text-white/80">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Income: {formatCurrency(summary?.totalIncome ?? 0)} · Expenses:{" "}
                  {formatCurrency(summary?.totalExpense ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Spending Chart */}
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground text-lg">
                  Weekly Spending
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  This week&apos;s daily expenses
                </p>
              </div>
              <Badge variant="secondary" className="bg-[#1e293b] text-foreground">
                This week
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySpending}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Spent",
                      ]}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-foreground text-lg">
                Recent Transactions
              </CardTitle>
              <Link
                href="/dashboard/finances"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions yet.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {transactions.map((tx) => {
                    const Icon =
                      transactionIcons[tx.category] || ShoppingCart;
                    const isIncome = tx.transactionType === "INCOME";
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isIncome
                                ? "bg-[#22c55e]/20 text-[#22c55e]"
                                : "bg-[#3b82f6]/20 text-[#3b82f6]"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.date).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isIncome ? "text-[#22c55e]" : "text-[#ef4444]"
                          }`}
                        >
                          {isIncome ? "+" : "−"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Habits */}
        <div className="flex flex-col gap-6">
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground text-lg">
                  Daily Habits
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {completedHabits}/{totalHabits} Done
                </p>
              </div>
              <Badge variant="secondary" className="bg-[#1e293b] text-foreground">
                {completedHabits}/{totalHabits}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : habits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No habits yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {habits.map((habit) => {
                    const Icon =
                      habitIcons[habit.icon || "workout"] || CheckCircle;
                    return (
                      <button
                        key={habit.id}
                        onClick={() => handleToggleHabit(habit.id)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1e293b] transition-colors text-left"
                      >
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                            habit.isCheckedToday
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground"
                          }`}
                        >
                          {habit.isCheckedToday && (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            habit.isCheckedToday
                              ? "bg-primary/20 text-primary"
                              : "bg-[#1e293b] text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              habit.isCheckedToday
                                ? "text-primary line-through"
                                : "text-foreground"
                            }`}
                          >
                            {habit.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {habit.description ?? habit.frequency}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <Link href="/dashboard/habits">
                <Button
                  variant="ghost"
                  className="w-full mt-4 border border-dashed border-[#334155] text-muted-foreground hover:text-foreground hover:bg-[#1e293b]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Habits
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardContent className="p-4">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? "—"
                    : formatCurrency(
                        (summary?.totalIncome ?? 0) -
                          (summary?.totalExpense ?? 0)
                      )}
                </p>
                <p className="text-xs text-muted-foreground">Net Balance</p>
              </CardContent>
            </Card>
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardContent className="p-4">
                <CheckCircle className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {completedHabits}/{totalHabits}
                </p>
                <p className="text-xs text-muted-foreground">Habits Today</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}