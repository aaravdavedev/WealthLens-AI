"use client";

import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Filler, Tooltip, Legend,
    type ChartData, type ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut, Scatter } from "react-chartjs-2";

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Filler, Tooltip, Legend
);

const GOLD = "#C9A84C";
const GREEN = "#3DFF6E";
const PINK = "#FF6B9D";
const LIGHT = "rgba(245,240,232,0.7)";

const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr↗", "May↗", "Jun↗"];

// ── 1. LINE FORECAST ──────────────────────────────────────────────────────
export function ForecastChart({ forecast }: { forecast?: number[] }) {
    const historical = [62000, 68000, 71000, 65000, 74000, 70000, 78000, 83420];
    const future = forecast ?? [87200, 91400, 88700];
    const labels = [...months.slice(0, historical.length), ...months.slice(historical.length, historical.length + future.length)];

    const data: ChartData<"line"> = {
        labels,
        datasets: [
            {
                label: "Historical",
                data: [...historical, ...Array(future.length).fill(null)],
                borderColor: GOLD,
                backgroundColor: "rgba(201,168,76,0.08)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: GOLD,
            },
            {
                label: "ARIMA Forecast",
                data: [...Array(historical.length - 1).fill(null), historical[historical.length - 1], ...future],
                borderColor: GREEN,
                backgroundColor: "rgba(61,255,110,0.06)",
                fill: true,
                tension: 0.4,
                borderDash: [6, 3],
                pointRadius: 4,
                pointBackgroundColor: GREEN,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: { labels: { color: LIGHT, font: { family: "Outfit" } } },
            tooltip: { backgroundColor: "#0F0D19", borderColor: GOLD, borderWidth: 1 },
        },
        scales: {
            x: { ticks: { color: LIGHT }, grid: { color: "rgba(201,168,76,0.06)" } },
            y: { ticks: { color: LIGHT, callback: (v) => `₹${Number(v).toLocaleString("en-IN")}` }, grid: { color: "rgba(201,168,76,0.06)" } },
        },
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 14 }}>
                ✦ ARIMA(2,1,2) · 6-MONTH FORECAST · MAPE 6.8%
            </div>
            <Line data={data} options={options} />
        </div>
    );
}

// ── 2. STACKED BAR ────────────────────────────────────────────────────────
export function StackedBarChart() {
    const data: ChartData<"bar"> = {
        labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        datasets: [
            { label: "Housing", data: [2800, 2840, 2840, 2840, 2840, 2840], backgroundColor: "rgba(201,168,76,0.75)" },
            { label: "Food", data: [1600, 1720, 1900, 1750, 1830, 1830], backgroundColor: "rgba(61,255,110,0.65)" },
            { label: "Transport", data: [1100, 1180, 1300, 1200, 1250, 1250], backgroundColor: "rgba(255,107,157,0.65)" },
            { label: "Investments", data: [1200, 1350, 1400, 1380, 1420, 1420], backgroundColor: "rgba(240,208,128,0.55)" },
            { label: "Leisure", data: [800, 900, 1100, 950, 1000, 1000], backgroundColor: "rgba(142,255,139,0.55)" },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        scales: {
            x: { stacked: true, ticks: { color: LIGHT }, grid: { color: "rgba(201,168,76,0.05)" } },
            y: { stacked: true, ticks: { color: LIGHT, callback: (v) => `₹${Number(v) / 1000}k` }, grid: { color: "rgba(201,168,76,0.05)" } },
        },
        plugins: {
            legend: { labels: { color: LIGHT, font: { family: "Outfit", size: 11 } } },
            tooltip: { backgroundColor: "#0F0D19", borderColor: GOLD, borderWidth: 1 },
        },
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 14 }}>◈ STACKED SPEND BREAKDOWN</div>
            <Bar data={data} options={options} />
        </div>
    );
}

