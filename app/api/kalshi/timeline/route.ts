import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { kalshiGet } from "@/lib/kalshi";

const STARTING_BALANCE = 100; // dollars

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player") ?? "graham";

  // Get all fills (costs) and settlements (payouts) sorted by time
  const [fillsRes, settlementsRes, balanceData] = await Promise.all([
    supabase.from("bets").select("placed_at, total_cost, status").eq("player", player).order("placed_at", { ascending: true }),
    supabase.from("settlements").select("settled_time, revenue, cost").eq("player", player).order("settled_time", { ascending: true }),
    kalshiGet("/trade-api/v2/portfolio/balance").catch(() => null),
  ]);

  const bets = fillsRes.data ?? [];
  const settlements = settlementsRes.data ?? [];

  // Build timeline events: deposits, wagers, payouts
  type Event = { date: string; type: "wager" | "payout" | "deposit"; amount: number };
  const events: Event[] = [];

  // Starting deposit
  if (bets.length > 0) {
    events.push({ date: bets[0].placed_at, type: "deposit", amount: STARTING_BALANCE });
  }

  // Each bet placed = cash out
  for (const b of bets) {
    events.push({ date: b.placed_at, type: "wager", amount: -(b.total_cost ?? 0) });
  }

  // Each settlement = cash in
  for (const s of settlements) {
    if (s.revenue > 0) {
      events.push({ date: s.settled_time, type: "payout", amount: s.revenue });
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Build running balance
  let balance = 0;
  const timeline: { date: string; balance: number; label: string }[] = [];

  for (const e of events) {
    balance += e.amount;
    const date = new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    timeline.push({
      date,
      balance: parseFloat(balance.toFixed(2)),
      label: e.type,
    });
  }

  // Deduplicate same-date entries (keep last value per date)
  const byDate = new Map<string, number>();
  for (const t of timeline) {
    byDate.set(t.date, t.balance);
  }

  const chart = Array.from(byDate.entries()).map(([date, balance]) => ({ date, balance }));

  const currentBalance = balanceData?.balance ? balanceData.balance / 100 : null;

  return NextResponse.json({ chart, currentBalance, player });
}
