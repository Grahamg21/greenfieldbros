import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player") ?? "graham";

  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .eq("player", player)
    .order("placed_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build analysis
  const bets = data ?? [];
  const settled = bets.filter((b) => b.status !== "open");
  const won = bets.filter((b) => b.status === "won");
  const lost = bets.filter((b) => b.status === "lost");
  const open = bets.filter((b) => b.status === "open");

  const totalPL = bets.reduce((s, b) => s + (b.profit_loss ?? 0), 0);
  const totalWagered = bets.reduce((s, b) => s + (b.total_cost ?? 0), 0);
  const winRate = settled.length ? Math.round((won.length / settled.length) * 100) : 0;
  const roi = totalWagered ? Math.round((totalPL / totalWagered) * 100) : 0;

  // By category
  const byCategory: Record<string, { bets: number; pl: number; wins: number }> = {};
  for (const b of bets) {
    const cat = b.category ?? "other";
    if (!byCategory[cat]) byCategory[cat] = { bets: 0, pl: 0, wins: 0 };
    byCategory[cat].bets++;
    byCategory[cat].pl += b.profit_loss ?? 0;
    if (b.status === "won") byCategory[cat].wins++;
  }

  return NextResponse.json({
    bets,
    stats: {
      total: bets.length,
      won: won.length,
      lost: lost.length,
      open: open.length,
      winRate,
      totalPL: parseFloat(totalPL.toFixed(2)),
      totalWagered: parseFloat(totalWagered.toFixed(2)),
      roi,
      byCategory,
    },
  });
}
