/**
 * WealthLens Transactions Page
 * Full transaction table with filters, search, and sorting
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag,
} from "lucide-react";
import {
  getTransactions,
  filterTransactions,
  deleteTransaction,
  getUniqueCategories,
} from "@/app/lib/store";
import type { Transaction, Category } from "@/app/lib/types";

const CATEGORY_ICONS: Record<Category, string> = {
  "Housing": "🏠",
  "Food & Dining": "🍽️",
  "Transportation": "🚗",
  "Shopping": "🛍️",
  "Entertainment": "🎬",
  "Utilities": "💡",
  "Healthcare": "🏥",
  "Investments": "📈",
  "Income": "💰",
  "Other": "📋",
};

const CATEGORY_COLORS: Record<Category, string> = {
  "Housing": "#C9A84C",
  "Food & Dining": "#3DFF6E",
  "Transportation": "#FF6B9D",
  "Shopping": "#60A5FA",
  "Entertainment": "#A78BFA",
  "Utilities": "#F59E0B",
  "Healthcare": "#EF4444",
  "Investments": "#10B981",
  "Income": "#8B6914",
  "Other": "#6B7280",
};

type SortField = "date" | "description" | "category" | "amount";
type SortDirection = "asc" | "desc";

interface Filters {
  search: string;
  category: Category | "";
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
}

// Transaction Row Component
function TransactionRow({
  transaction,
  onDelete,
}: {
  transaction: Transaction;
  onDelete: (id: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const isIncome = transaction.amount > 0;
  const categoryColor = CATEGORY_COLORS[transaction.category] || "#6B7280";

  return (
    <tr className="group hover:bg-white/5 transition-colors border-b border-[#C9A84C]/10">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-[#F5F0E8]/60">{formatDate(transaction.date)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{CATEGORY_ICONS[transaction.category] || "📋"}</span>
          <div>
            <p className="text-sm font-medium text-[#F5F0E8]">
              {transaction.description || transaction.merchant || transaction.category}
            </p>
            {transaction.merchant && transaction.description && (
              <p className="text-xs text-[#F5F0E8]/40">{transaction.merchant}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${categoryColor}20`,
            color: categoryColor,
          }}
        >
          {transaction.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`text-sm font-semibold ${isIncome ? "text-[#3DFF6E]" : "text-[#F5F0E8]"}`}>
          {isIncome ? "+" : "-"}{formatAmount(transaction.amount)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-white/10 text-[#F5F0E8]/40 hover:text-[#F5F0E8] transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-1 w-36 bg-[#0F0D19] border border-[#C9A84C]/30 rounded-xl shadow-xl z-10 py-1">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#F5F0E8] hover:bg-white/5 transition-colors">
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(transaction.id);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#FF6B9D] hover:bg-white/5 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#C9A84C]/10">
      <span className="text-sm text-[#F5F0E8]/50">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg text-sm text-[#F5F0E8] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg text-sm text-[#F5F0E8] hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = useMemo(() => getUniqueCategories(), []);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const filtered = filterTransactions({
      searchQuery: filters.search,
      category: (filters.category as Category) || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
    });
    setTransactions(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "description":
          comparison = (a.description || "").localeCompare(b.description || "");
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "amount":
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [transactions, sortField, sortDirection]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
      loadTransactions();
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-[#F5F0E8]/30" />;
    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-[#C9A84C]" />
    ) : (
      <ChevronDown size={14} className="text-[#C9A84C]" />
    );
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#F5F0E8]">Transactions</h1>
              <p className="text-[#F5F0E8]/60">Manage and analyze your financial transactions</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded-lg hover:bg-[#C9A84C]/30 transition-colors">
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[280px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F5F0E8]/40" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0F0D19] border border-[#C9A84C]/30 rounded-xl text-[#F5F0E8] placeholder-[#F5F0E8]/30 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
                showFilters
                  ? "bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]"
                  : "bg-[#0F0D19] border-[#C9A84C]/30 text-[#F5F0E8] hover:border-[#C9A84C]/50"
              }`}
            >
              <Filter size={18} />
              Filters
              {(filters.category || filters.startDate || filters.minAmount) && (
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-[#0F0D19] border border-[#C9A84C]/20 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F5F0E8]/50 mb-1.5">
                    <Tag size={12} className="inline mr-1" />
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value as Category })}
                    className="w-full px-3 py-2 bg-[#07060E] border border-[#C9A84C]/30 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F5F0E8]/50 mb-1.5">
                    <Calendar size={12} className="inline mr-1" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07060E] border border-[#C9A84C]/30 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F5F0E8]/50 mb-1.5">
                    <Calendar size={12} className="inline mr-1" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07060E] border border-[#C9A84C]/30 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F5F0E8]/50 mb-1.5">
                    <DollarSign size={12} className="inline mr-1" />
                    Min Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount}
                    onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07060E] border border-[#C9A84C]/30 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#F5F0E8]/50 mb-1.5">
                    <DollarSign size={12} className="inline mr-1" />
                    Max Amount
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07060E] border border-[#C9A84C]/30 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#F5F0E8]/60 hover:text-[#F5F0E8] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Transactions Table */}
        <div className="bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C9A84C]/20">
                  <th
                    onClick={() => handleSort("date")}
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5F0E8]/60 uppercase tracking-wider cursor-pointer hover:text-[#F5F0E8] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("description")}
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5F0E8]/60 uppercase tracking-wider cursor-pointer hover:text-[#F5F0E8] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <SortIcon field="description" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("category")}
                    className="px-6 py-4 text-left text-xs font-semibold text-[#F5F0E8]/60 uppercase tracking-wider cursor-pointer hover:text-[#F5F0E8] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Category
                      <SortIcon field="category" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="px-6 py-4 text-right text-xs font-semibold text-[#F5F0E8]/60 uppercase tracking-wider cursor-pointer hover:text-[#F5F0E8] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
                        <Search size={24} className="text-[#C9A84C]" />
                      </div>
                      <p className="text-[#F5F0E8]/60 font-medium">No transactions found</p>
                      <p className="text-[#F5F0E8]/40 text-sm mt-1">
                        Try adjusting your filters or upload a bank statement
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {transactions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0F0D19] border border-[#C9A84C]/20 rounded-xl">
              <p className="text-sm text-[#F5F0E8]/50">Total Transactions</p>
              <p className="text-2xl font-bold text-[#F5F0E8]">{transactions.length}</p>
            </div>
            <div className="p-4 bg-[#0F0D19] border border-[#3DFF6E]/20 rounded-xl">
              <p className="text-sm text-[#F5F0E8]/50">Total Income</p>
              <p className="text-2xl font-bold text-[#3DFF6E]">
                {formatAmount(transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0))}
              </p>
            </div>
            <div className="p-4 bg-[#0F0D19] border border-[#FF6B9D]/20 rounded-xl">
              <p className="text-sm text-[#F5F0E8]/50">Total Expenses</p>
              <p className="text-2xl font-bold text-[#FF6B9D]">
                {formatAmount(Math.abs(transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
