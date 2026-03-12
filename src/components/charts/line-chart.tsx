"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import { getChartColor } from "@/components/charts/chart-colors"
import type {
  ChartContainerProps,
  ChartDataPoint,
  ChartDataPointMulti,
} from "@/components/charts/chart-types"

export interface LineChartProps extends ChartContainerProps {
  /** Data for single or multiple series. Each point must have a "name" and at least one value key. */
  data: ChartDataPoint[] | ChartDataPointMulti[]
  /** Data key for single-series mode (ignored if dataKeys is set). */
  dataKey?: string
  /** For multi-series: keys and optional colors for each line. */
  dataKeys?: { key: string; color?: string }[]
  /** Unit label for tooltip/axis (e.g. "€", "kg"). */
  unit?: string
}

export function LineChart({
  data,
  dataKey = "value",
  dataKeys,
  unit,
  title = "Line chart",
  height = 300,
  className,
}: LineChartProps) {
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
        <RechartsLineChart
          data={data as ChartDataPoint[]}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
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
            <Line
              key={String(key)}
              type="monotone"
              dataKey={key}
              stroke={
                dataKeys?.[index]?.color ?? getChartColor(index)
              }
              strokeWidth={2}
              dot={{ fill: "var(--background)", strokeWidth: 2 }}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
