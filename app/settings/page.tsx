/**
 * WealthLens Settings Page
 * User preferences, theme, and data management
 */

"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Moon,
  Sun,
  Globe,
  DollarSign,
  Bell,
  Database,
  Trash2,
  Download,
  Upload,
  Shield,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  getPreferences,
  savePreferences,
  exportAllData,
  importAllData,
  clearAllData,
  getTransactions,
} from "@/app/lib/store";
import type { UserPreferences } from "@/app/lib/types";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

// Settings Section Component
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#F5F0E8] mb-1">{title}</h2>
        {description && <p className="text-sm text-[#F5F0E8]/50">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// Toggle Switch Component
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        checked ? "bg-[#C9A84C]" : "bg-[#F5F0E8]/20"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-[#07060E] transition-all duration-300 ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "USD",
    theme: "dark",
    dateFormat: "MM/DD/YYYY",
    defaultView: "dashboard",
    emailNotifications: true,
    weeklyReports: true,
    aiInsightsEnabled: true,
  });
  const [dataStats, setDataStats] = useState({
    transactions: 0,
    insights: 0,
    lastSync: null as string | null,
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    setPreferences(prefs);
    const transactions = getTransactions();
    setDataStats({
      transactions: transactions.length,
      insights: 0,
      lastSync: null,
    });
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferences({ [key]: value });
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealthlens-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importAllData(data);
        setShowImportSuccess(true);
        setTimeout(() => setShowImportSuccess(false), 3000);
      } catch (error) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    clearAllData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-[#C9A84C]/20">
              <Settings size={24} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F5F0E8]">Settings</h1>
              <p className="text-[#F5F0E8]/60">
                Customize your WealthLens experience
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {/* Appearance */}
          <SettingsSection
            title="Appearance"
            description="Customize how WealthLens looks"
          >
            <div className="space-y-4">
              {/* Theme */}
              <div className="flex items-center justify-between p-4 bg-[#07060E] rounded-xl">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-[#C9A84C]" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F0E8]">Dark Mode</p>
                    <p className="text-xs text-[#F5F0E8]/50">
                      Always on for premium experience
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={preferences.theme === "dark"}
                  onChange={(checked) =>
                    updatePreference("theme", checked ? "dark" : "light")
                  }
                />
              </div>

              {/* Date Format */}
              <div className="p-4 bg-[#07060E] rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Globe size={20} className="text-[#C9A84C]" />
                  <span className="text-sm font-medium text-[#F5F0E8]">
                    Date Format
                  </span>
                </div>
                <div className="flex gap-2">
                  {DATE_FORMATS.map((format) => (
                    <button
                      key={format.value}
                      onClick={() =>
                        updatePreference("dateFormat", format.value as UserPreferences["dateFormat"])
                      }
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        preferences.dateFormat === format.value
                          ? "bg-[#C9A84C]/30 text-[#C9A84C] border border-[#C9A84C]"
                          : "bg-[#0F0D19] text-[#F5F0E8]/60 border border-transparent hover:border-[#C9A84C]/30"
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Currency */}
          <SettingsSection title="Currency" description="Set your preferred currency">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CURRENCIES.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() =>
                    updatePreference("currency", currency.code as UserPreferences["currency"])
                  }
                  className={`p-4 rounded-xl text-center transition-all ${
                    preferences.currency === currency.code
                      ? "bg-[#C9A84C]/30 border border-[#C9A84C]"
                      : "bg-[#07060E] border border-transparent hover:border-[#C9A84C]/30"
                  }`}
                >
                  <span className="text-2xl font-bold text-[#F5F0E8]">
                    {currency.symbol}
                  </span>
                  <p className="text-xs text-[#F5F0E8]/60 mt-1">{currency.code}</p>
                </button>
              ))}
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            title="Notifications"
            description="Manage your notification preferences"
          >
            <div className="space-y-3">
              {[
                {
                  key: "emailNotifications" as const,
                  icon: Bell,
                  title: "Email Notifications",
                  description: "Receive updates about your account",
                },
                {
                  key: "weeklyReports" as const,
                  icon: Database,
                  title: "Weekly Reports",
                  description: "Get a summary of your spending every week",
                },
                {
                  key: "aiInsightsEnabled" as const,
                  icon: Shield,
                  title: "AI Insights",
                  description: "Allow AI to analyze your spending patterns",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 bg-[#07060E] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-[#C9A84C]" />
                    <div>
                      <p className="text-sm font-medium text-[#F5F0E8]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#F5F0E8]/50">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    checked={preferences[item.key]}
                    onChange={(checked) => updatePreference(item.key, checked)}
                  />
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection
            title="Data Management"
            description="Export, import, or reset your data"
          >
            <div className="space-y-3">
              {/* Export */}
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 bg-[#07060E] rounded-xl hover:bg-[#0F0D19] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-[#3DFF6E]" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F0E8]">
                      Export Data
                    </p>
                    <p className="text-xs text-[#F5F0E8]/50">
                      Download a backup of all your data
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-[#F5F0E8]/30 group-hover:text-[#C9A84C] transition-colors"
                />
              </button>

              {/* Import */}
              <label className="w-full flex items-center justify-between p-4 bg-[#07060E] rounded-xl hover:bg-[#0F0D19] transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Upload size={20} className="text-[#C9A84C]" />
                  <div>
                    <p className="text-sm font-medium text-[#F5F0E8]">
                      Import Data
                    </p>
                    <p className="text-xs text-[#F5F0E8]/50">
                      Restore from a backup file
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <ChevronRight
                  size={18}
                  className="text-[#F5F0E8]/30 group-hover:text-[#C9A84C] transition-colors"
                />
              </label>

              {/* Reset */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-between p-4 bg-[#07060E] rounded-xl hover:bg-[#FF6B9D]/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={20} className="text-[#FF6B9D]" />
                  <div>
                    <p className="text-sm font-medium text-[#FF6B9D]">
                      Reset All Data
                    </p>
                    <p className="text-xs text-[#F5F0E8]/50">
                      Delete all transactions and settings
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-[#F5F0E8]/30 group-hover:text-[#FF6B9D] transition-colors"
                />
              </button>
            </div>

            {/* Data Stats */}
            <div className="mt-6 p-4 bg-[#07060E] rounded-xl">
              <p className="text-xs font-medium text-[#F5F0E8]/40 uppercase tracking-wider mb-3">
                Data Statistics
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-[#F5F0E8]">
                    {dataStats.transactions}
                  </p>
                  <p className="text-xs text-[#F5F0E8]/50">Transactions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#F5F0E8]">
                    {dataStats.insights}
                  </p>
                  <p className="text-xs text-[#F5F0E8]/50">Insights</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#F5F0E8]">
                    {dataStats.lastSync ? "Synced" : "Never"}
                  </p>
                  <p className="text-xs text-[#F5F0E8]/50">Last Sync</p>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#0F0D19] border border-[#FF6B9D]/30 rounded-2xl p-6 max-w-md mx-4">
              <h3 className="text-xl font-bold text-[#F5F0E8] mb-2">
                Reset All Data?
              </h3>
              <p className="text-[#F5F0E8]/60 mb-6">
                This will permanently delete all your transactions, insights,
                and settings. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-[#C9A84C]/30 text-[#F5F0E8] hover:bg-[#C9A84C]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#FF6B9D]/20 text-[#FF6B9D] hover:bg-[#FF6B9D]/30 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Success Toast */}
        {showImportSuccess && (
          <div className="fixed bottom-6 right-6 bg-[#3DFF6E]/20 border border-[#3DFF6E] text-[#3DFF6E] px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <Check size={18} />
            <span>Data imported successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
