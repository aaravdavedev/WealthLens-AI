/**
 * WealthLens Overview Cards
 * Premium metric cards with animations and trends
 */

"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, Target } from "lucide-react";
import { getCurrentMonthStats, getTransactions } from "@/app/lib/store";
import type { Transaction } from "@/app/lib/types";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  accent: string;
  delay?: number;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, trend, accent, delay = 0 }: MetricCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isPositive = trend === "up";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-700
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{
        background: `linear-gradient(135deg, rgba(15, 13, 25, 0.9) 0%, rgba(15, 13, 25, 0.6) 100%)`,
        borderColor: accent,
        boxShadow: mounted ? `0 0 30px ${accent}20` : "none",
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${accent}40, transparent 70%)`,
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 rounded-xl transition-all duration-500"
            style={{ background: `${accent}20` }}
          >
            <Icon size={24} style={{ color: accent }} />
          </div>
          <div
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${isPositive ? "bg-green-500/20 text-[#3DFF6E]" : "bg-red-500/20 text-[#FF6B9D]"}
            `}
          >
            <TrendIcon size={14} />
            <span>{change > 0 ? "+" : ""}{change}%</span>
          </div>
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-3xl font-bold text-[#F5F0E8] tracking-tight">{value}</span>
        </div>

        {/* Title */}
        <div className="text-sm font-medium text-[#F5F0E8]/60 mb-2">{title}</div>

        {/* Change label */}
        <div className="text-xs text-[#F5F0E8]/40">{changeLabel}</div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-1000"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: mounted ? 1 : 0,
        }}
      />
    </div>
  );
}

// Animated counter hook
function useAnimatedValue(target: number, duration = 1500, decimals = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setValue(target * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return Number(value.toFixed(decimals));
}

export default function OverviewCards() {
  const [stats, setStats] = useState({
    netWorth: 84320,
    income: 8340,
    expenses: 5420,
    savings: 2920,
    savingsRate: 35,
  });
  const [previousStats, setPreviousStats] = useState({
    income: 7500,
    expenses: 5200,
    savings: 2300,
    netWorth: 81400,
  });

  useEffect(() => {
    const current = getCurrentMonthStats();
    const allTransactions = getTransactions();

    // Calculate totals from transactions if available
    if (allTransactions.length > 0) {
      let totalIncome = 0;
      let totalExpenses = 0;

      allTransactions.forEach((t: Transaction) => {
        if (t.amount > 0) {
          totalIncome += t.amount;
        } else {
          totalExpenses += Math.abs(t.amount);
        }
      });

      const savings = totalIncome - totalExpenses;
      const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

      setStats({
        netWorth: 84320 + savings,
        income: totalIncome || 8340,
        expenses: totalExpenses || 5420,
        savings: savings || 2920,
        savingsRate: Number(savingsRate.toFixed(1)) || 35,
      });
    }
  }, []);

  const animatedNetWorth = useAnimatedValue(stats.netWorth);
  const animatedIncome = useAnimatedValue(stats.income);
  const animatedExpenses = useAnimatedValue(stats.expenses);
  const animatedSavings = useAnimatedValue(stats.savings);

  // Calculate percentage changes
  const incomeChange = ((stats.income - previousStats.income) / previousStats.income) * 100;
  const expenseChange = ((stats.expenses - previousStats.expenses) / previousStats.expenses) * 100;
  const savingsChange = ((stats.savings - previousStats.savings) / previousStats.savings) * 100;
  const netWorthChange = ((stats.netWorth - previousStats.netWorth) / previousStats.netWorth) * 100;

  const cards = [
    {
      title: "Net Worth",
      value: `$${animatedNetWorth.toLocaleString()}`,
      change: Number(netWorthChange.toFixed(1)),
      changeLabel: "vs last month",
      icon: Wallet,
      trend: netWorthChange >= 0 ? ("up" as const) : ("down" as const),
      accent: "#C9A84C",
      delay: 0,
    },
    {
      title: "Monthly Income",
      value: `$${animatedIncome.toLocaleString()}`,
      change: Number(incomeChange.toFixed(1)),
      changeLabel: "vs last month",
      icon: CreditCard,
      trend: incomeChange >= 0 ? ("up" as const) : ("down" as const),
      accent: "#3DFF6E",
      delay: 100,
    },
    {
      title: "Monthly Expenses",
      value: `$${animatedExpenses.toLocaleString()}`,
      change: Number(expenseChange.toFixed(1)),
      changeLabel: "vs last month",
      icon: Target,
      trend: expenseChange <= 0 ? ("up" as const) : ("down" as const),
      accent: "#FF6B9D",
      delay: 200,
    },
    {
      title: "Savings",
      value: `$${animatedSavings.toLocaleString()}`,
      change: Number(savingsChange.toFixed(1)),
      changeLabel: `${stats.savingsRate}% savings rate`,
      icon: PiggyBank,
      trend: savingsChange >= 0 ? ("up" as const) : ("down" as const),
      accent: "#8EFF8B",
      delay: 300,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
