# Frontend → Backend Integration Plan

**Source:** ASP.NET API Domain Analysis Report  
**Frontend repo:** ArchFlow-Front  
**Generated:** 2026-03-16  
**Purpose:** Technical plan for integrating the frontend with the backend API. No implementation—planning only.

---

## 1. Backend API Summary

Base URL: `/api` (or `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL`).

### 1.1 Controllers and Endpoints

| Controller | Base route | HTTP methods | Endpoints |
|------------|------------|--------------|-----------|
| **AuthController** | `api/auth` | POST, GET | login, logout, me |
| **UsersController** | `api/users` | GET, POST | {id}, (body) |
| **ProjectsController** | `api/projects` | GET, POST, PUT, DELETE | (none), {id}, {id}/archive, {id}/restore, {id}/members, {id}/members/{userId}, {id}/invites, invites/{token}/accept, decline, revoke |
| **BacklogController** | `api/projects/{projectId}/backlog` | GET, PATCH | (none), epics, epics/{epicId}, epics/reorder, epics/{epicId}/archive, epics/{epicId}/restore, epics/{epicId}/stories, stories/{storyId}, stories/reorder, stories/move, stories/{storyId}/archive, stories/{storyId}/restore |
| **SprintsController** | `api/projects/{projectId}/sprints` | GET, POST, PATCH | (none), {sprintId}, {sprintId}/activate, close, cancel, {sprintId}/archive, {sprintId}/restore |
| **SprintItemsController** | `api/projects/{projectId}/sprints/{sprintId}/items` | GET, POST, PATCH, DELETE | (none), {itemId} |
| **BoardsController** | `api/projects/{projectId}/sprints/{sprintId}/board` | GET, PATCH | (none), (body) |
| **BoardColumnsController** | `api/projects/{projectId}/sprints/{sprintId}/board/columns` | GET, POST, PUT, DELETE | (none), {columnId} |
| **BoardCardsController** | `api/projects/.../board/columns/{columnId}/cards` | GET, POST, PATCH, DELETE | (none), {cardId}/reorder, {cardId}/move, {cardId} |
| **StoryTasksController** | `api/projects/.../items/{sprintItemId}/tasks` | GET, POST, PUT, DELETE, PATCH | (none), {taskId}, {taskId}/reorder, {taskId}/move |
| **LabelsController** | `api/projects/{projectId}/labels` | GET, POST, PUT, DELETE | (none), {labelId} |
| **CardCommentsController** | `api/projects/{projectId}/cards/{cardId}/comments` | GET, POST, PUT, DELETE | (none), {commentId} |
| **CardAttachmentsController** | `api/projects/{projectId}/cards/{cardId}/attachments` | GET, POST, DELETE | (none), {attachmentId} |
| **CardLabelsController** | `api/projects/{projectId}/cards/{cardId}/labels` | GET, POST, DELETE | (none), {cardLabelId} |
| **CardActivitiesController** | `api/projects/{projectId}/cards/{cardId}/activities` | GET, POST | (none) |

### 1.2 Flat Endpoint List (for reference)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/users/{id}
POST   /api/users

GET    /api/projects
GET    /api/projects/{id}
POST   /api/projects
PUT    /api/projects/{id}
POST   /api/projects/{id}/archive
POST   /api/projects/{id}/restore
POST   /api/projects/{id}/members
DELETE /api/projects/{id}/members/{userId}
GET    /api/projects/{id}/members
GET    /api/projects/{id}/invites
POST   /api/projects/{id}/invites
PUT    /api/projects/invites/{token}/accept
PUT    /api/projects/invites/{token}/decline
PUT    /api/projects/invites/{token}/revoke

GET    /api/projects/{projectId}/backlog
PATCH  /api/projects/{projectId}/backlog
POST   /api/projects/{projectId}/backlog/epics
PATCH  /api/projects/{projectId}/backlog/epics/{epicId}
PATCH  /api/projects/{projectId}/backlog/epics/reorder
PATCH  /api/projects/{projectId}/backlog/epics/{epicId}/archive
PATCH  /api/projects/{projectId}/backlog/epics/{epicId}/restore
POST   /api/projects/{projectId}/backlog/epics/{epicId}/stories
PATCH  /api/projects/{projectId}/backlog/stories/{storyId}
PATCH  /api/projects/{projectId}/backlog/stories/reorder
PATCH  /api/projects/{projectId}/backlog/stories/move
PATCH  /api/projects/{projectId}/backlog/stories/{storyId}/archive
PATCH  /api/projects/{projectId}/backlog/stories/{storyId}/restore

GET    /api/projects/{projectId}/sprints
GET    /api/projects/{projectId}/sprints/{sprintId}
POST   /api/projects/{projectId}/sprints
PATCH  /api/projects/{projectId}/sprints/{sprintId}
POST   /api/projects/{projectId}/sprints/{sprintId}/activate
POST   /api/projects/{projectId}/sprints/{sprintId}/close
POST   /api/projects/{projectId}/sprints/{sprintId}/cancel
PATCH  /api/projects/{projectId}/sprints/{sprintId}/archive
PATCH  /api/projects/{projectId}/sprints/{sprintId}/restore

