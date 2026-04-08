/**
 * WealthLens SpendingChart
 * Category breakdown with Recharts
 */

"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getCategoryBreakdown } from "@/app/lib/store";
import type { CategoryBreakdown } from "@/app/lib/types";

const COLORS = {
  "Housing": ["#C9A84C", "#F0D080"],
  "Food & Dining": ["#3DFF6E", "#8EFF8B"],
  "Transportation": ["#FF6B9D", "#C850C0"],
  "Shopping": ["#60A5FA", "#93C5FD"],
  "Entertainment": ["#A78BFA", "#C4B5FD"],
  "Utilities": ["#F59E0B", "#FCD34D"],
  "Healthcare": ["#EF4444", "#FCA5A5"],
  "Investments": ["#10B981", "#34D399"],
  "Income": ["#8B6914", "#C9A84C"],
  "Other": ["#6B7280", "#9CA3AF"],
};

const DEFAULT_COLORS = ["#C9A84C", "#3DFF6E", "#FF6B9D", "#60A5FA", "#A78BFA", "#F59E0B", "#EF4444", "#10B981"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CategoryBreakdown;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0F0D19]/95 border border-[#C9A84C]/30 rounded-lg p-3 backdrop-blur-xl">
        <p className="text-[#F5F0E8] font-semibold mb-1">{data.category}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#F5F0E8]/60">Amount:</span>
            <span className="text-[#F5F0E8] font-medium">${data.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#F5F0E8]/60">Percentage:</span>
            <span className="text-[#C9A84C] font-medium">{data.percentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#F5F0E8]/60">Transactions:</span>
            <span className="text-[#F5F0E8]">{data.count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function SpendingChart() {
  const [data, setData] = useState<CategoryBreakdown[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const breakdown = getCategoryBreakdown();
    setData(breakdown);
  }, []);

  if (!mounted) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-[#C9A84C]/50">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p className="text-[#F5F0E8]/60 font-medium">No spending data yet</p>
        <p className="text-[#F5F0E8]/40 text-sm mt-1">Upload a bank statement to see your breakdown</p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
          >
            {data.map((entry, index) => {
              const colors = COLORS[entry.category] || DEFAULT_COLORS;
              return <Cell key={`cell-${index}`} fill={colors[0]} stroke={colors[1]} strokeWidth={2} />;
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-[#F5F0E8]/70 text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
