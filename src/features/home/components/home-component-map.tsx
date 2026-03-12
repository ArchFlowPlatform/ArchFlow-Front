import { Blocks, LayoutTemplate, Sparkles } from "lucide-react"

import { FeatureCard } from "@/components/shared/feature-card"
import { SectionHeading } from "@/components/shared/section-heading"

const componentGroups = [
  {
    title: "Primitive layer",
    description:
      "Generated and foundational shadcn-style components stay in `src/components/ui`.",
    icon: <Blocks className="size-5 text-primary" />,
    items: ["Button", "Badge", "Card"],
  },
  {
    title: "Shared layer",
    description:
      "Reusable app-facing building blocks stay in `src/components/shared`.",
    icon: <LayoutTemplate className="size-5 text-primary" />,
    items: ["PageShell", "FeatureCard", "SectionHeading", "StatusBadge"],
  },
  {
    title: "Feature layer",
    description:
      "Feature-specific composition stays next to the domain in `src/features/home/components`.",
    icon: <Sparkles className="size-5 text-primary" />,
    items: ["HomeHero", "HomeStatusPanel", "HomeComponentMap"],
  },
]

export function HomeComponentMap() {
  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Component structure"
        title="A predictable UI layer for shared and feature-local code"
        description="This keeps the design system reusable, the feature code focused, and the App Router thin."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {componentGroups.map((group) => (
          <FeatureCard
            key={group.title}
            icon={group.icon}
            title={group.title}
            description={group.description}
          >
            <ul className="space-y-2 text-sm text-muted-foreground">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </FeatureCard>
        ))}
      </div>
    </section>
  )
}
