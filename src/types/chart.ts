/**
 * Burndown chart data point.
 * Used by BurndownChart in components/charts.
 */
export interface BurndownPoint {
  label: string;
  dateISO: string;
  idealRemaining: number;
  actualRemaining: number;
  delta: number;
}
