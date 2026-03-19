"use client";

import { useState } from "react";
import {
  Plus,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  Calendar,
  Wallet,
  Dumbbell,
  BookOpen,
  Globe,
  Home,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

interface Goal {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  category: string;
  status: "on-track" | "at-risk" | "completed" | "behind";
  icon: string;
  unit?: string;
}

const goalIcons: Record<string, typeof Target> = {
  finance: Wallet,
  health: Dumbbell,
  learning: BookOpen,
  language: Globe,
  home: Home,
};

const defaultGoals: Goal[] = [
  {
    id: "1",
    name: "Emergency Fund",
    description: "Save 6 months of expenses as an emergency reserve",
    targetValue: 30000,
    currentValue: 18500,
    deadline: "Dec 2024",
    category: "Finance",
    status: "on-track",
    icon: "finance",
    unit: "currency",
  },
  {
    id: "2",
    name: "Read 24 Books",
    description: "Read at least 2 books per month throughout the year",
    targetValue: 24,
    currentValue: 14,
    deadline: "Dec 2024",
    category: "Learning",
    status: "at-risk",
    icon: "learning",
  },
  {
    id: "3",
    name: "Lose 10kg",
    description: "Reach target weight of 75kg through diet and exercise",
    targetValue: 10,
    currentValue: 6.5,
    deadline: "Feb 2025",
    category: "Health",
    status: "on-track",
    icon: "health",
  },
  {
    id: "4",
    name: "Run a Half Marathon",
    description: "Complete a 21km race in under 2 hours",
    targetValue: 100,
    currentValue: 68,
    deadline: "Mar 2025",
    category: "Health",
    status: "on-track",
    icon: "health",
  },
  {
    id: "5",
    name: "Learn Spanish",
    description: "Reach B2 level in Spanish on Duolingo",
    targetValue: 365,
    currentValue: 142,
    deadline: "Dec 2025",
    category: "Learning",
    status: "on-track",
    icon: "language",
  },
  {
    id: "6",
    name: "Down Payment for Home",
    description: "Save R$ 80,000 for a down payment on a house",
    targetValue: 80000,
    currentValue: 22000,
    deadline: "Dec 2026",
    category: "Finance",
    status: "behind",
    icon: "home",
    unit: "currency",
  },
];

const statusColors: Record<string, string> = {
  "on-track": "bg-[#22c55e]/20 text-[#22c55e]",
  "at-risk": "bg-[#f59e0b]/20 text-[#f59e0b]",
  completed: "bg-primary/20 text-primary",
  behind: "bg-[#ef4444]/20 text-[#ef4444]",
};

const statusLabels: Record<string, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  completed: "Completed",
  behind: "Behind",
};

export default function GoalsPage() {
  const [goals] = useState<Goal[]>(defaultGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const stats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === "on-track").length,
    completed: goals.filter((g) => g.status === "completed").length,
    atRisk: goals.filter((g) => g.status === "at-risk" || g.status === "behind")
      .length,
  };

  const formatValue = (goal: Goal, value: number) => {
    if (goal.unit === "currency") {
      return formatCurrency(value);
    }
    return value.toString();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">
            Track your long-term objectives and milestones
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111827] border-[#1e293b]">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Goal
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Set a new long-term goal to track
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Goal Name</Label>
                <Input
                  placeholder="e.g., Save for vacation"
                  className="bg-[#1e293b] border-[#334155]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Description</Label>
                <Input
                  placeholder="Brief description of your goal"
                  className="bg-[#1e293b] border-[#334155]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Target Value</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="bg-[#1e293b] border-[#334155]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Category</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-[#334155]">
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Deadline</Label>
                <Input type="date" className="bg-[#1e293b] border-[#334155]" />
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-[#1e293b] border-[#334155]"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Create Goal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]/20 text-[#22c55e]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.onTrack}
                </p>
                <p className="text-sm text-muted-foreground">On Track</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.completed}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f59e0b]/20 text-[#f59e0b]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.atRisk}
                </p>
                <p className="text-sm text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {goals.map((goal) => {
          const Icon = goalIcons[goal.icon] || Target;
          const progress = Math.round(
            (goal.currentValue / goal.targetValue) * 100
          );

          return (
            <Card key={goal.id} className="bg-[#111827] border-[#1e293b]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1e293b]">
                      <Icon className="h-6 w-6 text-[#f59e0b]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[goal.status]} border-0`}>
                    {statusLabels[goal.status]}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {progress}% complete
                    </span>
                    <span className="text-foreground font-medium">
                      {formatValue(goal, goal.currentValue)} /{" "}
                      {formatValue(goal, goal.targetValue)}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-[#1e293b]"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {goal.deadline}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-[#1e293b] text-muted-foreground"
                    >
                      {goal.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
