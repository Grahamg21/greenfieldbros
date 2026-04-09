import crypto from "crypto";

const API_KEY = process.env.KALSHI_API_KEY!;
const PRIVATE_KEY = process.env.KALSHI_PRIVATE_KEY!;
const BASE = "api.elections.kalshi.com";

function sign(method: string, basePath: string): { timestamp: string; sig: string } {
  const timestamp = Date.now().toString();
  const msg = timestamp + method + basePath;
  const sig = crypto
    .sign("SHA256", Buffer.from(msg), {
      key: PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    })
    .toString("base64");
  return { timestamp, sig };
}

export async function kalshiGet(basePath: string, query?: Record<string, string>) {
  const qs = query ? "?" + new URLSearchParams(query).toString() : "";
  const { timestamp, sig } = sign("GET", basePath);
  const url = `https://${BASE}${basePath}${qs}`;

  const res = await fetch(url, {
    headers: {
      "KALSHI-ACCESS-KEY": API_KEY,
      "KALSHI-ACCESS-TIMESTAMP": timestamp,
      "KALSHI-ACCESS-SIGNATURE": sig,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kalshi ${basePath} → ${res.status}: ${err}`);
  }
  return res.json();
}

// Paginate through all fills
export async function getAllFills(): Promise<KalshiFill[]> {
  const all: KalshiFill[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < 20; page++) {
    const params: Record<string, string> = { limit: "100" };
    if (cursor) params.cursor = cursor;

    const data = await kalshiGet("/trade-api/v2/portfolio/fills", params);
    const fills: KalshiFill[] = data.fills ?? [];
    all.push(...fills);

    if (!data.cursor || fills.length < 100) break;
    cursor = data.cursor;
    await new Promise((r) => setTimeout(r, 300)); // rate limit courtesy
  }

  return all;
}

// Get market info for a ticker (title, category)
export async function getMarket(ticker: string) {
  try {
    const data = await kalshiGet(`/trade-api/v2/markets/${ticker}`);
    return data.market ?? null;
  } catch {
    return null;
  }
}

// Get all settlements paginated
export async function getAllSettlements() {
  const all: KalshiSettlement[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < 20; i++) {
    const params: Record<string, string> = { limit: "100" };
    if (cursor) params.cursor = cursor;
    const data = await kalshiGet("/trade-api/v2/portfolio/settlements", params);
    const items: KalshiSettlement[] = data.settlements ?? [];
    all.push(...items);
    if (!data.cursor || items.length < 100) break;
    cursor = data.cursor;
    await new Promise((r) => setTimeout(r, 300));
  }
  return all;
}

// Get all open position tickers (what you currently hold)
export async function getOpenPositionTickers(): Promise<Set<string>> {
  const data = await kalshiGet("/trade-api/v2/portfolio/positions", { limit: "100" });
  const positions: { ticker: string; position: number }[] = data.market_positions ?? [];
  // Only positions with non-zero contracts are truly open
  return new Set(positions.filter((p) => p.position !== 0).map((p) => p.ticker));
}

export type KalshiSettlement = {
  ticker: string;
  event_ticker: string;
  market_result: string;
  yes_count_fp: string;
  no_count_fp: string;
  yes_total_cost_dollars: string;
  no_total_cost_dollars: string;
  revenue: number;
  fee_cost: string;
  settled_time: string;
};

export type KalshiFill = {
  fill_id: string;
  trade_id: string;
  order_id: string;
  market_ticker: string;
  ticker: string;
  action: "buy" | "sell";
  side: "yes" | "no";
  count_fp: string;
  yes_price_dollars: string;
  no_price_dollars: string;
  fee_cost: string;
  created_time: string;
  ts: number;
  is_taker: boolean;
};
