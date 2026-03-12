---
description: Axios service layer pattern
globs:
  - "src/services/**/*.ts"
alwaysApply: true
---

# Axios Service Layer

Use Axios only inside service modules.

Rules:

- UI must never call Axios directly
- All API calls must exist inside /services
- Services must return typed responses

Example structure:

services
 └ users
     ├ user.service.ts
     └ user.types.ts