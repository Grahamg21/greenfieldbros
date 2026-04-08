import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const TRN_KEY = process.env.TRN_API_KEY ?? process.env.NEXT_PUBLIC_TRN_API_KEY;

const PLAYERS = [
  { key: "graham", steamId: process.env.STEAM_ID_GRAHAM, label: "Graham" },
  { key: "brother", steamId: process.env.STEAM_ID_BROTHER, label: "Gabe" },
  { key: "david", steamId: process.env.STEAM_ID_DAVID, label: "David" },
];

const PLAYLIST_LABELS: Record<string, string> = {
  "ranked-duels": "1v1",
  "ranked-doubles": "2v2",
  "ranked-standard": "3v3",
};

type Segment = {
  type: string;
  attributes: { playlistId?: string };
  stats: Record<string, { value: number; displayValue: string }>;
};

async function fetchPlayer(steamId: string, label: string, key: string) {
  const res = await fetch(
    `https://api.tracker.gg/api/v2/rocket-league/standard/profile/steam/${steamId}`,
    {
      headers: {
        "TRN-Api-Key": TRN_KEY ?? "",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://tracker.gg/rocket-league",
        "Origin": "https://tracker.gg",
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} for ${label}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const segments: Segment[] = json?.data?.segments ?? [];

  const overview = segments.find((s) => s.type === "overview");
  const career = overview
    ? {
        wins: overview.stats.wins?.value ?? 0,
        goals: overview.stats.goals?.value ?? 0,
        assists: overview.stats.assists?.value ?? 0,
        saves: overview.stats.saves?.value ?? 0,
        shots: overview.stats.shots?.value ?? 0,
        mvps: overview.stats.mVPs?.value ?? 0,
        goalShotRatio: overview.stats.goalShotRatio?.displayValue ?? "—",
        winStreak: overview.stats.winStreak?.value ?? 0,
      }
    : null;

  const playlists = segments
    .filter((s) => s.type === "playlist" && PLAYLIST_LABELS[s.attributes.playlistId ?? ""])
    .map((s) => ({
      id: s.attributes.playlistId!,
      label: PLAYLIST_LABELS[s.attributes.playlistId!],
      tier: s.stats.tier?.displayValue ?? "Unranked",
      division: s.stats.division?.displayValue ?? "",
      mmr: Math.round(s.stats.rating?.value ?? 0),
      matches: s.stats.matchesPlayed?.value ?? 0,
      winPct: s.stats.winPercentage?.displayValue ?? "—",
    }))
    .sort((a, b) => b.mmr - a.mmr);

  return { key, label, career, playlists };
}

export async function POST() {
  if (!TRN_KEY) {
    return NextResponse.json({ error: "TRN_API_KEY not configured" }, { status: 500 });
  }

  const results = [];
  const errors = [];

  // Fetch sequentially to avoid rate limiting
  for (const { key, steamId, label } of PLAYERS) {
    if (!steamId) continue;
    try {
      const data = await fetchPlayer(steamId, label, key);
      results.push(data);
      // Small delay between requests to be polite
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      errors.push({ key, label, error: String(err) });
    }
  }

  if (results.length === 0) {
    return NextResponse.json(
      { error: "All players failed", details: errors },
      { status: 502 }
    );
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    players: results,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Write to cache
  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "rl-stats.json"), JSON.stringify(payload, null, 2));

  return NextResponse.json({ success: true, updated: results.length, errors });
}