GET    /api/projects/{projectId}/sprints/{sprintId}/items
GET    /api/projects/{projectId}/sprints/{sprintId}/items/{itemId}
POST   /api/projects/{projectId}/sprints/{sprintId}/items
PATCH  /api/projects/{projectId}/sprints/{sprintId}/items/{itemId}
DELETE /api/projects/{projectId}/sprints/{sprintId}/items/{itemId}

GET    /api/projects/{projectId}/sprints/{sprintId}/board
PATCH  /api/projects/{projectId}/sprints/{sprintId}/board

GET    /api/projects/{projectId}/sprints/{sprintId}/board/columns
POST   /api/projects/{projectId}/sprints/{sprintId}/board/columns
PUT    /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}
DELETE /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}

GET    /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}/cards
POST   /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}/cards
PATCH  .../cards/{cardId}/reorder
PATCH  .../cards/{cardId}/move
DELETE .../cards/{cardId}

GET    /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks
POST   .../tasks
PUT    .../tasks/{taskId}
DELETE .../tasks/{taskId}
PATCH  .../tasks/{taskId}/reorder
PATCH  .../tasks/{taskId}/move

GET    /api/projects/{projectId}/labels
GET    /api/projects/{projectId}/labels/{labelId}
POST   /api/projects/{projectId}/labels
PUT    /api/projects/{projectId}/labels/{labelId}
DELETE /api/projects/{projectId}/labels/{labelId}

GET    /api/projects/{projectId}/cards/{cardId}/comments
POST   ...
PUT    .../comments/{commentId}
DELETE .../comments/{commentId}

GET    /api/projects/{projectId}/cards/{cardId}/attachments
POST   ...
DELETE .../attachments/{attachmentId}

GET    /api/projects/{projectId}/cards/{cardId}/labels
POST   ...
DELETE .../labels/{cardLabelId}

GET    /api/projects/{projectId}/cards/{cardId}/activities
POST   ...
```

---

## 2. Entity → Type Mapping

Backend entities map to frontend TypeScript interfaces. Use **string** for all GUIDs and ISO date strings for DateTime. Align with backend DTOs when available; below is the entity-based contract.

### 2.1 Enums (shared types)

```ts
// src/features/shared/types/enums.ts (or per-feature)

export type UserType = string; // from backend UserType enum
export type ProjectStatus = "active" | "archived" | "deleted";
export type MemberRole = "owner" | "scrum_master" | "developer" | "product_owner";
export type InviteStatus = string; // from backend InviteStatus
export type BusinessValue = "high" | "medium" | "low";
export type EpicStatus = "draft" | "active" | "completed";
export type UserStoryStatus = "draft" | "ready" | "in_progress" | "done";
export type UserStoryComplexity = "low" | "medium" | "high" | "very_high";
export type SprintStatus = "planned" | "active" | "completed" | "cancelled";
export type BoardType = "kanban" | "scrum" | "custom";
export type StoryTaskStatus = string; // from backend StoryTaskStatus
export type CardActivityType = "moved" | "created" | "updated" | "assigned" | "commented";
```

### 2.2 Core entities

```ts
// User
export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}
// Request: CreateUserRequest (email, name, password, type, etc.)

// Project
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
}
// Optional view: ProjectWithDetails extends Project { owner: User; members: ProjectMember[]; }
// Request: CreateProjectRequest, UpdateProjectRequest

// ProjectMember
export interface ProjectMember {
  id: number;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: User;
}

// ProjectInvite
export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: MemberRole;
  token: string;
  expiresAt: string;
  createdAt: string;
  status: InviteStatus;
}
```

### 2.3 Backlog entities

```ts
// ProductBacklog
export interface ProductBacklog {
  id: string;
  projectId: string;
  overview: string;
  createdAt: string;
  updatedAt: string;
  epics?: Epic[];
}

// Epic
export interface Epic {
  id: number;
  productBacklogId: string;
  name: string;
  description: string;
  businessValue: BusinessValue;
  status: EpicStatus;
  position: number;
  priority: number;
  color: string;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userStories?: UserStory[];
}
// Request: CreateEpicRequest, UpdateEpicRequest, ReorderEpicsRequest, MoveStoryRequest

