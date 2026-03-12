import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  tone?: "default" | "secondary" | "outline" | "success"
  children: ReactNode
}

export function StatusBadge({
  tone = "secondary",
  children,
}: StatusBadgeProps) {
  return <Badge variant={tone}>{children}</Badge>
}
