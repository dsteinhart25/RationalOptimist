import portfolioData from "../../data/portfolio.json";

const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

/* ── Types ── */
interface Position {
  id: number;
  newsletter: string;
  ticker: string;
  company: string;
  action: string;
  buyDate: string;
  buyPrice: number;
  sellDate: string | null;
  sellPrice: number | null;
  latestPrice: number | null;
  freeRideDate: string | null;
  freeRidePct: number | null;
  freeRidePrice: number | null;
  stopLoss: number | null;
  positionSize: string;
  status: "open" | "closed" | "free-ride";
  guidance: string;
  notes: string;
}

interface Newsletter {
  id: string;
  name: string;
  source: string;
  url: string;
}

/* ── Helpers ── */
function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

function fmtShort(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y.slice(2)}`;
}

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

function holdingPeriod(buyDate: string, sellDate: string | null) {
  const end = sellDate ?? new Date().toISOString().slice(0, 10);
  const days = daysBetween(buyDate, end);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  const years = Math.floor(days / 365);
  const rem = Math.round((days % 365) / 30);
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

/**
 * Calculate total return:
 * - Open: (latest - buy) / buy
 * - Free-ride: ((pctSold * freeRidePrice) + ((1-pctSold) * latest) - buy) / buy
 * - Closed: (sell - buy) / buy
 */
function calcReturn(p: Position): number | null {
  if (p.status === "closed" && p.sellPrice !== null) {
    return ((p.sellPrice - p.buyPrice) / p.buyPrice) * 100;
  }
  if (
    p.status === "free-ride" &&
    p.freeRidePct !== null &&
    p.freeRidePrice !== null &&
    p.latestPrice !== null
  ) {
    const sold = p.freeRidePct / 100;
    const cashFromSale = sold * p.freeRidePrice;
    const remainingValue = (1 - sold) * p.latestPrice;
    return ((cashFromSale + remainingValue - p.buyPrice) / p.buyPrice) * 100;
  }
  if (p.latestPrice !== null) {
    return ((p.latestPrice - p.buyPrice) / p.buyPrice) * 100;
  }
  return null;
}

/* ── Summary stats ── */
function computeStats(positions: Position[]) {
  const open = positions.filter((p) => p.status === "open");
  const closed = positions.filter((p) => p.status === "closed");
  const freeRides = positions.filter((p) => p.status === "free-ride");

  const allReturns = positions.map(calcReturn).filter((r): r is number => r !== null);
  const winners = allReturns.filter((g) => g > 0).length;
  const losers = allReturns.filter((g) => g <= 0).length;
  const avgReturn =
    allReturns.length > 0
      ? allReturns.reduce((a, b) => a + b, 0) / allReturns.length
      : 0;

  return {
    totalPositions: positions.length,
    openPositions: open.length,
    closedPositions: closed.length,
    freeRidePositions: freeRides.length,
    winners,
    losers,
    winRate: winners + losers > 0 ? (winners / (winners + losers)) * 100 : 0,
    avgReturn,
  };
}

/* ── Action badge ── */
function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    Buy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Hold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Free Ride": "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Sell: "bg-red-500/15 text-red-400 border-red-500/30",
    Closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${styles[action] ?? styles.Hold}`}
    >
      {action}
    </span>
  );
}

