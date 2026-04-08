/**
 * WealthLens Type Definitions
 * Core types for the financial analysis application
 */

// Transaction category types
export type Category =
  | "Housing"
  | "Food & Dining"
  | "Transportation"
  | "Shopping"
  | "Entertainment"
  | "Utilities"
  | "Healthcare"
  | "Investments"
  | "Income"
  | "Other";

// Transaction type
export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number; // negative for expense, positive for income
  category: Category;
  merchant?: string;
  tags?: string[];
  notes?: string;
  source: "csv" | "pdf" | "manual";
  createdAt: string;
}

// Spending by category
export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

// Monthly summary
export interface MonthlySummary {
  month: string; // YYYY-MM format
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
  topCategory: Category;
}

// AI-generated insight
export interface Insight {
  id: string;
  type: "spending" | "savings" | "anomaly" | "opportunity" | "warning";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category?: Category;
  actionable: boolean;
  actionText?: string;
  createdAt: string;
}

// Financial health score components
export interface FinancialHealth {
  score: number; // 0-100
  components: {
    savingsRate: number;
    budgetAdherence: number;
    expenseDiversity: number;
    incomeStability: number;
    spendingTrend: number;
  };
  lastUpdated: string;
}

// User preferences
export interface UserPreferences {
  currency: "USD" | "EUR" | "GBP" | "INR" | "JPY";
  theme: "dark" | "light" | "system";
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  defaultView: "dashboard" | "transactions" | "analytics";
  emailNotifications: boolean;
  weeklyReports: boolean;
  aiInsightsEnabled: boolean;
}

// Parsed file result
export interface ParsedFileResult {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    dateRange: { start: string; end: string };
    totalIncome: number;
    totalExpenses: number;
    categories: Category[];
  };
  errors?: string[];
}

// Forecast data point
export interface ForecastPoint {
  date: string;
  value: number;
  lowerCI: number;
  upperCI: number;
}

// AI Analysis result
export interface AIAnalysisResult {
  summary: string;
  aroma: string;
  insights: Insight[];
  recommendations: string[];
  spending: CategoryBreakdown[];
  riskLevel: "low" | "medium" | "high";
  savingsPotential: number;
}

// App state
export interface AppState {
  transactions: Transaction[];
  insights: Insight[];
  preferences: UserPreferences;
  financialHealth: FinancialHealth | null;
  lastSync: string | null;
}
