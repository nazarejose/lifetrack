"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/i18n";
import {
  TrendingUp,
  Plus,
  ShoppingCart,
  CreditCard,
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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { TransactionSummary, Habit, Transaction, TransactionCategory } from "@/lib/types";

// ─── Constantes ───────────────────────────────────────────────────────────────

const habitIcons: Record<string, typeof Dumbbell> = {
  workout: Dumbbell,
  meditation: Brain,
  reading: BookOpen,
  water: Droplets,
  language: Globe,
};

// ─── HabitsBlock — fora do DashboardPage para evitar re-renders ───────────────

interface HabitsBlockProps {
  habits: Habit[];
  isLoading: boolean;
  completedHabits: number;
  totalHabits: number;
  onToggle: (id: string) => void;
}

function HabitsBlock({
  habits,
  isLoading,
  completedHabits,
  totalHabits,
  onToggle,
}: HabitsBlockProps) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-foreground text-lg">
            {t.habitsTitle}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {completedHabits}/{totalHabits} {t.completed}
          </p>
        </div>
        <Badge variant="secondary" className="bg-secondary text-foreground">
          {completedHabits}/{totalHabits}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
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
            {t.noHabits}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => {
              const Icon = habitIcons[habit.icon || "workout"] || CheckCircle;
              return (
                <button
                  key={habit.id}
                  onClick={() => onToggle(habit.id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left w-full"
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0 ${
                      habit.isCheckedToday
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}
                  >
                    {habit.isCheckedToday && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${
                      habit.isCheckedToday
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        habit.isCheckedToday
                          ? "text-primary line-through"
                          : "text-foreground"
                      }`}
                    >
                      {habit.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
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
            className="w-full mt-4 border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.manageHabits}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [habitFilter, setHabitFilter] = useState<"weekly" | "monthly">("weekly");

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, habitsData, transactionsData] = await Promise.all([
        api.getTransactionSummary(),
        api.getHabits(),
        api.getTransactions(),
      ]);
      setSummary(summaryData);
      setHabits(habitsData);
      setAllTransactions(transactionsData);
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

  const completedHabits = useMemo(
    () => habits.filter((h) => h.isCheckedToday).length,
    [habits]
  );
  const totalHabits = habits.length;

  const handleToggleHabit = useCallback(async (habitId: string) => {
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
  }, []);

  const weeklySpending = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const totals: Record<string, number> = {};
    days.forEach((d) => (totals[d] = 0));
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    allTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      if (date >= weekAgo && tx.transactionType === "EXPENSE") {
        const day = days[date.getDay()];
        totals[day] = (totals[day] || 0) + tx.amount;
      }
    });
    return days.map((day) => ({ day, value: totals[day] }));
  }, [allTransactions]);


  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t.welcome}, {user?.name?.split(" ")[0] || ""}!
        </h1>
        <p className="text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* ── MOBILE ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:hidden">
        <BalanceCard summary={summary} isLoading={isLoading} mobile />
        <HabitsBlock
          habits={habits}
          isLoading={isLoading}
          completedHabits={completedHabits}
          totalHabits={totalHabits}
          onToggle={handleToggleHabit}
        />
        <WeeklyChart data={weeklySpending} formatCurrency={formatCurrency} />
        <CategoriesChart transactions={allTransactions} />
        <HabitCompletionChart
          filter={habitFilter}
          setFilter={setHabitFilter}
        />
        <RecentTransactions
          transactions={transactions}
          isLoading={isLoading}
        />
      </div>

      {/* ── DESKTOP ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-6 lg:items-start">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6 min-w-0">
          <BalanceCard summary={summary} isLoading={isLoading} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WeeklyChart data={weeklySpending} formatCurrency={formatCurrency} />
            <CategoriesChart transactions={allTransactions} />
          </div>
          <HabitCompletionChart
            filter={habitFilter}
            setFilter={setHabitFilter}
          />
          <RecentTransactions
            transactions={transactions}
            isLoading={isLoading}
          />
        </div>
        {/* Coluna direita */}
        <div className="self-start">
          <HabitsBlock
            habits={habits}
            isLoading={isLoading}
            completedHabits={completedHabits}
            totalHabits={totalHabits}
            onToggle={handleToggleHabit}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function BalanceCard({
  summary,
  isLoading,
  mobile,
}: {
  summary: TransactionSummary | null;
  isLoading: boolean;
  mobile?: boolean;
}) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  return (
    <Card className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] border-0">
      <CardContent className="p-5">
        <p className="text-sm text-white/80 mb-1">{t.totalBalance}</p>
        <p className="text-3xl font-bold text-white mb-1">
          {isLoading ? "—" : formatCurrency(summary?.balance ?? 0)}
        </p>
        <div
          className={`flex text-sm text-white/70 mt-2 ${
            mobile ? "flex-wrap gap-x-3 gap-y-1" : "items-center gap-3"
          }`}
        >
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {t.income}: {formatCurrency(summary?.totalIncome ?? 0)}
          </span>
          {!mobile && <span>·</span>}
          <span>{t.expenses}: {formatCurrency(summary?.totalExpense ?? 0)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyChart({
  data,
  formatCurrency,
}: {
  data: { day: string; value: number }[];
  formatCurrency: (v: number) => string;
}) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-foreground text-lg">{t.weeklySpending}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.thisWeek}</p>
        </div>
        <Badge variant="secondary" className="bg-secondary text-foreground">
          {t.sevenDays}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#f8fafc" }}
                formatter={(v: number) => [formatCurrency(v), t.spent]}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoriesChart({ transactions }: { transactions: Transaction[] }) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
 
  useEffect(() => {
    api.getTransactionCategories().then(setCategories).catch(() => {});
  }, []);
 
  const data = (() => {
    
    if (categories.length > 0) {
      const totals: Record<string, { name: string; color: string; total: number }> = {};
      let grandTotal = 0;
 
      transactions
        .filter((tx) => tx.transactionType === "EXPENSE" && tx.categoryId)
        .forEach((tx) => {
          const cat = categories.find((c) => c.id === tx.categoryId);
          if (!cat) return;
          if (!totals[cat.id]) {
            totals[cat.id] = { name: cat.name, color: cat.color, total: 0 };
          }
          totals[cat.id].total += tx.amount;
          grandTotal += tx.amount;
        });
 
      if (grandTotal > 0) {
        return Object.values(totals)
          .map((item) => ({
            name: item.name,
            value: Math.round((item.total / grandTotal) * 100),
            color: item.color,
          }))
          .sort((a, b) => b.value - a.value);
      }
    }
 
    // Fallback: agrupa por INCOME/EXPENSE
    const income = transactions
      .filter((tx) => tx.transactionType === "INCOME")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = transactions
      .filter((tx) => tx.transactionType === "EXPENSE")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const total = income + expense;
 
    if (total === 0) {
      return [
        { name: t.income, value: 50, color: "#22c55e" },
        { name: t.expenses, value: 50, color: "#ef4444" },
      ];
    }

    return [
      { name: t.income, value: Math.round((income / total) * 100), color: "#22c55e" },
      { name: t.expenses, value: Math.round((expense / total) * 100), color: "#ef4444" },
    ];
  })();
 
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-lg">{t.distribution}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {categories.length > 0 ? t.byExpenseCategory : t.incomeVsExpenses}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="h-[140px] w-[140px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={2} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    color: "#0f172a",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                </div>
                <span className="font-medium text-foreground ml-2 flex-shrink-0">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HabitCompletionChart({
  filter,
  setFilter,
}: {
  filter: 'weekly' | 'monthly';
  setFilter: (f: 'weekly' | 'monthly') => void;
}) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const [data, setData] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    setIsLoading(true);
    api.getHabitHistory(filter)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [filter]);
 
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-foreground text-lg">
            {t.habitCompletionRate}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {filter === 'weekly'
              ? t.habitCompletion7Days
              : t.habitCompletion12Months}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setFilter('weekly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'weekly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.weekly}
          </button>
          <button
            onClick={() => setFilter('monthly')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.monthly}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {t.noHabitData}
          </p>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(v: number) => [`${v}%`, t.completed]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentTransactions({
  transactions,
  isLoading,
}: {
  transactions: Transaction[];
  isLoading: boolean;
}) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-foreground text-lg">{t.recentTransactions}</CardTitle>
        <Link href="/dashboard/finances" className="text-sm text-primary hover:underline">
          {t.viewAll}
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t.noTransactions}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {transactions.map((tx) => {
              const isIncome = tx.transactionType === "INCOME";
              const Icon = isIncome ? CreditCard : ShoppingCart;
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${isIncome ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-[#3b82f6]/20 text-[#3b82f6]"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ml-4 flex-shrink-0 ${isIncome ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    {isIncome ? "+" : "−"}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}