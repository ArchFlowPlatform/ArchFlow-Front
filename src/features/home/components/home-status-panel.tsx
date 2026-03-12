import { Component, Palette } from "lucide-react"

import { FeatureCard } from "@/components/shared/feature-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { HOME_STATUS_ITEMS } from "@/features/home/constants/home.constants"
import type { HomeStatusItem } from "@/features/home/types/home.types"

import { StatusRow } from "./status-row"

export function HomeStatusPanel() {
  return (
    <FeatureCard
      icon={<Palette className="size-5 text-primary" aria-hidden />}
      title="UI layer structure"
      description="Project rules are now reflected in the component layout."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="success">shadcn</StatusBadge>
          <StatusBadge>Tailwind</StatusBadge>
          <StatusBadge tone="outline">Feature-first</StatusBadge>
        </div>
        <div className="space-y-3">
          {HOME_STATUS_ITEMS.map((item: HomeStatusItem) => (
            <StatusRow key={item.label} item={item} />
          ))}
        </div>
        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Component className="size-4" aria-hidden />
            Component rule
          </div>
          Raw primitives stay inside `src/components/ui`, while reusable
          composed blocks live in `src/components/shared`.
        </div>
      </div>
    </FeatureCard>
  )
}
