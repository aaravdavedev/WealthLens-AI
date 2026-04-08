"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  Activity,
} from "lucide-react";
import { getMonthlySummaries, getCategoryBreakdown, getBalanceOverTime, getTransactions } from "@/app/lib/store";
import type { MonthlySummary, CategoryBreakdown } from "@/app/lib/types";

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F0D19]/95 border border-[#C9A84C]/30 rounded-lg p-3 backdrop-blur-xl">
        <p className="text-[#F5F0E8] font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[#F5F0E8]/60">{entry.name}:</span>
            <span className="text-[#F5F0E8] font-medium">
              {entry.value >= 0 ? "$" : "-$"}{Math.abs(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  positive: boolean;
}) {
  return (
    <div className="p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-[#C9A84C]/20">
          <Icon size={20} className="text-[#C9A84C]" />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            positive ? "bg-[#3DFF6E]/20 text-[#3DFF6E]" : "bg-[#FF6B9D]/20 text-[#FF6B9D]"
          }`}
        >
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-[#F5F0E8] mb-1">{value}</p>
      <p className="text-sm text-[#F5F0E8]/50">{title}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlySummary[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [balanceData, setBalanceData] = useState<{ date: string; balance: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const transactions = getTransactions();
    if (transactions.length > 0) {
      setMonthlyData(getMonthlySummaries());
      setCategoryData(getCategoryBreakdown());
      setBalanceData(getBalanceOverTime());
    }
  }, []);

  // Calculate trend stats
  const stats = {
    avgMonthlySpend: monthlyData.length > 0
      ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length
      : 5400,
    avgMonthlyIncome: monthlyData.length > 0
      ? monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
      : 7200,
    savingsRate: monthlyData.length > 0
      ? (monthlyData.reduce((sum, m) => sum + m.net, 0) / monthlyData.reduce((sum, m) => sum + m.income, 0)) * 100
      : 25,
    topCategory: categoryData.length > 0
      ? categoryData[0].category
      : "Housing",
  };

  // Prepare chart data
  const incomeExpenseData = monthlyData.map((m) => ({
    month: new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    income: m.income,
    expenses: m.expenses,
    net: m.net,
  }));

  const categoryChartData = categoryData.slice(0, 6).map((c) => ({
    name: c.category,
    amount: c.amount,
    percentage: c.percentage,
  }));

  if (!mounted) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-[#C9A84C]/20 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-[#C9A84C]/10 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#F5F0E8] mb-2">Analytics</h1>
          <p className="text-[#F5F0E8]/60">Deep insights into your financial patterns</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Avg Monthly Spend"
            value={`$${stats.avgMonthlySpend.toLocaleString()}`}
            change="-2.4%"
            icon={DollarSign}
            positive={true}
          />
          <StatCard
            title="Avg Monthly Income"
            value={`$${stats.avgMonthlyIncome.toLocaleString()}`}
            change="+5.2%"
            icon={DollarSign}
            positive={true}
          />
          <StatCard
            title="Savings Rate"
            value={`${stats.savingsRate.toFixed(1)}%`}
            change="+1.8%"
            icon={PieChart}
            positive={true}
          />
          <StatCard
            title="Top Category"
            value={stats.topCategory}
            change="34%"
            icon={Activity}
            positive={true}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expenses */}
          <div className="p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#F5F0E8]">Income vs Expenses</h2>
                <p className="text-sm text-[#F5F0E8]/50">Monthly cash flow analysis</p>
              </div>
              <select className="bg-[#07060E] border border-[#C9A84C]/30 rounded-lg px-3 py-2 text-sm text-[#F5F0E8]">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>

            <div className="h-80">
              {incomeExpenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={incomeExpenseData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3DFF6E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3DFF6E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#C9A84C" strokeOpacity={0.1} />
                    <XAxis
                      dataKey="month"
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: 20 }}
                      formatter={(value) => <span className="text-[#F5F0E8]/70">{value}</span>}
                    />

                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#3DFF6E"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#incomeGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#FF6B9D"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#expenseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Calendar size={48} className="text-[#C9A84C]/30 mb-4" />
                  <p className="text-[#F5F0E8]/60">No monthly data available</p>
                  <p className="text-[#F5F0E8]/40 text-sm">Upload transactions to see trends</p>
                </div>
              )}
            </div>
          </div>

          {/* Balance Over Time */}
          <div className="p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#F5F0E8]">Net Worth Trend</h2>
                <p className="text-sm text-[#F5F0E8]/50">Your wealth accumulation over time</p>
              </div>
            </div>

            <div className="h-80">
              {balanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceData}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#C9A84C" strokeOpacity={0.1} />
                    <XAxis
                      dataKey="date"
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short" })}
                    />
                    <YAxis
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Net Worth"
                      stroke="#C9A84C"
                      strokeWidth={2}
                      fill="url(#balanceGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <TrendingUp size={48} className="text-[#C9A84C]/30 mb-4" />
                  <p className="text-[#F5F0E8]/60">No balance data available</p>
                  <p className="text-[#F5F0E8]/40 text-sm">Upload transactions to track your wealth</p>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#F5F0E8]">Spending by Category</h2>
              <p className="text-sm text-[#F5F0E8]/50">Where your money goes</p>
            </div>

            <div className="h-80">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#C9A84C" strokeOpacity={0.1} />
                    <XAxis
                      type="number"
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.8, fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="amount"
                      name="Amount"
                      fill="#C9A84C"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <PieChart size={48} className="text-[#C9A84C]/30 mb-4" />
                  <p className="text-[#F5F0E8]/60">No category data available</p>
                  <p className="text-[#F5F0E8]/40 text-sm">Categorize transactions to see breakdown</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Net Worth Comparison */}
          <div className="p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#F5F0E8]">Monthly Comparison</h2>
              <p className="text-sm text-[#F5F0E8]/50">Net worth change by month</p>
            </div>

            <div className="h-80">
              {incomeExpenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#C9A84C" strokeOpacity={0.1} />
                    <XAxis
                      dataKey="month"
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#F5F0E8"
                      strokeOpacity={0.3}
                      tick={{ fill: "#F5F0E8", opacity: 0.6, fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="text-[#F5F0E8]/70">{value}</span>}
                    />

                    <Bar
                      dataKey="net"
                      name="Net"
                      fill="#C9A84C"
                      radius={[4, 4, 0, 0]}
                    >
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Activity size={48} className="text-[#C9A84C]/30 mb-4" />
                  <p className="text-[#F5F0E8]/60">No comparison data available</p>
                  <p className="text-[#F5F0E8]/40 text-sm">Add transactions to see monthly comparisons</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
