"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Download,
  TrendingUp,
  Wallet,
  ShoppingCart,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import type { Transaction, TransactionSummary, TransactionType } from "@/lib/types";

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    category: "",
  });

  const fetchData = async () => {
    try {
      const [txData, summaryData] = await Promise.all([
        api.getTransactions(),
        api.getTransactionSummary(),
      ]);
      setTransactions(txData);
      setSummary(summaryData);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      filterType === "all" || t.transactionType.toLowerCase() === filterType;
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
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
      const newTransaction = await api.createTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
      });
      await fetchData(); 
      setIsDialogOpen(false);
      setFormData({ description: "", amount: "", type: "EXPENSE", category: "" });
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    // Optimistic update
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTransaction(id);
      const summaryData = await api.getTransactionSummary();
      setSummary(summaryData);
    } catch {
      // Revert on error
      await fetchData();
    } finally {
      setDeletingId(null);
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
              <span className="text-sm">Total Balance</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {isLoading ? "—" : formatCurrency(summary.balance)}
            </p>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <TrendingUp className="h-4 w-4" />
              <span>Updated now</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Monthly Income</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "—" : formatCurrency(summary.totalIncome)}
            </p>
            <p className="text-sm text-[#22c55e]">Total received</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Monthly Expenses</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {isLoading ? "—" : formatCurrency(summary.totalExpense)}
            </p>
            <p className="text-sm text-[#ef4444]">Total spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-foreground text-lg">
            Transactions
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111827] border-[#1e293b]">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add Transaction</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Record a new income or expense
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Description</Label>
                    <Input
                      placeholder="e.g., Supermarket"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-[#1e293b] border-[#334155]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Amount (R$)</Label>
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
                    <Label className="text-foreground">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: TransactionType) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-[#334155]">
                        <SelectItem value="INCOME">Income</SelectItem>
                        <SelectItem value="EXPENSE">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-[#1e293b] border-[#334155]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-[#334155]">
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Housing">Housing</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
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
                        "Save"
                      )}
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
              <p className="text-muted-foreground text-sm">No transactions found.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-[#1e293b] border-[#334155]"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first transaction
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e293b]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value (BRL)</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-[#1e293b] last:border-0 hover:bg-[#1e293b]/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-foreground">
                          {transaction.description}
                        </td>
                        <td className={`py-4 px-4 text-sm font-medium ${transaction.transactionType === "INCOME" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {transaction.transactionType === "INCOME" ? "+" : "−"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={`${
                              transaction.transactionType === "INCOME"
                                ? "bg-[#22c55e]/20 text-[#22c55e]"
                                : "bg-[#ef4444]/20 text-[#ef4444]"
                            } border-0`}
                          >
                            {transaction.transactionType === "INCOME" ? "Income" : "Expense"}
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#1e293b]">
                <p className="text-sm text-muted-foreground">
                  Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-[#1e293b] border-[#334155]"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`h-8 w-8 ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "bg-[#1e293b] border-[#334155]"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-[#1e293b] border-[#334155]"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
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