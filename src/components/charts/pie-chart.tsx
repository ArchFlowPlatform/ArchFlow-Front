"use client"

import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import { cn } from "@/lib/utils"
import { getChartColor } from "@/components/charts/chart-colors"
import type { ChartContainerProps, PieDataPoint } from "@/components/charts/chart-types"

export interface PieChartProps extends ChartContainerProps {
  data: PieDataPoint[]
  /** Key for the value field (default: "value"). */
  valueKey?: keyof PieDataPoint
  /** Key for the label field (default: "name"). */
  nameKey?: keyof PieDataPoint
  /** Unit label for tooltip (e.g. "€", "%"). */
  unit?: string
  /** Inner radius for donut style (0 = pie). */
  innerRadius?: number
}

export function PieChart({
  data,
  valueKey = "value",
  nameKey = "name",
  unit,
  innerRadius = 0,
  title = "Pie chart",
  height = 300,
  className,
}: PieChartProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={title}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={2}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getChartColor(index)}
                stroke="var(--background)"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
