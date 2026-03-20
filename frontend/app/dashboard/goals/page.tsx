"use client";

import { useState, useEffect, useCallback } from "react";
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
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { api } from "@/lib/api";
import type { Goal, GoalStatus, Habit } from "@/lib/types";

const goalIcons: Record<string, typeof Target> = {
  Finance: Wallet,
  Health: Dumbbell,
  Learning: BookOpen,
  Language: Globe,
  Home: Home,
};

const normalizeStatus = (status: string): string =>
  status.toLowerCase().replace("_", "-");

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

type FormData = {
  name: string;
  description: string;
  targetValue: string;
  currentValue: string;
  deadline: string;
  category: string;
  status: GoalStatus;
  habitId: string;
};

const emptyForm: FormData = {
  name: "",
  description: "",
  targetValue: "",
  currentValue: "",
  deadline: "",
  category: "Finance",
  status: "ON_TRACK",
  habitId: "",
};

interface GoalFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

function GoalForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: GoalFormProps) {

  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    api.getHabits().then(setHabits).catch(() => { });
  }, []);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Goal Name</Label>
        <Input
          placeholder="e.g., Save for vacation"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="bg-[#1e293b] border-[#334155]"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Description</Label>
        <Input
          placeholder="Brief description of your goal"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="bg-[#1e293b] border-[#334155]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">Target Value</Label>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={formData.targetValue}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, targetValue: e.target.value }))
            }
            className="bg-[#1e293b] border-[#334155]"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">Current Value</Label>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={formData.currentValue}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, currentValue: e.target.value }))
            }
            className="bg-[#1e293b] border-[#334155]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, category: v }))
            }
          >
            <SelectTrigger className="bg-[#1e293b] border-[#334155]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Language">Language</SelectItem>
              <SelectItem value="Home">Home</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-foreground">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData((prev) => ({ ...prev, status: v as GoalStatus }))
            }
          >
            <SelectTrigger className="bg-[#1e293b] border-[#334155]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="ON_TRACK">On Track</SelectItem>
              <SelectItem value="AT_RISK">At Risk</SelectItem>
              <SelectItem value="BEHIND">Behind</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Deadline</Label>
        <Input
          type="date"
          value={formData.deadline}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, deadline: e.target.value }))
          }
          className="bg-[#1e293b] border-[#334155]"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Link to Habit (optional)</Label>
        <Select
          value={formData.habitId ?? "none"}
          onValueChange={(v) =>
            setFormData((prev) => ({ ...prev, habitId: v === "none" ? "" : v }))
          }
        >
          <SelectTrigger className="bg-[#1e293b] border-[#334155]">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-[#334155]">
            <SelectItem value="none">None</SelectItem>
            {habits.map((h) => (
              <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 bg-[#1e293b] border-[#334155]"
          onClick={onCancel}
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
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === "ON_TRACK").length,
    completed: goals.filter((g) => g.status === "COMPLETED").length,
    atRisk: goals.filter(
      (g) => g.status === "AT_RISK" || g.status === "BEHIND"
    ).length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createGoal({
        name: formData.name,
        description: formData.description,
        targetValue: parseInt(formData.targetValue),
        currentValue: formData.currentValue ? parseInt(formData.currentValue) : 0,
        deadline: formData.deadline,
        category: formData.category,
        status: formData.status,
        habitId: formData.habitId || undefined,
      });
      await fetchData();
      setIsCreateOpen(false);
      setFormData(emptyForm);
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    setIsSubmitting(true);
    try {
      await api.updateGoal(editingGoal.id, {
        name: formData.name,
        description: formData.description,
        targetValue: parseFloat(formData.targetValue),
        currentValue: parseFloat(formData.currentValue),
        deadline: formData.deadline,
        category: formData.category,
        status: formData.status,
        habitId: formData.habitId || undefined,
      });
      await fetchData();
      setEditingGoal(null);
      setFormData(emptyForm);
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await api.deleteGoal(id);
    } catch {
      await fetchData();
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description ?? "",
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      deadline: new Date(goal.deadline).toISOString().split("T")[0],
      category: goal.category,
      status: goal.status,
      habitId: goal.habitId ?? "",
    });
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
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-[#111827] border-[#1e293b]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create New Goal
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Set a new long-term goal to track
              </DialogDescription>
            </DialogHeader>
            <GoalForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreateOpen(false);
                setFormData(emptyForm);
              }}
              submitLabel="Create Goal"
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Goals", value: stats.total, icon: Target, color: "bg-primary/20 text-primary" },
          { label: "On Track", value: stats.onTrack, icon: TrendingUp, color: "bg-[#22c55e]/20 text-[#22c55e]" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "bg-primary/20 text-primary" },
          { label: "At Risk", value: stats.atRisk, icon: Clock, color: "bg-[#f59e0b]/20 text-[#f59e0b]" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#111827] border-[#1e293b]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? "—" : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Target className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No goals yet.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-[#1e293b] border-[#334155]"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const Icon = goalIcons[goal.category] || Target;
            const normalizedStatus = normalizeStatus(goal.status);
            const progress = Math.min(
              Math.round((goal.currentValue / goal.targetValue) * 100),
              100
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
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`${statusColors[normalizedStatus]} border-0`}
                      >
                        {statusLabels[normalizedStatus]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(goal)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-[#ef4444]"
                        onClick={() => handleDelete(goal.id)}
                        disabled={deletingId === goal.id}
                      >
                        {deletingId === goal.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {progress}% complete
                      </span>
                      <span className="text-foreground font-medium">
                        {goal.currentValue} / {goal.targetValue}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-[#1e293b]" />
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Deadline:{" "}
                          {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                        </span>
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
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingGoal}
        onOpenChange={(open) => {
          if (!open) {
            setEditingGoal(null);
            setFormData(emptyForm);
          }
        }}
      >
        <DialogContent
          className="bg-[#111827] border-[#1e293b]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Goal</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your goal progress and details
            </DialogDescription>
          </DialogHeader>
          <GoalForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingGoal(null);
              setFormData(emptyForm);
            }}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}