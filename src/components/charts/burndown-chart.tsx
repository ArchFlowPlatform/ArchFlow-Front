"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cx } from "@/lib/utils/cx";
import type { BurndownPoint } from "@/types/chart";

export interface BurndownChartProps {
  points: BurndownPoint[];
  scopeHours: number;
  burnedHours: number;
  remainingHours: number;
  note?: string;
}

interface ChartPoint extends BurndownPoint {
  dayLabel: string;
}

const NUM_GRID_LINES = 5;

/** Single source of truth for burndown line series — used by `<Line>` and the legend. */
export const BURNDOWN_CHART_SERIES = {
  ideal: {
    stroke: "rgba(255,255,255,0.35)",
    strokeDasharray: "6 6",
    strokeWidth: 2,
    label: "Ideal remaining",
  },
  actual: {
    stroke: "var(--af-pin, #6D28D9)",
    strokeWidth: 2.5,
    label: "Actual remaining",
  },
} as const;

function formatHours(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  if (Number.isInteger(rounded)) return `${rounded}h`;
  return `${rounded.toFixed(1)}h`;
}

function clamp(value: number, maxY: number): number {
  return Math.max(0, Math.min(Number(value) || 0, maxY));
}

function BurndownTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div
      className={cx(
        "af-surface-md min-w-[180px] bg-[#14121a]/96 px-3 py-2 text-[11px] text-white/80",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="af-text-tertiary text-[10px] font-semibold uppercase tracking-[0.16em]">
          Dia
        </span>
        <span className="af-text-secondary text-[10px]">{point.dateISO}</span>
      </div>
      <div className="mt-1 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="af-text-secondary">Ideal remaining</span>
          <span>{formatHours(point.idealRemaining)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="af-text-secondary">Actual remaining</span>
          <span>{formatHours(point.actualRemaining)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="af-text-secondary">Delta</span>
          <span>{formatHours(point.delta)}</span>
        </div>
      </div>
    </div>
  );
}

export default function BurndownChart({
  points,
  scopeHours,
  burnedHours,
  remainingHours,
  note = "Nota: sem histórico diário (worklog/done_at). A linha \"Actual\" é uma aproximação distribuindo horas registradas até o due date do card (ou fim da sprint).",
}: BurndownChartProps) {
  const { chartPoints, gridTicks, maxY } = useMemo(() => {
    const safeScopeHours = Math.max(Number(scopeHours) || 0, 0);
    const derivedMaxY = Math.max(safeScopeHours, 1);
    const totalPoints = Math.max(points.length, 1);

    const nextChartPoints: ChartPoint[] = points.map((point, index) => {
      const t = totalPoints === 1 ? 0 : index / (totalPoints - 1);
      const idealRemaining = clamp(
        Number.isFinite(point.idealRemaining)
          ? point.idealRemaining
          : safeScopeHours * (1 - t),
        derivedMaxY,
      );
      const actualRemaining = clamp(point.actualRemaining, derivedMaxY);
      const delta =
        Number.isFinite(point.delta)
          ? point.delta
          : Number((actualRemaining - idealRemaining).toFixed(2));

      return {
        ...point,
        dayLabel: point.label,
        idealRemaining: Number(idealRemaining.toFixed(2)),
        actualRemaining: Number(actualRemaining.toFixed(2)),
        delta: Number(delta.toFixed(2)),
      };
    });

    const nextGridTicks = Array.from({ length: NUM_GRID_LINES }, (_, index) => {
      const t = index / (NUM_GRID_LINES - 1);
      return Number((derivedMaxY * t).toFixed(2));
    });

    return { chartPoints: nextChartPoints, gridTicks: nextGridTicks, maxY: derivedMaxY };
  }, [points, scopeHours]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="af-text-tertiary text-xs font-semibold uppercase tracking-[0.18em]">
            Burndown
          </p>
          <p className="af-text-secondary text-xs">
            Remaining hours (Actual vs Ideal)
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className="af-text-secondary flex flex-wrap items-center justify-end gap-3 text-[10px]"
            role="list"
            aria-label="Séries do gráfico"
          >
            <span className="inline-flex items-center gap-1.5" role="listitem">
              <span
                className="inline-block w-8 shrink-0 border-t-2 border-dashed"
                style={{
                  borderColor: BURNDOWN_CHART_SERIES.ideal.stroke,
                }}
                aria-hidden
              />
              <span>{BURNDOWN_CHART_SERIES.ideal.label}</span>
            </span>
            <span className="inline-flex items-center gap-1.5" role="listitem">
              <span
                className="inline-block h-0.5 w-8 shrink-0 rounded-sm"
                style={{
                  backgroundColor: BURNDOWN_CHART_SERIES.actual.stroke,
                }}
                aria-hidden
              />
              <span>{BURNDOWN_CHART_SERIES.actual.label}</span>
            </span>
          </div>
          <div className="af-text-secondary flex flex-wrap items-center justify-end gap-2 text-[10px]">
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              <span className="af-text-tertiary mr-1.5 text-[9px] uppercase tracking-wide">
                Métricas
              </span>
              Scope&nbsp;{formatHours(scopeHours)}
            </span>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Burned&nbsp;{formatHours(burnedHours)}
            </span>
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5">
              Remaining&nbsp;{formatHours(remainingHours)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-1 h-[240px] min-h-[12rem] w-full min-w-0 md:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartPoints}
            margin={{ top: 12, right: 8, bottom: 8, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="dayLabel"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 9 }}
              tickMargin={10}
              minTickGap={12}
            />
            <YAxis
              type="number"
              domain={[0, maxY]}
              ticks={gridTicks}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10 }}
              tickMargin={8}
              width={44}
              tickFormatter={formatHours}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
              content={<BurndownTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            <Line
              type="monotone"
              dataKey="idealRemaining"
              stroke={BURNDOWN_CHART_SERIES.ideal.stroke}
              strokeWidth={BURNDOWN_CHART_SERIES.ideal.strokeWidth}
              strokeDasharray={BURNDOWN_CHART_SERIES.ideal.strokeDasharray}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actualRemaining"
              stroke={BURNDOWN_CHART_SERIES.actual.stroke}
              strokeWidth={BURNDOWN_CHART_SERIES.actual.strokeWidth}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {note ? (
        <p className="af-text-tertiary text-[10px]">{note}</p>
      ) : null}
    </div>
  );
}
