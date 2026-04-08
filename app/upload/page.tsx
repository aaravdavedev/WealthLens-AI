"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { addTransactions } from "@/app/lib/store";
import type { Transaction, Category } from "@/app/lib/types";

// File type icons
const FILE_ICONS: Record<string, React.ReactNode> = {
  "text/csv": (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C9A84C"
      strokeWidth="2"
    >
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2M8 17h2M12 13h4M12 17h4" />
    </svg>
  ),
  "application/pdf": (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF6B9D"
      strokeWidth="2"
    >
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12v6M7 15h6" />
    </svg>
  ),
};

// Smart categorization based on description
function categorizeTransaction(description: string): Category {
  const desc = description.toLowerCase();

  if (/swiggy|zomato|uber.?eats|doordash|grubhub|restaurant|food|coffee|starbucks|mcdonald|kfc/i.test(desc))
    return "Food & Dining";

  if (/uber|lyft|ola|taxi|transit|gas|shell|bp|fuel|car|auto|vehicle/i.test(desc))
    return "Transportation";

  if (/amazon|ebay|shop|store|walmart|target|best.?buy|purchase/i.test(desc))
    return "Shopping";

  if (/netflix|spotify|hulu|disney|apple|music|game|entertainment/i.test(desc))
    return "Entertainment";

  if (/electric|water|gas|utility|phone|internet|bill|insurance/i.test(desc))
    return "Utilities";

  if (/rent|mortgage|housing|apartment|lease|property/i.test(desc))
    return "Housing";

  if (/hospital|doctor|medical|pharmacy|health|clinic|dental/i.test(desc))
    return "Healthcare";

  if (/stock|invest|broker|dividend|trading|crypto|etf/i.test(desc))
    return "Investments";

  if (/salary|deposit|payroll|income|wage|refund/i.test(desc))
    return "Income";

  return "Other";
}

// Parse CSV content
function parseCSV(content: string): Omit<Transaction, "id" | "createdAt">[] {
  const lines = content.split("\n").filter((line) => line.trim());
  const transactions: Omit<Transaction, "id" | "createdAt">[] = [];

  // Try to detect header
  const hasHeader = /date|description|amount|transaction/i.test(lines[0]);
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Try different CSV delimiters
    const parts = line.includes(",") ? line.split(",") : line.split("\t");

    if (parts.length >= 2) {
      // Try to find date, description, and amount
      let date = "";
      let description = "";
      let amount = 0;

      // Simple heuristic parsing
      for (let j = 0; j < parts.length; j++) {
        const part = parts[j].trim().replace(/^["']|["']$/g, "");

        // Check if it's a date
        if (!date && /\d{1,4}[/-]\d{1,2}[/-]\d{1,4}/.test(part)) {
          date = part;
        }
        // Check if it's an amount
        else if (amount === 0 && /[\d,]+\.?\d*/.test(part.replace(/[$,]/g, ""))) {
          const num = parseFloat(part.replace(/[$,\s]/g, ""));
          if (!isNaN(num) && num !== 0) {
            amount = num;
          }
        }
        // Otherwise it's description
        else if (!description && part.length > 2) {
          description = part;
        }
      }

      // Default to today if no date found
      if (!date) {
        date = new Date().toISOString().split("T")[0];
      }

      // Format date consistently
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split("T")[0];
      }

      if (description && amount !== 0) {
        const category = categorizeTransaction(description);

        transactions.push({
          date,
          description,
          amount: amount > 0 ? amount : -Math.abs(amount), // Negative for expenses
          category,
          source: "csv",
        });
      }
    }
  }

  return transactions;
}

