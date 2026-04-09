import { NextResponse } from "next/server";
import { getAllFills, getMarket, getOpenPositionTickers, type KalshiFill } from "@/lib/kalshi";
import { supabaseAdmin } from "@/lib/supabase";

// Detect category from market title/ticker
function detectCategory(title: string, ticker: string): string {
  const t = (title + " " + ticker).toLowerCase();
  if (/nba|nfl|nhl|mlb|nascar|ncaa|pga|ufc|mma|soccer|mls|epl|tennis|golf|cfb|cbb/.test(t)) return "sports";
  if (/election|vote|senate|house|president|congress|poll/.test(t)) return "politics";
  if (/bitcoin|eth|crypto|btc/.test(t)) return "crypto";
  if (/fed|rate|inflation|gdp|economy/.test(t)) return "economy";
  return "other";
}

// Group fills into trades (buys + sells on same market)
function groupFillsIntoTrades(fills: KalshiFill[]) {
  const markets = new Map<string, KalshiFill[]>();
  for (const fill of fills) {
    const key = fill.market_ticker;
    if (!markets.has(key)) markets.set(key, []);
    markets.get(key)!.push(fill);
  }
  return markets;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const player = body.player ?? "graham";

  try {
    const [fills, openTickers] = await Promise.all([
      getAllFills(),
      getOpenPositionTickers(),
    ]);

    if (!fills.length) {
      return NextResponse.json({ synced: 0, message: "No fills found" });
    }

    const grouped = groupFillsIntoTrades(fills);
    const rows = [];

    for (const [ticker, marketFills] of grouped) {
      // Get market info (title) — rate limit: one at a time
      let marketTitle = ticker;
      let category = "sports";

      try {
        const market = await getMarket(ticker);
        if (market) {
          marketTitle = market.title ?? ticker;
          category = detectCategory(marketTitle, ticker);
        }
      } catch {
        // Use ticker as title if market fetch fails
      }

      await new Promise((r) => setTimeout(r, 200));

      // Calculate aggregates across all fills for this market
      let totalCost = 0;
      let totalContracts = 0;
      let totalPayout = 0;
      let latestSide: "yes" | "no" = "yes";
      let placedAt = marketFills[0].created_time;
      let settledAt: string | null = null;

      for (const fill of marketFills) {
        const contracts = parseFloat(fill.count_fp);
        const price = fill.side === "yes"
          ? parseFloat(fill.yes_price_dollars)
          : parseFloat(fill.no_price_dollars);
        const cost = contracts * price;

        if (fill.action === "buy") {
          totalCost += cost;
          totalContracts += contracts;
          latestSide = fill.side;
          if (fill.created_time < placedAt) placedAt = fill.created_time;
        } else {
          totalPayout += cost;
          settledAt = fill.created_time;
        }
      }

      // Use Kalshi positions API as source of truth for open/settled
      const isOpen = openTickers.has(ticker);
      const profitLoss = isOpen
        ? -totalCost  // open: unrealized cost
        : totalPayout - totalCost; // settled: actual P&L

      let status: string;
      if (isOpen) {
        status = "open";
      } else if (profitLoss > 0) {
        status = "won";
      } else if (profitLoss < 0) {
        status = "lost";
      } else {
        status = "lost"; // broke even counts as loss
      }

      rows.push({
        id: ticker + "_" + player,
        player,
        market_id: ticker,
        market_title: marketTitle,
        category,
        side: latestSide,
        contracts: Math.round(totalContracts),
        price: parseFloat((totalCost / Math.max(totalContracts, 1)).toFixed(4)),
        total_cost: parseFloat(totalCost.toFixed(4)),
        status,
        payout: parseFloat(totalPayout.toFixed(4)),
        profit_loss: parseFloat(profitLoss.toFixed(4)),
        placed_at: placedAt,
        settled_at: settledAt,
      });
    }

    // Upsert all rows
    const { error } = await supabaseAdmin.from("bets").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      synced: rows.length,
      player,
      fills: fills.length,
    });
  } catch (err) {
    console.error("Kalshi sync error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
