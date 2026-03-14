---
description: Frontend-only application consuming an external API with a standard response envelope
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
alwaysApply: true
---

# Frontend Only – External API Integration

This project is a **frontend-only application** built with Next.js.

The application **must consume an external API** and must **NOT implement backend logic inside this repository**.

## Forbidden implementations

Do NOT implement backend features inside this project:

- No database access
- No ORM
- No persistence layer
- No API controllers
- No API route handlers
- No backend business logic

Avoid creating files such as:

- `src/pages/api/*`
- `src/app/api/*`
- database connections
- repository layers

The application **must behave purely as a client of an external API**.

## API communication

All HTTP communication must go through the service layer using Axios.

Structure:

src
 └ services
     └ api
         ├ http-client.ts
         └ <resource>.service.ts

UI components must never call HTTP clients directly.

## Standard API response format

All API responses follow the same envelope:

{
  message: string
  success: boolean
  data: unknown
  errors: unknown[]
}

This envelope must always be respected.

## TypeScript response model

Define a generic response type:

```ts
export interface ApiResponse<T> {
  message: string
  success: boolean
  data: T
  errors: unknown[]
}

Services must always return typed responses.

Example:

async function getUsers(): Promise<ApiResponse<User[]>> {
  const response = await httpClient.get<ApiResponse<User[]>>("/users")
  return response.data
}
Zod validation

Use Zod schemas to validate data when needed.

Example:

const UserSchema = z.object({
  id: z.string(),
  name: z.string()
})
Error handling

Errors must be handled in the service layer.

UI components should only consume processed results.

Example rule:

If success === false, throw or return a handled error

Components must not interpret raw API responses

Separation of responsibilities

Layers must follow this structure:

services
→ HTTP communication

schemas
→ Zod validation

features/components
→ UI and presentation logic

Hooks may orchestrate data fetching but must call services instead of Axios directly.

Summary

This repository:

is a frontend application

consumes an external API

must not implement backend logic

must respect the standard API response envelope

must use typed responses