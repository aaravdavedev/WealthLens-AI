/**
 * WealthLens Dashboard
 * Main dashboard page with overview cards, charts, and insights
 */

"use client";

import { useEffect, useState } from "react";
import OverviewCards from "@/app/components/OverviewCards";
import SpendingChart from "@/app/components/SpendingChart";
import RecentTransactions from "@/app/components/RecentTransactions";
import AIInsights from "@/app/components/AIInsights";
import { getTransactions } from "@/app/lib/store";
import type { Transaction } from "@/app/lib/types";

// Particle background component
function ParticleBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: Math.random() * 4 + 1 + "px",
            height: Math.random() * 4 + 1 + "px",
            background: ["#C9A84C", "#3DFF6E", "#FF6B9D", "#F5F0E8"][Math.floor(Math.random() * 4)],
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const [hasData, setHasData] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const transactions = getTransactions();
    setHasData(transactions.length > 0);
  }, []);

  return (
    <div className="relative min-h-screen p-6 lg:p-8">
      <ParticleBackground />

      <div className={`relative z-10 max-w-7xl mx-auto transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#F5F0E8] mb-2">
                Dashboard
              </h1>
              <p className="text-[#F5F0E8]/60">
                Welcome back! Here&apos;s your financial overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] font-medium hover:bg-[#C9A84C]/30 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </header>

        {/* Overview Cards */}
        <section className="mb-8">
          <OverviewCards />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Spending Chart */}
          <div className="xl:col-span-2 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#F5F0E8]">Spending by Category</h2>
                <p className="text-sm text-[#F5F0E8]/50">Breakdown of your expenses</p>
              </div>
              <select className="bg-[#07060E] border border-[#C9A84C]/30 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] focus:outline-none focus:border-[#C9A84C]">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
            <SpendingChart />
          </div>

          {/* AI Insights */}
          <div className="xl:col-span-1">
            <AIInsights />
          </div>
        </div>

        {/* Recent Transactions */}
        <section>
          <RecentTransactions />
        </section>
      </div>
    </div>
  );
}
