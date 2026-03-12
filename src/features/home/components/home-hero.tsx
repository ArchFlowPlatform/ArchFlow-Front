import { ArrowRight, Layers3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"

export function HomeHero() {
  return (
    <section
      className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-8 text-card-foreground shadow-sm"
      aria-labelledby="home-hero-title"
    >
      <StatusBadge tone="success">UI layer ready</StatusBadge>
      <div className="space-y-4">
        <p className="flex items-center gap-3 text-sm text-muted-foreground">
          <Layers3 className="size-4 shrink-0" aria-hidden />
          <span>Next.js enterprise structure with shared and feature-local UI</span>
        </p>
        <div className="space-y-3">
          <h1
            id="home-hero-title"
            className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Build with shadcn primitives, shared wrappers, and feature-first composition.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            The UI layer now separates reusable primitives in{" "}
            <code className="mx-1 font-mono text-foreground">src/components/ui</code>
            from shared app-facing building blocks in{" "}
            <code className="mx-1 font-mono text-foreground">src/components/shared</code>
            and feature-local composition in{" "}
            <code className="ml-1 font-mono text-foreground">src/features/home/components</code>.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button>
          Shared primitives
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button variant="outline">Feature components</Button>
      </div>
    </section>
  )
}
