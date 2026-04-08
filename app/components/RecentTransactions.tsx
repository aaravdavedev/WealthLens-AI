/**
 * WealthLens Recent Transactions
 * Latest transactions list for dashboard
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from "lucide-react";
import { getTransactions } from "@/app/lib/store";
import type { Transaction, Category } from "@/app/lib/types";

// Category icon mapping
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

// Category colors
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAmount(amount: number): string {
  const absAmount = Math.abs(amount);
  return `$${absAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface TransactionRowProps {
  transaction: Transaction;
  index: number;
}

function TransactionRow({ transaction, index }: TransactionRowProps) {
  const [mounted, setMounted] = useState(false);
  const isIncome = transaction.amount > 0;
  const categoryColor = CATEGORY_COLORS[transaction.category] || "#6B7280";

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`
        flex items-center justify-between p-4 rounded-xl transition-all duration-500
        hover:bg-white/5 group cursor-pointer
        ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
      `}
    >
      {/* Left: Icon + Details */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${categoryColor}20` }}
        >
          {CATEGORY_ICONS[transaction.category] || "📋"}
        </div>

        <div>
          <p className="text-[#F5F0E8] font-medium text-sm line-clamp-1">
            {transaction.description || transaction.merchant || transaction.category}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: `${categoryColor}20`, color: categoryColor }}
            >
              {transaction.category}
            </span>
            <span className="text-xs text-[#F5F0E8]/40">{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>

      {/* Right: Amount */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`font-semibold ${isIncome ? "text-[#3DFF6E]" : "text-[#F5F0E8]"}`}>
            {isIncome ? "+" : "-"}{formatAmount(transaction.amount)}
          </p>
          {isIncome && (
            <div className="flex items-center justify-end gap-1 text-[#3DFF6E]/60">
              <ArrowDownLeft size={12} />
              <span className="text-xs">Income</span>
            </div>
          )}
        </div>

        <ArrowRight
          size={16}
          className="text-[#F5F0E8]/20 group-hover:text-[#C9A84C] transition-colors"
        />
      </div>
    </div>
  );
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const allTransactions = getTransactions();
    // Get 5 most recent
    const recent = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setTransactions(recent);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#F5F0E8]">Recent Transactions</h3>
          <p className="text-sm text-[#F5F0E8]/50">Latest activity across your accounts</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-sm font-medium text-[#C9A84C] hover:text-[#F0D080] transition-colors"
        >
          View All
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="divide-y divide-[#C9A84C]/10">
          {transactions.map((transaction, index) => (
            <TransactionRow key={transaction.id} transaction={transaction} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-[#F5F0E8]/60 font-medium">No transactions yet</p>
          <p className="text-[#F5F0E8]/40 text-sm mt-1">Upload a bank statement to get started</p>
        </div>
      )}
    </div>
  );
}
