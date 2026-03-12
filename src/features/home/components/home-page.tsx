import { PageShell } from "@/components/shared/page-shell"
import { ThemeToggleHint } from "@/components/shared/theme-toggle-hint"

import { HomeComponentMap } from "@/features/home/components/home-component-map"
import { HomeHero } from "@/features/home/components/home-hero"
import { HomeStatusPanel } from "@/features/home/components/home-status-panel"

export function HomePage() {
  return (
    <PageShell>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <HomeHero />
        <HomeStatusPanel />
      </div>
      <HomeComponentMap />
      <ThemeToggleHint />
    </PageShell>
  )
}
