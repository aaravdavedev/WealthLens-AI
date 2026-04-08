/**
 * WealthLens AI Insights
 * AI-generated financial insights
 */

"use client";

import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { getInsights } from "@/app/lib/store";
import type { Insight } from "@/app/lib/types";

const TYPE_CONFIG: Record<
  Insight["type"],
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  spending: {
    icon: TrendingUp,
    color: "#C9A84C",
    bgColor: "#C9A84C20",
    label: "Spending",
  },
  savings: {
    icon: Lightbulb,
    color: "#3DFF6E",
    bgColor: "#3DFF6E20",
    label: "Savings",
  },
  anomaly: {
    icon: AlertTriangle,
    color: "#FF6B9D",
    bgColor: "#FF6B9D20",
    label: "Anomaly",
  },
  opportunity: {
    icon: Sparkles,
    color: "#F0D080",
    bgColor: "#F0D08020",
    label: "Opportunity",
  },
  warning: {
    icon: AlertTriangle,
    color: "#EF4444",
    bgColor: "#EF444420",
    label: "Warning",
  },
};

interface InsightCardProps {
  insight: Insight;
  index: number;
}

function InsightCard({ insight, index }: InsightCardProps) {
  const [mounted, setMounted] = useState(false);
  const config = TYPE_CONFIG[insight.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`
        p-5 rounded-xl border transition-all duration-500 group
        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        background: `linear-gradient(135deg, ${config.bgColor} 0%, transparent 100%)`,
        borderColor: `${config.color}30`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="p-3 rounded-xl shrink-0"
          style={{ background: config.bgColor }}
        >
          <Icon size={20} style={{ color: config.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: config.bgColor, color: config.color }}
            >
              {config.label}
            </span>
            {insight.impact === "high" && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>

          <h4 className="text-[#F5F0E8] font-semibold mb-1">{insight.title}</h4>
          <p className="text-sm text-[#F5F0E8]/60 line-clamp-2">{insight.description}</p>

          {insight.actionable && insight.actionText && (
            <button
              className="mt-3 flex items-center gap-1 text-sm font-medium transition-all duration-300 hover:gap-2"
              style={{ color: config.color }}
            >
              {insight.actionText}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate demo insights if none exist
function generateDemoInsights(): Insight[] {
  return [
    {
      id: "demo-1",
      type: "spending",
      title: "Dining expenses up 18%",
      description: "You've spent $340 more on dining out this month compared to last. Consider setting a weekly dining budget.",
      impact: "medium",
      actionable: true,
      actionText: "Set budget",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      type: "opportunity",
      title: "Investment window detected",
      description: "Based on your spending patterns, you could invest an additional $500/month without impacting lifestyle.",
      impact: "high",
      actionable: true,
      actionText: "Explore options",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-3",
      type: "savings",
      title: "Utility switch opportunity",
      description: "Comparing your utility costs, switching providers could save you $120 annually.",
      impact: "low",
      actionable: true,
      actionText: "Learn more",
      createdAt: new Date().toISOString(),
    },
  ];
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedInsights = getInsights();
    if (storedInsights.length > 0) {
      setInsights(storedInsights.slice(0, 3));
    } else {
      setInsights(generateDemoInsights());
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#C9A84C]/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#C9A84C]/20 to-[#3DFF6E]/20">
            <Sparkles size={20} className="text-[#C9A84C]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F5F0E8]">AI Insights</h3>
            <p className="text-sm text-[#F5F0E8]/50">Powered by WealthLens AI</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} />
        ))}
      </div>

      {/* CTA */}
      <button className="w-full mt-6 py-3 rounded-xl border border-[#C9A84C]/30 text-[#C9A84C] font-medium hover:bg-[#C9A84C]/10 transition-colors">
        Generate New Insights
      </button>
    </div>
  );
}
