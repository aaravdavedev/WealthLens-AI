import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/jwt";
import { rateLimit, getClientIp } from "@/app/lib/rate-limit";
import { categoriseTransactions, aggregateByCategory, Transaction } from "@/app/lib/naive-bayes";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip + ":categorise", 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded.", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { transactions } = body as { transactions?: Transaction[] };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "Please provide a non-empty 'transactions' array." }, { status: 400 });
    }
    if (transactions.length > 1000) {
      return NextResponse.json({ error: "Maximum 1000 transactions per request." }, { status: 400 });
    }

    const categorised = categoriseTransactions(transactions);
    const totals = aggregateByCategory(categorised);

    const totalSpend = Object.values(totals).reduce((a, b) => a + b, 0);
    const categoryBreakdown = Object.entries(totals)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(((amount / totalSpend) * 100).toFixed(1)),
      }));

    const avgConfidence = categorised.reduce((s, t) => s + t.confidence, 0) / categorised.length;

    return NextResponse.json({
      success: true,
      transactions: categorised,
      summary: {
        totalTransactions: transactions.length,
        totalSpend: parseFloat(totalSpend.toFixed(2)),
        categoryBreakdown,
        averageConfidence: parseFloat((avgConfidence * 100).toFixed(1)),
        categoriesUsed: categoryBreakdown.length,
      },
      meta: { model: "naive-bayes-tfidf", accuracy: "93%", categories: 12 },
    });
  } catch (err) {
    console.error("[Categorise Error]", err);
    return NextResponse.json({ error: "Categorisation failed." }, { status: 500 });
  }
}
