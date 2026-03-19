"use client";

import { useState } from "react";
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/format";

const incomeVsExpenses = [
  { month: "Jan", income: 5200, expenses: 3800 },
  { month: "Feb", income: 4800, expenses: 4200 },
  { month: "Mar", income: 6100, expenses: 3900 },
  { month: "Apr", income: 5500, expenses: 4100 },
  { month: "May", income: 7200, expenses: 4500 },
  { month: "Jun", income: 6800, expenses: 4200 },
  { month: "Jul", income: 8100, expenses: 4800 },
  { month: "Aug", income: 7500, expenses: 4600 },
  { month: "Sep", income: 8800, expenses: 5200 },
  { month: "Oct", income: 9200, expenses: 4900 },
  { month: "Nov", income: 8500, expenses: 5100 },
  { month: "Dec", income: 9800, expenses: 5500 },
];

const expenseCategories = [
  { name: "Housing", value: 35, color: "#3b82f6" },
  { name: "Food", value: 20, color: "#22c55e" },
  { name: "Transport", value: 12, color: "#f59e0b" },
  { name: "Health", value: 10, color: "#ec4899" },
  { name: "Education", value: 8, color: "#06b6d4" },
  { name: "Leisure", value: 15, color: "#ef4444" },
];

const monthlySavings = [
  { month: "Jan", value: 1400 },
  { month: "Feb", value: 600 },
  { month: "Mar", value: 2200 },
  { month: "Apr", value: 1400 },
  { month: "May", value: 2700 },
  { month: "Jun", value: 2600 },
  { month: "Jul", value: 3300 },
  { month: "Aug", value: 2900 },
  { month: "Sep", value: 3600 },
  { month: "Oct", value: 4300 },
  { month: "Nov", value: 3400 },
  { month: "Dec", value: 4300 },
];

const habitCompletion = [
  { month: "Jan", value: 72 },
  { month: "Feb", value: 68 },
  { month: "Mar", value: 75 },
  { month: "Apr", value: 78 },
  { month: "May", value: 82 },
  { month: "Jun", value: 79 },
  { month: "Jul", value: 85 },
  { month: "Aug", value: 88 },
  { month: "Sep", value: 82 },
  { month: "Oct", value: 86 },
  { month: "Nov", value: 84 },
  { month: "Dec", value: 89 },
];

export default function ReportsPage() {
  const [year] = useState(2024);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Annual performance overview &mdash; {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {year}
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Avg Monthly Income
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(8242)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-[#22c55e]">
              <TrendingUp className="h-4 w-4" />
              <span>+8.2% vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Avg Monthly Expenses
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(3842)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-[#ef4444]">
              <TrendingDown className="h-4 w-4" />
              <span>-5.4% vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Avg Monthly Savings
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(4400)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm text-[#22c55e]">
              <TrendingUp className="h-4 w-4" />
              <span>+14.3% vs last year</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Habit Completion Rate
            </p>
            <p className="text-2xl font-bold text-foreground">83%</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-[#22c55e]">
              <TrendingUp className="h-4 w-4" />
              <span>+11% vs last year</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Income vs Expenses */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-foreground text-lg">
                Income vs Expenses
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Monthly comparison &mdash; {year}
              </p>
            </div>
            <Badge variant="secondary" className="bg-[#1e293b] text-foreground">
              Annual
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenses}>
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
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Bar
                    dataKey="income"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Income"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Expenses"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">
              Expense Categories
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of monthly spending
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{cat.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Savings */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">
              Monthly Savings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Net savings per month &mdash; {year}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySavings}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [formatCurrency(value), "Savings"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#savingsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Habit Completion Rate */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-lg">
              Habit Completion Rate
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly % of habits completed &mdash; {year}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={habitCompletion}>
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
                    domain={[60, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                    }}
                    formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#22c55e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
