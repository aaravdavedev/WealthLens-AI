/**
 * WealthLens Store Module
 * Handles localStorage persistence and data management
 */

import type {
  Transaction,
  Insight,
  UserPreferences,
  FinancialHealth,
  CategoryBreakdown,
  MonthlySummary,
  Category,
} from "./types";

// Storage keys
const STORAGE_KEYS = {
  transactions: "wealthlens_transactions",
  insights: "wealthlens_insights",
  preferences: "wealthlens_preferences",
  financialHealth: "wealthlens_financial_health",
  lastSync: "wealthlens_last_sync",
} as const;

// Default preferences
const defaultPreferences: UserPreferences = {
  currency: "USD",
  theme: "dark",
  dateFormat: "MM/DD/YYYY",
  defaultView: "dashboard",
  emailNotifications: true,
  weeklyReports: true,
  aiInsightsEnabled: true,
};

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== TRANSACTIONS ====================

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.transactions);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  updateLastSync();
}

export function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Transaction {
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const transactions = getTransactions();
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function addTransactions(newTransactions: Omit<Transaction, "id" | "createdAt">[]): Transaction[] {
  const transactions = getTransactions();
  const created = newTransactions.map((t) => ({
    ...t,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }));
  transactions.push(...created);
  saveTransactions(transactions);
  return created;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;
  transactions[index] = { ...transactions[index], ...updates };
  saveTransactions(transactions);
  return transactions[index];
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter((t) => t.id !== id);
  if (filtered.length === transactions.length) return false;
  saveTransactions(filtered);
  return true;
}

export function clearAllTransactions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.transactions);
}

// ==================== INSIGHTS ====================

export function getInsights(): Insight[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEYS.insights);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveInsights(insights: Insight[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.insights, JSON.stringify(insights));
}

export function addInsight(insight: Omit<Insight, "id" | "createdAt">): Insight {
  const newInsight: Insight = {
    ...insight,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const insights = getInsights();
  insights.unshift(newInsight); // Add to beginning
  saveInsights(insights);
  return newInsight;
}

export function clearInsights(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.insights);
}

// ==================== PREFERENCES ====================

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  const stored = localStorage.getItem(STORAGE_KEYS.preferences);
  if (!stored) return defaultPreferences;
  try {
    return { ...defaultPreferences, ...JSON.parse(stored) };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...preferences };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated));
  }
  return updated;
}

// ==================== FINANCIAL HEALTH ====================

export function getFinancialHealth(): FinancialHealth | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEYS.financialHealth);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveFinancialHealth(health: FinancialHealth): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.financialHealth, JSON.stringify(health));
}

// ==================== SYNC ====================

function updateLastSync(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
}

export function getLastSync(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.lastSync);
}

// ==================== COMPUTED DATA ====================

// Calculate category breakdown
export function getCategoryBreakdown(
  transactions?: Transaction[],
  startDate?: string,
  endDate?: string
): CategoryBreakdown[] {
  const txs = transactions || getTransactions();
  const filtered = txs.filter((t) => {
    if (t.amount > 0) return false; // Only expenses
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });

  const totalSpent = filtered.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const categoryMap = new Map<Category, { amount: number; count: number }>();

  filtered.forEach((t) => {
    const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: current.amount + Math.abs(t.amount),
      count: current.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
      count: data.count,
      trend: "stable" as const,
      trendValue: 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Calculate monthly summaries
export function getMonthlySummaries(transactions?: Transaction[]): MonthlySummary[] {
  const txs = transactions || getTransactions();
  const monthMap = new Map<string, { income: number; expenses: number; count: number; categories: Map<Category, number> }>();

  txs.forEach((t) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    const current = monthMap.get(month) || {
      income: 0,
      expenses: 0,
      count: 0,
      categories: new Map<Category, number>(),
    };

    if (t.amount > 0) {
      current.income += t.amount;
    } else {
      current.expenses += Math.abs(t.amount);
      current.categories.set(t.category, (current.categories.get(t.category) || 0) + Math.abs(t.amount));
    }
    current.count += 1;
    monthMap.set(month, current);
  });

  return Array.from(monthMap.entries())
    .map(([month, data]) => {
      let topCategory: Category = "Other";
      let maxAmount = 0;
      data.categories.forEach((amount, category) => {
        if (amount > maxAmount) {
          maxAmount = amount;
          topCategory = category;
        }
      });

      return {
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
        transactionCount: data.count,
        topCategory,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Get current month's stats
export function getCurrentMonthStats(): {
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
} {
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  const txs = getTransactions().filter((t) => t.date.startsWith(currentMonth));

  let income = 0;
  let expenses = 0;

  txs.forEach((t) => {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      expenses += Math.abs(t.amount);
    }
  });

  return {
    income,
    expenses,
    net: income - expenses,
    transactionCount: txs.length,
  };
}

// Get balance over time (for charts)
export function getBalanceOverTime(transactions?: Transaction[]): { date: string; balance: number }[] {
  const txs = transactions || getTransactions();
  const sorted = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const balanceMap = new Map<string, number>();
  let runningBalance = 0;

  sorted.forEach((t) => {
    runningBalance += t.amount;
    balanceMap.set(t.date, runningBalance);
  });

  return Array.from(balanceMap.entries())
    .map(([date, balance]) => ({ date, balance }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Search and filter transactions
export function filterTransactions(options: {
  searchQuery?: string;
  category?: Category;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}): Transaction[] {
  let txs = getTransactions();

  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    txs = txs.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.merchant?.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  if (options.category) {
    txs = txs.filter((t) => t.category === options.category);
  }

  if (options.startDate) {
    txs = txs.filter((t) => t.date >= options.startDate!);
  }

  if (options.endDate) {
    txs = txs.filter((t) => t.date <= options.endDate!);
  }

  if (options.minAmount !== undefined) {
    txs = txs.filter((t) => Math.abs(t.amount) >= options.minAmount!);
  }

  if (options.maxAmount !== undefined) {
    txs = txs.filter((t) => Math.abs(t.amount) <= options.maxAmount!);
  }

  return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Export all data (for backup)
export function exportAllData(): {
  transactions: Transaction[];
  insights: Insight[];
  preferences: UserPreferences;
  financialHealth: FinancialHealth | null;
  exportedAt: string;
} {
  return {
    transactions: getTransactions(),
    insights: getInsights(),
    preferences: getPreferences(),
    financialHealth: getFinancialHealth(),
    exportedAt: new Date().toISOString(),
  };
}

// Import data (for restore)
export function importAllData(data: {
  transactions?: Transaction[];
  insights?: Insight[];
  preferences?: Partial<UserPreferences>;
}): void {
  if (data.transactions) saveTransactions(data.transactions);
  if (data.insights) saveInsights(data.insights);
  if (data.preferences) savePreferences(data.preferences);
}

// Clear all data (reset)
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// Get unique categories from transactions
export function getUniqueCategories(): Category[] {
  const txs = getTransactions();
  const categories = new Set(txs.map((t) => t.category));
  return Array.from(categories).sort();
}

// Get date range of transactions
export function getTransactionDateRange(): { start: string; end: string } | null {
  const txs = getTransactions();
  if (txs.length === 0) return null;
  const dates = txs.map((t) => t.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}