// ── 3. AREA CHART (Net Worth Growth) ─────────────────────────────────────
export function AreaChart() {
    const data: ChartData<"line"> = {
        labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        datasets: [{
            label: "Net Worth (₹)",
            data: [61000, 64200, 67800, 70100, 73400, 77200, 80100, 82600, 84320],
            borderColor: GOLD,
            backgroundColor: "rgba(201,168,76,0.12)",
            fill: true,
            tension: 0.5,
            pointRadius: 3,
            pointBackgroundColor: GOLD,
        }],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: "#0F0D19", borderColor: GOLD, borderWidth: 1 },
        },
        scales: {
            x: { ticks: { color: LIGHT }, grid: { color: "rgba(201,168,76,0.05)" } },
            y: { ticks: { color: LIGHT, callback: (v) => `₹${Number(v) / 1000}k` }, grid: { color: "rgba(201,168,76,0.05)" } },
        },
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 14 }}>⬡ NET WORTH TRAJECTORY</div>
            <Line data={data} options={options} />
        </div>
    );
}

// ── 4. PIE / DOUGHNUT ─────────────────────────────────────────────────────
export function PieChart() {
    const data: ChartData<"doughnut"> = {
        labels: ["Housing 34%", "Investments 17%", "Food 22%", "Transport 15%", "Leisure 12%"],
        datasets: [{
            data: [34, 17, 22, 15, 12],
            backgroundColor: ["rgba(201,168,76,0.8)", "rgba(240,208,128,0.75)", "rgba(61,255,110,0.75)", "rgba(255,107,157,0.75)", "rgba(142,255,139,0.65)"],
            borderColor: "#07060E",
            borderWidth: 3,
        }],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        cutout: "68%",
        plugins: {
            legend: { position: "bottom", labels: { color: LIGHT, font: { family: "Outfit", size: 11 }, padding: 16 } },
            tooltip: { backgroundColor: "#0F0D19", borderColor: GOLD, borderWidth: 1 },
        },
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 14 }}>◉ CATEGORY ALLOCATION</div>
            <Doughnut data={data} options={options} />
        </div>
    );
}

// ── 5. SCATTER (Income vs Expenses) ──────────────────────────────────────
export function ScatterChart() {
    const data: ChartData<"scatter"> = {
        datasets: [{
            label: "Monthly Snapshot",
            data: [
                { x: 95000, y: 68000 }, { x: 98000, y: 71000 }, { x: 101000, y: 74000 },
                { x: 97000, y: 70000 }, { x: 103000, y: 78000 }, { x: 106000, y: 83420 },
            ],
            backgroundColor: GOLD,
            pointRadius: 7,
            pointHoverRadius: 10,
        }],
    };

    const options: ChartOptions<"scatter"> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#0F0D19", borderColor: GOLD, borderWidth: 1,
                callbacks: { label: (ctx) => `Income ₹${(ctx.parsed.x ?? 0).toLocaleString("en-IN")} · Spend ₹${(ctx.parsed.y ?? 0).toLocaleString("en-IN")}` },
            },
        },
        scales: {
            x: { title: { display: true, text: "Income (₹)", color: LIGHT }, ticks: { color: LIGHT, callback: (v) => `₹${Number(v) / 1000}k` }, grid: { color: "rgba(201,168,76,0.05)" } },
            y: { title: { display: true, text: "Expenses (₹)", color: LIGHT }, ticks: { color: LIGHT, callback: (v) => `₹${Number(v) / 1000}k` }, grid: { color: "rgba(201,168,76,0.05)" } },
        },
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 14 }}>✦ INCOME vs EXPENSES SCATTER</div>
            <Scatter data={data} options={options} />
        </div>
    );
}

