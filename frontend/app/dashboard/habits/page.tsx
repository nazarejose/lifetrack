"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  CheckCircle,
  Flame,
  Search,
  Brain,
  Dumbbell,
  BookOpen,
  Droplets,
  Globe,
  Briefcase,
  Trash2,
  Loader2,
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

type HabitWithMeta = Habit & { icon: string };

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "DAILY" as Frequency,
  });

  const fetchData = useCallback(async () => {
    try {
      const habitsData = await api.getHabits();
      setHabits(habitsData.map((h) => ({ ...h, icon: "workout" })));
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredHabits = habits.filter((h) => {
    const matchesFilter =
      filter === "all" || h.frequency.toLowerCase() === filter;
    const matchesSearch = h.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedToday = habits.filter((h) => h.isCheckedToday).length;
  const totalHabits = habits.length;

  const handleToggleHabit = async (habitId: string) => {
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

  const handleDelete = async (habitId: string) => {
    setDeletingId(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    try {
      await api.deleteHabit(habitId);
    } catch {
      await fetchData(); // reverte se falhar
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createHabit({
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
      });
      await fetchData();
      setIsDialogOpen(false);
      setFormData({ name: "", description: "", frequency: "DAILY" });
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
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
                  <Label className="text-foreground">
                    Description (optional)
                  </Label>
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add Habit"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "daily", "weekly", "monthly"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            className={
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
            }
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "all" ? " Habits" : ""}
          </Button>
        ))}
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
            value={totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}
            className="h-2 bg-[#1e293b]"
          />
        </CardContent>
      </Card>

      {/* Habits List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Dumbbell className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No habits found.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-[#1e293b] border-[#334155]"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first habit
          </Button>
        </div>
      ) : (
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

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#f59e0b]">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {habit.streak ?? 0} days
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[#ef4444]"
                        onClick={() => handleDelete(habit.id)}
                        disabled={deletingId === habit.id}
                      >
                        {deletingId === habit.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}