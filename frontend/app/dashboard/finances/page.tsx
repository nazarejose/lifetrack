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
  Pencil,
  ChevronLeft,
  ChevronRight,
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

const defaultTransactions: Transaction[] = [
  { id: "1", description: "Monthly Salary", amount: 5000, type: "INCOME", category: "Salary", date: "2023-10-15" },
  { id: "2", description: "Smart Supermarket", amount: 450, type: "EXPENSE", category: "Food", date: "2023-10-14" },
  { id: "3", description: "Freelance Project - Web Design", amount: 1200, type: "INCOME", category: "Freelance", date: "2023-10-12" },
  { id: "4", description: "Electricity Bill - Enel", amount: 220, type: "EXPENSE", category: "Utilities", date: "2023-10-10" },
  { id: "5", description: "Gold Gym Membership", amount: 150, type: "EXPENSE", category: "Health", date: "2023-10-08" },
];

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [summary, setSummary] = useState<TransactionSummary>({
    balance: 12450,
    incomes: 8200,
    expenses: 3750,
  });
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as TransactionType,
    category: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txData, summaryData] = await Promise.all([
          api.getTransactions(),
          api.getTransactionSummary(),
        ]);
        if (txData.length > 0) setTransactions(txData);
        setSummary(summaryData);
      } catch {
        // Use default data on error
      }
    };
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesType =
      filterType === "all" || t.type.toLowerCase() === filterType;
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
    try {
      const newTransaction = await api.createTransaction({
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
      });
      setTransactions((prev) => [newTransaction, ...prev]);
      const summaryData = await api.getTransactionSummary();
      setSummary(summaryData);
      setIsDialogOpen(false);
      setFormData({ description: "", amount: "", type: "EXPENSE", category: "" });
    } catch {
      // Handle error
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Balance Card */}
        <Card className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-white/80 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Total Balance</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {formatCurrency(summary.balance)}
            </p>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <TrendingUp className="h-4 w-4" />
              <span>+2.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income Card */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Monthly Income</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(summary.incomes)}
            </p>
            <p className="text-sm text-[#22c55e]">1 On track for goal</p>
          </CardContent>
        </Card>

        {/* Monthly Expenses Card */}
        <Card className="bg-[#111827] border-[#1e293b]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Monthly Expenses</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {formatCurrency(summary.expenses)}
            </p>
            <p className="text-sm text-[#ef4444]">-5.4% less than average</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-[#111827] border-[#1e293b]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-foreground text-lg">
            Recent Transactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px] bg-[#1e293b] border-[#334155] text-foreground"
              />
            </div>
            <Button
              variant="outline"
              className="bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              className="bg-[#1e293b] border-[#334155] text-foreground hover:bg-[#334155]"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111827] border-[#1e293b]">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    Add Transaction
                  </DialogTitle>
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
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="bg-[#1e293b] border-[#334155]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
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
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
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
                    >
                      Save
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Value (BRL)
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
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
                    <td
                      className={`py-4 px-4 text-sm font-medium ${
                        transaction.type === "INCOME"
                          ? "text-[#22c55e]"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${
                          transaction.type === "INCOME"
                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                            : "bg-[#ef4444]/20 text-[#ef4444]"
                        } border-0`}
                      >
                        {transaction.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
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
              Showing {paginatedTransactions.length} of{" "}
              {filteredTransactions.length} transactions
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
        </CardContent>
      </Card>
    </div>
  );
}
