# ASP.NET API Domain Analysis Report

**Repository:** archFlowServer  
**Generated:** 2026-03-16  
**Purpose:** Backend–frontend contract validation (entities, services, controllers, endpoints).

---

## 1. Domain Entities

Entities are defined in `Models/Entities/` and registered in `Data/AppDbContext.cs` via `DbSet<T>`.  
DTOs, ViewModels, Request/Response types, and Migrations are excluded.

---

### Entity: User

**Path:** `Models/Entities/User.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property      | Type     | Nullable | Key |
|---------------|----------|----------|-----|
| Id            | Guid     | No       | PK  |
| Name          | string   | No       |     |
| Email         | string   | No       |     |
| Type          | UserType | No       |     |
| PasswordHash  | string   | No       |     |
| AvatarUrl     | string   | No       |     |
| CreatedAt     | DateTime | No       |     |
| UpdatedAt     | DateTime | No       |     |

**Navigation properties:** None (other entities reference User via FK only).

**Relationships:** Referenced by ProjectMember (UserId), CardComment (UserId), CardActivity (UserId), UserStory (AssigneeId), StoryTask (AssigneeId).

---

### Entity: Project

**Path:** `Models/Entities/Project.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property   | Type         | Nullable | Key |
|------------|--------------|----------|-----|
| Id         | Guid         | No       | PK  |
| Name       | string       | No       |     |
| Description| string       | No       |     |
| Status     | ProjectStatus| No       |     |
| OwnerId    | Guid         | No       |     |
| CreatedAt  | DateTime     | No       |     |

**Navigation properties:**

- ProductBacklog (ProductBacklog)
- Members (IReadOnlyCollection&lt;ProjectMember&gt;)

**Relationships:**

- OneToOne → ProductBacklog
- OneToMany → ProjectMember
- OneToMany → Sprint (via ProjectId)
- OneToMany → Board (via ProjectId)
- OneToMany → Label (via ProjectId)

---

### Entity: ProjectMember

**Path:** `Models/Entities/ProjectMember.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property  | Type     | Nullable | Key |
|-----------|----------|----------|-----|
| Id        | int      | No       | PK  |
| ProjectId | Guid     | No       | FK  |
| UserId    | Guid     | No       | FK  |
| Role      | MemberRole | No    |     |
| JoinedAt  | DateTime | No       |     |

**Navigation properties:**

- Project (Project)
- User (User)

**Relationships:**

- ManyToOne → Project
- ManyToOne → User

---

### Entity: ProjectInvite

**Path:** `Models/Entities/ProjectInvite.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property  | Type       | Nullable | Key |
|-----------|------------|----------|-----|
| Id        | Guid       | No       | PK  |
| ProjectId | Guid       | No       | FK  |
| Email     | string     | No       |     |
| Role      | MemberRole | No       |     |
| Token     | string     | No       |     |
| ExpiresAt | DateTime   | No       |     |
| CreatedAt | DateTime   | No       |     |
| Status    | InviteStatus | No     |     |

**Navigation properties:** None (FK to Project only, no nav in entity).

**Relationships:**

- ManyToOne → Project

---

### Entity: ProductBacklog

**Path:** `Models/Entities/ProductBacklog.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property  | Type     | Nullable | Key |
|-----------|----------|----------|-----|
| Id        | Guid     | No       | PK  |
| ProjectId | Guid     | No       | FK  |
| Overview  | string   | No       |     |
| CreatedAt | DateTime| No       |     |
| UpdatedAt | DateTime| No       |     |

**Navigation properties:**

- Project (Project)
- Epics (IReadOnlyCollection&lt;Epic&gt;)

**Relationships:**

- OneToOne → Project
- OneToMany → Epic

---

### Entity: Epic

**Path:** `Models/Entities/Epic.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property        | Type        | Nullable | Key |
|-----------------|-------------|----------|-----|
| Id              | int         | No       | PK  |
| ProductBacklogId| Guid        | No       | FK  |
| Name            | string      | No       |     |
| Description     | string      | No       |     |
| BusinessValue   | BusinessValue | No    |     |
| Status          | EpicStatus  | No       |     |
| Position        | int         | No       |     |
| Priority        | int         | No       |     |
| Color           | string      | No       |     |
| IsArchived      | bool        | No       |     |
| ArchivedAt     | DateTime?   | Yes      |     |
| CreatedAt       | DateTime    | No       |     |
| UpdatedAt       | DateTime    | No       |     |

