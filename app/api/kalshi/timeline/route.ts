import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { kalshiGet } from "@/lib/kalshi";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player") ?? "graham";

  const [settlementsRes, betsRes, balanceData] = await Promise.all([
    supabase
      .from("settlements")
      .select("settled_time, profit_loss")
      .eq("player", player)
      .order("settled_time", { ascending: true }),
    supabase
      .from("bets")
      .select("placed_at, settled_at, profit_loss, status")
      .eq("player", player)
      .order("placed_at", { ascending: true }),
    kalshiGet("/trade-api/v2/portfolio/balance").catch(() => null),
  ]);

  const settlements = settlementsRes.data ?? [];
  const bets = betsRes.data ?? [];

  // Use settlements table if it has data; fall back to settled bets
  type PLEvent = { date: string; pl: number };
  let events: PLEvent[] = [];

  if (settlements.length > 0) {
    events = settlements.map((s) => ({
      date: s.settled_time,
      pl: s.profit_loss ?? 0,
    }));
  } else {
    // Fallback: use settled bets (won/lost) from bets table
    events = bets
      .filter((b) => b.status !== "open" && (b.settled_at || b.placed_at))
      .map((b) => ({
        date: b.settled_at ?? b.placed_at,
        pl: b.profit_loss ?? 0,
      }));
  }

  // Build cumulative P&L timeline
  let cumPL = 0;
  const timeline: { date: string; pl: number }[] = [];

  for (const e of events) {
    cumPL += e.pl;
    const date = new Date(e.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    timeline.push({ date, pl: parseFloat(cumPL.toFixed(2)) });
  }

  // Deduplicate same-date entries (keep last value per date)
  const byDate = new Map<string, number>();
  for (const t of timeline) {
    byDate.set(t.date, t.pl);
  }

  const chart = Array.from(byDate.entries()).map(([date, pl]) => ({ date, pl }));

  const currentBalance = balanceData?.balance ? balanceData.balance / 100 : null;

  return NextResponse.json({
    chart,
    currentBalance,
    player,
    source: settlements.length > 0 ? "settlements" : "bets",
  });
}
