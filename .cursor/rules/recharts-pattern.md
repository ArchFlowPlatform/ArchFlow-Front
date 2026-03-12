---
description: Recharts chart patterns
globs:
  - "src/components/charts/**/*.tsx"
---

# Recharts Usage

Charts must be wrapped in reusable components.

Structure:

components
 └ charts
     ├ line-chart.tsx
     ├ bar-chart.tsx
     └ pie-chart.tsx

Rules:

- Do not place chart logic inside pages
- Charts must accept typed props