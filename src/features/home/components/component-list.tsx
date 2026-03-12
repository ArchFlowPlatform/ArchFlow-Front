interface ComponentListProps {
  items: readonly string[]
}

export function ComponentList({ items }: ComponentListProps) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((name) => (
        <li
          key={name}
          className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 font-mono text-xs text-foreground"
        >
          {name}
        </li>
      ))}
    </ul>
  )
}
