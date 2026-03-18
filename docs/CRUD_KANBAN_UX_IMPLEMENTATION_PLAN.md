# CRUD, UI Integration & Kanban UX — Implementation Plan

**Sources:** `docs/FRONTEND_BACKEND_INTEGRATION_PLAN.md`, `.cursor/rules/ASP.NET-API-Domain-Analysis-Report.md`  
**Scope:** `src/` (features, components, services, hooks, types)  
**Date:** 2026-03-17  
**Status:** Planning only — no implementation in this document.

---

## Executive summary

The frontend already exposes **many API modules** under `src/features/*/api/` aligned with backend controllers. **Read paths** are partially wired (projects, backlog, sprints, board/columns/cards, card sub-resources). **Write paths** are largely **unused in UI**: backlog mutations, sprint CRUD, sprint items, column CRUD, card create/delete, labels, tasks. Kanban supports **drag/move** and **modal detail** with **comment POST**; **card creation** and **column creation** are not integrated. This plan orders work by entity, defines UI patterns (Trello-like card, modals, confirmations), and aligns with **HTTP-only auth** and **feature-based architecture** — **no new libraries**.

---

## 1. CRUD coverage per entity

Legend: **API** = module exists in repo | **UI** = user-facing action wired | **Gap** = API exists but no UI, or UI is mock-only.

| Entity | Create | Read | Update | Delete | Notes |
|--------|--------|------|--------|--------|-------|
| **Auth / User** | login (UI) | me (context) | — | logout | Users: `GET/POST /users` — API layer if missing; sign-up flow TBD |
| **Project** | API `POST /projects` | API + ProjectsHub | API `PUT`, archive/restore | — (archive only) | Hub: **AddProjectCard** not wired. No edit/delete project UI |
| **ProjectMember / Invite** | API add member, invites | API get members | — | API remove member | No member management UI |
| **Backlog / Epic** | API `POST .../epics` | API + ProductBacklogPage | API `PATCH` epic, reorder, archive/restore | archive (soft) | **No create/edit epic UI**. Stories created under epic |
| **UserStory** | API `POST .../stories` | via backlog | API `PATCH`, reorder, move, archive/restore | archive | **No add/edit story UI** on backlog page |
| **Sprint** | API `POST .../sprints` | API + context | API `PATCH`, activate/close/cancel, archive/restore | — | Empty states say “Create sprint” but **no handler** |
| **SprintItem** | API POST | — (Step 6 partial) | API PATCH | API DELETE | Sprint backlog still mock-heavy in places |
| **Board** | — | API GET/PATCH | API PATCH | — | Board metadata; columns drive Kanban structure |
| **BoardColumn** | API POST | via `useBoardColumns` | API PUT | API DELETE | **“Adicionar coluna”** button **not wired** |
| **BoardCard** | API `POST .../cards` | API + `useKanbanBoardView` | move/reorder PATCH | API DELETE | **Create/delete card UI missing**. Move on drop **wired** |
| **StoryTask** | API POST | API hooks exist | API PUT, reorder/move | API DELETE | Sprint backlog task CRUD UI gap |
| **Label** | API POST | API | API PUT | API DELETE | KanbanModal shows labels; **no manage labels UI** |
| **CardComment** | API POST (KanbanModal) | API hooks | API PUT | API DELETE | **Submit button** today; plan to add blur-save for *new* cards pattern |
| **CardAttachment / CardLabel / CardActivity** | Mixed | hooks in modal | partial | partial | Mostly read + comment create |

---

## 2. Missing integrations (high level)

