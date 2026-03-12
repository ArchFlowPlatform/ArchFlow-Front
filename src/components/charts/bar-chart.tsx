"use client"

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import { getChartColor } from "@/components/charts/chart-colors"
import type { ChartContainerProps, ChartDataPoint, ChartDataPointMulti } from "@/components/charts/chart-types"

export interface BarChartProps extends ChartContainerProps {
  /** Data for single or multiple bar series. */
  data: ChartDataPoint[] | ChartDataPointMulti[]
  /** Data key for single-series mode (ignored if dataKeys is set). */
  dataKey?: string
  /** For multi-series: keys and optional colors for each bar group. */
  dataKeys?: { key: string; color?: string }[]
  /** Unit label for tooltip/axis (e.g. "€", "kg"). */
  unit?: string
}

export function BarChart({
  data,
  dataKey = "value",
  dataKeys,
  unit,
  title = "Bar chart",
  height = 300,
  className,
}: BarChartProps) {
  const keys =
    dataKeys && dataKeys.length > 0
      ? dataKeys.map((d) => d.key)
      : [dataKey]

  return (
    <div
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={title}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data as ChartDataPoint[]}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={unit ? (v) => `${v} ${unit}` : undefined}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
            formatter={
              unit
                ? (value: unknown) => [String(value ?? 0), unit] as [React.ReactNode, string]
                : undefined
            }
          />
          <Legend />
          {keys.map((key, index) => (
            <Bar
              key={String(key)}
              dataKey={key}
              fill={dataKeys?.[index]?.color ?? getChartColor(index)}
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
