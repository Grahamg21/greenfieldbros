"use client";
import { useEffect, useState } from "react";

type Playlist = {
  id: string;
  label: string;
  tier: string;
  division: string;
  mmr: number;
  matches: number;
  winPct: string;
};

type Career = {
  wins: number;
  goals: number;
  assists: number;
  saves: number;
  shots: number;
  mvps: number;
  goalShotRatio: string;
  winStreak: number;
};

type Player = {
  key: string;
  label: string;
  career?: Career;
  playlists?: Playlist[];
  error?: string;
};

type CacheData = {
  lastUpdated: string | null;
  players: Player[];
};

const RANK_COLORS: Record<string, string> = {
  Bronze: "#cd7f32",
  Silver: "#a8a9ad",
  Gold: "#ffd700",
  Platinum: "#00bcd4",
  Diamond: "#4fc3f7",
  Champion: "#ab47bc",
  "Grand Champion": "#f44336",
  "Supersonic Legend": "#ff6d00",
  Unranked: "#6b7280",
};

function getRankColor(tier: string) {
  const match = Object.keys(RANK_COLORS).find((k) => tier.startsWith(k));
  return match ? RANK_COLORS[match] : "#6b7280";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export default function RocketLeagueSection() {
  const [data, setData] = useState<CacheData | null>(null);
  const [activePlayer, setActivePlayer] = useState<string>("graham");
  const [activeTab, setActiveTab] = useState<"ranks" | "career">("ranks");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  function loadCache() {
    fetch("/api/rocketleague")
      .then((r) => r.json())
      .then((d: CacheData) => setData(d))
      .catch(() => setData({ lastUpdated: null, players: [] }));
  }

  useEffect(() => { loadCache(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/rocketleague/refresh", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setRefreshError(json.error ?? "Refresh failed");
      } else {
        loadCache();
      }
    } catch {
      setRefreshError("Could not reach refresh endpoint");
    } finally {
      setRefreshing(false);
    }
  }

  const players = data?.players ?? [];
  const current = players.find((p) => p.key === activePlayer);
  const isEmpty = !data?.lastUpdated || players.length === 0;

  return (
    <div className="mt-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <h3 className="text-xl font-bold text-text">Rocket League</h3>
          {data?.lastUpdated && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neon/10 text-neon border border-neon/30">
              LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {data?.lastUpdated && (
            <span className="text-xs text-muted font-mono">
              Updated {formatDate(data.lastUpdated)}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 text-xs font-mono px-4 py-2 rounded border transition-colors ${
              refreshing
                ? "border-border text-muted cursor-not-allowed"
                : "border-neon/40 text-neon hover:bg-neon/10"
            }`}
          >
            <svg
              className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? "FETCHING..." : "REFRESH STATS"}
          </button>
        </div>
      </div>

      {/* Refresh error */}
      {refreshError && (
        <div className="card p-4 mb-4 border-red-500/30 text-red-400 text-sm font-mono">
          ⚠ {refreshError}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !refreshing && (
        <div className="card p-8 text-center">
          <p className="text-muted text-sm mb-4">No stats cached yet. Hit Refresh Stats to pull data from tracker.gg.</p>
          <button
            onClick={handleRefresh}
            className="text-xs font-mono px-5 py-2.5 bg-neon text-bg font-bold rounded hover:bg-neon-dim transition-colors"
          >
            REFRESH STATS NOW
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {refreshing && (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-surface-2" />
          ))}
        </div>
      )}

      {/* Content */}
      {!isEmpty && !refreshing && (
        <>
          {/* Player tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {players.map((p) => (
              <button
                key={p.key}
                onClick={() => setActivePlayer(p.key)}
                className={`font-mono text-xs px-4 py-2 rounded border transition-colors ${
                  activePlayer === p.key
                    ? "border-neon/60 text-neon bg-neon/5"
                    : "border-border text-muted hover:text-text"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sub-tabs */}
          {current && (
            <div className="flex gap-2 mb-5">
              {(["ranks", "career"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${
                    activeTab === t
                      ? "border-purple/60 text-purple bg-purple/5"
                      : "border-border text-muted hover:text-text"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Ranks */}
          {current && activeTab === "ranks" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(current.playlists ?? []).length === 0 && (
                <div className="card p-5 text-muted text-sm col-span-3">No ranked data found.</div>
              )}
              {(current.playlists ?? []).map((pl) => (
                <div key={pl.id} className="card p-5">
                  <p className="text-muted text-xs font-mono tracking-wider mb-3">{pl.label}</p>
                  <p className="text-xl font-bold" style={{ color: getRankColor(pl.tier) }}>
                    {pl.tier}
                  </p>
                  {pl.division && <p className="text-muted text-xs mt-0.5">{pl.division}</p>}
                  <p className="text-neon font-mono text-sm font-bold mt-2">{pl.mmr} MMR</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted">
                    <span>{pl.matches} matches</span>
                    <span>{pl.winPct} win%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Career */}
          {current && activeTab === "career" && current.career && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Wins", value: current.career.wins.toLocaleString(), color: "text-neon" },
                { label: "Goals", value: current.career.goals.toLocaleString(), color: "text-yellow-400" },
                { label: "Saves", value: current.career.saves.toLocaleString(), color: "text-blue-400" },
                { label: "Assists", value: current.career.assists.toLocaleString(), color: "text-purple" },
                { label: "Shots", value: current.career.shots.toLocaleString(), color: "text-text" },
                { label: "MVPs", value: current.career.mvps.toLocaleString(), color: "text-yellow-300" },
                { label: "Goal %", value: current.career.goalShotRatio, color: "text-neon" },
                { label: "Win Streak", value: String(current.career.winStreak), color: "text-text" },
              ].map((stat) => (
                <div key={stat.label} className="card p-4">
                  <p className="text-muted text-xs font-mono tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
