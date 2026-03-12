import { ArrowRight, Layers3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"

export function HomeHero() {
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-8 text-card-foreground shadow-sm">
      <StatusBadge tone="success">UI layer ready</StatusBadge>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Layers3 className="size-4" />
          <span>Next.js enterprise structure with shared and feature-local UI</span>
        </div>
        <div className="space-y-3">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Build with shadcn primitives, shared wrappers, and feature-first composition.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            The UI layer now separates reusable primitives in
            <span className="mx-1 font-mono text-foreground">src/components/ui</span>
            from shared app-facing building blocks in
            <span className="mx-1 font-mono text-foreground">src/components/shared</span>
            and feature-local composition in
            <span className="ml-1 font-mono text-foreground">src/features/home/components</span>.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button>
          Shared primitives
          <ArrowRight className="size-4" />
        </Button>
        <Button variant="outline">Feature components</Button>
      </div>
    </section>
  )
}
