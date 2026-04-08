import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const text = await file.text();
    const rows = text.split("\n").slice(1);

    let totalSpent = 0;
    let categories: Record<string, number> = {};

    for (let row of rows) {
      const cols = row.split(",");

      const description = cols[1]?.toLowerCase() || "";
      const amount = parseFloat(cols[2]) || 0;

      totalSpent += amount;

      // 🔥 SMART CATEGORY DETECTION
      let category = "Other";

      if (description.includes("swiggy") || description.includes("zomato"))
        category = "Food";
      else if (description.includes("uber") || description.includes("ola"))
        category = "Transport";
      else if (description.includes("amazon") || description.includes("flipkart"))
        category = "Shopping";
      else if (description.includes("netflix") || description.includes("spotify"))
        category = "Entertainment";

      categories[category] = (categories[category] || 0) + amount;
    }

    // 🔥 CONVERT TO ARRAY
    const spending = Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
    }));

    // 🔥 UNIQUE SUMMARY
    const summary = `You spent ₹${totalSpent.toFixed(
      0
    )} across ${spending.length} categories.`;

    // 🔥 AROMA ENGINE (this is your "vibe")
    let aroma = "Balanced financial behavior";

    if (categories["Food"] > totalSpent * 0.4)
      aroma = "High food spending, lifestyle heavy";
    else if (categories["Shopping"] > totalSpent * 0.4)
      aroma = "Impulse spending detected";
    else if (categories["Transport"] > totalSpent * 0.4)
      aroma = "High mobility lifestyle";

    // 🔥 INSIGHTS
    const insights = [
      `Top category: ${spending.sort((a, b) => b.amount - a.amount)[0]?.category
      }`,
      `Total spend: ₹${totalSpent}`,
      `Number of transactions: ${rows.length}`,
    ];

    return NextResponse.json({
      summary,
      aroma,
      insights,
      spending,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to analyze" });
  }
}