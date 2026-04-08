"use client";
import { useEffect, useState } from "react";

type Game = {
  appId: number;
  name: string;
  hoursRecent: number;
  hoursTotal: number;
  img: string;
};

type PlayerData = {
  player: string;
  profile: { personaname: string; avatarfull: string; profileurl: string } | null;
  games: Game[];
};

const platforms = [
  { name: "Steam", icon: "🎮", color: "text-blue-400", connected: true },
  { name: "Epic Games", icon: "⚡", color: "text-yellow-400", connected: false },
  { name: "Riot Games", icon: "⚔️", color: "text-red-400", connected: false },
];

export default function GamingSection() {
  const [data, setData] = useState<PlayerData[] | null>(null);
  const [error, setError] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string>("graham");

  useEffect(() => {
    fetch("/api/steam")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(true);
        else setData(d.players);
      })
      .catch(() => setError(true));
  }, []);

  const current = data?.find((p) => p.player === activePlayer);
  const others = data?.filter((p) => p.player !== activePlayer) ?? [];

  return (
    <section id="gaming" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-12">
          <span className="section-label">{'// 02'}</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-text">
            Gaming
          </h2>
          <p className="text-muted mt-3 max-w-xl">
            PC gamers at heart. Steam, Epic, Riot — if it runs on a rig, we&apos;ve played it.
          </p>
        </div>

        {/* Platform badges */}
        <div className="flex flex-wrap gap-3 mb-10">
          {platforms.map((p) => (
            <div key={p.name} className="card flex items-center gap-2 px-4 py-2 text-sm">
              <span>{p.icon}</span>
              <span className="text-text font-medium">{p.name}</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded-full border ${
                p.connected
                  ? "bg-neon/10 text-neon border-neon/30"
                  : "bg-surface-2 text-muted border-border"
              }`}>
                {p.connected ? "LIVE" : "SOON"}
              </span>
            </div>
          ))}
        </div>

        {/* Player tabs */}
        {data && (
          <div className="flex gap-2 mb-6">
            {data.map((p) => (
              <button
                key={p.player}
                onClick={() => setActivePlayer(p.player)}
                className={`flex items-center gap-2 font-mono text-xs px-4 py-2 rounded border transition-colors ${
                  activePlayer === p.player
                    ? "border-neon/60 text-neon bg-neon/5"
                    : "border-border text-muted hover:text-text"
                }`}
              >
                {p.profile?.avatarfull && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.profile.avatarfull} alt="" className="w-5 h-5 rounded-full" />
                )}
                {p.profile?.personaname ?? (p.player === "graham" ? "Graham" : "Gabe")}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {error && (
          <div className="card p-6 text-muted text-sm text-center">
            Could not load Steam data. Check your API key and Steam profile visibility (must be set to Public).
          </div>
        )}

        {!data && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-surface-2" />
            ))}
          </div>
        )}

        {current && (
          <>
            {current.games.length === 0 ? (
              <div className="card p-6 text-muted text-sm text-center">
                No recent games — or Steam profile may be set to private.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {current.games.map((game) => (
                  <GameCard key={game.appId} game={game} />
                ))}
              </div>
            )}

            {/* vs snippet */}
            {others.filter((o) => o.games.length > 0).map((o) => (
              <div key={o.player} className="mt-4 card p-4 flex items-center gap-4">
                <span className="text-muted text-xs font-mono shrink-0">
                  {o.profile?.personaname ?? o.player} recently played:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {o.games.slice(0, 3).map((g: Game) => (
                    <span key={g.appId} className="text-xs font-mono text-text bg-surface-2 px-2 py-1 rounded border border-border">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </section>
  );
}

function GameCard({ game }: { game: Game }) {
  return (
    <a
      href={`https://store.steampowered.com/app/${game.appId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="card overflow-hidden group"
    >
      <div className="relative h-24 overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.img}
          alt={game.name}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <p className="text-text text-sm font-semibold leading-tight">{game.name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-neon font-mono text-xs font-bold">
            {game.hoursTotal.toLocaleString()} hrs total
          </span>
          {game.hoursRecent > 0 && (
            <span className="text-muted text-xs">{game.hoursRecent}h this week</span>
          )}
        </div>
      </div>
    </a>
  );
}