**Navigation properties:**

- ProductBacklog (ProductBacklog)
- UserStories (IReadOnlyCollection&lt;UserStory&gt;)

**Relationships:**

- ManyToOne → ProductBacklog
- OneToMany → UserStory

---

### Entity: UserStory

**Path:** `Models/Entities/UserStory.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property         | Type              | Nullable | Key |
|------------------|-------------------|----------|-----|
| Id               | int               | No       | PK  |
| EpicId           | int               | No       | FK  |
| Title            | string            | No       |     |
| Persona          | string            | No       |     |
| Description      | string            | No       |     |
| AcceptanceCriteria | string          | No       |     |
| Complexity       | UserStoryComplexity | No    |     |
| Effort           | int?              | Yes      |     |
| Dependencies     | string            | No       |     |
| Priority         | int               | No       |     |
| BusinessValue    | BusinessValue     | No       |     |
| Status           | UserStoryStatus   | No       |     |
| BacklogPosition  | int               | No       |     |
| AssigneeId       | Guid?             | Yes      |     |
| IsArchived       | bool              | No       |     |
| ArchivedAt      | DateTime?         | Yes      |     |
| CreatedAt        | DateTime          | No       |     |
| UpdatedAt        | DateTime          | No       |     |

**Navigation properties:**

- Epic (Epic)
- Tasks (ICollection&lt;StoryTask&gt;) — note: tasks are on SprintItem, not directly on UserStory in persistence
- BoardCards (ICollection&lt;BoardCard&gt;)

**Relationships:**

- ManyToOne → Epic
- OneToMany → BoardCard
- OneToMany → SprintItem (via UserStoryId)

---

### Entity: Sprint

**Path:** `Models/Entities/Sprint.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property      | Type        | Nullable | Key |
|---------------|-------------|----------|-----|
| Id            | Guid        | No       | PK  |
| ProjectId     | Guid        | No       | FK  |
| Name          | string      | No       |     |
| Goal          | string      | No       |     |
| ExecutionPlan | string      | No       |     |
| StartDate     | DateTime    | No       |     |
| EndDate       | DateTime    | No       |     |
| Status        | SprintStatus| No       |     |
| CapacityHours | int         | No       |     |
| IsArchived    | bool        | No       |     |
| ArchivedAt    | DateTime?   | Yes      |     |
| CreatedAt     | DateTime    | No       |     |
| UpdatedAt     | DateTime    | No       |     |

**Navigation properties:**

- Project (Project)
- Board (Board)
- Items (IReadOnlyCollection&lt;SprintItem&gt;)

**Relationships:**

- ManyToOne → Project
- OneToOne → Board
- OneToMany → SprintItem

---

### Entity: Board

**Path:** `Models/Entities/Board.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property    | Type     | Nullable | Key |
|-------------|----------|----------|-----|
| Id          | Guid     | No       | PK  |
| ProjectId   | Guid     | No       | FK  |
| SprintId    | Guid     | No       | FK  |
| Name        | string   | No       |     |
| Description | string   | No       |     |
| BoardType   | BoardType| No       |     |
| CreatedAt   | DateTime | No       |     |
| UpdatedAt   | DateTime | No       |     |

**Navigation properties:**

- Project (Project)
- Sprint (Sprint)

**Relationships:**

- ManyToOne → Project
- OneToOne → Sprint
- OneToMany → BoardColumn (via BoardId, configured in DbContext)

---

### Entity: SprintItem

**Path:** `Models/Entities/SprintItem.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property    | Type     | Nullable | Key |
|-------------|----------|----------|-----|
| Id          | int      | No       | PK  |
| SprintId    | Guid     | No       | FK  |
| UserStoryId | int      | No       | FK  |
| Position    | int      | No       |     |
| Notes       | string   | No       |     |
| AddedAt     | DateTime | No       |     |

