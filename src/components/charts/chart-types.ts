/**
 * Shared types for reusable chart components.
 * Charts accept typed props; do not place chart logic inside pages.
 */

/** Single data point for line/bar charts (one value per category). */
export interface ChartDataPoint {
  name: string
  value: number
}

/** Data point with multiple series (e.g. multiple lines or bar groups). */
export interface ChartDataPointMulti {
  name: string
  [seriesKey: string]: string | number
}

/** Data point for pie/donut charts. */
export interface PieDataPoint {
  name: string
  value: number
}

/** Common props for all chart wrappers. */
export interface ChartContainerProps {
  className?: string
  /** Chart title for accessibility. */
  title?: string
  /** Height of the chart container (default: 300). */
  height?: number
}