| Area | Situation |
|------|-----------|
| **Backlog** | `backlog.api.ts` has full mutation set; **ProductBacklogPage** is read-only (expand rows only). |
| **Sprints** | `sprints.api.ts` complete; **SprintPage / SprintBacklog / Kanban** empty states reference “Create sprint” **without** `createSprint` call. |
| **Kanban columns** | `board-columns.api.ts` has CRUD; UI shows fixed columns from API but **cannot add column**. |
| **Kanban cards** | `createCard` requires `userStoryId`; **true “quick card”** may need backlog story first or backend supports placeholder — **confirm contract** with ASP.NET report. |
| **Projects hub** | `createProject` exists; **AddProjectCard** has optional `onAdd` **never passed**. |
| **Services folder** | Legacy `services/projects/project.service.ts` may duplicate `features/projects/api`; **standardize on features/*/api** per integration plan. |

---

## 3. UI gaps

| Location | Missing |
|----------|---------|
| **ProjectsHub** | Create project flow (modal or inline name + submit). |
| **ProductBacklog** | Add Epic, Add Story, edit inline/modal, archive with confirm. |
| **Sprint views** | Create sprint modal (name, dates, goal). Activate/close actions. |
| **Kanban** | Add column; add card; delete card; empty column message; **no columns** state. |
| **KanbanModal** | Double-click to open (optional); edit title/description (PATCH story or card — entity clarity); delete card. |
| **Global** | Toasts for mutation success/failure (partial today). Confirm dialogs for destructive actions. |

---

## 4. UI actions definition

### 4.1 Create

| Action | Placement | Pattern |
|--------|-----------|---------|
| **Project** | ProjectsHub | Primary button / AddProjectCard → modal (name, description) → `createProject` → `refetch` useProjects |
| **Epic** | Backlog | “Add epic” in section header → modal or inline row |
| **User story** | Backlog | Per-epic “Add story” → modal (title, epicId preset) |
| **Sprint** | Sprint selector area or empty state | Modal: name, start/end, goal → `createSprint` → refetch sprints context |
| **Sprint item** | Sprint backlog | “Add to sprint” from story picker or create item |
| **Board column** | Kanban header / “Adicionar coluna” | Modal: name, WIP → `createColumn` → refetch columns |
| **Board card** | Per column footer “Add card” | **Trello-like** (see §5) — depends on `userStoryId` requirement |
| **Task** | Sprint backlog story row | Inline or modal |
| **Comment** | KanbanModal | Keep POST; extend with blur-save for parity with new card UX where applicable |

### 4.2 Update

| Action | Pattern |
|--------|---------|
| **Project / Sprint / Epic / Story** | Modal (double-click row or “Edit” menu) or inline title edit |
| **Card position** | Already: drag → `moveCard` / optimistic + rollback on error |
| **Column** | Modal or inline for name, WIP limit |

### 4.3 Delete

| Action | Pattern |
|--------|---------|
| **Soft deletes** | Archive epic/story/sprint per API — confirm: “Archive?” |
| **Hard deletes** | Column delete, card delete, task delete, member remove — **confirm modal** mandatory |
| **Cancel** | Clear optimistic state on failure |

---

## 5. Trello-like card creation (critical)

**Backend constraint:** `CreateBoardCardRequest` includes `userStoryId`. Options:

1. **Flow A:** “Add card” opens minimal picker: select existing backlog story (or create story in modal first) then POST card.  
2. **Flow B:** If API allows optional `userStoryId` or draft card — align with domain report.  
3. **UX spec (once story is chosen or placeholder exists):**  
   - User clicks **Add card** in column → insert **temporary row** (local id `temp-…`) with focused **textarea/input**.  
   - **No submit button**; **save on blur** (and optionally **Enter** to blur).  
   - On blur: if empty → remove temp card; if non-empty → `createCard` with `userStoryId` + title mapping (may need API field for title on card vs story — **verify DTO**).  
   - On failure: toast + remove or keep in error state.  
   - **Reuse:** extract “commit on blur” from comment field pattern in `KanbanModal` (today comment uses explicit submit — add shared hook `useCommitOnBlur` or small component).

---

## 6. Modal pattern (mandatory)

**Current:** `KanbanModal` — full-screen overlay, click backdrop to close, Escape, **card opens on single click** (`KanbanCard` `onClick`).

**Target alignment:**

| Rule | Implementation |
|------|----------------|
| **Open detail** | Prefer **double-click** on card for modal (single click = select/focus only, or keep single-click if product prefers — document decision). Drag must not open modal (ignore dblclick during drag). |
| **Editing entities** | Same overlay + panel layout as KanbanModal (shared `ModalShell` or extract layout from KanbanModal). |
| **Consistency** | Use existing `af-surface-lg`, backdrop `bg-black/60`, focus trap if adding later (no new lib — minimal `useEffect` focus). |

---

## 7. Kanban UX fixes

| Issue | Fix |
|-------|-----|
| **No columns** | After `useBoardColumns` returns `[]`: centered empty state — *“Create a column to start the board”* + CTA → column create flow. |
| **Add card with no columns** | Disable “Add card” globally or per-board; tooltip / inline hint pointing to column creation. |
| **Empty column** | Optional: dashed drop zone text *“Drop stories here”* / *“No cards yet”*. |
| **Blank loading** | Reuse `LoadingScreen` / skeleton rows for columns. |
| **WIP error** | Already toast on exceed — keep; ensure **refetch** after failed move to resync. |

---

## 8. State management strategy

| Concern | Approach |
|---------|----------|
| **Where to call API** | **Only** in `features/*/api/*.ts` from **hooks** (`useMutation`-style callbacks or dedicated `useCreateX`) — **not** inside presentational components. |
| **Cache / refresh** | After mutation: **`refetch()`** from existing hooks (`useKanbanBoardView`, `useBoardColumns`, `useBacklog`) — simplest and consistent. |
| **Optimistic** | Use for **card move/reorder** (already partial); optional for add card (append temp until server id returns). |
| **Loading** | Per-action `isSubmitting` or global overlay for heavy ops only. |
| **Errors** | Toast or inline banner; rollback optimistic updates. |

---

## 9. API integration layer rules

1. **No raw `fetch` in pages** — use existing `http-client` via feature APIs.  
2. **Types** — `src/types/*` + `src/types/requests.ts`; extend when DTOs differ.  
3. **Auth** — Bearer via cookie/storage per current HTTP client; all mutations inherit 401 handling.

---

## 10. Edge cases

| Case | Handling |
|------|----------|
| **Empty arrays** | `columns?.map` → default `[]`; guard before `columns[0]`. |
| **Failed create** | Remove optimistic temp entity; show error. |
| **Partial PATCH** | Send only changed fields per `UpdateXRequest`. |
| **Stale sprint** | After sprint list changes, context already picks default; refetch board when `sprintId` changes. |
| **Card without story** | Block create until story exists or API documents draft behavior. |

---

## 11. Step-by-step execution order

1. **Foundation** — Shared `ModalShell` / confirm dialog component (copy patterns from KanbanModal). Toast helper if not centralized.  
2. **Projects** — Wire AddProjectCard → createProject + refetch.  
3. **Sprints** — Create sprint modal + wire empty states on Sprint / Kanban / SprintBacklog.  
4. **Board columns** — Empty-column state + create column + refetch.  
5. **Board cards** — Confirm story linkage → Trello-like create + `createCard` + refetch; optional delete card.  
6. **Backlog** — Epic/story create + edit modals + archive flows.  
7. **Sprint backlog / tasks** — Sprint items + story tasks CRUD (Step 6 completion).  
8. **KanbanModal** — Double-click open; edit/delete; comment blur-save optional alignment.  
9. **Labels & members** — Project labels management; invites/members if in scope.  
10. **Polish** — Loading states, empty copy, E2E smoke on critical paths.

---

## 12. References in codebase

| Artifact | Path |
|----------|------|
| Endpoint list | `docs/FRONTEND_BACKEND_INTEGRATION_PLAN.md` §1 |
| Domain depth | `.cursor/rules/ASP.NET-API-Domain-Analysis-Report.md` |
| Board cards API | `src/features/board/api/board-cards.api.ts` |
| Board columns API | `src/features/board/api/board-columns.api.ts` |
| Kanban compose | `src/features/projects/hooks/useKanbanBoardView.ts` |
| Modal + comment | `src/components/kanban/KanbanModal.tsx` |
| Card open | `src/components/kanban/KanbanCard.tsx` (single click) |

---

*End of plan.*
