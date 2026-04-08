/**
 * WealthLens Sidebar Navigation
 * Premium fintech sidebar with navigation and user menu
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  Upload,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { getCurrentMonthStats } from "@/app/lib/store";

// Navigation items
const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { href: "/transactions", label: "Transactions", icon: Receipt, badge: null },
  { href: "/analytics", label: "Analytics", icon: BarChart3, badge: "New" },
  { href: "/upload", label: "Upload Data", icon: Upload, badge: null },
];

const SECONDARY_ITEMS = [
  { href: "/insights", label: "AI Insights", icon: Sparkles, badge: "Beta" },
  { href: "/settings", label: "Settings", icon: Settings, badge: null },
];

// WealthLens Logo Component
function SidebarLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <svg
          width={collapsed ? 32 : 40}
          height={collapsed ? 32 : 40}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="sidebarGold" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F0D080" />
              <stop offset="50%" stopColor="#C9A84C" />
              <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <linearGradient id="sidebarGreen" x1="44" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8EFF8B" />
              <stop offset="100%" stopColor="#3DFF6E" stopOpacity="0.5" />
            </linearGradient>
            <radialGradient id="sidebarCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
            </radialGradient>
          </defs>
          <polygon
            points="22,2 39,11.5 39,32.5 22,42 5,32.5 5,11.5"
            stroke="url(#sidebarGold)"
            strokeWidth="0.6"
            fill="none"
            opacity="0.4"
          />
          <polygon
            points="22,8 34,15 34,29 22,36 10,29 10,15"
            stroke="url(#sidebarGold)"
            strokeWidth="1.2"
            fill="url(#sidebarCore)"
          />
          <circle cx="22" cy="22" r="7" stroke="url(#sidebarGold)" strokeWidth="0.9" fill="none" />
          <circle cx="22" cy="22" r="2.8" fill="url(#sidebarGold)" />
          <path
            d="M 22 15 A 7 7 0 0 1 29 22"
            stroke="url(#sidebarGreen)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span
            className="text-lg font-semibold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #F0D080 0%, #C9A84C 50%, #F0D080 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            WealthLens
          </span>
          <span className="text-xs text-[#F5F0E8]/50">AI-Powered Finance</span>
        </div>
      )}
    </Link>
  );
}

// Navigation Item Component
function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  collapsed,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge: string | null;
  collapsed: boolean;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        ${isActive ? "bg-gradient-to-r from-[#C9A84C]/20 to-transparent border border-[#C9A84C]/30" : "hover:bg-white/5 border border-transparent"}
        ${collapsed ? "justify-center" : ""}
        group
      `}
      title={collapsed ? label : undefined}
    >
      <div
        className={`
          relative p-2 rounded-lg transition-all duration-300
          ${isActive ? "bg-[#C9A84C]/20" : "bg-white/5 group-hover:bg-white/10"}
        `}
      >
        <Icon
          size={collapsed ? 22 : 20}
          className={`transition-colors duration-300 ${isActive ? "text-[#C9A84C]" : "text-[#F5F0E8]/60 group-hover:text-[#F5F0E8]"}`}
        />
        {badge && !collapsed && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#3DFF6E] rounded-full animate-pulse" />
        )}
      </div>

      {!collapsed && (
        <>
          <span className={`flex-1 text-sm font-medium transition-colors duration-300 ${isActive ? "text-[#F5F0E8]" : "text-[#F5F0E8]/70 group-hover:text-[#F5F0E8]"}`}>
            {label}
          </span>
          {badge && (
            <span
              className={`
                px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider
                ${badge === "Beta" ? "bg-[#3DFF6E]/20 text-[#3DFF6E]" : ""}
                ${badge === "New" ? "bg-[#FF6B9D]/20 text-[#FF6B9D]" : ""}
              `}
            >
              {badge}
            </span>
          )}
          <ChevronRight
            size={16}
            className={`text-[#F5F0E8]/30 transition-all duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
          />
        </>
      )}
    </Link>
  );
}

// Quick Stats Component
function QuickStats({ collapsed }: { collapsed: boolean }) {
  const [stats, setStats] = useState({ income: 0, expenses: 0, net: 0 });

  useEffect(() => {
    setStats(getCurrentMonthStats());
  }, []);

  if (collapsed) return null;

  return (
    <div className="px-4 py-4 mt-4 bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-xl border border-[#C9A84C]/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-[#3DFF6E] rounded-full animate-pulse" />
        <span className="text-xs font-medium text-[#C9A84C] uppercase tracking-wider">This Month</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#F5F0E8]/50">Income</span>
          <span className="text-sm font-semibold text-[#3DFF6E]">${stats.income.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#F5F0E8]/50">Expenses</span>
          <span className="text-sm font-semibold text-[#FF6B9D]">${stats.expenses.toLocaleString()}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent my-2" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#F5F0E8]/70 font-medium">Net</span>
          <span className={`text-sm font-bold ${stats.net >= 0 ? "text-[#3DFF6E]" : "text-[#FF6B9D]"}`}>
            {stats.net >= 0 ? "+" : ""}${stats.net.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Sidebar Component
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-3 rounded-xl bg-[#07060E]/90 border border-[#C9A84C]/30 backdrop-blur-xl"
      >
        {mobileOpen ? <X size={20} className="text-[#C9A84C]" /> : <Menu size={20} className="text-[#C9A84C]" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          bg-[#07060E]/95 border-r border-[#C9A84C]/20
          backdrop-blur-xl
          transition-all duration-300 ease-out
          flex flex-col
          ${collapsed ? "w-20" : "w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#C9A84C]/10">
          <div className="flex items-center justify-between">
            <SidebarLogo collapsed={collapsed} />
            {!collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-white/5 transition-colors"
                title={collapsed ? "Expand" : "Collapse"}
              >
                <ChevronRight
                  size={18}
                  className={`text-[#F5F0E8]/50 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            {!collapsed && (
              <span className="px-4 text-xs font-semibold text-[#F5F0E8]/40 uppercase tracking-wider">Main Menu</span>
            )}
            <div className="mt-2 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  collapsed={collapsed}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            {!collapsed && (
              <span className="px-4 text-xs font-semibold text-[#F5F0E8]/40 uppercase tracking-wider">AI Features</span>
            )}
            <div className="mt-2 space-y-1">
              {SECONDARY_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  collapsed={collapsed}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats collapsed={collapsed} />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#C9A84C]/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#8B6914] flex items-center justify-center">
              <User size={18} className="text-[#07060E]" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F5F0E8] truncate">User Account</p>
                <p className="text-xs text-[#F5F0E8]/50 truncate">Premium Plan</p>
              </div>
            )}
            {!collapsed && <LogOut size={16} className="text-[#F5F0E8]/30 hover:text-[#FF6B9D] transition-colors cursor-pointer" />}
          </div>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`hidden lg:block transition-all duration-300 ${collapsed ? "w-20" : "w-72"}`} />
    </>
  );
}
