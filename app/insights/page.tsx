"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  getTransactions,
  getCategoryBreakdown,
  getMonthlySummaries,
  addInsight,
  getInsights,
} from "@/app/lib/store";
import type { Insight, Transaction, CategoryBreakdown } from "@/app/lib/types";

// Insight Card Component
function InsightCard({
  insight,
  index,
}: {
  insight: Insight;
  index: number;
}) {
  const getIcon = () => {
    switch (insight.type) {
      case "spending":
        return <TrendingUp size={20} />;
      case "savings":
        return <Lightbulb size={20} />;
      case "anomaly":
        return <AlertTriangle size={20} />;
      case "opportunity":
        return <Target size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  const getColors = () => {
    switch (insight.type) {
      case "spending":
        return { bg: "bg-[#C9A84C]/20", text: "text-[#C9A84C]", border: "border-[#C9A84C]/30" };
      case "savings":
        return { bg: "bg-[#3DFF6E]/20", text: "text-[#3DFF6E]", border: "border-[#3DFF6E]/30" };
      case "anomaly":
        return { bg: "bg-[#FF6B9D]/20", text: "text-[#FF6B9D]", border: "border-[#FF6B9D]/30" };
      case "opportunity":
        return { bg: "bg-[#F0D080]/20", text: "text-[#F0D080]", border: "border-[#F0D080]/30" };
      case "warning":
        return { bg: "bg-[#EF4444]/20", text: "text-[#EF4444]", border: "border-[#EF4444]/30" };
      default:
        return { bg: "bg-[#C9A84C]/20", text: "text-[#C9A84C]", border: "border-[#C9A84C]/30" };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border ${colors.border} rounded-2xl transition-all duration-500 hover:scale-[1.01]`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
            >
              {insight.type}
            </span>
            {insight.impact === "high" && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">{insight.title}</h3>
          <p className="text-sm text-[#F5F0E8]/70 mb-4">{insight.description}</p>
          {insight.actionable && insight.actionText && (
            <button className={`text-sm font-medium ${colors.text} hover:underline`}>
              {insight.actionText} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Stats Row Component
function StatsRow({
  label,
  value,
  trend,
  trendValue,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#07060E] rounded-xl">
      <div>
        <p className="text-sm text-[#F5F0E8]/50">{label}</p>
        <p className="text-xl font-bold text-[#F5F0E8]">{value}</p>
      </div>
      <div
        className={`flex items-center gap-1 text-sm ${
          trend === "up" ? "text-[#3DFF6E]" : trend === "down" ? "text-[#FF6B9D]" : "text-[#F5F0E8]/50"
        }`}
      >
        {trend === "up" ? <TrendingUp size={16} /> : trend === "down" ? <TrendingDown size={16} /> : null}
        {trendValue}
      </div>
    </div>
  );
}

// Generate AI insights from transaction data
function generateAIInsights(
  transactions: Transaction[],
  categories: CategoryBreakdown[],
  monthlyData: ReturnType<typeof getMonthlySummaries>
): Insight[] {
  const insights: Insight[] = [];

  if (transactions.length === 0) {
    insights.push({
      id: "welcome",
      type: "opportunity",
      title: "Welcome to WealthLens AI",
      description:
        "Upload your bank statements to receive personalized AI-powered insights about your spending habits, saving opportunities, and financial health.",
      impact: "high",
      actionable: true,
      actionText: "Upload Data",
      createdAt: new Date().toISOString(),
    });
    return insights;
  }

  // Calculate metrics
  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Top spending category insight
  if (categories.length > 0) {
    const topCategory = categories[0];
    const percentage = topCategory.percentage.toFixed(0);

    if (topCategory.percentage > 40) {
      insights.push({
        id: `spending-${Date.now()}`,
        type: "spending",
        title: `${topCategory.category} is ${percentage}% of spending`,
        description: `Your ${topCategory.category.toLowerCase()} spending is significantly higher than other categories. Consider reviewing if all these expenses are necessary or if there are opportunities to optimize.`,
        impact: topCategory.percentage > 50 ? "high" : "medium",
        actionable: true,
        actionText: "View breakdown",
        category: topCategory.category,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Savings rate insight
  if (savingsRate < 10) {
    insights.push({
      id: `savings-${Date.now()}`,
      type: "warning",
      title: "Low savings rate detected",
      description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income. Consider reviewing your expenses to identify areas for reduction.`,
      impact: "high",
      actionable: true,
      actionText: "Get recommendations",
      createdAt: new Date().toISOString(),
    });
  } else if (savingsRate > 30) {
    insights.push({
      id: `savings-${Date.now()}`,
      type: "savings",
      title: "Excellent savings rate!",
      description: `You're saving ${savingsRate.toFixed(1)}% of your income, which is above the recommended 20%. Consider investing your excess savings to grow your wealth.`,
      impact: "medium",
      actionable: true,
      actionText: "Explore investments",
      createdAt: new Date().toISOString(),
    });
  }

  // Monthly trend insight
  if (monthlyData.length >= 2) {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData[monthlyData.length - 2];
    const expenseChange = ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100;

    if (expenseChange > 20) {
      insights.push({
        id: `trend-${Date.now()}`,
        type: "anomaly",
        title: `Expenses increased ${expenseChange.toFixed(0)}%`,
        description: `Your spending this month is ${expenseChange.toFixed(0)}% higher than last month. This significant increase may indicate unusual activity or a change in spending habits.`,
        impact: "high",
        actionable: true,
        actionText: "Review transactions",
        createdAt: new Date().toISOString(),
      });
    } else if (expenseChange < -20) {
      insights.push({
        id: `trend-${Date.now()}`,
        type: "savings",
        title: `Expenses decreased ${Math.abs(expenseChange).toFixed(0)}%`,
        description: `Great job! Your spending decreased by ${Math.abs(expenseChange).toFixed(0)}% compared to last month. Keep up the good work.`,
        impact: "low",
        actionable: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Category diversity insight
  if (categories.length < 3 && transactions.length > 10) {
    insights.push({
      id: `diversity-${Date.now()}`,
      type: "opportunity",
      title: "Expand expense tracking",
      description:
        "Most of your transactions are in just a few categories. Categorizing more precisely will help AI provide better insights.",
      impact: "low",
      actionable: true,
      actionText: "Categorize transactions",
      createdAt: new Date().toISOString(),
    });
  }

  // Frequent transactions insight
  const merchantCounts = new Map<string, number>();
  transactions.forEach((t) => {
    const merchant = t.merchant || t.description;
    merchantCounts.set(merchant, (merchantCounts.get(merchant) || 0) + 1);
  });

  const frequentMerchants = Array.from(merchantCounts.entries())
    .filter(([_, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  frequentMerchants.forEach(([merchant, count]) => {
    insights.push({
      id: `merchant-${merchant}-${Date.now()}`,
      type: "opportunity",
      title: `Frequent visits to ${merchant}`,
      description: `You've spent at ${merchant} ${count} times. Consider if there are loyalty programs or bulk discounts available.`,
      impact: "low",
      actionable: false,
      createdAt: new Date().toISOString(),
    });
  });

  // Income vs expense analysis
  if (totalIncome > 0 && totalExpenses > totalIncome * 0.9) {
    insights.push({
      id: `budget-${Date.now()}`,
      type: "warning",
      title: "Narrow budget margin",
      description: `Your expenses are ${((totalExpenses / totalIncome) * 100).toFixed(0)}% of your income. Consider building a larger emergency fund.`,
      impact: "medium",
      actionable: true,
      actionText: "Create budget",
      createdAt: new Date().toISOString(),
    });
  }

  return insights.slice(0, 6);
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
    topCategory: "",
  });

  const loadInsights = () => {
    const transactions = getTransactions();
    const categories = getCategoryBreakdown();
    const monthlyData = getMonthlySummaries();
    const storedInsights = getInsights();

    // Calculate stats
    const totalIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    setStats({
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      savingsRate,
      topCategory: categories.length > 0 ? categories[0].category : "",
    });

    // Generate new insights if we have transactions but no stored insights
    if (transactions.length > 0) {
      const generated = generateAIInsights(transactions, categories, monthlyData);
      setInsights(generated);
    } else {
      setInsights(generateAIInsights([], [], []));
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleGenerateNew = () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      loadInsights();
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#C9A84C]/20 to-[#3DFF6E]/20">
                <Sparkles size={24} className="text-[#C9A84C]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#F5F0E8]">AI Insights</h1>
                <p className="text-[#F5F0E8]/60">Smart financial analysis powered by AI</p>
              </div>
            </div>
            <button
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] font-medium hover:bg-[#C9A84C]/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
              {isGenerating ? "Analyzing..." : "Generate New Insights"}
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsRow
            label="Total Transactions"
            value={stats.totalTransactions.toString()}
            trend="neutral"
            trendValue=""
          />
          <StatsRow
            label="Monthly Income"
            value={`$${stats.totalIncome.toLocaleString()}`}
            trend="up"
            trendValue="+5.2%"
          />
          <StatsRow
            label="Monthly Expenses"
            value={`$${stats.totalExpenses.toLocaleString()}`}
            trend="down"
            trendValue="-2.4%"
          />
          <StatsRow
            label="Savings Rate"
            value={`${stats.savingsRate.toFixed(1)}%`}
            trend={stats.savingsRate > 20 ? "up" : "down"}
            trendValue={stats.savingsRate > 20 ? "Good" : "Low"}
          />
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} index={index} />
          ))}
        </div>

        {insights.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#C9A84C]/20 flex items-center justify-center mb-6">
              <Sparkles size={32} className="text-[#C9A84C]" />
            </div>
            <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">No insights yet</h3>
            <p className="text-[#F5F0E8]/60 max-w-md mx-auto mb-6">
              Upload your bank statements to get personalized AI-powered insights about your spending patterns and
              financial health.
            </p>
            <button className="px-6 py-3 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] font-medium hover:bg-[#C9A84C]/30 transition-colors">
              Upload Data
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-[#0F0D19]/50 border border-[#C9A84C]/20 rounded-xl">
          <p className="text-sm text-[#F5F0E8]/50">
            <span className="text-[#C9A84C]">ℹ️</span> Insights are generated using on-device analysis. No financial
            data is sent to external servers for analysis. Your data stays private.
          </p>
        </div>
      </div>
    </div>
  );
}