**Navigation properties:**

- Sprint (Sprint)
- UserStory (UserStory)
- Tasks (ICollection&lt;StoryTask&gt;)

**Relationships:**

- ManyToOne → Sprint
- ManyToOne → UserStory
- OneToMany → StoryTask

---

### Entity: StoryTask

**Path:** `Models/Entities/StoryTask.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property       | Type          | Nullable | Key |
|----------------|---------------|----------|-----|
| Id             | int           | No       | PK  |
| SprintItemId   | int           | No       | FK  |
| Title          | string        | No       |     |
| Description    | string        | No       |     |
| AssigneeId     | Guid?         | Yes      |     |
| EstimatedHours | int?          | Yes      |     |
| ActualHours    | int?          | Yes      |     |
| Priority       | int           | No       |     |
| Position       | int           | No       |     |
| Status         | StoryTaskStatus | No     |     |
| CreatedAt      | DateTime      | No       |     |
| UpdatedAt      | DateTime      | No       |     |

**Navigation properties:**

- SprintItem (SprintItem)

**Relationships:**

- ManyToOne → SprintItem

---

### Entity: BoardColumn

**Path:** `Models/Entities/BoardColumn.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property     | Type     | Nullable | Key |
|--------------|----------|----------|-----|
| Id           | int      | No       | PK  |
| BoardId      | Guid     | No       | FK  |
| Name         | string   | No       |     |
| Description  | string   | No       |     |
| Position     | int      | No       |     |
| WipLimit     | int?     | Yes      |     |
| Color        | string   | No       |     |
| IsDoneColumn | bool     | No       |     |
| CreatedAt    | DateTime | No       |     |
| UpdatedAt    | DateTime | No       |     |

**Navigation properties:**

- Board (Board)
- Cards (IReadOnlyCollection&lt;BoardCard&gt;)

**Relationships:**

- ManyToOne → Board
- OneToMany → BoardCard

---

### Entity: BoardCard

**Path:** `Models/Entities/BoardCard.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property   | Type     | Nullable | Key |
|------------|----------|----------|-----|
| Id         | int      | No       | PK  |
| ColumnId   | int      | No       | FK  |
| UserStoryId| int      | No       | FK  |
| Position   | int      | No       |     |
| CreatedAt  | DateTime | No       |     |
| UpdatedAt  | DateTime | No       |     |

**Navigation properties:**

- Column (BoardColumn)
- UserStory (UserStory)

**Relationships:**

- ManyToOne → BoardColumn
- ManyToOne → UserStory
- OneToMany → CardLabel, CardAttachment, CardComment, CardActivity (via CardId)

---

### Entity: Label

**Path:** `Models/Entities/Label.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property   | Type     | Nullable | Key |
|------------|----------|----------|-----|
| Id         | int      | No       | PK  |
| ProjectId  | Guid     | No       | FK  |
| Name       | string   | No       |     |
| Color      | string   | No       |     |
| CreatedAt  | DateTime | No       |     |
| UpdatedAt  | DateTime | No       |     |

**Navigation properties:**

- Project (Project)

**Relationships:**

- ManyToOne → Project
- ManyToMany → BoardCard (via CardLabel join)

---

### Entity: CardLabel

