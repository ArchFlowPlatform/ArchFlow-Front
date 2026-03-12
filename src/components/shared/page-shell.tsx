import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageShellProps {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn("min-h-svh bg-background", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8 lg:py-14">
        {children}
      </div>
    </main>
  )
}