// ── 6. WATERFALL (Cash Flow) ─────────────────────────────────────────────
export function WaterfallChart() {
    const items = [
        { label: "Income", value: 106000, type: "positive" },
        { label: "Housing", value: -2840, type: "negative" },
        { label: "Food", value: -1830, type: "negative" },
        { label: "Transport", value: -1250, type: "negative" },
        { label: "Invest", value: -1420, type: "negative" },
        { label: "Leisure", value: -1000, type: "negative" },
        { label: "Net", value: 97660, type: "total" },
    ];

    // Build stacked bar: invisible base + colored delta
    let running = 0;
    const bases: number[] = [];
    const deltas: number[] = [];
    const colors: string[] = [];

    for (const item of items) {
        if (item.type === "total") {
            bases.push(0);
            deltas.push(item.value);
            colors.push("rgba(201,168,76,0.85)");
        } else {
            bases.push(item.type === "positive" ? 0 : running + item.value);
            deltas.push(Math.abs(item.value));
            colors.push(item.type === "positive" ? "rgba(61,255,110,0.8)" : "rgba(255,107,157,0.75)");
            running += item.value;
        }
    }

    const data: ChartData<"bar"> = {
        labels: items.map((i) => i.label),
        datasets: [
            { data: bases, backgroundColor: "transparent", stack: "s" },
            { data: deltas, backgroundColor: colors, stack: "s", borderRadius: 4 },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#0F0D19", borderColor: GOLD, borderWidth: 1,
                callbacks: {
                    label: (ctx) =>
                        ctx.datasetIndex === 1
                            ? `₹${items[ctx.dataIndex].value.toLocaleString("en-IN")}`
                            : "",
                },
            },
        },
        scales: {
            x: { stacked: true, ticks: { color: LIGHT }, grid: { display: false } },
            y: { stacked: true, ticks: { color: LIGHT, callback: (v) => `₹${Number(v) / 1000}k` }, grid: { color: "rgba(201,168,76,0.05)" } },
        },
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 14 }}>⬟ WATERFALL · CASH FLOW BRIDGE</div>
            <Bar data={data} options={options} />
        </div>
    );
}

