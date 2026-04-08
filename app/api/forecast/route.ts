import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/jwt";
import { rateLimit, getClientIp } from "@/app/lib/rate-limit";
import { sarimaForecast } from "@/app/lib/arima";

export async function POST(req: NextRequest) {
  // Rate limit: 20 req/min per IP
  const ip = getClientIp(req);
  const limit = rateLimit(ip + ":forecast", 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded.", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter), "X-RateLimit-Remaining": "0" } }
    );
  }

  // JWT authentication
  try {
    requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      series,
      steps = 6,
      seasonal = true,
      seasonalPeriod = 12,
    } = body as {
      series?: number[];
      steps?: number;
      seasonal?: boolean;
      seasonalPeriod?: number;
    };

    if (!series || !Array.isArray(series) || series.length < 6) {
      return NextResponse.json({ error: "Please provide at least 6 data points in 'series'." }, { status: 400 });
    }
    if (steps < 1 || steps > 24) {
      return NextResponse.json({ error: "'steps' must be between 1 and 24." }, { status: 400 });
    }

    const result = sarimaForecast(series, steps, seasonal ? seasonalPeriod : 1);

    return NextResponse.json(
      {
        success: true,
        model: result.model,
        forecast: result.forecast,
        lowerCI: result.lowerCI,
        upperCI: result.upperCI,
        forecastLabels: result.labels,
        metrics: {
          mape: parseFloat(result.metrics.mape.toFixed(2)),
          rmse: parseFloat(result.metrics.rmse.toFixed(2)),
          mae: parseFloat(result.metrics.mae.toFixed(2)),
          naiveRMSE: parseFloat(result.metrics.naiveBaseline.toFixed(2)),
          improvementOverNaive: parseFloat(result.metrics.improvementOverNaive.toFixed(1)),
        },
        meta: {
          inputLength: series.length,
          stepsForecasted: steps,
          seasonal,
        },
      },
      { headers: { "X-RateLimit-Remaining": String(limit.remaining) } }
    );
  } catch (err) {
    console.error("[Forecast Error]", err);
    return NextResponse.json({ error: "Forecasting failed. Please check your data." }, { status: 500 });
  }
}
