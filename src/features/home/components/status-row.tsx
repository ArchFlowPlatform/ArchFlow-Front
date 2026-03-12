import { CheckCircle2 } from "lucide-react"

import type { HomeStatusItem } from "@/features/home/types/home.types"

interface StatusRowProps {
  item: HomeStatusItem
}

export function StatusRow({ item }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-3 text-sm">
        <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />
        <span>{item.label}</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {item.value}
      </span>
    </div>
  )
}
