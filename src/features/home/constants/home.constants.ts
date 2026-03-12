import type { HomeComponentGroup, HomeStatusItem } from "@/features/home/types/home.types"

export const HOME_STATUS_ITEMS: readonly HomeStatusItem[] = [
  { label: "Theme system", value: "Enabled" },
  { label: "Tailwind styling", value: "Utility-first" },
  { label: "Component boundaries", value: "Shared + feature-local" },
] as const

export const HOME_COMPONENT_GROUPS: readonly HomeComponentGroup[] = [
  {
    title: "Primitive layer",
    description:
      "Generated and foundational shadcn-style components stay in `src/components/ui`.",
    items: ["Button", "Badge", "Card"],
  },
  {
    title: "Shared layer",
    description:
      "Reusable app-facing building blocks stay in `src/components/shared`.",
    items: ["PageShell", "FeatureCard", "SectionHeading", "StatusBadge"],
  },
  {
    title: "Feature layer",
    description:
      "Feature-specific composition stays next to the domain in `src/features/home/components`.",
    items: ["HomeHero", "HomeStatusPanel", "HomeComponentMap"],
  },
] as const
