"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  Flame,
  Archive,
  Search,
  Brain,
  Dumbbell,
  BookOpen,
  Droplets,
  Globe,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Habit, Frequency } from "@/lib/types";

const habitIcons: Record<string, typeof Dumbbell> = {
  meditation: Brain,
  workout: Dumbbell,
  reading: BookOpen,
  water: Droplets,
  language: Globe,
  work: Briefcase,
};

const defaultHabits = [
  {
    id: "1",
    name: "Morning Meditation",
    frequency: "DAILY" as Frequency,
    totalCompletions: 124,
    isCheckedToday: true,
    icon: "meditation",
    streak: 12,
  },
  {
    id: "2",
    name: "Morning Workout",
    frequency: "DAILY" as Frequency,
    totalCompletions: 98,
    isCheckedToday: true,
    icon: "workout",
    streak: 9,
  },
  {
    id: "3",
    name: "Read 20 Pages",
    frequency: "DAILY" as Frequency,
    totalCompletions: 67,
    isCheckedToday: false,
    icon: "reading",
    streak: 5,
  },
  {
    id: "4",
    name: "Drink 3L Water",
    frequency: "DAILY" as Frequency,
    totalCompletions: 200,
    isCheckedToday: false,
    icon: "water",
    streak: 15,
  },
  {
    id: "5",
    name: "Language Practice",
    frequency: "DAILY" as Frequency,
    totalCompletions: 42,
    isCheckedToday: false,
    icon: "language",
    streak: 3,
  },
  {
    id: "6",
    name: "Weekly Gym Session",
    frequency: "WEEKLY" as Frequency,
    totalCompletions: 22,
    isCheckedToday: true,
    icon: "workout",
    streak: 4,
  },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState(defaultHabits);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "DAILY" as Frequency,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const habitsData = await api.getHabits();
        if (habitsData.length > 0) {
          setHabits(
            habitsData.map((h) => ({
              ...h,
              icon: "workout",
              streak: Math.floor(Math.random() * 20),
            }))
          );
        }
      } catch {
        // Use default data
      }
    };
    fetchData();
  }, []);

  const filteredHabits = habits.filter((h) => {
    const matchesFilter =
      filter === "all" || h.frequency.toLowerCase() === filter;
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedToday = habits.filter((h) => h.isCheckedToday).length;
  const totalHabits = habits.length;

  const handleToggleHabit = async (habitId: string) => {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              isCheckedToday: !h.isCheckedToday,
              totalCompletions: h.isCheckedToday
                ? h.totalCompletions - 1
                : h.totalCompletions + 1,
            }
          : h
      )
    );
    try {
      await api.toggleHabit(habitId);
    } catch {
      // Revert on error
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                isCheckedToday: !h.isCheckedToday,
                totalCompletions: h.isCheckedToday
                  ? h.totalCompletions + 1
                  : h.totalCompletions - 1,
              }
            : h
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newHabit = await api.createHabit({
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
      });
      setHabits((prev) => [
        ...prev,
        { ...newHabit, icon: "workout", streak: 0 },
      ]);
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", frequency: "DAILY" });
    } catch {
      // Handle error
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground">
            {completedToday} of {totalHabits} completed today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[180px] bg-[#1e293b] border-[#334155]"
            />
          </div>
          <Button
            variant="outline"
            className="bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111827] border-[#1e293b]">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Add New Habit
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create a new habit to track
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Habit Name</Label>
                  <Input
                    placeholder="e.g., Morning Exercise"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-[#1e293b] border-[#334155]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Description (optional)</Label>
                  <Input
                    placeholder="e.g., 30 minutes of cardio"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-[#1e293b] border-[#334155]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: Frequency) =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-[#334155]">
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
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
                    Add Habit
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          className={
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
          }
          onClick={() => setFilter("all")}
        >
          All Habits
        </Button>
        <Button
          variant={filter === "daily" ? "default" : "outline"}
          className={
            filter === "daily"
              ? "bg-primary text-primary-foreground"
              : "bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
          }
          onClick={() => setFilter("daily")}
        >
          Daily
        </Button>
        <Button
          variant={filter === "weekly" ? "default" : "outline"}
          className={
            filter === "weekly"
              ? "bg-primary text-primary-foreground"
              : "bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
          }
          onClick={() => setFilter("weekly")}
        >
          Weekly
        </Button>
      </div>

      {/* Today's Progress */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base">
              Today&apos;s Progress
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedToday}/{totalHabits}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={(completedToday / totalHabits) * 100}
            className="h-2 bg-[#1e293b]"
          />
        </CardContent>
      </Card>

      {/* Habits List */}
      <div className="flex flex-col gap-3">
        {filteredHabits.map((habit) => {
          const Icon = habitIcons[habit.icon || "workout"] || Dumbbell;
          return (
            <Card
              key={habit.id}
              className={cn(
                "bg-[#111827] border-[#1e293b] transition-all hover:border-[#334155]",
                habit.isCheckedToday && "border-primary/30"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                        habit.isCheckedToday
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {habit.isCheckedToday && (
                        <CheckCircle className="h-5 w-5" />
                      )}
                    </button>

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        habit.isCheckedToday
                          ? "bg-primary/20 text-primary"
                          : "bg-[#1e293b] text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Name and Meta */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            habit.isCheckedToday
                              ? "text-primary line-through"
                              : "text-foreground"
                          )}
                        >
                          {habit.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-[#1e293b] text-muted-foreground text-xs"
                        >
                          {habit.frequency === "DAILY"
                            ? "Daily"
                            : habit.frequency === "WEEKLY"
                            ? "Weekly"
                            : "Monthly"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {habit.totalCompletions} completions
                      </p>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-2 text-[#f59e0b]">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {habit.streak} days
                    </span>
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