**Path:** `Models/Entities/CardLabel.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property  | Type     | Nullable | Key |
|-----------|----------|----------|-----|
| Id        | int      | No       | PK  |
| CardId    | int      | No       | FK  |
| LabelId   | int      | No       | FK  |
| CreatedAt | DateTime | No       |     |

**Navigation properties:**

- Card (BoardCard)
- Label (Label)

**Relationships:**

- ManyToOne → BoardCard
- ManyToOne → Label

---

### Entity: CardAttachment

**Path:** `Models/Entities/CardAttachment.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property   | Type     | Nullable | Key |
|------------|----------|----------|-----|
| Id         | int      | No       | PK  |
| CardId     | int      | No       | FK  |
| FileName   | string   | No       |     |
| FilePath   | string   | No       |     |
| FileSize   | int?     | Yes      |     |
| MimeType   | string   | No       |     |
| UploadedBy | Guid     | No       |     |
| CreatedAt  | DateTime | No       |     |

**Navigation properties:**

- Card (BoardCard)

**Relationships:**

- ManyToOne → BoardCard

---

### Entity: CardComment

**Path:** `Models/Entities/CardComment.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property         | Type     | Nullable | Key |
|------------------|----------|----------|-----|
| Id               | int      | No       | PK  |
| CardId           | int      | No       | FK  |
| UserId           | Guid     | No       |     |
| Content          | string   | No       |     |
| ParentCommentId  | int?     | Yes      | FK  |
| CreatedAt        | DateTime | No       |     |
| UpdatedAt        | DateTime | No       |     |

**Navigation properties:**

- Card (BoardCard)
- ParentComment (CardComment?)
- Replies (IReadOnlyCollection&lt;CardComment&gt;)

**Relationships:**

- ManyToOne → BoardCard
- Self-referential ManyToOne → CardComment (parent/replies)

---

### Entity: CardActivity

**Path:** `Models/Entities/CardActivity.cs`  
**Namespace:** `archFlowServer.Models.Entities`

**Properties:**

| Property     | Type           | Nullable | Key |
|--------------|----------------|----------|-----|
| Id           | int            | No       | PK  |
| CardId       | int            | No       | FK  |
| UserId       | Guid           | No       |     |
| ActivityType | CardActivityType | No     |     |
| OldValue     | string         | No       | (jsonb in DB) |
| NewValue     | string         | No       | (jsonb in DB) |
| Description  | string         | No       |     |
| CreatedAt    | DateTime       | No       |     |

**Navigation properties:**

- Card (BoardCard)

**Relationships:**

- ManyToOne → BoardCard

---

## 2. Services

| Service                      | Path                         | Responsibility |
|-----------------------------|------------------------------|----------------|
| AuthService                 | Services/AuthService.cs      | Login, logout, authenticated user (me). |
| TokenService               | Services/TokenService.cs     | JWT token generation/validation. |
| UserService                | Services/UserService.cs      | User CRUD (e.g. create user). |
| ProjectService             | Services/ProjectService.cs    | Project CRUD, archive/restore, members, invites. |
| ProjectAuthorizationService| Services/ProjectAuthorizationService.cs | Project permission checks. |
| BacklogService             | Services/BacklogService.cs    | Product backlog, epics, user stories (CRUD, reorder, move, archive/restore). |
| SprintService              | Services/SprintService.cs    | Sprint CRUD, activate/close/cancel, archive/restore. |
| SprintItemService          | Services/SprintItemService.cs| Sprint items (add/update/remove user stories in sprint). |
| BoardService               | Services/BoardService.cs     | Board get/update (by sprint). |
| BoardColumnService         | Services/BoardColumnService.cs| Board columns CRUD. |
| BoardCardService           | Services/BoardCardService.cs | Board cards CRUD, reorder, move. |
| StoryTaskService           | Services/StoryTaskService.cs  | Story tasks CRUD, reorder, move. |
| LabelService               | Services/LabelService.cs     | Project labels CRUD. |
| CardLabelService           | Services/CardLabelService.cs | Card–label association (add/remove). |
| CardAttachmentService      | Services/CardAttachmentService.cs | Card attachments (add/delete). |
| CardCommentService         | Services/CardCommentService.cs   | Card comments CRUD, nested replies. |
| CardActivityService        | Services/CardActivityService.cs  | Card activity log (create, list). |

---

## 3. Controllers and Endpoints

Base URL assumption: `/api` unless overridden by route.  
Route parameters: `{projectId:guid}`, `{sprintId:guid}`, `{id:guid}`, `{columnId:int}`, `{cardId:int}`, etc.

---

### AuthController

**Route prefix:** `api/auth`

| Method | Route        | Action | Description (summary)     |
|--------|--------------|--------|---------------------------|
| POST   | login        | Login  | Login                     |
| POST   | logout       | Logout | Logout (Authorize)        |
| GET    | me           | Me     | Current user (Authorize)  |

---

### UsersController

**Route prefix:** `api/users`

| Method | Route    | Action   | Description     |
|--------|----------|----------|-----------------|
| GET    | {id}     | GetById  | Get user by id  |
| POST   | (body)   | Create   | Create user     |

---

### ProjectsController

**Route prefix:** `api/projects`

| Method | Route                          | Action        | Description            |
|--------|--------------------------------|---------------|------------------------|
| GET    | (none)                         | GetAll        | List user's projects   |
| GET    | {id:guid}                      | GetById       | Get project by id      |
| POST   | (body)                         | Create        | Create project         |
| PUT    | {id:guid}                      | Update        | Update project         |
| POST   | {id:guid}/archive              | Archive       | Archive project        |
| POST   | {id:guid}/restore              | Restore       | Restore project        |
| POST   | {id:guid}/members              | AddMember     | Add member             |
| DELETE | {id:guid}/members/{userId:guid}| RemoveMember  | Remove member          |
| GET    | {id:guid}/members              | GetMembers    | List members           |
| GET    | {id:guid}/invites              | GetInvites    | List invites           |
| POST   | {id:guid}/invites              | CreateInvite  | Create invite          |
| PUT    | invites/{token}/accept         | AcceptInvite  | Accept invite          |
| PUT    | invites/{token}/decline        | DeclineInvite | Decline invite         |
| PUT    | invites/{token}/revoke         | RevokeInvite  | Revoke invite          |

---

### BacklogController

**Route prefix:** `api/projects/{projectId:guid}/backlog`

| Method | Route                    | Action         | Description              |
|--------|--------------------------|----------------|--------------------------|
| GET    | (none)                   | GetBacklog     | Full product backlog     |
| PATCH  | (body overview)          | UpdateOverview | Update backlog overview  |
| POST   | epics                    | CreateEpic     | Create epic              |
| PATCH  | epics/{epicId:int}       | UpdateEpic     | Update epic              |
| PATCH  | epics/reorder            | ReorderEpic    | Reorder epics            |
| PATCH  | epics/{epicId:int}/archive| ArchiveEpic   | Archive epic             |
| PATCH  | epics/{epicId:int}/restore| RestoreEpic   | Restore epic             |
| POST   | epics/{epicId:int}/stories| CreateStory   | Create user story        |
| PATCH  | stories/{storyId:int}    | UpdateStory    | Update user story        |
| PATCH  | stories/reorder          | ReorderStory   | Reorder user stories     |
| PATCH  | stories/move             | MoveStory      | Move story between epics |
| PATCH  | stories/{storyId:int}/archive | ArchiveStory | Archive user story  |
| PATCH  | stories/{storyId:int}/restore | RestoreStory | Restore user story  |

---

### SprintsController

**Route prefix:** `api/projects/{projectId:guid}/sprints`

| Method | Route                    | Action      | Description        |
|--------|--------------------------|-------------|--------------------|
| GET    | (none)                   | GetAll      | List sprints       |
| GET    | {sprintId:guid}          | GetById     | Get sprint         |
| POST   | (body)                   | Create      | Create sprint      |
| PATCH  | {sprintId:guid}          | Update      | Update sprint      |
| POST   | {sprintId:guid}/activate | Activate    | Activate sprint    |
| POST   | {sprintId:guid}/close    | Close       | Close sprint       |
| POST   | {sprintId:guid}/cancel   | Cancel      | Cancel sprint      |
| PATCH  | {sprintId:guid}/archive  | Archive     | Archive sprint     |
| PATCH  | {sprintId:guid}/restore | Restore     | Restore sprint     |

---

### SprintItemsController

**Route prefix:** `api/projects/{projectId:guid}/sprints/{sprintId:guid}/items`

| Method | Route              | Action   | Description        |
|--------|--------------------|----------|--------------------|
| GET    | (none)             | GetAll   | List sprint items  |
| GET    | {itemId:int}       | GetById  | Get sprint item    |
| POST   | (body)             | Create   | Add story to sprint|
| PATCH  | {itemId:int}       | Update   | Update item        |
| DELETE | {itemId:int}       | Delete   | Remove from sprint |

---

### BoardsController

**Route prefix:** `api/projects/{projectId:guid}/sprints/{sprintId:guid}/board`

| Method | Route   | Action  | Description   |
|--------|---------|---------|---------------|
| GET    | (none)  | GetBoard| Get board     |
| PATCH  | (body)  | Update  | Update board  |

---

### BoardColumnsController

**Route prefix:** `api/projects/{projectId:guid}/sprints/{sprintId:guid}/board/columns`

| Method | Route               | Action   | Description   |
|--------|---------------------|----------|---------------|
| GET    | (none)              | GetAll   | List columns  |
| POST   | (body)              | Create   | Create column |
| PUT    | {columnId:int}      | Update   | Update column |
| DELETE | {columnId:int}      | Delete   | Delete column |

---

### BoardCardsController

**Route prefix:** `api/projects/{projectId:guid}/sprints/{sprintId:guid}/board/columns/{columnId:int}/cards`

| Method | Route                 | Action   | Description   |
|--------|-----------------------|----------|---------------|
| GET    | (none)                | GetAll   | List cards    |
| POST   | (body)                | Create   | Create card   |
| PATCH  | {cardId:int}/reorder  | Reorder  | Reorder cards |
| PATCH  | {cardId:int}/move     | Move     | Move card     |
| DELETE | {cardId:int}          | Delete   | Delete card   |

---

### StoryTasksController

**Route prefix:** `api/projects/{projectId:guid}/sprints/{sprintId:guid}/items/{sprintItemId:int}/tasks`

| Method | Route                 | Action   | Description   |
|--------|-----------------------|----------|---------------|
| GET    | (none)                | GetAll   | List tasks    |
| POST   | (body)                | Create   | Create task   |
| PUT    | {taskId:int}          | Update   | Update task   |
| DELETE | {taskId:int}          | Delete   | Delete task   |
| PATCH  | {taskId:int}/reorder  | Reorder  | Reorder tasks |
| PATCH  | {taskId:int}/move     | Move     | Move task     |

---

### LabelsController

**Route prefix:** `api/projects/{projectId:guid}/labels`

| Method | Route            | Action   | Description   |
|--------|------------------|----------|---------------|
| GET    | (none)           | GetAll   | List labels   |
| GET    | {labelId:int}    | GetById  | Get label     |
| POST   | (body)           | Create   | Create label  |
| PUT    | {labelId:int}    | Update   | Update label  |
| DELETE | {labelId:int}    | Delete   | Delete label  |

---

### CardCommentsController

**Route prefix:** `api/projects/{projectId:guid}/cards/{cardId:int}/comments`

| Method | Route             | Action   | Description    |
|--------|-------------------|----------|----------------|
| GET    | (none)            | GetAll   | List comments  |
| POST   | (body)            | Create   | Create comment |
| PUT    | {commentId:int}   | Update   | Update comment |
| DELETE | {commentId:int}   | Delete   | Delete comment |

---

### CardAttachmentsController

**Route prefix:** `api/projects/{projectId:guid}/cards/{cardId:int}/attachments`

| Method | Route                | Action   | Description     |
|--------|----------------------|----------|-----------------|
| GET    | (none)               | GetAll   | List attachments|
| POST   | (body/form)          | Create   | Add attachment  |
| DELETE | {attachmentId:int}  | Delete   | Delete attachment|

---

### CardLabelsController

**Route prefix:** `api/projects/{projectId:guid}/cards/{cardId:int}/labels`

| Method | Route               | Action   | Description   |
|--------|---------------------|----------|---------------|
| GET    | (none)              | GetAll   | List card labels |
| POST   | (body)              | Add      | Add label to card |
| DELETE | {cardLabelId:int}   | Remove   | Remove label from card |

---

### CardActivitiesController

**Route prefix:** `api/projects/{projectId:guid}/cards/{cardId:int}/activities`

| Method | Route   | Action   | Description     |
|--------|---------|----------|-----------------|
| GET    | (none)  | GetAll   | List activities |
| POST   | (body)  | Create   | Log activity    |

---

## 4. Enums (Referenced by Entities)

| Enum                | Path                         | Use in entities                    |
|---------------------|------------------------------|------------------------------------|
| UserType            | Models/Enums/UserType.cs     | User                               |
| ProjectStatus       | Models/Enums/ProjectStatus.cs| Project                            |
| MemberRole          | Models/Enums/MemberRole.cs   | ProjectMember, ProjectInvite       |
| InviteStatus        | Models/Enums/InviteStatus.cs | ProjectInvite                      |
| BusinessValue       | Models/Enums/BusinessValue.cs| Epic, UserStory                    |
| EpicStatus          | Models/Enums/EpicStatus.cs   | Epic                               |
| UserStoryStatus     | Models/Enums/UserStoryStatus.cs | UserStory                       |
| UserStoryComplexity | Models/Enums/UserStoryComplexity.cs | UserStory                    |
| SprintStatus        | Models/Enums/SprintStatus.cs | Sprint                             |
| BoardType           | Models/Enums/BoardType.cs    | Board                              |
| StoryTaskStatus     | In StoryTask.cs              | StoryTask                          |
| CardActivityType    | Models/Enums/CardActivityType.cs | CardActivity                   |

---

## 5. Machine-Readable Endpoint List (Flat)

For contract validation, below is a flat list of all HTTP endpoints.

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
PATCH  /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}/cards/{cardId}/reorder
PATCH  /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}/cards/{cardId}/move
DELETE /api/projects/{projectId}/sprints/{sprintId}/board/columns/{columnId}/cards/{cardId}

GET    /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks
POST   /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks
PUT    /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks/{taskId}
DELETE /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks/{taskId}
PATCH  /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks/{taskId}/reorder
PATCH  /api/projects/{projectId}/sprints/{sprintId}/items/{sprintItemId}/tasks/{taskId}/move

GET    /api/projects/{projectId}/labels
GET    /api/projects/{projectId}/labels/{labelId}
POST   /api/projects/{projectId}/labels
PUT    /api/projects/{projectId}/labels/{labelId}
DELETE /api/projects/{projectId}/labels/{labelId}

GET    /api/projects/{projectId}/cards/{cardId}/comments
POST   /api/projects/{projectId}/cards/{cardId}/comments
PUT    /api/projects/{projectId}/cards/{cardId}/comments/{commentId}
DELETE /api/projects/{projectId}/cards/{cardId}/comments/{commentId}

GET    /api/projects/{projectId}/cards/{cardId}/attachments
POST   /api/projects/{projectId}/cards/{cardId}/attachments
DELETE /api/projects/{projectId}/cards/{cardId}/attachments/{attachmentId}

GET    /api/projects/{projectId}/cards/{cardId}/labels
POST   /api/projects/{projectId}/cards/{cardId}/labels
DELETE /api/projects/{projectId}/cards/{cardId}/labels/{cardLabelId}

GET    /api/projects/{projectId}/cards/{cardId}/activities
POST   /api/projects/{projectId}/cards/{cardId}/activities
```

---

**End of report.** Use this document to compare with the frontend: validate that every required endpoint is called, that request/response shapes match DTOs, and that no backend entities are missing on the frontend.
