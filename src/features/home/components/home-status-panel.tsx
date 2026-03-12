import { CheckCircle2, Component, Palette } from "lucide-react"

import { FeatureCard } from "@/components/shared/feature-card"
import { StatusBadge } from "@/components/shared/status-badge"

const statusItems = [
  {
    label: "Theme system",
    value: "Enabled",
  },
  {
    label: "Tailwind styling",
    value: "Utility-first",
  },
  {
    label: "Component boundaries",
    value: "Shared + feature-local",
  },
]

export function HomeStatusPanel() {
  return (
    <FeatureCard
      icon={<Palette className="size-5 text-primary" />}
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
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3"
            >
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>{item.label}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Component className="size-4" />
            Component rule
          </div>
          Raw primitives stay inside `src/components/ui`, while reusable composed
          blocks live in `src/components/shared`.
        </div>
      </div>
    </FeatureCard>
  )
}
