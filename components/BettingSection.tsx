"use client";
import { useEffect, useState } from "react";
import BalanceChart from "./BalanceChart";

type Bet = {
  id: string;
  market_title: string;
  category: string;
  side: string;
  contracts: number;
  total_cost: number;
  status: string;
  profit_loss: number;
  payout: number;
  placed_at: string;
};

type Stats = {
  total: number;
  won: number;
  lost: number;
  open: number;
  winRate: number;
  totalPL: number;
  totalWagered: number;
  roi: number;
  byCategory: Record<string, { bets: number; pl: number; wins: number }>;
};

type BetData = { bets: Bet[]; stats: Stats };

const CAT_ICONS: Record<string, string> = {
  sports: "🏆", politics: "🗳️", crypto: "₿", economy: "📈", other: "🎲",
};

const CAT_COLORS: Record<string, string> = {
  sports: "text-neon", politics: "text-purple", crypto: "text-yellow-400",
  economy: "text-blue-400", other: "text-muted",
};

function PLBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`font-mono font-bold ${positive ? "text-neon" : "text-red-400"}`}>
      {positive ? "+" : ""}${Math.abs(value).toFixed(2)}
    </span>
  );
}

function StatCard({ label, value, sub, color = "text-text" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="text-muted text-xs font-mono tracking-widest uppercase">{label}</p>
      <p className={`text-3xl font-bold font-mono mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-muted text-xs">{sub}</p>}
    </div>
  );
}

export default function BettingSection() {
  const [data, setData] = useState<BetData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "bets">("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");

  function loadBets() {
    fetch("/api/kalshi/bets?player=graham")
      .then((r) => r.json())
      .then((d) => { if (d.stats) setData(d); })
      .catch(() => {});
  }

  useEffect(() => { loadBets(); }, []);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/kalshi/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: "graham" }),
      });
      const json = await res.json();
      if (json.error) setSyncMsg("Error: " + json.error);
      else {
        setSyncMsg(`✓ Synced ${json.synced} markets`);
        loadBets();
      }
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  const stats = data?.stats;
  const bets = data?.bets ?? [];
  const filtered = filterStatus === "all" ? bets : bets.filter((b) => b.status === filterStatus);
  const topWins = [...bets].filter((b) => b.status === "won").sort((a, b) => b.profit_loss - a.profit_loss).slice(0, 5);
  const topLosses = [...bets].filter((b) => b.status === "lost").sort((a, b) => a.profit_loss - b.profit_loss).slice(0, 5);
  const openBets = bets.filter((b) => b.status === "open");

  return (
    <section id="betting" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <span className="section-label">{'// 05'}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-text">Predictions</h2>
            <p className="text-muted mt-3 max-w-lg">
              Kalshi sports markets — live stats, analysis, and the full record.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 pt-6">
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 text-xs font-mono px-4 py-2 rounded border transition-colors ${
                syncing ? "border-border text-muted cursor-not-allowed" : "border-neon/40 text-neon hover:bg-neon/10"
              }`}
            >
              <svg className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? "SYNCING..." : "SYNC BETS"}
            </button>
            {syncMsg && <p className={`text-xs font-mono ${syncMsg.startsWith("Error") ? "text-red-400" : "text-neon"}`}>{syncMsg}</p>}
          </div>
        </div>

        {/* Empty */}
        {!stats && !syncing && (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-text font-semibold mb-2">No bets synced yet</p>
            <p className="text-muted text-sm mb-6">Hit sync to pull your full Kalshi history</p>
            <button onClick={handleSync} className="text-xs font-mono px-6 py-3 bg-neon text-bg font-bold rounded hover:bg-neon-dim transition-colors">
              SYNC NOW
            </button>
          </div>
        )}

        {syncing && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-surface-2" />)}
          </div>
        )}

        {stats && stats.total > 0 && (
          <>
            {/* Balance timeline chart */}
            <div className="mb-6">
              <BalanceChart />
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Record"
                value={`${stats.won}W – ${stats.lost}L`}
                sub={`${stats.open} open`}
                color="text-text"
              />
              <StatCard
                label="Win Rate"
                value={`${stats.winRate}%`}
                sub={`${stats.won + stats.lost} settled`}
                color={stats.winRate >= 50 ? "text-neon" : "text-red-400"}
              />
              <StatCard
                label="Total P&L"
                value={`${stats.totalPL >= 0 ? "+" : ""}$${Math.abs(stats.totalPL).toFixed(2)}`}
                sub={`$${stats.totalWagered.toFixed(2)} wagered`}
                color={stats.totalPL >= 0 ? "text-neon" : "text-red-400"}
              />
              <StatCard
                label="ROI"
                value={`${stats.roi >= 0 ? "+" : ""}${stats.roi}%`}
                sub="return on investment"
                color={stats.roi >= 0 ? "text-neon" : "text-red-400"}
              />
            </div>

            {/* Win/Loss bar */}
            <div className="card p-5 mb-6">
              <div className="flex items-center justify-between mb-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neon inline-block" /><span className="text-neon font-mono font-bold">{stats.won} Won</span></span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /><span className="text-red-400 font-mono font-bold">{stats.lost} Lost</span></span>
                  {stats.open > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /><span className="text-yellow-400 font-mono font-bold">{stats.open} Open</span></span>}
                </div>
                <span className="text-muted text-xs font-mono">${stats.totalWagered.toFixed(2)} total wagered</span>
              </div>
              <div className="w-full h-4 rounded-full bg-surface-2 overflow-hidden flex">
                {stats.won > 0 && <div className="h-full bg-neon/80 transition-all" style={{ width: `${(stats.won / stats.total) * 100}%` }} />}
                {stats.open > 0 && <div className="h-full bg-yellow-400/60 transition-all" style={{ width: `${(stats.open / stats.total) * 100}%` }} />}
                {stats.lost > 0 && <div className="h-full bg-red-500/70 transition-all" style={{ width: `${(stats.lost / stats.total) * 100}%` }} />}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["dashboard", "bets"] as const).map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`font-mono text-xs px-4 py-2 rounded border transition-colors ${
                    activeTab === t ? "border-neon/60 text-neon bg-neon/5" : "border-border text-muted hover:text-text"
                  }`}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Category grid */}
                <div>
                  <h3 className="text-xs font-mono text-muted tracking-widest uppercase mb-3">By Category</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {Object.entries(stats.byCategory).sort((a, b) => b[1].bets - a[1].bets).map(([cat, info]) => {
                      const winRate = info.bets > 0 ? Math.round((info.wins / info.bets) * 100) : 0;
                      return (
                        <div key={cat} className="card p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">{CAT_ICONS[cat] ?? "🎲"}</span>
                            <span className={`text-xs font-mono font-bold capitalize ${CAT_COLORS[cat] ?? "text-muted"}`}>{cat}</span>
                          </div>
                          <p className="text-text text-2xl font-bold font-mono">{info.bets}</p>
                          <p className="text-muted text-xs">bets</p>
                          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-muted text-xs">{winRate}% win</span>
                            <PLBadge value={info.pl} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Best / Worst */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-xs font-mono text-muted tracking-widest uppercase mb-4">🏆 Best Bets</h3>
                    <div className="space-y-3">
                      {topWins.length === 0 && <p className="text-muted text-xs">No wins yet</p>}
                      {topWins.map((b, i) => (
                        <div key={b.id} className="flex items-start gap-3">
                          <span className="text-muted font-mono text-xs mt-0.5 w-4 shrink-0">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-text text-xs leading-tight truncate">{b.market_title}</p>
                            <p className="text-muted text-xs mt-0.5">{new Date(b.placed_at).toLocaleDateString()}</p>
                          </div>
                          <PLBadge value={b.profit_loss} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-xs font-mono text-muted tracking-widest uppercase mb-4">📉 Worst Bets</h3>
                    <div className="space-y-3">
                      {topLosses.length === 0 && <p className="text-muted text-xs">No losses recorded</p>}
                      {topLosses.map((b, i) => (
                        <div key={b.id} className="flex items-start gap-3">
                          <span className="text-muted font-mono text-xs mt-0.5 w-4 shrink-0">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-text text-xs leading-tight truncate">{b.market_title}</p>
                            <p className="text-muted text-xs mt-0.5">{new Date(b.placed_at).toLocaleDateString()}</p>
                          </div>
                          <PLBadge value={b.profit_loss} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Open positions */}
                {openBets.length > 0 && (
                  <div className="card p-6">
                    <h3 className="text-xs font-mono text-muted tracking-widest uppercase mb-4">
                      🟡 Open Positions <span className="text-yellow-400 ml-2">{openBets.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {openBets.map((b) => (
                        <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                            b.side === "yes" ? "text-neon border-neon/30 bg-neon/5" : "text-red-400 border-red-400/30 bg-red-400/5"
                          }`}>{b.side.toUpperCase()}</span>
                          <p className="text-text text-xs flex-1 truncate">{b.market_title}</p>
                          <span className="text-muted font-mono text-xs shrink-0">${b.total_cost?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BETS TAB */}
            {activeTab === "bets" && (
              <>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {["all", "won", "lost", "open"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors capitalize ${
                        filterStatus === s ? "border-purple/60 text-purple bg-purple/5" : "border-border text-muted hover:text-text"
                      }`}>
                      {s} {s !== "all" && `(${bets.filter(b => b.status === s).length})`}
                    </button>
                  ))}
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-surface-2/50">
                          <th className="text-left p-4 text-muted font-mono text-xs tracking-wider">MARKET</th>
                          <th className="text-center p-4 text-muted font-mono text-xs tracking-wider w-16">SIDE</th>
                          <th className="text-right p-4 text-muted font-mono text-xs tracking-wider w-24">WAGERED</th>
                          <th className="text-right p-4 text-muted font-mono text-xs tracking-wider w-24">P&L</th>
                          <th className="text-center p-4 text-muted font-mono text-xs tracking-wider w-20">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.slice(0, 100).map((bet) => (
                          <tr key={bet.id} className="border-b border-border/40 hover:bg-surface-2/40 transition-colors">
                            <td className="p-4">
                              <p className="text-text text-sm leading-tight">{bet.market_title}</p>
                              <p className="text-muted text-xs mt-0.5">
                                {CAT_ICONS[bet.category]} {bet.category} · {new Date(bet.placed_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                                bet.side === "yes" ? "text-neon border-neon/30 bg-neon/5" : "text-red-400 border-red-400/30 bg-red-400/5"
                              }`}>{bet.side.toUpperCase()}</span>
                            </td>
                            <td className="p-4 text-right font-mono text-text text-sm">${bet.total_cost?.toFixed(2)}</td>
                            <td className="p-4 text-right"><PLBadge value={bet.profit_loss} /></td>
                            <td className="p-4 text-center">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded-full border capitalize ${
                                bet.status === "won" ? "text-neon bg-neon/10 border-neon/30" :
                                bet.status === "lost" ? "text-red-400 bg-red-400/10 border-red-400/30" :
                                "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                              }`}>{bet.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length > 100 && (
                    <p className="text-center text-muted text-xs p-4 font-mono border-t border-border">
                      Showing 100 of {filtered.length} bets
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