// ── 7. HEATMAP CALENDAR (Daily Spend) ────────────────────────────────────
export function HeatmapCalendar() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeks = 8;
    const spends = Array.from({ length: weeks * 7 }, () =>
        Math.round(Math.random() * 4000 + 200)
    );

    const maxSpend = Math.max(...spends);

    const toColor = (val: number) => {
        const intensity = val / maxSpend;
        if (intensity > 0.75) return `rgba(255,107,157,${0.5 + intensity * 0.5})`;
        if (intensity > 0.4) return `rgba(201,168,76,${0.3 + intensity * 0.6})`;
        return `rgba(61,255,110,${0.15 + intensity * 0.4})`;
    };

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 16 }}>◈ DAILY SPEND HEATMAP · LAST 8 WEEKS</div>
            <div style={{ display: "flex", gap: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 24 }}>
                    {days.map((d) => (
                        <div key={d} style={{ fontFamily: "Outfit", fontSize: 10, color: "rgba(245,240,232,0.3)", height: 18, lineHeight: "18px" }}>{d}</div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: weeks }, (_, w) => (
                        <div key={w} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ fontFamily: "Outfit", fontSize: 9, color: "rgba(245,240,232,0.2)", textAlign: "center", marginBottom: 4 }}>
                                W{w + 1}
                            </div>
                            {Array.from({ length: 7 }, (_, d) => {
                                const idx = w * 7 + d;
                                const val = spends[idx];
                                return (
                                    <div
                                        key={d}
                                        title={`₹${val.toLocaleString("en-IN")}`}
                                        style={{
                                            width: 18, height: 18, borderRadius: 3,
                                            background: toColor(val),
                                            cursor: "default",
                                            transition: "transform 0.15s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.4)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
                <span style={{ fontFamily: "Outfit", fontSize: 9, color: "rgba(245,240,232,0.3)" }}>Low</span>
                {["rgba(61,255,110,0.3)", "rgba(201,168,76,0.5)", "rgba(201,168,76,0.8)", "rgba(255,107,157,0.7)", "rgba(255,107,157,1)"].map((c, i) => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />
                ))}
                <span style={{ fontFamily: "Outfit", fontSize: 9, color: "rgba(245,240,232,0.3)" }}>High</span>
            </div>
        </div>
    );
}

// ── 8. SANKEY FLOW (SVG-based) ────────────────────────────────────────────
export function SankeyFlow() {
    const nodes = [
        { id: "income", label: "Income", x: 40, y: 180, w: 18, h: 260, color: "rgba(61,255,110,0.8)" },
        { id: "housing", label: "Housing 34%", x: 320, y: 20, w: 16, h: 88, color: "rgba(201,168,76,0.8)" },
        { id: "invest", label: "Invest 17%", x: 320, y: 118, w: 16, h: 44, color: "rgba(240,208,128,0.8)" },
        { id: "food", label: "Food 22%", x: 320, y: 172, w: 16, h: 57, color: "rgba(142,255,139,0.75)" },
        { id: "transport", label: "Transport 15%", x: 320, y: 239, w: 16, h: 39, color: "rgba(255,107,157,0.75)" },
        { id: "leisure", label: "Leisure 12%", x: 320, y: 288, w: 16, h: 31, color: "rgba(255,200,100,0.7)" },
    ];

    const flows = [
        { from: "income", to: "housing", color: "rgba(201,168,76,0.15)" },
        { from: "income", to: "invest", color: "rgba(240,208,128,0.12)" },
        { from: "income", to: "food", color: "rgba(142,255,139,0.12)" },
        { from: "income", to: "transport", color: "rgba(255,107,157,0.12)" },
        { from: "income", to: "leisure", color: "rgba(255,200,100,0.12)" },
    ];

    const getNode = (id: string) => nodes.find((n) => n.id === id)!;

    return (
        <div style={{ background: "rgba(15,13,25,0.8)", borderRadius: 12, padding: "20px 24px", border: "1px solid rgba(201,168,76,0.14)" }}>
            <div style={{ fontFamily: "Outfit", fontSize: 10, letterSpacing: "0.2em", color: GOLD, marginBottom: 16 }}>⬡ SANKEY · MONEY FLOW</div>
            <svg viewBox="0 0 420 340" style={{ width: "100%", height: "auto" }}>
                {/* Flows */}
                {flows.map((f) => {
                    const src = getNode(f.from);
                    const dst = getNode(f.to);
                    const x1 = src.x + src.w;
                    const y1 = src.y + src.h / 2;
                    const x2 = dst.x;
                    const y2 = dst.y + dst.h / 2;
                    const cx = (x1 + x2) / 2;
                    return (
                        <path
                            key={f.to}
                            d={`M${x1},${src.y} C${cx},${src.y} ${cx},${dst.y} ${x2},${dst.y} L${x2},${dst.y + dst.h} C${cx},${dst.y + dst.h} ${cx},${src.y + src.h} ${x1},${src.y + src.h} Z`}
                            fill={f.color}
                            stroke="none"
                        />
                    );
                })}
                {/* Nodes */}
                {nodes.map((n) => (
                    <g key={n.id}>
                        <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={4} fill={n.color} />
                        <text
                            x={n.id === "income" ? n.x - 6 : n.x + n.w + 8}
                            y={n.y + n.h / 2}
                            dominantBaseline="middle"
                            textAnchor={n.id === "income" ? "end" : "start"}
                            fill="rgba(245,240,232,0.7)"
                            fontSize={10}
                            fontFamily="Outfit"
                        >
                            {n.label}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}

// ── FULL DASHBOARD EXPORT ─────────────────────────────────────────────────
export default function FinancialDashboard() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20, padding: "0 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
            <ForecastChart />
            <StackedBarChart />
            <AreaChart />
            <PieChart />
            <ScatterChart />
            <WaterfallChart />
            <HeatmapCalendar />
            <SankeyFlow />
        </div>
    );
}