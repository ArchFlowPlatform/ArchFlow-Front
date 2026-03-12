import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description: string
  children?: ReactNode
  className?: string
}

export function FeatureCard({
  icon,
  title,
  description,
  children,
  className,
}: FeatureCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="gap-4">
        <div className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-muted/60">
          {icon}
        </div>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  )
}
