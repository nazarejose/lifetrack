"use client";

import { useEffect, useState } from "react";
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

const balanceHistory = [
  { month: "Jun", value: 7200 },
  { month: "Jul", value: 8100 },
  { month: "Aug", value: 7800 },
  { month: "Sep", value: 9200 },
  { month: "Oct", value: 10800 },
  { month: "Nov", value: 12450 },
];

const weeklySpending = [
  { day: "Mon", value: 85 },
  { day: "Tue", value: 280 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 120 },
  { day: "Fri", value: 420 },
  { day: "Sat", value: 180 },
  { day: "Sun", value: 95 },
];

const transactionIcons: Record<string, typeof ShoppingCart> = {
  shopping: ShoppingCart,
  income: CreditCard,
  food: Utensils,
  utilities: Zap,
  gas: Fuel,
};

const habitIcons: Record<string, typeof Dumbbell> = {
  workout: Dumbbell,
  meditation: Brain,
  reading: BookOpen,
  water: Droplets,
  language: Globe,
};

const defaultHabits = [
  {
    id: "1",
    name: "Morning Workout",
    description: "Completed at 7:30 AM",
    isCheckedToday: true,
    icon: "workout",
  },
  {
    id: "2",
    name: "Read 20 Pages",
    description: "Daily Goal",
    isCheckedToday: false,
    icon: "reading",
  },
  {
    id: "3",
    name: "Drink 3L Water",
    description: "Progress: 1.5L",
    isCheckedToday: false,
    icon: "water",
  },
  {
    id: "4",
    name: "Meditation",
    description: "Completed at 8:00 AM",
    isCheckedToday: true,
    icon: "meditation",
  },
  {
    id: "5",
    name: "Language Practice",
    description: "15 min on Duolingo",
    isCheckedToday: false,
    icon: "language",
  },
];

const defaultTransactions = [
  {
    id: "1",
    description: "Supermercado Silva",
    date: "Today, 2:45 PM",
    amount: -342.5,
    category: "shopping",
  },
  {
    id: "2",
    description: "Freelance Project",
    date: "Yesterday, 10:15 AM",
    amount: 2500.0,
    category: "income",
  },
  {
    id: "3",
    description: "Sabor & Arte",
    date: "Yesterday, 8:30 PM",
    amount: -120.0,
    category: "food",
  },
  {
    id: "4",
    description: "Electric Company",
    date: "Oct 24, 2023",
    amount: -215.9,
    category: "utilities",
  },
  {
    id: "5",
    description: "Shell Gas Station",
    date: "Oct 23, 2023",
    amount: -150.0,
    category: "gas",
  },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<TransactionSummary>({
    balance: 12450,
    incomes: 8200,
    expenses: 3750,
  });
  const [habits, setHabits] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      isCheckedToday: boolean;
      icon?: string;
    }>
  >(defaultHabits);
  const [transactions] = useState(defaultTransactions);
  const user = api.getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, habitsData] = await Promise.all([
          api.getTransactionSummary(),
          api.getHabits(),
        ]);
        setSummary(summaryData);
        if (habitsData.length > 0) {
          setHabits(habitsData);
        }
      } catch {
        // Use default data on error
      }
    };
    fetchData();
  }, []);

  const completedHabits = habits.filter((h) => h.isCheckedToday).length;
  const totalHabits = habits.length;

  const handleToggleHabit = async (habitId: string) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId ? { ...h, isCheckedToday: !h.isCheckedToday } : h
      )
    );
    try {
      await api.toggleHabit(habitId);
    } catch {
      // Revert on error
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId ? { ...h, isCheckedToday: !h.isCheckedToday } : h
        )
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(" ")[0] || "Alex"}!
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
                {formatCurrency(summary.balance)}
              </p>
              <div className="flex items-center gap-1 text-sm text-white/80">
                <TrendingUp className="h-4 w-4" />
                <span>+12.5% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Balance History Chart */}
          <Card className="bg-[#111827] border-[#1e293b]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-foreground text-lg">
                  Balance History
                </CardTitle>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </div>
              <Badge className="bg-[#22c55e]/20 text-[#22c55e] border-0">
                +52% growth
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceHistory}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
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
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                      formatter={(value: number) => [formatCurrency(value), "Balance"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                      formatter={(value: number) => [formatCurrency(value), "Spent"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
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
              <div className="flex flex-col gap-4">
                {transactions.map((tx) => {
                  const Icon = transactionIcons[tx.category] || ShoppingCart;
                  const isIncome = tx.amount > 0;
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
                            {tx.date}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isIncome ? "text-[#22c55e]" : "text-[#ef4444]"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Habits */}
        <div className="flex flex-col gap-6">
          {/* Daily Habits Card */}
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
                      width: `${(completedHabits / totalHabits) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Habits List */}
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
                          {habit.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Add New Habit */}
              <Button
                variant="ghost"
                className="w-full mt-4 border border-dashed border-[#334155] text-muted-foreground hover:text-foreground hover:bg-[#1e293b]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Habit
              </Button>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardContent className="p-4">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(1250)}
                </p>
                <p className="text-xs text-muted-foreground">Monthly Savings</p>
              </CardContent>
            </Card>
            <Card className="bg-[#111827] border-[#1e293b]">
              <CardContent className="p-4">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">12 Days</p>
                <p className="text-xs text-muted-foreground">Habit Streak</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
