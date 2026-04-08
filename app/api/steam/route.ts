import { NextResponse } from "next/server";

const API_KEY = process.env.STEAM_API_KEY;
const STEAM_IDS = {
  graham: process.env.STEAM_ID_GRAHAM,
  brother: process.env.STEAM_ID_BROTHER,
  david: process.env.STEAM_ID_DAVID,
};

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
  return res.json();
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: "STEAM_API_KEY not configured" }, { status: 500 });
  }

  try {
    const results = await Promise.all(
      Object.entries(STEAM_IDS).map(async ([player, steamId]) => {
        if (!steamId) return { player, games: [], profile: null };

        const [gamesData, profileData] = await Promise.all([
          fetchJson(
            `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${API_KEY}&steamid=${steamId}&count=6`
          ),
          fetchJson(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${API_KEY}&steamids=${steamId}`
          ),
        ]);

        const profile = profileData?.response?.players?.[0] ?? null;
        const games = (gamesData?.response?.games ?? []).map((g: SteamGame) => ({
          appId: g.appid,
          name: g.name,
          hoursRecent: Math.round(g.playtime_2weeks / 60 * 10) / 10,
          hoursTotal: Math.round(g.playtime_forever / 60),
          img: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
        }));

        return { player, profile, games };
      })
    );

    return NextResponse.json({ players: results });
  } catch (err) {
    console.error("Steam API error:", err);
    return NextResponse.json({ error: "Failed to fetch Steam data" }, { status: 500 });
  }
}

type SteamGame = {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
};