/* ── Gain/Loss display ── */
function GainLoss({ value }: { value: number }) {
  const color =
    value > 0 ? "text-emerald-400" : value < 0 ? "text-red-400" : "text-text-muted";
  return (
    <span className={`font-semibold ${color}`}>
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/* ── Main page ── */
export default function PortfolioPage() {
  const newsletters = portfolioData.newsletters as Newsletter[];
  const positions = portfolioData.positions as Position[];
  const stats = computeStats(positions);
  const lastUpdated = (portfolioData as { lastUpdated?: string }).lastUpdated;

  const nlMap = new Map(newsletters.map((n) => [n.id, n]));

  /* group by newsletter */
  const grouped = new Map<string, Position[]>();
  for (const p of positions) {
    const arr = grouped.get(p.newsletter) ?? [];
    arr.push(p);
    grouped.set(p.newsletter, arr);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto">
          <a href={BASE} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" className="h-8 w-8" />
            <span
              className="text-sm font-bold tracking-[-0.5px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-text-primary">Rational Optimist</span>{" "}
              <span className="text-gold">Society</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE}/about`}
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              About
            </a>
            <a
              href={BASE}
              className="hidden sm:inline-flex px-4 py-2 rounded-[8px] text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
            >
              Home
            </a>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main
        className="flex-1 px-4 sm:px-6 py-12"
        style={{
          background:
            "linear-gradient(180deg, #0a0a0b 0%, #111113 50%, #0a0a0b 100%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-[-0.5px] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Portfolio <span className="text-gold">Tracker</span>
            </h1>
            <p className="text-text-secondary text-sm">
              Newsletter positions across all subscriptions.
              {lastUpdated && (
                <span className="text-text-muted ml-2">
                  Last updated {fmt(lastUpdated)}
                </span>
              )}
            </p>
          </div>

          {/* ─── Summary Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {[
              { label: "Total", value: stats.totalPositions, color: "text-text-primary" },
              { label: "Open", value: stats.openPositions, color: "text-blue-400" },
              { label: "Free Rides", value: stats.freeRidePositions, color: "text-emerald-400" },
              { label: "Closed", value: stats.closedPositions, color: "text-text-secondary" },
              {
                label: "Win Rate",
                value: stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : "—",
                color: "text-gold",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-[12px] bg-bg-card border border-border p-5"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
              >
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-bold ${card.color}`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* ─── Avg Return ─── */}
          <div className="mb-10 rounded-[12px] bg-bg-card border border-border p-5 max-w-xs"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
          >
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              Avg Return (All Positions)
            </p>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <GainLoss value={stats.avgReturn} />
            </p>
          </div>

          {/* ─── Position Tables (grouped by newsletter) ─── */}
          {Array.from(grouped.entries()).map(([nlId, nlPositions]) => {
            const nl = nlMap.get(nlId);
            return (
              <div key={nlId} className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    className="text-lg font-bold text-text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {nl?.name ?? nlId}
                  </h2>
                  {nl && (
                    <span className="text-xs text-text-muted">
                      {nl.source}
                    </span>
                  )}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block rounded-[12px] border border-border overflow-hidden"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-bg-tertiary text-text-muted text-xs uppercase tracking-wider">
                          <th className="text-left px-4 py-3 font-medium">Ticker</th>
                          <th className="text-left px-4 py-3 font-medium">Company</th>
                          <th className="text-left px-4 py-3 font-medium">Action</th>
                          <th className="text-left px-4 py-3 font-medium">Size</th>
                          <th className="text-right px-4 py-3 font-medium">Entry</th>
                          <th className="text-right px-4 py-3 font-medium">Latest</th>
                          <th className="text-left px-4 py-3 font-medium">Buy Date</th>
                          <th className="text-left px-4 py-3 font-medium">Free Ride</th>
                          <th className="text-right px-4 py-3 font-medium">Return</th>
                          <th className="text-right px-4 py-3 font-medium">Holding</th>
                          <th className="text-right px-4 py-3 font-medium">Stop</th>
                          <th className="text-left px-4 py-3 font-medium">Guidance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {nlPositions.map((p) => {
                          const totalReturn = calcReturn(p);
                          return (
                            <tr
                              key={p.id}
                              className="bg-bg-card hover:bg-bg-card-hover transition-colors"
                            >
                              <td className="px-4 py-3 font-semibold text-gold whitespace-nowrap">
                                {p.ticker}
                              </td>
                              <td className="px-4 py-3 text-text-primary whitespace-nowrap">
                                {p.company}
                              </td>
                              <td className="px-4 py-3">
                                <ActionBadge action={p.action} />
                              </td>
                              <td className="px-4 py-3 text-text-secondary text-xs">
                                {p.positionSize}
                              </td>
                              <td className="px-4 py-3 text-right text-text-primary font-mono">
                                ${p.buyPrice.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                                {p.latestPrice !== null ? (
                                  <span className={
                                    p.latestPrice >= p.buyPrice
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }>
                                    ${p.latestPrice.toFixed(2)}
                                  </span>
                                ) : p.sellPrice !== null ? (
                                  <span className="text-text-muted">
                                    ${p.sellPrice.toFixed(2)}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                                {fmtShort(p.buyDate)}
                              </td>
                              <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                                {p.freeRideDate ? (
                                  <span>
                                    {fmtShort(p.freeRideDate)}
                                    {p.freeRidePct !== null && (
                                      <span className="text-emerald-400 ml-1 text-xs">
                                        {p.freeRidePct}% @ ${p.freeRidePrice?.toFixed(2)}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {totalReturn !== null ? (
                                  <GainLoss value={totalReturn} />
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap">
                                {holdingPeriod(p.buyDate, p.sellDate)}
                              </td>
                              <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap">
                                {p.stopLoss !== null ? (
                                  <span className="text-red-400/70">{p.stopLoss}%</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-4 py-3 text-text-muted text-xs max-w-[220px]">
                                {p.guidance || p.notes || "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile / tablet cards */}
                <div className="lg:hidden flex flex-col gap-3">
                  {nlPositions.map((p) => {
                    const totalReturn = calcReturn(p);
                    return (
                      <div
                        key={p.id}
                        className="rounded-[12px] bg-bg-card border border-border p-4"
                        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gold font-bold text-base">
                              {p.ticker}
                            </span>
                            <span className="text-text-secondary text-sm">
                              {p.company}
                            </span>
                          </div>
                          <ActionBadge action={p.action} />
                        </div>

                        {/* Price + return row */}
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div>
                            <span className="text-text-muted text-xs block">Entry</span>
                            <span className="text-text-primary font-mono text-sm">
                              ${p.buyPrice.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-text-muted text-xs block">Latest</span>
                            {p.latestPrice !== null ? (
                              <span className={`font-mono text-sm ${
                                p.latestPrice >= p.buyPrice
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}>
                                ${p.latestPrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-text-muted text-sm">—</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-text-muted text-xs block">Return</span>
                            {totalReturn !== null ? (
                              <GainLoss value={totalReturn} />
                            ) : (
                              <span className="text-text-muted text-sm">—</span>
                            )}
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-3 gap-2 text-xs border-t border-border pt-3">
                          <div>
                            <span className="text-text-muted">Buy Date</span>
                            <p className="text-text-secondary">{fmtShort(p.buyDate)}</p>
                          </div>
                          <div>
                            <span className="text-text-muted">Holding</span>
                            <p className="text-text-secondary">
                              {holdingPeriod(p.buyDate, p.sellDate)}
                            </p>
                          </div>
                          <div>
                            <span className="text-text-muted">Size</span>
                            <p className="text-text-secondary">{p.positionSize}</p>
                          </div>
                          {p.freeRideDate && (
                            <div className="col-span-2">
                              <span className="text-text-muted">Free Ride</span>
                              <p className="text-emerald-400">
                                {fmtShort(p.freeRideDate)} — sold {p.freeRidePct}% @ ${p.freeRidePrice?.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {p.stopLoss !== null && (
                            <div>
                              <span className="text-text-muted">Hard Stop</span>
                              <p className="text-red-400/70">{p.stopLoss}%</p>
                            </div>
                          )}
                        </div>

                        {/* Guidance */}
                        {(p.guidance || p.notes) && (
                          <div className="mt-3 border-t border-border pt-2">
                            {p.guidance && (
                              <p className="text-text-muted text-xs">{p.guidance}</p>
                            )}
                            {p.notes && (
                              <p className="text-text-muted text-xs mt-1 italic">{p.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ─── Empty state ─── */}
          {positions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">No positions tracked yet.</p>
              <p className="text-text-muted text-sm mt-2">
                Add positions to{" "}
                <code className="text-gold">src/data/portfolio.json</code> to get started.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-bg py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-sm text-text-muted">
            <a href={BASE} className="hover:text-gold transition-colors">
              Home
            </a>
            <a
              href={`${BASE}/about`}
              className="hover:text-gold transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
