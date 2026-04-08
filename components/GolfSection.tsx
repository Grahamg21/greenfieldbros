"use client";
import { useState } from "react";

// Edit these to reflect real scores as you play
const players = [
  { id: "graham", name: "Graham", handicap: 14, avatar: "G" },
  { id: "bro", name: "The Bro", handicap: 18, avatar: "B" },
];

const recentRounds: Round[] = [
  {
    id: 1,
    date: "2026-04-05",
    course: "Rancho Park GC",
    par: 71,
    scores: { graham: 84, bro: 89 },
    winner: "graham",
  },
  {
    id: 2,
    date: "2026-03-29",
    course: "Griffith Park — Wilson",
    par: 72,
    scores: { graham: 91, bro: 87 },
    winner: "bro",
  },
  {
    id: 3,
    date: "2026-03-22",
    course: "Penmar Golf Course",
    par: 66,
    scores: { graham: 78, bro: 80 },
    winner: "graham",
  },
  {
    id: 4,
    date: "2026-03-15",
    course: "Roosevelt GC",
    par: 70,
    scores: { graham: 85, bro: 85 },
    winner: "tie",
  },
];

type Round = {
  id: number;
  date: string;
  course: string;
  par: number;
  scores: Record<string, number>;
  winner: string;
};

function getStats() {
  const stats = { graham: { wins: 0, avg: 0, best: 999 }, bro: { wins: 0, avg: 0, best: 999 } };
  let grahamTotal = 0, broTotal = 0;
  recentRounds.forEach((r) => {
    if (r.winner === "graham") stats.graham.wins++;
    if (r.winner === "bro") stats.bro.wins++;
    grahamTotal += r.scores.graham;
    broTotal += r.scores.bro;
    if (r.scores.graham < stats.graham.best) stats.graham.best = r.scores.graham;
    if (r.scores.bro < stats.bro.best) stats.bro.best = r.scores.bro;
  });
  stats.graham.avg = Math.round(grahamTotal / recentRounds.length);
  stats.bro.avg = Math.round(broTotal / recentRounds.length);
  return stats;
}

export default function GolfSection() {
  const [activeTab, setActiveTab] = useState<"scoreboard" | "rounds">("scoreboard");
  const stats = getStats();
  const grahamWins = stats.graham.wins;
  const broWins = stats.bro.wins;
  const totalRounds = recentRounds.length;
  const ties = totalRounds - grahamWins - broWins;

  return (
    <section id="golf" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-12">
          <span className="section-label">{'// 04'}</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-text">
            Golf
          </h2>
          <p className="text-muted mt-3 max-w-xl">
            The rivalry is real. Who&apos;s up this season?
          </p>
        </div>

        {/* Head-to-head banner */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 items-center text-center">
            {/* Graham */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-neon/20 border-2 border-neon flex items-center justify-center text-neon font-mono text-2xl font-bold">
                G
              </div>
              <p className="text-text font-semibold">Graham</p>
              <p className="text-muted text-xs">HCP {players[0].handicap}</p>
              <p className="text-5xl font-mono font-bold text-neon">{grahamWins}</p>
              <p className="text-xs text-muted">wins</p>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-muted text-xs font-mono tracking-widest uppercase mb-2">
                {totalRounds} rounds
              </div>
              <div className="font-mono font-bold text-3xl text-muted">VS</div>
              {ties > 0 && (
                <p className="text-muted text-xs mt-2">{ties} tie{ties > 1 ? "s" : ""}</p>
              )}
              <div className="mt-4 w-full bg-surface-2 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-neon to-purple"
                  style={{ width: `${(grahamWins / (grahamWins + broWins || 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between w-full mt-1">
                <span className="text-neon text-xs font-mono">{grahamWins}</span>
                <span className="text-purple text-xs font-mono">{broWins}</span>
              </div>
            </div>

            {/* Bro */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-purple/20 border-2 border-purple flex items-center justify-center text-purple font-mono text-2xl font-bold">
                B
              </div>
              <p className="text-text font-semibold">The Bro</p>
              <p className="text-muted text-xs">HCP {players[1].handicap}</p>
              <p className="text-5xl font-mono font-bold text-purple">{broWins}</p>
              <p className="text-xs text-muted">wins</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border text-center text-sm">
            {[
              { label: "Avg Score", g: stats.graham.avg, b: stats.bro.avg },
              { label: "Best Round", g: stats.graham.best, b: stats.bro.best },
            ].map((row) => (
              <div key={row.label} className="contents">
                <p className="text-neon font-mono font-bold">{row.g}</p>
                <p className="text-muted text-xs self-center">{row.label}</p>
                <p className="text-purple font-mono font-bold">{row.b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["scoreboard", "rounds"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-xs px-4 py-2 rounded border transition-colors ${
                activeTab === tab
                  ? "border-neon/60 text-neon bg-neon/5"
                  : "border-border text-muted hover:border-border hover:text-text"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Recent rounds table */}
        {activeTab === "rounds" && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted font-mono text-xs tracking-wider">DATE</th>
                  <th className="text-left p-4 text-muted font-mono text-xs tracking-wider">COURSE</th>
                  <th className="text-center p-4 text-neon font-mono text-xs tracking-wider">GRAHAM</th>
                  <th className="text-center p-4 text-purple font-mono text-xs tracking-wider">THE BRO</th>
                  <th className="text-center p-4 text-muted font-mono text-xs tracking-wider">RESULT</th>
                </tr>
              </thead>
              <tbody>
                {recentRounds.map((round) => (
                  <tr key={round.id} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                    <td className="p-4 text-muted font-mono text-xs">{round.date}</td>
                    <td className="p-4 text-text">{round.course}</td>
                    <td className="p-4 text-center font-mono font-bold text-neon">
                      {round.scores.graham}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-purple">
                      {round.scores.bro}
                    </td>
                    <td className="p-4 text-center">
                      {round.winner === "tie" ? (
                        <span className="text-xs font-mono text-muted">TIE</span>
                      ) : (
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                            round.winner === "graham"
                              ? "bg-neon/10 text-neon border border-neon/30"
                              : "bg-purple/10 text-purple border border-purple/30"
                          }`}
                        >
                          {round.winner === "graham" ? "GRAHAM" : "BRO"} W
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "scoreboard" && (
          <div className="card p-6">
            <p className="text-muted text-sm text-center py-8">
              🏌️ Scoreboard coming soon — log your next round to start tracking
              season standings, stroke differential, and course-by-course breakdowns.
            </p>
          </div>
        )}

        {/* 18 Birdies note */}
        <div className="mt-6 flex items-start gap-3 text-sm text-muted p-4 border border-border/50 rounded-lg">
          <span>📱</span>
          <p>
            You use <strong className="text-text">18 Birdies</strong> to track rounds — there&apos;s no public
            API, but you can manually add scores above to keep the rivalry board live.
            Down the road we can explore scraping the share links 18 Birdies generates.
          </p>
        </div>
      </div>
    </section>
  );
}
