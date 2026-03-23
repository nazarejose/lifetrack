"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/i18n";
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
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction, TransactionSummary, TransactionType, TransactionCategory } from "@/lib/types";

// Cores disponíveis para categorias
const PRESET_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ec4899",
  "#06b6d4", "#ef4444", "#8b5cf6", "#f97316",
  "#14b8a6", "#a78bfa",
];

export default function FinancesPage() {
  const { language } = useLanguage();
  const t = translations[language].finances;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);
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
      toast.success(language === "pt" ? "Transação adicionada!" : "Transaction added!");
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTransaction(id);
      const summaryData = await api.getTransactionSummary();
      setSummary(summaryData);
      toast.success(language === "pt" ? "Transação removida!" : "Transaction removed!");
    } catch {
      await fetchData();
      toast.error(language === "pt" ? "Erro ao remover transação." : "Error removing transaction.");
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
    setConfirmDeleteCatId(null);
    try {
      await api.deleteTransactionCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(language === "pt" ? "Categoria removida!" : "Category removed!");
    } catch {
      toast.error(language === "pt" ? "Erro ao remover categoria." : "Error removing category.");
    }
  };

  return (
    <>
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {language === "pt" ? "Remover transação" : "Remove transaction"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {language === "pt" ? "Tem certeza que deseja remover esta transação? Esta ação não pode ser desfeita." : "Are you sure you want to remove this transaction? This action cannot be undone."}
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

      <AlertDialog open={!!confirmDeleteCatId} onOpenChange={(o) => !o && setConfirmDeleteCatId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {language === "pt" ? "Remover categoria" : "Remove category"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {language === "pt" ? "Tem certeza que deseja remover esta categoria?" : "Are you sure you want to remove this category?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-border">
              {language === "pt" ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white" onClick={() => confirmDeleteCatId && handleDeleteCategory(confirmDeleteCatId)}>
              {language === "pt" ? "Remover" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">{t.totalBalance}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {isLoading ? "—" : formatCurrency(summary.balance)}
            </p>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <TrendingUp className="h-4 w-4" />
              <span>{t.updatedNow}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 text-foreground mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.monthlyIncome}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {isLoading ? "—" : formatCurrency(summary.totalIncome)}
            </p>
            <p className="text-sm text-[#22c55e]">{t.totalReceived}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 text-foreground mb-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.monthlyExpense}</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {isLoading ? "—" : formatCurrency(summary.totalExpense)}
            </p>
            <p className="text-sm text-[#ef4444]">{t.totalSpent}</p>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
          <CardTitle className="text-foreground text-base">{t.categories}</CardTitle>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="bg-secondary border-border text-foreground hover:bg-border">
                <Tag className="h-4 w-4 mr-2" />
                {t.newCategory}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border" onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-foreground">{t.createCategory}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {t.createCategoryDesc}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">{t.name}</Label>
                  <Input
                    placeholder={t.namePlaceholder}
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="bg-secondary border-border"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">{t.type}</Label>
                  <Select
                    value={categoryForm.type}
                    onValueChange={(v: TransactionType) => setCategoryForm({ ...categoryForm, type: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border">
                      <SelectItem value="INCOME">{t.income}</SelectItem>
                      <SelectItem value="EXPENSE">{t.expense}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-foreground">{t.color}</Label>
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
                  <Button type="button" variant="outline" className="flex-1 bg-secondary border-border" onClick={() => setIsCategoryDialogOpen(false)}>
                    {t.cancel}
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                    {t.create}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.noCategories}</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-border bg-secondary max-w-full"
                >
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-foreground">{cat.name}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 bg-border text-muted-foreground">
                    {cat.type === "INCOME" ? t.income : t.expense}
                  </Badge>
                  <button
                    onClick={() => setConfirmDeleteCatId(cat.id)}
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
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <CardTitle className="text-foreground text-lg">{t.transactions}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 w-[180px] bg-secondary border-border text-foreground"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[130px] bg-secondary border-border text-foreground">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="income">{t.incomes}</SelectItem>
                <SelectItem value="expense">{t.expenses}</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.new}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                <DialogTitle className="text-foreground">{t.newTransaction}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {t.newTransactionDesc}
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">{t.description}</Label>
                    <Input
                      placeholder={t.descriptionPlaceholder}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">{t.value}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">{t.type}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: TransactionType) =>
                        setFormData({ ...formData, type: value, categoryId: "" })
                      }
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-border">
                        <SelectItem value="INCOME">{t.income}</SelectItem>
                        <SelectItem value="EXPENSE">{t.expense}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">
                      {t.categoryOptional}{" "}
                      <span className="text-muted-foreground text-xs">{t.optional}</span>
                    </Label>
                    <Select
                      value={formData.categoryId || "none"}
                      onValueChange={(v) => setFormData({ ...formData, categoryId: v === "none" ? "" : v })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder={t.noCategory} />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary border-border">
                        <SelectItem value="none">{t.noCategory}</SelectItem>
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
                        {formData.type === "INCOME" ? t.noCategoryIncomeCreated : t.noCategoryExpenseCreated}{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => { setIsDialogOpen(false); setIsCategoryDialogOpen(true); }}
                        >
                          {t.createNow}
                        </button>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" className="flex-1 bg-secondary border-border" onClick={() => setIsDialogOpen(false)}>
                      {t.cancel}
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.save}
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
              <p className="text-muted-foreground text-sm">{t.noTransactionsFound}</p>
              <Button variant="outline" size="sm" className="mt-2 bg-secondary border-border" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addTransaction}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.date}</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.description}</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.categoryOptional}</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.value}</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.type}</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
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
                            onClick={() => setConfirmDeleteId(transaction.id)}
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {t.showing} {paginatedTransactions.length} {t.of} {filteredTransactions.length} {t.transactionsCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-secondary border-border" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`h-8 w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : "bg-secondary border-border"}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-secondary border-border" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>

    </>
  );
}