// Parse simple text (for demo purposes, extract transactions)
function parseText(content: string): Omit<Transaction, "id" | "createdAt">[] {
  const transactions: Omit<Transaction, "id" | "createdAt">[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Look for patterns like: Date, Description, Amount
    const match = line.match(
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+?)\s+([\d,]+\.?\d*)/);
    if (match) {
      const [, dateStr, description, amountStr] = match;
      const amount = parseFloat(amountStr.replace(/,/g, ""));

      if (description && !isNaN(amount)) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          transactions.push({
            date: date.toISOString().split("T")[0],
            description: description.trim(),
            amount: -Math.abs(amount),
            category: categorizeTransaction(description),
            source: "pdf",
          });
        }
      }
    }
  }

  return transactions;
}

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "processing" | "success" | "error";
  progress: number;
  transactions: Omit<Transaction, "id" | "createdAt">[];
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: "pending" as const,
      progress: 0,
      transactions: [],
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const processFiles = async () => {
    setIsUploading(true);

    for (const fileItem of files) {
      if (fileItem.status !== "pending") continue;

      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "processing" } : f
        )
      );

      try {
        const content = await fileItem.file.text();
        let transactions: Omit<Transaction, "id" | "createdAt">[] = [];

        if (fileItem.file.name.endsWith(".csv")) {
          transactions = parseCSV(content);
        } else if (fileItem.file.name.endsWith(".pdf")) {
          // For PDF, we'd need pdf-parse library in production
          // For now, try to extract text patterns
          transactions = parseText(content);
        }

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (transactions.length > 0) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: "success", progress: 100, transactions }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    status: "error",
                    error: "No valid transactions found in file",
                  }
                : f
            )
          );
        }
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "error", error: "Failed to parse file" }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const saveTransactions = () => {
    const allTransactions = files
      .filter((f) => f.status === "success")
      .flatMap((f) => f.transactions);

    if (allTransactions.length > 0) {
      addTransactions(allTransactions);
      setSuccess(true);
      setFiles([]);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const successfulFiles = files.filter((f) => f.status === "success");
  const totalTransactions = successfulFiles.reduce(
    (sum, f) => sum + f.transactions.length,
    0
  );

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 size={20} className="animate-spin text-[#C9A84C]" />;
      case "success":
        return <Check size={20} className="text-[#3DFF6E]" />;
      case "error":
        return <AlertCircle size={20} className="text-[#FF6B9D]" />;
      default:
        return <FileText size={20} className="text-[#F5F0E8]/60" />;
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-[#C9A84C]/20">
              <Upload size={24} className="text-[#C9A84C]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#F5F0E8]">Upload Data</h1>
              <p className="text-[#F5F0E8]/60">
                Import your bank statements for AI analysis
              </p>
            </div>
          </div>
        </header>

        {/* Drop Zone */}
        {files.length === 0 && (
          <div
            {...getRootProps()}
            className={`
              p-12 border-2 border-dashed rounded-2xl cursor-pointer
              transition-all duration-300 text-center
              ${
                isDragActive
                  ? "border-[#C9A84C] bg-[#C9A84C]/10"
                  : "border-[#C9A84C]/30 hover:border-[#C9A84C]/60 bg-[#0F0D19]/50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <Upload size={32} className="text-[#C9A84C]" />
            </div>
            <p className="text-xl font-semibold text-[#F5F0E8] mb-2">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-[#F5F0E8]/50 mb-4">
              or click to browse
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="px-3 py-1 rounded-full bg-[#07060E] text-xs text-[#F5F0E8]/60">
                .CSV
              </span>
              <span className="px-3 py-1 rounded-full bg-[#07060E] text-xs text-[#F5F0E8]/60">
                .PDF
              </span>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            {/* Continue adding files */}
            <div
              {...getRootProps()}
              className="p-4 border-2 border-dashed border-[#C9A84C]/20 rounded-xl cursor-pointer hover:border-[#C9A84C]/40 transition-colors text-center"
            >
              <input {...getInputProps()} />
              <p className="text-sm text-[#F5F0E8]/60">
                + Add more files
              </p>
            </div>

            {/* Files */}
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${
                      file.status === "success"
                        ? "bg-[#3DFF6E]/5 border-[#3DFF6E]/30"
                        : file.status === "error"
                        ? "bg-[#FF6B9D]/5 border-[#FF6B9D]/30"
                        : "bg-[#0F0D19] border-[#C9A84C]/20"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* File Icon */}
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                        ${file.status === "processing" ? "animate-pulse" : ""}
                      `}
                      style={{
                        background:
                          file.status === "success"
                            ? "rgba(61, 255, 110, 0.1)"
                            : file.status === "error"
                            ? "rgba(255, 107, 157, 0.1)"
                            : "rgba(201, 168, 76, 0.1)",
                      }}
                    >
                      {FILE_ICONS[file.file.type] || FILE_ICONS["text/csv"]}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F0E8] truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#F5F0E8]/50">
                          {(file.file.size / 1024).toFixed(1)} KB
                        </span>
                        {file.status === "success" && (
                          <span className="text-xs text-[#3DFF6E]">
                            {file.transactions.length} transactions found
                          </span>
                        )}
                        {file.error && (
                          <span className="text-xs text-[#FF6B9D]">
                            {file.error}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {file.status === "processing" && (
                        <div className="mt-2 h-1 bg-[#07060E] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C9A84C] transition-all duration-500"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status/Remove */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <button
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === "processing"}
                        className="p-2 rounded-lg hover:bg-white/5 text-[#F5F0E8]/40 hover:text-[#FF6B9D] transition-colors disabled:opacity-50"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setFiles([])}
                disabled={isUploading}
                className="px-6 py-3 rounded-xl border border-[#C9A84C]/30 text-[#F5F0E8] font-medium hover:bg-[#C9A84C]/10 transition-colors disabled:opacity-50"
              >
                Clear All
              </button>

              {!isUploading && successfulFiles.length === 0 && (
                <button
                  onClick={processFiles}
                  disabled={files.every((f) => f.status !== "pending")}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] font-medium hover:bg-[#C9A84C]/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Process Files
                </button>
              )}

              {successfulFiles.length > 0 && (
                <button
                  onClick={saveTransactions}
                  className="flex-1 px-6 py-3 rounded-xl bg-[#3DFF6E]/20 text-[#3DFF6E] font-medium hover:bg-[#3DFF6E]/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Import {totalTransactions} Transactions
                </button>
              )}
            </div>

            {/* Summary */}
            {successfulFiles.length > 0 && (
              <div className="p-4 bg-[#07060E] rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#C9A84C]">
                      {files.length}
                    </p>
                    <p className="text-xs text-[#F5F0E8]/50">Files</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#3DFF6E]">
                      {successfulFiles.length}
                    </p>
                    <p className="text-xs text-[#F5F0E8]/50">Processed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#F5F0E8]">
                      {totalTransactions}
                    </p>
                    <p className="text-xs text-[#F5F0E8]/50">Transactions</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gradient-to-br from-[#0F0D19]/80 to-transparent border border-[#C9A84C]/20 rounded-2xl">
          <h3 className="text-lg font-semibold text-[#F5F0E8] mb-4">
            Supported Formats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#07060E] rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                {FILE_ICONS["text/csv"]}
                <span className="font-medium text-[#F5F0E8]">CSV Files</span>
              </div>
              <p className="text-sm text-[#F5F0E8]/50">
                Most banks export statements as CSV. We automatically detect
                dates, descriptions, and amounts.
              </p>
            </div>
            <div className="p-4 bg-[#07060E] rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                {FILE_ICONS["application/pdf"]}
                <span className="font-medium text-[#F5F0E8]">PDF Statements</span>
              </div>
              <p className="text-sm text-[#F5F0E8]/50">
                Upload PDF bank statements. Text extraction may vary by bank.
              </p>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {success && (
          <div className="fixed bottom-6 right-6 bg-[#3DFF6E]/20 border border-[#3DFF6E] text-[#3DFF6E] px-6 py-4 rounded-xl flex items-center gap-3">
            <Check size={24} />
            <div>
              <p className="font-medium">Import Successful!</p>
              <p className="text-sm opacity-80">
                {totalTransactions} transactions added to your account
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
