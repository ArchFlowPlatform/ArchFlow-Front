---
description: Next.js enterprise architecture
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
alwaysApply: true
---

# Next.js Enterprise Architecture

Use a feature-first architecture.

Project structure:

src
 ├ features
 ├ components
 ├ services
 ├ hooks
 ├ lib
 └ types

Guidelines:

- Features encapsulate business logic
- Components are reusable UI
- Services handle API communication
- Hooks contain reusable state logic
- Business logic must not exist inside UI components

Next.js Guidelines:

- Prefer Server Components
- Use Client Components only when necessary
- Use server actions for mutations