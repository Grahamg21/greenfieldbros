"use client";
import { useEffect, useState } from "react";

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

type BetData = {
  bets: Bet[];
  stats: Stats;
};

const STATUS_STYLES: Record<string, string> = {
  won: "text-neon bg-neon/10 border-neon/30",
  lost: "text-red-400 bg-red-400/10 border-red-400/30",
  open: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  settled: "text-muted bg-surface-2 border-border",
};

const CAT_ICONS: Record<string, string> = {
  sports: "🏆",
  politics: "🗳️",
  crypto: "₿",
  economy: "📈",
  other: "🎲",
};

export default function BettingSection() {
  const [data, setData] = useState<BetData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "bets">("overview");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [lastSync, setLastSync] = useState<string | null>(null);

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
      if (json.error) {
        setSyncMsg("Error: " + json.error);
      } else {
        setSyncMsg(`Synced ${json.synced} markets (${json.fills} fills)`);
        setLastSync(new Date().toLocaleTimeString());
        loadBets();
      }
    } catch {
      setSyncMsg("Sync failed — check server logs");
    } finally {
      setSyncing(false);
    }
  }

  const stats = data?.stats;
  const bets = data?.bets ?? [];
  const filtered = filterStatus === "all" ? bets : bets.filter((b) => b.status === filterStatus);

  return (
    <section id="betting" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-12">
          <div>
            <span className="section-label">{'// 05'}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-text">Predictions</h2>
            <p className="text-muted mt-3 max-w-xl">
              Kalshi sports market bets — wins, losses, and the analysis.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {lastSync && <span className="text-xs text-muted font-mono">Last sync: {lastSync}</span>}
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`flex items-center gap-2 text-xs font-mono px-4 py-2 rounded border transition-colors ${
                syncing
                  ? "border-border text-muted cursor-not-allowed"
                  : "border-neon/40 text-neon hover:bg-neon/10"
              }`}
            >
              <svg className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? "SYNCING..." : "SYNC BETS"}
            </button>
            {syncMsg && (
              <p className={`text-xs font-mono ${syncMsg.startsWith("Error") ? "text-red-400" : "text-neon"}`}>
                {syncMsg}
              </p>
            )}
          </div>
        </div>

        {/* Empty state */}
        {!stats && !syncing && (
          <div className="card p-10 text-center">
            <p className="text-muted text-sm mb-4">No bets synced yet. Hit Sync Bets to pull your Kalshi history.</p>
            <button
              onClick={handleSync}
              className="text-xs font-mono px-5 py-2.5 bg-neon text-bg font-bold rounded hover:bg-neon-dim transition-colors"
            >
              SYNC BETS NOW
            </button>
          </div>
        )}

        {syncing && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-surface-2" />)}
          </div>
        )}

        {stats && stats.total > 0 && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Bets", value: stats.total, color: "text-text" },
                { label: "Win Rate", value: `${stats.winRate}%`, color: stats.winRate >= 50 ? "text-neon" : "text-red-400" },
                {
                  label: "Total P&L",
                  value: `${stats.totalPL >= 0 ? "+" : ""}$${stats.totalPL.toFixed(2)}`,
                  color: stats.totalPL >= 0 ? "text-neon" : "text-red-400",
                },
                {
                  label: "ROI",
                  value: `${stats.roi >= 0 ? "+" : ""}${stats.roi}%`,
                  color: stats.roi >= 0 ? "text-neon" : "text-red-400",
                },
              ].map((s) => (
                <div key={s.label} className="card p-5">
                  <p className="text-muted text-xs font-mono tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-bold font-mono mt-2 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* W/L bar */}
            <div className="card p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neon font-mono font-bold">{stats.won}W</span>
                  <span className="text-muted">–</span>
                  <span className="text-red-400 font-mono font-bold">{stats.lost}L</span>
                  {stats.open > 0 && <span className="text-yellow-400 font-mono font-bold">{stats.open} open</span>}
                </div>
                <span className="text-muted text-xs font-mono">
                  ${stats.totalWagered.toFixed(2)} wagered
                </span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-3 overflow-hidden flex">
                <div className="h-3 bg-neon transition-all" style={{ width: `${(stats.won / (stats.won + stats.lost || 1)) * 100}%` }} />
                <div className="h-3 bg-red-500/60 transition-all" style={{ width: `${(stats.lost / (stats.won + stats.lost || 1)) * 100}%` }} />
              </div>
            </div>

            {/* Category breakdown */}
            {Object.keys(stats.byCategory).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                {Object.entries(stats.byCategory)
                  .sort((a, b) => b[1].bets - a[1].bets)
                  .map(([cat, info]) => (
                    <div key={cat} className="card p-4 text-center">
                      <div className="text-2xl mb-1">{CAT_ICONS[cat] ?? "🎲"}</div>
                      <p className="text-text text-xs font-medium capitalize">{cat}</p>
                      <p className="text-muted text-xs mt-1">{info.bets} bets</p>
                      <p className={`font-mono text-xs font-bold mt-1 ${info.pl >= 0 ? "text-neon" : "text-red-400"}`}>
                        {info.pl >= 0 ? "+" : ""}${info.pl.toFixed(2)}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {(["overview", "bets"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`font-mono text-xs px-4 py-2 rounded border transition-colors ${
                    activeTab === t
                      ? "border-neon/60 text-neon bg-neon/5"
                      : "border-border text-muted hover:text-text"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Bets table */}
            {activeTab === "bets" && (
              <>
                {/* Filter */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {["all", "won", "lost", "open"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors capitalize ${
                        filterStatus === s
                          ? "border-purple/60 text-purple bg-purple/5"
                          : "border-border text-muted hover:text-text"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 text-muted font-mono text-xs tracking-wider">MARKET</th>
                          <th className="text-center p-4 text-muted font-mono text-xs tracking-wider">SIDE</th>
                          <th className="text-center p-4 text-muted font-mono text-xs tracking-wider">WAGERED</th>
                          <th className="text-center p-4 text-muted font-mono text-xs tracking-wider">P&L</th>
                          <th className="text-center p-4 text-muted font-mono text-xs tracking-wider">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.slice(0, 50).map((bet) => (
                          <tr key={bet.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                            <td className="p-4">
                              <p className="text-text text-sm leading-tight max-w-xs truncate">{bet.market_title}</p>
                              <p className="text-muted text-xs mt-0.5">
                                {CAT_ICONS[bet.category]} {bet.category} · {new Date(bet.placed_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded border ${
                                bet.side === "yes"
                                  ? "text-neon border-neon/30 bg-neon/5"
                                  : "text-red-400 border-red-400/30 bg-red-400/5"
                              }`}>
                                {bet.side.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono text-text text-sm">
                              ${bet.total_cost?.toFixed(2)}
                            </td>
                            <td className={`p-4 text-center font-mono font-bold text-sm ${
                              bet.profit_loss > 0 ? "text-neon" : bet.profit_loss < 0 ? "text-red-400" : "text-muted"
                            }`}>
                              {bet.profit_loss > 0 ? "+" : ""}${bet.profit_loss?.toFixed(2)}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded border capitalize ${STATUS_STYLES[bet.status] ?? STATUS_STYLES.settled}`}>
                                {bet.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length > 50 && (
                    <p className="text-center text-muted text-xs p-4 font-mono">
                      Showing 50 of {filtered.length} bets
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Overview analysis */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-sm font-mono text-muted tracking-widest uppercase mb-4">Best Bets</h3>
                  <div className="space-y-3">
                    {bets.filter((b) => b.status === "won").sort((a, b) => b.profit_loss - a.profit_loss).slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-start justify-between gap-2">
                        <p className="text-text text-xs leading-tight flex-1 truncate">{b.market_title}</p>
                        <span className="text-neon font-mono text-xs font-bold shrink-0">+${b.profit_loss.toFixed(2)}</span>
                      </div>
                    ))}
                    {bets.filter((b) => b.status === "won").length === 0 && (
                      <p className="text-muted text-xs">No wins yet — sync your bets first.</p>
                    )}
                  </div>
                </div>
                <div className="card p-6">
                  <h3 className="text-sm font-mono text-muted tracking-widest uppercase mb-4">Worst Bets</h3>
                  <div className="space-y-3">
                    {bets.filter((b) => b.status === "lost").sort((a, b) => a.profit_loss - b.profit_loss).slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-start justify-between gap-2">
                        <p className="text-text text-xs leading-tight flex-1 truncate">{b.market_title}</p>
                        <span className="text-red-400 font-mono text-xs font-bold shrink-0">${b.profit_loss.toFixed(2)}</span>
                      </div>
                    ))}
                    {bets.filter((b) => b.status === "lost").length === 0 && (
                      <p className="text-muted text-xs">No losses recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
