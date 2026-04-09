"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

type DataPoint = { date: string; balance: number };
type TimelineData = { chart: DataPoint[]; currentBalance: number | null };

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const positive = val >= 100;
  return (
    <div className="bg-surface border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-muted mb-1">{label}</p>
      <p className={`font-bold text-sm ${positive ? "text-neon" : "text-red-400"}`}>
        ${val.toFixed(2)}
      </p>
      <p className={`text-xs ${positive ? "text-neon/60" : "text-red-400/60"}`}>
        {val >= 100 ? "+" : ""}${(val - 100).toFixed(2)} vs start
      </p>
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
  const current = data?.currentBalance;
  const first = chart[0]?.balance ?? 100;
  const last = chart[chart.length - 1]?.balance ?? 100;
  const allTime = current ?? last;
  const totalReturn = allTime - 100;
  const isUp = totalReturn >= 0;

  // Y axis domain with padding
  const values = chart.map((d) => d.balance);
  const minVal = Math.min(...values, allTime) * 0.9;
  const maxVal = Math.max(...values, allTime) * 1.1;

  if (loading) {
    return <div className="h-64 card animate-pulse bg-surface-2 rounded-xl" />;
  }

  if (!chart.length) {
    return (
      <div className="h-64 card flex items-center justify-center text-muted text-sm">
        Sync your bets to see the balance timeline
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-muted text-xs font-mono tracking-widest uppercase">Account Balance</p>
          <p className={`text-4xl font-bold font-mono mt-1 ${isUp ? "text-neon" : "text-red-400"}`}>
            ${allTime.toFixed(2)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm font-mono ${isUp ? "text-neon" : "text-red-400"}`}>
              {isUp ? "▲" : "▼"} {isUp ? "+" : ""}${totalReturn.toFixed(2)}
            </span>
            <span className="text-muted text-xs">vs $100 start</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-muted text-xs font-mono">Started with</p>
          <p className="text-text font-mono font-bold">$100.00</p>
          <p className={`text-xs font-mono mt-1 ${isUp ? "text-neon" : "text-red-400"}`}>
            {isUp ? "+" : ""}{((totalReturn / 100) * 100).toFixed(1)}% all time
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={100}
            stroke="#6b7280"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{ value: "Start $100", position: "insideTopRight", fontSize: 9, fill: "#6b7280" }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={isUp ? "#00ff9f" : "#ef4444"}
            strokeWidth={2}
            fill="url(#balanceGrad)"
            dot={false}
            activeDot={{ r: 4, fill: isUp ? "#00ff9f" : "#ef4444", stroke: "#0a0a0f", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