// UserStory
export interface UserStory {
  id: number;
  epicId: number;
  title: string;
  persona: string;
  description: string;
  acceptanceCriteria: string;
  complexity: UserStoryComplexity;
  effort: number | null;
  dependencies: string;
  priority: number;
  businessValue: BusinessValue;
  status: UserStoryStatus;
  backlogPosition: number;
  assigneeId: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
// Request: CreateStoryRequest, UpdateStoryRequest, ReorderStoriesRequest
```

### 2.4 Sprint & board entities

```ts
// Sprint
export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  executionPlan: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  capacityHours: number;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
// Request: CreateSprintRequest, UpdateSprintRequest

// SprintItem
export interface SprintItem {
  id: number;
  sprintId: string;
  userStoryId: number;
  position: number;
  notes: string;
  addedAt: string;
  userStory?: UserStory;
  tasks?: StoryTask[];
}

// StoryTask
export interface StoryTask {
  id: number;
  sprintItemId: number;
  title: string;
  description: string;
  assigneeId: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  priority: number;
  position: number;
  status: StoryTaskStatus;
  createdAt: string;
  updatedAt: string;
}
// Request: CreateStoryTaskRequest, UpdateStoryTaskRequest, ReorderTasksRequest, MoveTaskRequest

// Board
export interface Board {
  id: string;
  projectId: string;
  sprintId: string;
  name: string;
  description: string;
  boardType: BoardType;
  createdAt: string;
  updatedAt: string;
  columns?: BoardColumn[];
}

// BoardColumn
export interface BoardColumn {
  id: number;
  boardId: string;
  name: string;
  description: string;
  position: number;
  wipLimit: number | null;
  color: string;
  isDoneColumn: boolean;
  createdAt: string;
  updatedAt: string;
  cards?: BoardCard[];
}

// BoardCard
export interface BoardCard {
  id: number;
  columnId: number;
  userStoryId: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  userStory?: UserStory;
}
// Request: CreateBoardCardRequest, ReorderCardRequest, MoveCardRequest
```

### 2.5 Labels & card sub-resources

```ts
// Label
export interface Label {
  id: number;
  projectId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// CardLabel (join)
export interface CardLabel {
  id: number;
  cardId: number;
  labelId: number;
  createdAt: string;
}

// CardComment
export interface CardComment {
  id: number;
  cardId: number;
  userId: string;
  content: string;
  parentCommentId: number | null;
  createdAt: string;
  updatedAt: string;
  replies?: CardComment[];
}

// CardAttachment
export interface CardAttachment {
  id: number;
  cardId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string;
  uploadedBy: string;
  createdAt: string;
}

// CardActivity
export interface CardActivity {
  id: number;
  cardId: number;
  userId: string;
  activityType: CardActivityType;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
}
```

### 2.6 Request / response contracts (examples)

- **Auth:** `LoginRequest` { email, password }, `LoginResponse` { token?, user? }
- **Projects:** `CreateProjectRequest`, `UpdateProjectRequest`, `AddMemberRequest`, `CreateInviteRequest`
- **Backlog:** `UpdateBacklogRequest` (overview), `CreateEpicRequest`, `UpdateEpicRequest`, `ReorderEpicsRequest`, `CreateStoryRequest`, `UpdateStoryRequest`, `ReorderStoriesRequest`, `MoveStoryRequest`
- **Sprints:** `CreateSprintRequest`, `UpdateSprintRequest`
- **Sprint items:** `CreateSprintItemRequest`, `UpdateSprintItemRequest`
- **Board:** `UpdateBoardRequest`
- **Columns:** `CreateBoardColumnRequest`, `UpdateBoardColumnRequest`
- **Cards:** `CreateBoardCardRequest`, `ReorderCardRequest`, `MoveCardRequest`
- **Tasks:** `CreateStoryTaskRequest`, `UpdateStoryTaskRequest`, `ReorderTasksRequest`, `MoveTaskRequest`
- **Labels:** `CreateLabelRequest`, `UpdateLabelRequest`
- **Comments:** `CreateCardCommentRequest`, `UpdateCardCommentRequest`
- **Attachments:** `CreateCardAttachmentRequest` (multipart/form-data)
- **Activities:** `CreateCardActivityRequest`

Define these in the same feature modules as the API calls, or in a shared `api.contract.ts`, and align with actual backend DTOs.

---

## 3. API Modules

Recommended structure: one API module per backend controller/feature, under `src/features/{feature}/api/` or a single `src/api/` with files per domain.

### 3.1 Proposed directory layout

```
src/
  lib/
    http-client.ts          # existing: base client, get/post/put/patch/del
  types/
    api.ts                  # existing: ApiResponse<T>
  features/
    auth/
      api/
        auth.api.ts
      types/
        auth.types.ts
      hooks/
        useAuth.ts
    users/
      api/
        users.api.ts
      types/
        user.types.ts
      hooks/
        useUser.ts
    projects/
      api/
        projects.api.ts     # replace/extend current services/projects/project.service.ts
      types/
        project.types.ts
      hooks/
        useProjects.ts
        useProject.ts
    backlog/
      api/
        backlog.api.ts
      types/
        backlog.types.ts
      hooks/
        useBacklog.ts
        useEpics.ts
        useStories.ts
    sprints/
      api/
        sprints.api.ts
      types/
        sprint.types.ts
      hooks/
        useSprints.ts
        useSprint.ts
    sprint-items/
      api/
        sprint-items.api.ts
      hooks/
        useSprintItems.ts
    board/
      api/
        board.api.ts
        board-columns.api.ts
        board-cards.api.ts
      types/
        board.types.ts
      hooks/
        useBoard.ts
        useBoardColumns.ts
        useBoardCards.ts
    story-tasks/
      api/
        story-tasks.api.ts
      hooks/
        useStoryTasks.ts
    labels/
      api/
        labels.api.ts
      hooks/
        useLabels.ts
    card-comments/
      api/
        card-comments.api.ts
      hooks/
        useCardComments.ts
    card-attachments/
      api/
        card-attachments.api.ts
      hooks/
        useCardAttachments.ts
    card-labels/
      api/
        card-labels.api.ts
      hooks/
        useCardLabels.ts
    card-activities/
      api/
        card-activities.api.ts
      hooks/
        useCardActivities.ts
```

Alternatively, group under a single `src/api/` with files like `auth.api.ts`, `projects.api.ts`, `backlog.api.ts`, etc., and keep types in `src/types/` or `src/features/*/types/`.

### 3.2 Functions per module

| Module | File | Functions |
|--------|------|-----------|
| **auth** | auth.api.ts | login(credentials), logout(), me() |
| **users** | users.api.ts | getUserById(id), createUser(payload) |
| **projects** | projects.api.ts | getProjects(), getProjectById(id), createProject(payload), updateProject(id, payload), archiveProject(id), restoreProject(id), getMembers(projectId), addMember(projectId, payload), removeMember(projectId, userId), getInvites(projectId), createInvite(projectId, payload), acceptInvite(token), declineInvite(token), revokeInvite(token) |
| **backlog** | backlog.api.ts | getBacklog(projectId), updateBacklogOverview(projectId, payload), createEpic(projectId, payload), updateEpic(projectId, epicId, payload), reorderEpics(projectId, payload), archiveEpic(projectId, epicId), restoreEpic(projectId, epicId), createStory(projectId, epicId, payload), updateStory(projectId, storyId, payload), reorderStories(projectId, payload), moveStory(projectId, payload), archiveStory(projectId, storyId), restoreStory(projectId, storyId) |
| **sprints** | sprints.api.ts | getSprints(projectId), getSprintById(projectId, sprintId), createSprint(projectId, payload), updateSprint(projectId, sprintId, payload), activateSprint(projectId, sprintId), closeSprint(projectId, sprintId), cancelSprint(projectId, sprintId), archiveSprint(projectId, sprintId), restoreSprint(projectId, sprintId) |
| **sprint-items** | sprint-items.api.ts | getSprintItems(projectId, sprintId), getSprintItemById(projectId, sprintId, itemId), createSprintItem(projectId, sprintId, payload), updateSprintItem(projectId, sprintId, itemId, payload), deleteSprintItem(projectId, sprintId, itemId) |
| **board** | board.api.ts | getBoard(projectId, sprintId), updateBoard(projectId, sprintId, payload) |
| **board-columns** | board-columns.api.ts | getColumns(projectId, sprintId), createColumn(projectId, sprintId, payload), updateColumn(projectId, sprintId, columnId, payload), deleteColumn(projectId, sprintId, columnId) |
| **board-cards** | board-cards.api.ts | getCards(projectId, sprintId, columnId), createCard(projectId, sprintId, columnId, payload), reorderCard(projectId, sprintId, columnId, cardId, payload), moveCard(projectId, sprintId, columnId, cardId, payload), deleteCard(projectId, sprintId, columnId, cardId) |
| **story-tasks** | story-tasks.api.ts | getTasks(projectId, sprintId, sprintItemId), createTask(projectId, sprintId, sprintItemId, payload), updateTask(projectId, sprintId, sprintItemId, taskId, payload), deleteTask(...), reorderTask(...), moveTask(...) |
| **labels** | labels.api.ts | getLabels(projectId), getLabelById(projectId, labelId), createLabel(projectId, payload), updateLabel(projectId, labelId, payload), deleteLabel(projectId, labelId) |
| **card-comments** | card-comments.api.ts | getComments(projectId, cardId), createComment(projectId, cardId, payload), updateComment(projectId, cardId, commentId, payload), deleteComment(projectId, cardId, commentId) |
| **card-attachments** | card-attachments.api.ts | getAttachments(projectId, cardId), createAttachment(projectId, cardId, formData), deleteAttachment(projectId, cardId, attachmentId) |
| **card-labels** | card-labels.api.ts | getCardLabels(projectId, cardId), addLabelToCard(projectId, cardId, payload), removeLabelFromCard(projectId, cardId, cardLabelId) |
| **card-activities** | card-activities.api.ts | getActivities(projectId, cardId), createActivity(projectId, cardId, payload) |

---

## 4. Endpoint → Function Mapping

| Backend endpoint | Frontend function |
|------------------|-------------------|
| POST /api/auth/login | auth.api → login(credentials) |
| POST /api/auth/logout | auth.api → logout() |
| GET /api/auth/me | auth.api → me() |
| GET /api/users/{id} | users.api → getUserById(id) |
| POST /api/users | users.api → createUser(payload) |
| GET /api/projects | projects.api → getProjects() |
| GET /api/projects/{id} | projects.api → getProjectById(id) |
| POST /api/projects | projects.api → createProject(payload) |
| PUT /api/projects/{id} | projects.api → updateProject(id, payload) |
| POST /api/projects/{id}/archive | projects.api → archiveProject(id) |
| POST /api/projects/{id}/restore | projects.api → restoreProject(id) |
| POST /api/projects/{id}/members | projects.api → addMember(projectId, payload) |
| DELETE /api/projects/{id}/members/{userId} | projects.api → removeMember(projectId, userId) |
| GET /api/projects/{id}/members | projects.api → getMembers(projectId) |
| GET /api/projects/{id}/invites | projects.api → getInvites(projectId) |
| POST /api/projects/{id}/invites | projects.api → createInvite(projectId, payload) |
| PUT /api/projects/invites/{token}/accept | projects.api → acceptInvite(token) |
| PUT /api/projects/invites/{token}/decline | projects.api → declineInvite(token) |
| PUT /api/projects/invites/{token}/revoke | projects.api → revokeInvite(token) |
| GET /api/projects/{projectId}/backlog | backlog.api → getBacklog(projectId) |
| PATCH /api/projects/{projectId}/backlog | backlog.api → updateBacklogOverview(projectId, payload) |
| POST .../backlog/epics | backlog.api → createEpic(projectId, payload) |
| PATCH .../backlog/epics/{epicId} | backlog.api → updateEpic(projectId, epicId, payload) |
| PATCH .../backlog/epics/reorder | backlog.api → reorderEpics(projectId, payload) |
| PATCH .../backlog/epics/{epicId}/archive | backlog.api → archiveEpic(projectId, epicId) |
| PATCH .../backlog/epics/{epicId}/restore | backlog.api → restoreEpic(projectId, epicId) |
| POST .../backlog/epics/{epicId}/stories | backlog.api → createStory(projectId, epicId, payload) |
| PATCH .../backlog/stories/{storyId} | backlog.api → updateStory(projectId, storyId, payload) |
| PATCH .../backlog/stories/reorder | backlog.api → reorderStories(projectId, payload) |
| PATCH .../backlog/stories/move | backlog.api → moveStory(projectId, payload) |
| PATCH .../backlog/stories/{storyId}/archive | backlog.api → archiveStory(projectId, storyId) |
| PATCH .../backlog/stories/{storyId}/restore | backlog.api → restoreStory(projectId, storyId) |
| GET /api/projects/{projectId}/sprints | sprints.api → getSprints(projectId) |
| GET .../sprints/{sprintId} | sprints.api → getSprintById(projectId, sprintId) |
| POST .../sprints | sprints.api → createSprint(projectId, payload) |
| PATCH .../sprints/{sprintId} | sprints.api → updateSprint(projectId, sprintId, payload) |
| POST .../sprints/{sprintId}/activate | sprints.api → activateSprint(projectId, sprintId) |
| POST .../sprints/{sprintId}/close | sprints.api → closeSprint(projectId, sprintId) |
| POST .../sprints/{sprintId}/cancel | sprints.api → cancelSprint(projectId, sprintId) |
| PATCH .../sprints/{sprintId}/archive | sprints.api → archiveSprint(projectId, sprintId) |
| PATCH .../sprints/{sprintId}/restore | sprints.api → restoreSprint(projectId, sprintId) |
| GET .../sprints/{sprintId}/items | sprint-items.api → getSprintItems(projectId, sprintId) |
| GET .../items/{itemId} | sprint-items.api → getSprintItemById(projectId, sprintId, itemId) |
| POST .../items | sprint-items.api → createSprintItem(projectId, sprintId, payload) |
| PATCH .../items/{itemId} | sprint-items.api → updateSprintItem(projectId, sprintId, itemId, payload) |
| DELETE .../items/{itemId} | sprint-items.api → deleteSprintItem(projectId, sprintId, itemId) |
| GET .../board | board.api → getBoard(projectId, sprintId) |
| PATCH .../board | board.api → updateBoard(projectId, sprintId, payload) |
| GET .../board/columns | board-columns.api → getColumns(projectId, sprintId) |
| POST .../board/columns | board-columns.api → createColumn(projectId, sprintId, payload) |
| PUT .../board/columns/{columnId} | board-columns.api → updateColumn(projectId, sprintId, columnId, payload) |
| DELETE .../board/columns/{columnId} | board-columns.api → deleteColumn(projectId, sprintId, columnId) |
| GET .../board/columns/{columnId}/cards | board-cards.api → getCards(projectId, sprintId, columnId) |
| POST .../cards | board-cards.api → createCard(projectId, sprintId, columnId, payload) |
| PATCH .../cards/{cardId}/reorder | board-cards.api → reorderCard(...) |
| PATCH .../cards/{cardId}/move | board-cards.api → moveCard(...) |
| DELETE .../cards/{cardId} | board-cards.api → deleteCard(...) |
| GET .../items/{sprintItemId}/tasks | story-tasks.api → getTasks(projectId, sprintId, sprintItemId) |
| POST .../tasks | story-tasks.api → createTask(...) |
| PUT .../tasks/{taskId} | story-tasks.api → updateTask(...) |
| DELETE .../tasks/{taskId} | story-tasks.api → deleteTask(...) |
| PATCH .../tasks/{taskId}/reorder | story-tasks.api → reorderTask(...) |
| PATCH .../tasks/{taskId}/move | story-tasks.api → moveTask(...) |
| GET /api/projects/{projectId}/labels | labels.api → getLabels(projectId) |
| GET .../labels/{labelId} | labels.api → getLabelById(projectId, labelId) |
| POST .../labels | labels.api → createLabel(projectId, payload) |
| PUT .../labels/{labelId} | labels.api → updateLabel(projectId, labelId, payload) |
| DELETE .../labels/{labelId} | labels.api → deleteLabel(projectId, labelId) |
| GET .../cards/{cardId}/comments | card-comments.api → getComments(projectId, cardId) |
| POST .../comments | card-comments.api → createComment(projectId, cardId, payload) |
| PUT .../comments/{commentId} | card-comments.api → updateComment(...) |
| DELETE .../comments/{commentId} | card-comments.api → deleteComment(...) |
| GET .../cards/{cardId}/attachments | card-attachments.api → getAttachments(projectId, cardId) |
| POST .../attachments | card-attachments.api → createAttachment(projectId, cardId, formData) |
| DELETE .../attachments/{attachmentId} | card-attachments.api → deleteAttachment(...) |
| GET .../cards/{cardId}/labels | card-labels.api → getCardLabels(projectId, cardId) |
| POST .../labels | card-labels.api → addLabelToCard(projectId, cardId, payload) |
| DELETE .../labels/{cardLabelId} | card-labels.api → removeLabelFromCard(...) |
| GET .../cards/{cardId}/activities | card-activities.api → getActivities(projectId, cardId) |
| POST .../activities | card-activities.api → createActivity(projectId, cardId, payload) |

---

## 5. Missing Backend Endpoints

Based on the current frontend pages and flows, the following are **not** listed in the backend report. Treat as optional or to be confirmed with the backend team:

| Endpoint | Usage | Note |
|----------|--------|------|
| (none critical) | — | All main flows (projects, backlog, sprints, board, tasks, labels, comments, attachments, activities) are covered. |
| Optional: GET /api/users/me/profile | Profile/settings | If backend exposes more than auth/me, e.g. editable profile. |
| Optional: PATCH /api/users/{id} | Update profile | If users can edit own profile. |
| Optional: GET /api/projects?search= | Search/filter projects | Frontend currently filters in memory; server-side search would scale better. |

No **required** missing endpoints identified for the current feature set.

---

## 6. Data Flows

### 6.1 Auth

- **Sign in (form):** Frontend collects email/password → `POST /api/auth/login` → store token (e.g. cookie/localStorage), then redirect (e.g. `/projects`).
- **Sign in (OAuth):** Frontend initiates OAuth; backend callback (if any) and token handling TBD; after success → same as above.
- **Load app / restore session:** Call `GET /api/auth/me` (with token) → set current user in context; on 401 → redirect to sign-in.
- **Sign out:** `POST /api/auth/logout` (with token) → clear token and user, redirect to sign-in.

### 6.2 Projects hub

- **List projects:** `GET /api/projects` → returns list; map to `Project[]` (or `ProjectWithDetails[]` if backend returns owner/members). ProjectsHubPage replaces `mockProjects` with this response.
- **Open project:** Navigate to `/projects/[projectId]/backlog` (or kanban/sprint); project context can be filled from list or `GET /api/projects/{id}` if needed.

### 6.3 Product backlog page

- **Load backlog:** `GET /api/projects/{projectId}/backlog` → ProductBacklog (epics + user stories). Replace `buildProductBacklogView(projectId)` mock with this.
- **Update overview:** PATCH backlog with overview text.
- **Epics:** Create (POST epics), update (PATCH epics/{id}), reorder (PATCH epics/reorder), archive/restore (PATCH epics/{id}/archive|restore).
- **Stories:** Create (POST epics/{id}/stories), update (PATCH stories/{id}), reorder (PATCH stories/reorder), move (PATCH stories/move), archive/restore (PATCH stories/{id}/archive|restore).
- **Assignees:** Resolve assignee names via `User` (from members or GET /api/users/{id} if needed).

### 6.4 Sprint selector & context

- **Load sprints:** `GET /api/projects/{projectId}/sprints` → replace `getSprintsForProject(projectId)` mock in ProjectSprintContext (or in a useSprints(projectId) hook).
- **Select sprint:** Store selected sprint id in context/sessionStorage; no API call.
- **Create sprint:** POST sprints → then refetch list and optionally set as selected.

### 6.5 Sprint backlog page

- **Load sprint items + tasks:**  
  - `GET /api/projects/{projectId}/sprints/{sprintId}/items` → SprintItem[] (with or without userStory nested).  
  - For each item, or in a single aggregated endpoint if backend provides: `GET .../items/{sprintItemId}/tasks` → StoryTask[].  
  Replace `buildSprintBacklogView(projectId, sprintId)` mock with these calls (or one aggregated backend endpoint if added).
- **Add story to sprint:** POST .../items (userStoryId, position, notes).
- **Remove from sprint:** DELETE .../items/{itemId}.
- **Tasks:** Create/update/delete/reorder/move via story-tasks.api.

### 6.6 Kanban page

- **Load board:** `GET /api/projects/{projectId}/sprints/{sprintId}/board` → Board with columns (and optionally cards). If cards are separate: GET .../board/columns for columns, then GET .../columns/{columnId}/cards per column. Replace `buildKanbanBoardView(projectId, sprintId)` mock.
- **Drag-and-drop:** On drop, call PATCH .../cards/{cardId}/move or reorder; update local state optimistically or refetch.
- **Open card modal:** Load comments, attachments, labels, activities for selected card: GET .../cards/{cardId}/comments, attachments, labels, activities. Display and allow create/update/delete via respective APIs.

### 6.7 Sprint page (summary / burndown)

- **Sprint data:** Already from `getSprintById(projectId, sprintId)` and sprint items/tasks. Burndown can be computed on frontend from task status/dates or from a future backend endpoint if added.

### 6.8 Project settings (if added)

- **Members:** GET/POST/DELETE .../projects/{id}/members.
- **Invites:** GET .../invites, POST create, PUT accept/decline/revoke.

---

## 7. Integration Strategy

### 7.1 HTTP client layer

- **Keep** `src/lib/http-client.ts`: base URL from env, timeout, JSON headers.
- **Add:** Auth header injection (e.g. Bearer from cookie or storage). Attach token on every request; on 401, clear session and redirect to sign-in.
- **Base URL:** Use `NEXT_PUBLIC_API_BASE_URL` in browser and `API_BASE_URL` on server (or proxy through Next.js to avoid CORS).

### 7.2 Request/response typing

- Use the **Entity → Type Mapping** interfaces for all API responses and request bodies.
- Keep `ApiResponse<T>` envelope: `{ success, message, data: T, errors }`. In each API function, return `data` or throw/handle by contract (e.g. normalize to left/right or throw on !success).
- For endpoints that return a single object or a list, type as `ApiResponse<Project>`, `ApiResponse<Project[]>`, etc. Align with actual backend DTO names when available.

### 7.3 Error handling

- **Centralized:** In HTTP client response interceptor, on 4xx/5xx: map to a small set of error types (e.g. Unauthorized, Forbidden, NotFound, ValidationError, ServerError). Optionally emit to a global toast/notification.
- **Validation errors:** If backend returns `errors[]` with field messages, map to form errors or inline messages.
- **Auth:** 401 → clear token, redirect to sign-in; 403 → show “no access” message.

### 7.4 Data validation

- Keep using **Zod** for responses that must be validated (e.g. ProjectSchema, UserSchema). Validate in the API layer or in hooks before setting state. On parse failure, treat as error and optionally report.
- Request payloads: define Zod schemas for Create/Update DTOs and validate before sending (optional but recommended).

### 7.5 API response normalization

- If backend returns different shapes (e.g. snake_case vs camelCase), add a thin normalization layer (per response or in one place) so the rest of the app consumes camelCase and ISO dates. Alternatively, configure axios transform or a small mapper per feature.

### 7.6 Suggested structure (recap)

- **infrastructure:** `lib/http-client.ts` (base client, interceptors, auth header).
- **features/*/api:** One file (or a few) per controller; each function calls http get/post/put/patch/del with typed URL and body.
- **features/*/types:** Domain types and request/response DTOs (or shared under `types/`).
- **features/*/hooks:** React Query or SWR (or plain useState + useEffect) that call the API layer and expose data + loading + error; components use hooks only.

---

## 8. Implementation Roadmap

### Step 1 — HTTP client and auth

1. **Extend HTTP client** (`src/lib/http-client.ts`):
   - Add request interceptor: read token (cookie or storage) and set `Authorization: Bearer <token>`.
   - Add response interceptor: on 401, clear token and redirect to `/signin` (or trigger a callback).
2. **Auth API + types** (`src/features/auth/api/auth.api.ts`, `types/auth.types.ts`):
   - Define LoginRequest, LoginResponse (or whatever backend returns).
   - Implement login(credentials), logout(), me(). Store token on login; clear on logout and 401.
3. **Auth context/provider:**
   - On app load, call me(); set user in context. If no token or 401, user is null and redirect to sign-in when needed.

### Step 2 — Domain types (shared and per feature)

1. Add **enums** (from backend) under `src/features/shared/types/enums.ts` or `src/types/enums.ts`.
2. Add **entity interfaces** (User, Project, ProjectMember, Epic, UserStory, Sprint, SprintItem, StoryTask, Board, BoardColumn, BoardCard, Label, CardComment, CardAttachment, CardLabel, CardActivity) under `src/types/` or per-feature `features/*/types/`. Reuse or replace existing `User`, `Project`, and mock schema types.
3. Add **request/response** types (CreateProjectRequest, UpdateStoryRequest, etc.) next to the API modules that use them.

### Step 3 — Projects API and hooks

1. **projects.api.ts:** Implement getProjects(), getProjectById(id), createProject(), updateProject(), archiveProject(), restoreProject(), getMembers(), addMember(), removeMember(), getInvites(), createInvite(), acceptInvite(), declineInvite(), revokeInvite(). Use existing http-client helpers.
2. **useProjects(), useProject(id):** Call getProjects() / getProjectById(); wrap in React Query or SWR for caching and refetch. Expose projects, project, loading, error.
3. **Wire ProjectsHubPage:** Replace mockProjects with useProjects(). Optionally use getProjectById(projectId) when entering a project layout.

### Step 4 — Backlog API and hooks

1. **backlog.api.ts:** Implement getBacklog(projectId), updateBacklogOverview(), createEpic(), updateEpic(), reorderEpics(), archiveEpic(), restoreEpic(), createStory(), updateStory(), reorderStories(), moveStory(), archiveStory(), restoreStory().
2. **useBacklog(projectId), useEpics(projectId), useStories(projectId, epicId):** Fetch backlog and optionally invalidate on mutations.
3. **Wire ProductBacklogPage:** Replace buildProductBacklogView(projectId) with useBacklog(projectId). Replace mock-based triage/filters with the same data from API.

### Step 5 — Sprints API and context

1. **sprints.api.ts:** Implement getSprints(projectId), getSprintById(), createSprint(), updateSprint(), activateSprint(), closeSprint(), cancelSprint(), archiveSprint(), restoreSprint().
2. **useSprints(projectId):** Fetch sprints; cache and refetch on create/update.
3. **ProjectSprintContext:** Use useSprints(projectId) instead of getSprintsForProject(projectId) mock. Keep selectedSprintId in context/sessionStorage; optionally refetch default sprint when list changes.

### Step 6 — Sprint items and story tasks

1. **sprint-items.api.ts:** getSprintItems(), getSprintItemById(), createSprintItem(), updateSprintItem(), deleteSprintItem().
2. **story-tasks.api.ts:** getTasks(), createTask(), updateTask(), deleteTask(), reorderTask(), moveTask().
3. **useSprintItems(projectId, sprintId), useStoryTasks(projectId, sprintId, sprintItemId):** Hooks that call the above.
4. **Wire SprintBacklogPage:** Replace buildSprintBacklogView() with useSprintItems() + useStoryTasks() (or one aggregated hook that composes them). Wire create/update/delete for items and tasks.

### Step 7 — Board, columns, cards

1. **board.api.ts, board-columns.api.ts, board-cards.api.ts:** Implement getBoard(), updateBoard(), getColumns(), createColumn(), updateColumn(), deleteColumn(), getCards(), createCard(), reorderCard(), moveCard(), deleteCard().
2. **useBoard(projectId, sprintId), useBoardColumns(), useBoardCards(columnId):** Hooks; invalidate or refetch on mutations.
3. **Wire KanbanPage:** Replace buildKanbanBoardView() and buildInitialKanbanCardState() with useBoard() + useBoardCards() per column. On drag-and-drop, call moveCard/reorderCard and update local state or refetch.

### Step 8 — Labels, comments, attachments, activities (card detail)

1. **labels.api.ts, card-comments.api.ts, card-attachments.api.ts, card-labels.api.ts, card-activities.api.ts:** Implement all listed functions.
2. **Hooks:** useLabels(projectId), useCardComments(projectId, cardId), useCardAttachments(projectId, cardId), useCardLabels(projectId, cardId), useCardActivities(projectId, cardId).
3. **Wire KanbanModal (or card detail):** Load comments, attachments, labels, activities when a card is selected; wire create/update/delete for each.

### Step 9 — Users API (if needed)

1. **users.api.ts:** getUserById(id), createUser(payload). Used for assignee resolution and sign-up if backend supports it.
2. **useUser(id):** Optional; use when displaying user names for assignees and comments.

### Step 10 — Validation and polish

1. Add Zod schemas for critical responses (Project, User, Backlog, Sprint, BoardCard, etc.) and validate in API layer or hooks.
2. Unify error handling (toast or inline) and loading states across pages.
3. Remove or gate mock data (feature flag or env) so production uses only the real API.

---

**End of plan.** Use this document to implement the frontend API layer step by step without inventing endpoints; align request/response shapes with the actual backend DTOs when they are documented or discovered.
