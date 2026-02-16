import portfolioData from "../../data/portfolio.json";

const BASE = "/RationalOptimist";

/* ── RiskHedge brand colors (inline — scoped to this page only) ── */
const RH = {
  accent: "#14b8a6",       // teal-500
  accentLight: "#5eead4",  // teal-300
  accentDim: "rgba(20,184,166,0.12)",
  bg: "#0b1120",           // deep navy
  bgCard: "#111827",       // gray-900
  bgCardHover: "#1a2235",
  bgHeader: "#0d1526",
  border: "#1e293b",       // slate-700
  borderHover: "#334155",  // slate-600
  textPrimary: "#f1f5f9",  // slate-100
  textSecondary: "#94a3b8", // slate-400
  textMuted: "#64748b",    // slate-500
};

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
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    Buy: { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.25)" },
    Hold: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
    "Free Ride": { bg: "rgba(59,130,246,0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
    Sell: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
    Closed: { bg: "rgba(100,116,139,0.12)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" },
  };
  const s = styles[action] ?? styles.Hold;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {action}
    </span>
  );
}

/* ── Gain/Loss display ── */
function GainLoss({ value }: { value: number }) {
  const color = value > 0 ? "#34d399" : value < 0 ? "#f87171" : RH.textMuted;
  return (
    <span className="font-semibold" style={{ color }}>
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

/* ── Main page ── */
export default function PortfolioPage() {
  const positions = portfolioData.positions as Position[];
  const stats = computeStats(positions);
  const lastUpdated = (portfolioData as { lastUpdated?: string }).lastUpdated;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: RH.bg, color: RH.textPrimary }}>
      {/* ─── Navigation ─── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: `${RH.bg}ee`, borderBottom: `1px solid ${RH.border}` }}
      >
        <div className="flex items-center justify-between px-6 py-3 max-w-[1400px] mx-auto">
          <a href={`${BASE}/portfolio`} className="flex items-center gap-3">
            {/* RiskHedge shield icon */}
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: RH.accentDim, color: RH.accent, border: `1px solid ${RH.accent}33` }}
            >
              RH
            </div>
            <div className="flex flex-col">
              <span
                className="text-sm font-bold tracking-[-0.5px] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span style={{ color: RH.textPrimary }}>Risk</span>
                <span style={{ color: RH.accent }}>Hedge</span>
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight"
                style={{ color: RH.textMuted }}
              >
                Disruption X
              </span>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`${BASE}/di-portfolio`}
              className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: RH.textSecondary }}
            >
              Disruption Investor
            </a>
            <a
              href={BASE}
              className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: RH.textSecondary }}
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
          background: `linear-gradient(180deg, ${RH.bg} 0%, #0f1729 50%, ${RH.bg} 100%)`,
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-[-0.5px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span style={{ color: RH.accent }}>Disruption X</span>{" "}
                <span style={{ color: RH.textPrimary }}>Portfolio</span>
              </h1>
            </div>
            <p className="text-sm" style={{ color: RH.textSecondary }}>
              Active positions and guidance from the Disruption X advisory.
              {lastUpdated && (
                <span style={{ color: RH.textMuted }} className="ml-2">
                  Updated {fmt(lastUpdated)}
                </span>
              )}
            </p>
          </div>

          {/* ─── Summary Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {[
              { label: "Total", value: stats.totalPositions, color: RH.textPrimary },
              { label: "Open", value: stats.openPositions, color: "#60a5fa" },
              { label: "Free Rides", value: stats.freeRidePositions, color: "#34d399" },
              { label: "Avg Return", value: null, color: RH.accent },
              {
                label: "Win Rate",
                value: stats.winRate > 0 ? `${stats.winRate.toFixed(0)}%` : "\u2014",
                color: RH.accent,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl p-5"
                style={{
                  background: RH.bgCard,
                  border: `1px solid ${RH.border}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: RH.textMuted }}
                >
                  {card.label}
                </p>
                {card.label === "Avg Return" ? (
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <GainLoss value={stats.avgReturn} />
                  </p>
                ) : (
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-display)", color: card.color }}
                  >
                    {card.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ─── Positions Table ─── */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-display)", color: RH.textPrimary }}
              >
                Open Positions
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: RH.accentDim, color: RH.accent }}
              >
                {positions.length} positions
              </span>
            </div>

            {/* Desktop table */}
            <div
              className="hidden lg:block rounded-xl overflow-hidden"
              style={{
                border: `1px solid ${RH.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="text-xs uppercase tracking-wider"
                      style={{ background: "#151d2e", color: RH.textMuted }}
                    >
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
                  <tbody>
                    {positions.map((p, i) => {
                      const totalReturn = calcReturn(p);
                      return (
                        <tr
                          key={p.id}
                          style={{
                            background: i % 2 === 0 ? RH.bgCard : "#0f1729",
                            borderBottom: `1px solid ${RH.border}`,
                          }}
                        >
                          <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: RH.accent }}>
                            {p.ticker}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: RH.textPrimary }}>
                            {p.company}
                          </td>
                          <td className="px-4 py-3">
                            <ActionBadge action={p.action} />
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: RH.textSecondary }}>
                            {p.positionSize}
                          </td>
                          <td className="px-4 py-3 text-right font-mono" style={{ color: RH.textPrimary }}>
                            ${p.buyPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                            {p.latestPrice !== null ? (
                              <span style={{ color: p.latestPrice >= p.buyPrice ? "#34d399" : "#f87171" }}>
                                ${p.latestPrice.toFixed(2)}
                              </span>
                            ) : p.sellPrice !== null ? (
                              <span style={{ color: RH.textMuted }}>
                                ${p.sellPrice.toFixed(2)}
                              </span>
                            ) : (
                              "\u2014"
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: RH.textSecondary }}>
                            {fmtShort(p.buyDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: RH.textSecondary }}>
                            {p.freeRideDate ? (
                              <span>
                                {fmtShort(p.freeRideDate)}
                                {p.freeRidePct !== null && (
                                  <span className="ml-1 text-xs" style={{ color: "#34d399" }}>
                                    {p.freeRidePct}% @ ${p.freeRidePrice?.toFixed(2)}
                                  </span>
                                )}
                              </span>
                            ) : (
                              "\u2014"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {totalReturn !== null ? <GainLoss value={totalReturn} /> : "\u2014"}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap" style={{ color: RH.textMuted }}>
                            {holdingPeriod(p.buyDate, p.sellDate)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap" style={{ color: RH.textMuted }}>
                            {p.stopLoss !== null ? (
                              <span style={{ color: "rgba(248,113,113,0.7)" }}>{p.stopLoss}%</span>
                            ) : (
                              "\u2014"
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs max-w-[220px]" style={{ color: RH.textMuted }}>
                            {p.guidance || p.notes || "\u2014"}
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
              {positions.map((p) => {
                const totalReturn = calcReturn(p);
                return (
                  <div
                    key={p.id}
                    className="rounded-xl p-4"
                    style={{
                      background: RH.bgCard,
                      border: `1px solid ${RH.border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base" style={{ color: RH.accent }}>
                          {p.ticker}
                        </span>
                        <span className="text-sm" style={{ color: RH.textSecondary }}>
                          {p.company}
                        </span>
                      </div>
                      <ActionBadge action={p.action} />
                    </div>

                    {/* Price + return row */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div>
                        <span className="text-xs block" style={{ color: RH.textMuted }}>Entry</span>
                        <span className="font-mono text-sm" style={{ color: RH.textPrimary }}>
                          ${p.buyPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-xs block" style={{ color: RH.textMuted }}>Latest</span>
                        {p.latestPrice !== null ? (
                          <span
                            className="font-mono text-sm"
                            style={{ color: p.latestPrice >= p.buyPrice ? "#34d399" : "#f87171" }}
                          >
                            ${p.latestPrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm" style={{ color: RH.textMuted }}>{"\u2014"}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs block" style={{ color: RH.textMuted }}>Return</span>
                        {totalReturn !== null ? (
                          <GainLoss value={totalReturn} />
                        ) : (
                          <span className="text-sm" style={{ color: RH.textMuted }}>{"\u2014"}</span>
                        )}
                      </div>
                    </div>

                    {/* Details grid */}
                    <div
                      className="grid grid-cols-3 gap-2 text-xs pt-3"
                      style={{ borderTop: `1px solid ${RH.border}` }}
                    >
                      <div>
                        <span style={{ color: RH.textMuted }}>Buy Date</span>
                        <p style={{ color: RH.textSecondary }}>{fmtShort(p.buyDate)}</p>
                      </div>
                      <div>
                        <span style={{ color: RH.textMuted }}>Holding</span>
                        <p style={{ color: RH.textSecondary }}>
                          {holdingPeriod(p.buyDate, p.sellDate)}
                        </p>
                      </div>
                      <div>
                        <span style={{ color: RH.textMuted }}>Size</span>
                        <p style={{ color: RH.textSecondary }}>{p.positionSize}</p>
                      </div>
                      {p.freeRideDate && (
                        <div className="col-span-2">
                          <span style={{ color: RH.textMuted }}>Free Ride</span>
                          <p style={{ color: "#34d399" }}>
                            {fmtShort(p.freeRideDate)} — sold {p.freeRidePct}% @ ${p.freeRidePrice?.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {p.stopLoss !== null && (
                        <div>
                          <span style={{ color: RH.textMuted }}>Hard Stop</span>
                          <p style={{ color: "rgba(248,113,113,0.7)" }}>{p.stopLoss}%</p>
                        </div>
                      )}
                    </div>

                    {/* Guidance */}
                    {(p.guidance || p.notes) && (
                      <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${RH.border}` }}>
                        {p.guidance && (
                          <p className="text-xs" style={{ color: RH.textMuted }}>{p.guidance}</p>
                        )}
                        {p.notes && (
                          <p className="text-xs mt-1 italic" style={{ color: RH.textMuted }}>{p.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Empty state ─── */}
          {positions.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: RH.textMuted }}>No positions tracked yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid ${RH.border}`, background: RH.bg }} className="py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold tracking-[-0.3px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span style={{ color: RH.textPrimary }}>Risk</span>
              <span style={{ color: RH.accent }}>Hedge</span>
            </span>
            <span className="text-xs" style={{ color: RH.textMuted }}>
              Disruption Research
            </span>
          </div>
          <p className="text-sm" style={{ color: RH.textMuted }}>
            &copy; {new Date().getFullYear()} RiskHedge. For subscriber use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
