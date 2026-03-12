import { Blocks, LayoutTemplate, Sparkles } from "lucide-react"

import { FeatureCard } from "@/components/shared/feature-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { HOME_COMPONENT_GROUPS } from "@/features/home/constants/home.constants"
import type { HomeComponentGroup } from "@/features/home/types/home.types"

import { ComponentList } from "./component-list"

const GROUP_ICON_MAP = {
  "Primitive layer": Blocks,
  "Shared layer": LayoutTemplate,
  "Feature layer": Sparkles,
} as const

const ICON_CLASS = "size-5 text-primary"

export function HomeComponentMap() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Component structure"
        title="A predictable UI layer for shared and feature-local code"
        description="This keeps the design system reusable, the feature code focused, and the App Router thin."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {HOME_COMPONENT_GROUPS.map((group: HomeComponentGroup) => {
          const Icon = GROUP_ICON_MAP[group.title as keyof typeof GROUP_ICON_MAP]
          return (
            <FeatureCard
              key={group.title}
              icon={Icon ? <Icon className={ICON_CLASS} aria-hidden /> : null}
              title={group.title}
              description={group.description}
            >
              <ComponentList items={group.items} />
            </FeatureCard>
          )
        })}
      </div>
    </section>
  )
}
