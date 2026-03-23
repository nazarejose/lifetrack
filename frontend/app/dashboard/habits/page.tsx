"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/i18n";
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
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { language } = useLanguage();
  const t = translations[language].habits;
  const [habits, setHabits] = useState<HabitWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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
      toast.success(language === "pt" ? "Hábito criado!" : "Habit created!");
      setFormData({ name: "", description: "", frequency: "DAILY" });
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {language === "pt" ? "Remover hábito" : "Remove habit"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {language === "pt" ? "Tem certeza que deseja remover este hábito? Todo o histórico será perdido." : "Are you sure you want to remove this habit? All history will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-border">
              {language === "pt" ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>
              {language === "pt" ? "Remover" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="text-muted-foreground">
            {completedToday}/{totalHabits} {t.completedToday}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[180px] bg-secondary border-border"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                {t.newHabit}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {t.addNewHabit}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {t.addNewHabitDesc}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">{t.habitName}</Label>
                  <Input
                    placeholder={t.habitNamePlaceholder}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">
                    {t.descriptionOptional}
                  </Label>
                  <Input
                    placeholder={t.descriptionPlaceholder}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">{t.frequency}</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value: Frequency) =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      <SelectItem value="DAILY">{t.daily}</SelectItem>
                      <SelectItem value="WEEKLY">{t.weekly}</SelectItem>
                      <SelectItem value="MONTHLY">{t.monthly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-secondary border-border"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {translations[language].finances.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t.addHabit
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
                : "bg-secondary border-border text-foreground hover:bg-border"
            }
            onClick={() => setFilter(f)}
          >
            {f === "all" ? t.allHabits : (f === "daily" ? t.daily : f === "weekly" ? t.weekly : t.monthly)}
          </Button>
        ))}
      </div>

      {/* Today's Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base">
              {t.todaysProgress}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedToday}/{totalHabits}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0}
            className="h-2 bg-secondary"
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
          <p className="text-muted-foreground text-sm">{t.noHabitsFound}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-secondary border-border"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.addFirstHabit}
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
                  "bg-card border-border transition-all hover:border-border",
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
                            : "bg-secondary text-muted-foreground"
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
                            className="bg-secondary text-muted-foreground text-xs"
                          >
                            {habit.frequency === "DAILY"
                              ? t.daily
                              : habit.frequency === "WEEKLY"
                                ? t.weekly
                                : t.monthly}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {habit.totalCompletions} {t.completions}
                        </p>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[#f59e0b]">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {habit.streak ?? 0} {t.days}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[#ef4444]"
                        onClick={() => setConfirmDeleteId(habit.id)}
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

    </>
  );
}