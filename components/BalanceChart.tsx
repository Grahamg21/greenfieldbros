"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

type DataPoint = { date: string; pl: number };
type TimelineData = { chart: DataPoint[]; currentBalance: number | null };

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const positive = val >= 0;
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-muted mb-1">{label}</p>
      <p className={`font-bold text-sm ${positive ? "text-neon" : "text-red-400"}`}>
        {positive ? "+" : ""}${val.toFixed(2)}
      </p>
      <p className="text-muted text-xs">cumulative P&amp;L</p>
    </div>
  );
}

export default function BalanceChart() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/kalshi/timeline?player=graham")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const chart = data?.chart ?? [];
  const currentBalance = data?.currentBalance;
  const lastPL = chart[chart.length - 1]?.pl ?? 0;
  const isUp = lastPL >= 0;

  // Y axis domain with padding
  const values = chart.map((d) => d.pl);
  const minVal = Math.min(...values, 0) - Math.abs(Math.min(...values, 0)) * 0.15 - 2;
  const maxVal = Math.max(...values, 0) + Math.abs(Math.max(...values, 0)) * 0.15 + 2;

  if (loading) {
    return <div className="h-64 card animate-pulse bg-surface-2 rounded-xl" />;
  }

  if (!chart.length) {
    return (
      <div className="h-64 card flex items-center justify-center text-muted text-sm">
        Sync your bets to see the P&amp;L timeline
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-muted text-xs font-mono tracking-widest uppercase">Current Balance</p>
          {currentBalance != null ? (
            <p className="text-4xl font-bold font-mono mt-1 text-text">
              ${currentBalance.toFixed(2)}
            </p>
          ) : (
            <p className="text-4xl font-bold font-mono mt-1 text-muted">—</p>
          )}
          <p className="text-muted text-xs mt-1 font-mono">live from Kalshi</p>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs font-mono tracking-widest uppercase">All-Time P&amp;L</p>
          <p className={`text-3xl font-bold font-mono mt-1 ${isUp ? "text-neon" : "text-red-400"}`}>
            {isUp ? "+" : ""}${lastPL.toFixed(2)}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className={`text-xs font-mono ${isUp ? "text-neon/70" : "text-red-400/70"}`}>
              {isUp ? "▲ profit" : "▼ loss"} on settled bets
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <p className="text-muted text-xs font-mono mb-3 tracking-widest uppercase">P&amp;L Over Time</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? "#00ff9f" : "#ef4444"} stopOpacity={0.2} />
              <stop offset="95%" stopColor={isUp ? "#00ff9f" : "#ef4444"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v >= 0 ? "+" : ""}$${v.toFixed(0)}`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke="#6b7280"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{ value: "breakeven", position: "insideTopRight", fontSize: 9, fill: "#6b7280" }}
          />
          <Area
            type="monotone"
            dataKey="pl"
            stroke={isUp ? "#00ff9f" : "#ef4444"}
            strokeWidth={2}
            fill="url(#plGrad)"
            dot={false}
            activeDot={{ r: 4, fill: isUp ? "#00ff9f" : "#ef4444", stroke: "#0a0a0f", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
