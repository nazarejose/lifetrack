"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Filter,
  ShoppingCart,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  X,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction, TransactionSummary, TransactionType, TransactionCategory } from "@/lib/types";

// Cores disponíveis para categorias
const PRESET_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ec4899",
  "#06b6d4", "#ef4444", "#8b5cf6", "#f97316",
  "#14b8a6", "#a78bfa",
];

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    categoryId: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "EXPENSE" as TransactionType,
    color: PRESET_COLORS[0],
  });

  const fetchData = useCallback(async () => {
    try {
      const [txData, summaryData, categoriesData] = await Promise.all([
        api.getTransactions(),
        api.getTransactionSummary(),
        api.getTransactionCategories(),
      ]);
      setTransactions(txData);
      setSummary(summaryData);
      setCategories(categoriesData);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtra categorias pelo tipo selecionado no form
  const filteredCategories = categories.filter(
    (c) => c.type === formData.type
  );

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.transactionType.toLowerCase() === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        categoryId: formData.categoryId || undefined,
      });
      await fetchData();
      setIsDialogOpen(false);
      setFormData({ description: "", amount: "", type: "EXPENSE", categoryId: "" });
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTransaction(id);
      const summaryData = await api.getTransactionSummary();
      setSummary(summaryData);
    } catch {
      await fetchData();
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTransactionCategory(categoryForm);
      await fetchData();
      setIsCategoryDialogOpen(false);
      setCategoryForm({ name: "", type: "EXPENSE", color: PRESET_COLORS[0] });
    } catch {
      // handle error
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteTransactionCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // handle error
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Saldo Total</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {isLoading ? "—" : formatCurrency(summary.balance)}
            </p>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <TrendingUp className="h-4 w-4" />
              <span>Atualizado agora</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Receita Mensal</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {isLoading ? "—" : formatCurrency(summary.totalIncome)}
            </p>
            <p className="text-sm text-[#22c55e]">Total recebido</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Despesa Mensal</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {isLoading ? "—" : formatCurrency(summary.totalExpense)}
            </p>
            <p className="text-sm text-[#ef4444]">Total gasto</p>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-foreground text-base">Categorias</CardTitle>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]">
                <Tag className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111827] border-[#1e293b]" onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Categoria</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Crie categorias personalizadas para organizar suas transações
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Nome</Label>
                  <Input
                    placeholder="ex: Alimentação, Salário..."
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="bg-[#1e293b] border-[#334155]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Tipo</Label>
                  <Select
                    value={categoryForm.type}
                    onValueChange={(v: TransactionType) => setCategoryForm({ ...categoryForm, type: v })}
                  >
                    <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-[#334155]">
                      <SelectItem value="INCOME">Receita</SelectItem>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">Cor</Label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, color })}
                        className={`h-7 w-7 rounded-full transition-transform ${
                          categoryForm.color === color ? "scale-125 ring-2 ring-white/50" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button type="button" variant="outline" className="flex-1 bg-[#1e293b] border-[#334155]" onClick={() => setIsCategoryDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                    Criar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma categoria criada ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-[#334155] bg-[#1e293b]"
                >
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-foreground">{cat.name}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-[#334155] text-muted-foreground">
                    {cat.type === "INCOME" ? "Receita" : "Despesa"}
                  </Badge>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-muted-foreground hover:text-[#ef4444] transition-colors ml-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-foreground text-lg">Transações</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 w-[180px] bg-[#1e293b] border-[#334155] text-foreground"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[130px] bg-[#1e293b] border-[#334155] text-foreground">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111827] border-[#1e293b]" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nova Transação</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Registre uma receita ou despesa
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Descrição</Label>
                    <Input
                      placeholder="ex: Supermercado"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-[#1e293b] border-[#334155]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-[#1e293b] border-[#334155]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: TransactionType) =>
                        setFormData({ ...formData, type: value, categoryId: "" })
                      }
                    >
                      <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-[#334155]">
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">
                      Categoria{" "}
                      <span className="text-muted-foreground text-xs">(opcional)</span>
                    </Label>
                    <Select
                      value={formData.categoryId || "none"}
                      onValueChange={(v) => setFormData({ ...formData, categoryId: v === "none" ? "" : v })}
                    >
                      <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                        <SelectValue placeholder="Sem categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-[#334155]">
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filteredCategories.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Nenhuma categoria de {formData.type === "INCOME" ? "receita" : "despesa"} criada.{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => { setIsDialogOpen(false); setIsCategoryDialogOpen(true); }}
                        >
                          Criar agora
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" className="flex-1 bg-[#1e293b] border-[#334155]" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Nenhuma transação encontrada.</p>
              <Button variant="outline" size="sm" className="mt-2 bg-[#1e293b] border-[#334155]" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar transação
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e293b]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-[#1e293b] last:border-0 hover:bg-[#1e293b]/50 transition-colors">
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-foreground">
                          {transaction.description}
                        </td>
                        <td className="py-4 px-4">
                          {transaction.category ? (
                            <div className="flex items-center gap-1.5">
                              <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: transaction.category.color }} />
                              <span className="text-sm text-muted-foreground">{transaction.category.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className={`py-4 px-4 text-sm font-medium ${transaction.transactionType === "INCOME" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {transaction.transactionType === "INCOME" ? "+" : "−"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={`${transaction.transactionType === "INCOME" ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-[#ef4444]/20 text-[#ef4444]"} border-0`}>
                            {transaction.transactionType === "INCOME" ? "Receita" : "Despesa"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-[#ef4444]"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deletingId === transaction.id}
                          >
                            {deletingId === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e293b]">
                <p className="text-sm text-muted-foreground">
                  Mostrando {paginatedTransactions.length} de {filteredTransactions.length} transações
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e293b] border-[#334155]" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`h-8 w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : "bg-[#1e293b] border-[#334155]"}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1e293b] border-[#334155]" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}