"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

/* ── brand tokens (match globals.css @theme) ── */
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e0c97a";
const NAVY = "#0f1b2d";
const NAVY_LIGHT = "#1a2d4a";
const SLATE = "#6b7fa3";
const CREAM = "#e8e4d9";

/* ── types ── */
export interface ChartDatum {
  label: string;
  value: number;
}

interface Props {
  title: string;
  subtitle: string;
  data: ChartDatum[];
  source: string;
  yLabel?: string;
  ySuffix?: string;
  yPrefix?: string;
  variant?: "area" | "bar";
  accentColor?: string;
  referenceValue?: number;
  referenceLabel?: string;
}

/* ── custom tooltip ── */
function CustomTooltip({
  active,
  payload,
  ySuffix = "",
  yPrefix = "",
}: {
  active?: boolean;
  payload?: { value: number; payload: ChartDatum }[];
  ySuffix?: string;
  yPrefix?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: NAVY,
        border: `1px solid ${GOLD}`,
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      <p style={{ color: CREAM, fontSize: 13, margin: 0, fontWeight: 600 }}>
        {d.payload.label}
      </p>
      <p style={{ color: GOLD, fontSize: 16, margin: "4px 0 0", fontWeight: 700 }}>
        {yPrefix}
        {d.value.toLocaleString()}
        {ySuffix}
      </p>
    </div>
  );
}

/* ── main component ── */
export default function GoodNewsChart({
  title,
  subtitle,
  data,
  source,
  yLabel,
  ySuffix = "",
  yPrefix = "",
  variant = "area",
  accentColor = GOLD,
  referenceValue,
  referenceLabel,
}: Props) {
  const gradientId = `grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="rounded-2xl border border-gray-700/60 bg-navy-light p-6 sm:p-8 flex flex-col gap-4 hover:border-gold/40 transition-colors">
      {/* header */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
          {title}
        </h3>
        <p className="mt-1 text-sm sm:text-base text-slate-blue leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,127,163,0.15)" />
              <XAxis
                dataKey="label"
                tick={{ fill: SLATE, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(107,127,163,0.2)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: SLATE, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={
                  yLabel
                    ? {
                        value: yLabel,
                        angle: -90,
                        position: "insideLeft",
                        fill: SLATE,
                        fontSize: 11,
                        offset: 16,
                      }
                    : undefined
                }
              />
              <Tooltip
                content={<CustomTooltip ySuffix={ySuffix} yPrefix={yPrefix} />}
                cursor={{ fill: "rgba(201,168,76,0.08)" }}
              />
              <Bar
                dataKey="value"
                fill={accentColor}
                radius={[4, 4, 0, 0]}
                animationDuration={1200}
              />
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,127,163,0.15)" />
              <XAxis
                dataKey="label"
                tick={{ fill: SLATE, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(107,127,163,0.2)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: SLATE, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={
                  yLabel
                    ? {
                        value: yLabel,
                        angle: -90,
                        position: "insideLeft",
                        fill: SLATE,
                        fontSize: 11,
                        offset: 16,
                      }
                    : undefined
                }
              />
              <Tooltip
                content={<CustomTooltip ySuffix={ySuffix} yPrefix={yPrefix} />}
                cursor={{ stroke: GOLD_LIGHT, strokeDasharray: "4 4" }}
              />
              {referenceValue !== undefined && (
                <ReferenceLine
                  y={referenceValue}
                  stroke={SLATE}
                  strokeDasharray="6 4"
                  label={{
                    value: referenceLabel ?? "",
                    fill: SLATE,
                    fontSize: 10,
                    position: "right",
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: accentColor,
                  stroke: NAVY,
                  strokeWidth: 2,
                }}
                animationDuration={1200}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* source */}
      <p className="text-xs text-gray-500 mt-auto">Source: {source}</p>
    </div>
  );
}
