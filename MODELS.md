# ArchFlow Server — Referência de Models

> Documento gerado automaticamente com base no código-fonte.
> Lista todas as **Entities**, **DTOs**, e **Enums** do projeto, indicando quais campos são **obrigatórios** e quais são **opcionais** para instanciar cada model.

---

## Sumário

- [Enums](#enums)
- [Entities](#entities)
- [DTOs — Auth](#dtos--auth)
- [DTOs — User](#dtos--user)
- [DTOs — Project](#dtos--project)
- [DTOs — Backlog](#dtos--backlog)
- [DTOs — Sprint](#dtos--sprint)
- [DTOs — Board](#dtos--board)
- [DTOs — Board Columns](#dtos--board-columns)
- [DTOs — Board Cards](#dtos--board-cards)
- [DTOs — Labels](#dtos--labels)
- [DTOs — Card Labels](#dtos--card-labels)
- [DTOs — Card Comments](#dtos--card-comments)
- [DTOs — Card Attachments](#dtos--card-attachments)
- [DTOs — Card Activities](#dtos--card-activities)
- [DTOs — Tasks](#dtos--tasks)

---

## Enums

### `UserType`


| Valor   |
| ------- |
| `Free`  |
| `Plus`  |
| `Admin` |


### `ProjectStatus`


| Valor      |
| ---------- |
| `Active`   |
| `Archived` |


### `MemberRole`


| Valor          |
| -------------- |
| `Owner`        |
| `ScrumMaster`  |
| `ProductOwner` |
| `Developer`    |


### `InviteStatus`


| Valor      | Int |
| ---------- | --- |
| `Pending`  | 0   |
| `Accepted` | 1   |
| `Declined` | 2   |
| `Expired`  | 3   |
| `Revoked`  | 4   |


### `EpicStatus`


| Valor       |
| ----------- |
| `Draft`     |
| `Active`    |
| `Completed` |


### `BusinessValue`


| Valor    |
| -------- |
| `Low`    |
| `Medium` |
| `High`   |


### `UserStoryStatus`


| Valor        |
| ------------ |
| `Draft`      |
| `Ready`      |
| `InProgress` |
| `Done`       |


### `UserStoryComplexity`


| Valor      |
| ---------- |
| `Low`      |
| `Medium`   |
| `High`     |
| `VeryHigh` |


### `SprintStatus`


| Valor       |
| ----------- |
| `Planned`   |
| `Active`    |
| `Closed`    |
| `Cancelled` |


### `BoardType`


| Valor    |
| -------- |
| `Kanban` |


### `CardPriority`


| Valor    |
| -------- |
| `Low`    |
| `Medium` |
| `High`   |


### `CardActivityType`


| Valor               |
| ------------------- |
| `Created`           |
| `Updated`           |
| `MovedColumn`       |
| `Reordered`         |
| `Assigned`          |
| `Unassigned`        |
| `LabelAdded`        |
| `LabelRemoved`      |
| `CommentAdded`      |
| `CommentEdited`     |
| `CommentDeleted`    |
| `AttachmentAdded`   |
| `AttachmentRemoved` |
| `DueDateChanged`    |
| `PriorityChanged`   |
| `Archived`          |
| `Restored`          |


### `StoryTaskStatus`


| Valor   | Int |
| ------- | --- |
| `Todo`  | 0   |
| `Doing` | 1   |
| `Done`  | 2   |


---

## Entities

### `User`


| Campo          | Tipo       | Obrigatório | Observação                    |
| -------------- | ---------- | ----------- | ----------------------------- |
| `name`         | `string`   | **Sim**     | Não pode ser vazio/whitespace |
| `email`        | `string`   | **Sim**     | Não pode ser vazio/whitespace |
| `type`         | `UserType` | **Sim**     | Enum                          |
| `passwordHash` | `string`   | **Sim**     | Não pode ser vazio/whitespace |
| `avatarUrl`    | `string?`  | Não         | Default: `null`               |


> **Gerados automaticamente:** `Id` (Guid), `CreatedAt`, `UpdatedAt`

---

### `Project`


| Campo         | Tipo      | Obrigatório | Observação                    |
| ------------- | --------- | ----------- | ----------------------------- |
| `name`        | `string`  | **Sim**     | Não pode ser vazio/whitespace |
| `ownerId`     | `Guid`    | **Sim**     | Não pode ser `Guid.Empty`     |
| `description` | `string?` | Não         | Default: `""`                 |


> **Gerados automaticamente:** `Id` (Guid), `Status` (Active), `CreatedAt`, `ProductBacklog` (criado junto), `Members` (Owner adicionado automaticamente)

---

### `ProjectMember`


| Campo       | Tipo         | Obrigatório | Observação |
| ----------- | ------------ | ----------- | ---------- |
| `projectId` | `Guid`       | **Sim**     | —          |
| `userId`    | `Guid`       | **Sim**     | —          |
| `role`      | `MemberRole` | **Sim**     | Enum       |


> **Gerados automaticamente:** `Id` (int), `JoinedAt`
> **Acesso:** Construtor `internal` — criado via `Project.AddMember()`

---

### `ProjectInvite`


| Campo        | Tipo         | Obrigatório | Observação                    |
| ------------ | ------------ | ----------- | ----------------------------- |
| `projectId`  | `Guid`       | **Sim**     | Não pode ser `Guid.Empty`     |
| `email`      | `string`     | **Sim**     | Não pode ser vazio/whitespace |
| `role`       | `MemberRole` | **Sim**     | Enum                          |
| `expiration` | `TimeSpan`   | **Sim**     | Duração do convite            |


> **Gerados automaticamente:** `Id` (Guid), `Token`, `CreatedAt`, `ExpiresAt`, `Status` (Pending)

---

### `ProductBacklog`


| Campo       | Tipo      | Obrigatório | Observação                |
| ----------- | --------- | ----------- | ------------------------- |
| `projectId` | `Guid`    | **Sim**     | Não pode ser `Guid.Empty` |
| `overview`  | `string?` | Não         | Default: `""`             |


> **Gerados automaticamente:** `Id` (Guid), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal` — criado automaticamente junto com `Project`

---

### `Epic`


| Campo              | Tipo            | Obrigatório | Observação                    |
| ------------------ | --------------- | ----------- | ----------------------------- |
| `productBacklogId` | `Guid`          | **Sim**     | Não pode ser `Guid.Empty`     |
| `name`             | `string`        | **Sim**     | Não pode ser vazio/whitespace |
| `description`      | `string?`       | Não         | Default: `""`                 |
| `businessValue`    | `BusinessValue` | **Sim**     | Enum                          |
| `status`           | `EpicStatus`    | **Sim**     | Enum                          |
| `position`         | `int`           | **Sim**     | Deve ser >= 0                 |
| `priority`         | `int`           | **Sim**     | —                             |
| `color`            | `string?`       | Não         | Default: `"#3498db"`          |
| `isArchived`       | `bool`          | **Sim**     | —                             |
| `archivedAt`       | `DateTime?`     | Não         | —                             |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `UserStory`


| Campo                | Tipo                  | Obrigatório | Observação                    |
| -------------------- | --------------------- | ----------- | ----------------------------- |
| `epicId`             | `int`                 | **Sim**     | Deve ser > 0                  |
| `title`              | `string`              | **Sim**     | Não pode ser vazio/whitespace |
| `persona`            | `string`              | **Sim**     | Não pode ser vazio/whitespace |
| `description`        | `string`              | **Sim**     | Não pode ser vazio/whitespace |
| `acceptanceCriteria` | `string?`             | Não         | Default: `""`                 |
| `complexity`         | `UserStoryComplexity` | **Sim**     | Enum                          |
| `effort`             | `int?`                | Não         | —                             |
| `dependencies`       | `string?`             | Não         | Default: `""`                 |
| `priority`           | `int`                 | **Sim**     | —                             |
| `businessValue`      | `BusinessValue`       | **Sim**     | Enum                          |
| `status`             | `UserStoryStatus`     | **Sim**     | Enum                          |
| `backlogPosition`    | `int`                 | **Sim**     | Deve ser >= 0                 |
| `assigneeId`         | `Guid?`               | Não         | —                             |


> **Gerados automaticamente:** `Id` (int), `IsArchived` (false), `ArchivedAt` (null), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `Sprint`


| Campo           | Tipo       | Obrigatório | Observação                    |
| --------------- | ---------- | ----------- | ----------------------------- |
| `projectId`     | `Guid`     | **Sim**     | Não pode ser `Guid.Empty`     |
| `name`          | `string`   | **Sim**     | Não pode ser vazio/whitespace |
| `goal`          | `string?`  | Não         | Default: `""`                 |
| `executionPlan` | `string?`  | Não         | Default: `""`                 |
| `startDate`     | `DateTime` | **Sim**     | Deve ser < `endDate`          |
| `endDate`       | `DateTime` | **Sim**     | Deve ser > `startDate`        |
| `capacityHours` | `int`      | **Sim**     | Deve ser >= 0                 |


> **Gerados automaticamente:** `Id` (Guid), `Status` (Planned), `IsArchived` (false), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `SprintItem`


| Campo         | Tipo      | Obrigatório | Observação                |
| ------------- | --------- | ----------- | ------------------------- |
| `sprintId`    | `Guid`    | **Sim**     | Não pode ser `Guid.Empty` |
| `userStoryId` | `int`     | **Sim**     | Deve ser > 0              |
| `position`    | `int`     | **Sim**     | Deve ser >= 0             |
| `notes`       | `string?` | Não         | Default: `""`             |


> **Gerados automaticamente:** `Id` (int), `AddedAt`
> **Acesso:** Construtor `internal`

---

### `StoryTask`


| Campo            | Tipo              | Obrigatório | Observação                    |
| ---------------- | ----------------- | ----------- | ----------------------------- |
| `sprintItemId`   | `int`             | **Sim**     | —                             |
| `title`          | `string`          | **Sim**     | Não pode ser vazio/whitespace |
| `description`    | `string?`         | Não         | Default: `""`                 |
| `assigneeId`     | `Guid?`           | Não         | —                             |
| `estimatedHours` | `int?`            | Não         | Se informado, deve ser >= 0   |
| `priority`       | `int`             | **Sim**     | Deve ser >= 0                 |
| `position`       | `int`             | **Sim**     | Deve ser >= 0                 |
| `status`         | `StoryTaskStatus` | **Sim**     | Enum                          |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `Board`


| Campo         | Tipo        | Obrigatório | Observação                    |
| ------------- | ----------- | ----------- | ----------------------------- |
| `projectId`   | `Guid`      | **Sim**     | Não pode ser `Guid.Empty`     |
| `sprintId`    | `Guid`      | **Sim**     | Não pode ser `Guid.Empty`     |
| `name`        | `string`    | **Sim**     | Não pode ser vazio/whitespace |
| `description` | `string?`   | Não         | Default: `""`                 |
| `boardType`   | `BoardType` | **Sim**     | Enum                          |


> **Gerados automaticamente:** `Id` (Guid), `CreatedAt`, `UpdatedAt` (via `IAuditableEntity`)
> **Acesso:** Construtor `internal`

---

### `BoardColumn`


| Campo          | Tipo      | Obrigatório | Observação                              |
| -------------- | --------- | ----------- | --------------------------------------- |
| `boardId`      | `Guid`    | **Sim**     | Não pode ser `Guid.Empty`               |
| `name`         | `string`  | **Sim**     | Não pode ser vazio/whitespace           |
| `description`  | `string?` | Não         | Default: `""`                           |
| `position`     | `int`     | **Sim**     | Deve ser >= 0                           |
| `wipLimit`     | `int?`    | Não         | Se informado, deve ser >= 0             |
| `color`        | `string?` | Não         | Default: `"#95a5a6"`, formato `#RRGGBB` |
| `isDoneColumn` | `bool`    | **Sim**     | —                                       |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `BoardCard`


| Campo         | Tipo  | Obrigatório | Observação    |
| ------------- | ----- | ----------- | ------------- |
| `columnId`    | `int` | **Sim**     | Deve ser > 0  |
| `userStoryId` | `int` | **Sim**     | Deve ser > 0  |
| `position`    | `int` | **Sim**     | Deve ser >= 0 |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `Label`


| Campo       | Tipo     | Obrigatório | Observação                                   |
| ----------- | -------- | ----------- | -------------------------------------------- |
| `projectId` | `Guid`   | **Sim**     | Não pode ser `Guid.Empty`                    |
| `name`      | `string` | **Sim**     | Não pode ser vazio/whitespace, máx 100 chars |
| `color`     | `string` | **Sim**     | Formato HEX `#RRGGBB`                        |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `CardLabel`


| Campo     | Tipo  | Obrigatório | Observação   |
| --------- | ----- | ----------- | ------------ |
| `cardId`  | `int` | **Sim**     | Deve ser > 0 |
| `labelId` | `int` | **Sim**     | Deve ser > 0 |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`
> **Acesso:** Construtor `internal`

---

### `CardComment`


| Campo             | Tipo     | Obrigatório | Observação                    |
| ----------------- | -------- | ----------- | ----------------------------- |
| `cardId`          | `int`    | **Sim**     | Deve ser > 0                  |
| `userId`          | `Guid`   | **Sim**     | Não pode ser `Guid.Empty`     |
| `content`         | `string` | **Sim**     | Não pode ser vazio/whitespace |
| `parentCommentId` | `int?`   | Não         | Para respostas aninhadas      |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`, `UpdatedAt`
> **Acesso:** Construtor `internal`

---

### `CardAttachment`


| Campo        | Tipo      | Obrigatório | Observação                                   |
| ------------ | --------- | ----------- | -------------------------------------------- |
| `cardId`     | `int`     | **Sim**     | Deve ser > 0                                 |
| `fileName`   | `string`  | **Sim**     | Não pode ser vazio/whitespace, máx 255 chars |
| `filePath`   | `string`  | **Sim**     | Não pode ser vazio/whitespace, máx 500 chars |
| `fileSize`   | `int?`    | Não         | —                                            |
| `mimeType`   | `string?` | Não         | Máx 100 chars                                |
| `uploadedBy` | `Guid`    | **Sim**     | Não pode ser `Guid.Empty`                    |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`
> **Acesso:** Construtor `internal`

---

### `CardActivity`


| Campo          | Tipo               | Obrigatório | Observação                |
| -------------- | ------------------ | ----------- | ------------------------- |
| `cardId`       | `int`              | **Sim**     | Deve ser > 0              |
| `userId`       | `Guid`             | **Sim**     | Não pode ser `Guid.Empty` |
| `activityType` | `CardActivityType` | **Sim**     | Enum                      |
| `oldValue`     | `string?`          | Não         | JSON (jsonb)              |
| `newValue`     | `string?`          | Não         | JSON (jsonb)              |
| `description`  | `string?`          | Não         | —                         |


> **Gerados automaticamente:** `Id` (int), `CreatedAt`
> **Acesso:** Construtor `internal`

---

## DTOs — Auth

### `LoginDto`


| Campo      | Tipo     | Obrigatório | Observação   |
| ---------- | -------- | ----------- | ------------ |
| `Email`    | `string` | **Sim**     | `[Required]` |
| `Password` | `string` | **Sim**     | `[Required]` |


---

## DTOs — User

### `CreateUserDto`


| Campo       | Tipo       | Obrigatório | Observação                                      |
| ----------- | ---------- | ----------- | ----------------------------------------------- |
| `Name`      | `string`   | **Sim**     | `[Required]`                                    |
| `Email`     | `string`   | **Sim**     | `[Required]`, deve ser único                    |
| `Type`      | `UserType` | Não         | Default: `Free`                                 |
| `Password`  | `string`   | **Sim**     | `[Required]`, texto puro (hasheado no servidor) |
| `AvatarUrl` | `string?`  | Não         | URL da imagem de perfil                         |


### `ResponseUserDto`


| Campo       | Tipo       | Observação |
| ----------- | ---------- | ---------- |
| `Id`        | `Guid`     | —          |
| `Name`      | `string`   | —          |
| `Email`     | `string`   | —          |
| `Type`      | `UserType` | —          |
| `AvatarUrl` | `string?`  | —          |
| `CreatedAt` | `DateTime` | —          |
| `UpdatedAt` | `DateTime` | —          |


---

## DTOs — Project

### `CreateProjectDto`


| Campo         | Tipo     | Obrigatório | Observação                |
| ------------- | -------- | ----------- | ------------------------- |
| `Name`        | `string` | **Sim**     | `[Required]`, mín 3 chars |
| `Description` | `string` | Não         | Default: `""`             |


### `UpdateProjectDto`


| Campo         | Tipo      | Obrigatório | Observação   |
| ------------- | --------- | ----------- | ------------ |
| `Name`        | `string`  | **Sim**     | `[Required]` |
| `Description` | `string?` | Não         | —            |


### `AddProjectMemberDto`


| Campo    | Tipo         | Obrigatório | Observação   |
| -------- | ------------ | ----------- | ------------ |
| `UserId` | `Guid`       | **Sim**     | `[Required]` |
| `Role`   | `MemberRole` | **Sim**     | `[Required]` |


### `InviteProjectMemberDto`


| Campo   | Tipo         | Obrigatório | Observação                     |
| ------- | ------------ | ----------- | ------------------------------ |
| `Email` | `string`     | **Sim**     | `[Required]`, `[EmailAddress]` |
| `Role`  | `MemberRole` | **Sim**     | `[Required]`                   |


### `ProjectResponseDto`


| Campo         | Tipo                             | Observação |
| ------------- | -------------------------------- | ---------- |
| `Id`          | `Guid`                           | —          |
| `Name`        | `string`                         | —          |
| `Description` | `string`                         | —          |
| `OwnerId`     | `Guid`                           | —          |
| `OwnerName`   | `string`                         | —          |
| `Members`     | `List<ProjectMemberResponseDto>` | —          |
| `Status`      | `ProjectStatus`                  | —          |
| `CreatedAt`   | `DateTime`                       | —          |


### `ProjectListDto` (record)


| Campo         | Tipo                                  | Observação |
| ------------- | ------------------------------------- | ---------- |
| `Id`          | `Guid`                                | —          |
| `Name`        | `string`                              | —          |
| `Description` | `string`                              | —          |
| `Status`      | `ProjectStatus`                       | —          |
| `CreatedAt`   | `DateTime`                            | —          |
| `Members`     | `IReadOnlyCollection<ProjectUserDto>` | —          |


### `ProjectMemberDto` (record)


| Campo       | Tipo         | Observação |
| ----------- | ------------ | ---------- |
| `Id`        | `int`        | —          |
| `ProjectId` | `Guid`       | —          |
| `UserId`    | `Guid`       | —          |
| `Role`      | `MemberRole` | —          |
| `JoinedAt`  | `DateTime`   | —          |


### `ProjectMemberResponseDto`


| Campo      | Tipo         | Observação |
| ---------- | ------------ | ---------- |
| `UserId`   | `Guid`       | —          |
| `Name`     | `string`     | —          |
| `Email`    | `string`     | —          |
| `Role`     | `MemberRole` | —          |
| `JoinedAt` | `DateTime`   | —          |


### `ProjectUserDto` (record)


| Campo       | Tipo         | Observação |
| ----------- | ------------ | ---------- |
| `UserId`    | `Guid`       | —          |
| `Name`      | `string`     | —          |
| `Email`     | `string`     | —          |
| `AvatarUrl` | `string`     | —          |
| `Role`      | `MemberRole` | —          |
| `JoinedAt`  | `DateTime`   | —          |


### `ProjectInviteResponseDto`


| Campo       | Tipo           | Observação |
| ----------- | -------------- | ---------- |
| `Id`        | `Guid`         | —          |
| `ProjectId` | `Guid`         | —          |
| `Email`     | `string`       | —          |
| `Role`      | `MemberRole`   | —          |
| `Token`     | `string`       | —          |
| `ExpiresAt` | `DateTime`     | —          |
| `CreatedAt` | `DateTime`     | —          |
| `Status`    | `InviteStatus` | —          |


---

## DTOs — Backlog

### `CreateEpicDto`


| Campo           | Tipo            | Obrigatório | Observação           |
| --------------- | --------------- | ----------- | -------------------- |
| `Name`          | `string`        | **Sim**     | Validado na entidade |
| `Description`   | `string?`       | Não         | —                    |
| `BusinessValue` | `BusinessValue` | Não         | Default: `Medium`    |
| `Status`        | `EpicStatus`    | Não         | Default: `Draft`     |
| `Priority`      | `int`           | Não         | Default: `0`         |
| `Color`         | `string?`       | Não         | —                    |
| `IsArchived`    | `bool`          | Não         | Default: `false`     |


### `UpdateEpicDto`


| Campo           | Tipo             | Obrigatório | Observação    |
| --------------- | ---------------- | ----------- | ------------- |
| `Name`          | `string?`        | Não         | Merge parcial |
| `Description`   | `string?`        | Não         | —             |
| `BusinessValue` | `BusinessValue?` | Não         | —             |
| `Status`        | `EpicStatus?`    | Não         | —             |
| `Position`      | `int?`           | Não         | —             |
| `Priority`      | `int?`           | Não         | —             |
| `Color`         | `string?`        | Não         | —             |


### `EpicResponseDto`


| Campo              | Tipo                         | Observação |
| ------------------ | ---------------------------- | ---------- |
| `Id`               | `int`                        | —          |
| `ProductBacklogId` | `Guid`                       | —          |
| `Name`             | `string`                     | —          |
| `Description`      | `string`                     | —          |
| `BusinessValue`    | `BusinessValue`              | —          |
| `Status`           | `EpicStatus`                 | —          |
| `Position`         | `int`                        | —          |
| `Priority`         | `int`                        | —          |
| `Color`            | `string`                     | —          |
| `CreatedAt`        | `DateTime`                   | —          |
| `UpdatedAt`        | `DateTime`                   | —          |
| `UserStories`      | `List<UserStoryResponseDto>` | —          |


### `ReorderEpicDto`


| Campo        | Tipo  | Obrigatório | Observação |
| ------------ | ----- | ----------- | ---------- |
| `EpicId`     | `int` | **Sim**     | —          |
| `ToPosition` | `int` | **Sim**     | —          |


### `CreateUserStoryDto`


| Campo                | Tipo                  | Obrigatório | Observação           |
| -------------------- | --------------------- | ----------- | -------------------- |
| `Title`              | `string`              | **Sim**     | Validado na entidade |
| `Persona`            | `string`              | **Sim**     | Validado na entidade |
| `Description`        | `string`              | **Sim**     | Validado na entidade |
| `AcceptanceCriteria` | `string?`             | Não         | —                    |
| `Complexity`         | `UserStoryComplexity` | Não         | Default: `Medium`    |
| `Effort`             | `int?`                | Não         | —                    |
| `Dependencies`       | `string?`             | Não         | —                    |
| `Priority`           | `int`                 | Não         | Default: `0`         |
| `BusinessValue`      | `BusinessValue`       | Não         | Default: `Medium`    |
| `Status`             | `UserStoryStatus`     | Não         | Default: `Draft`     |
| `AssigneeId`         | `Guid?`               | Não         | —                    |
| `IsArchived`         | `bool`                | Não         | Default: `false`     |


### `UpdateUserStoryDto`


| Campo                | Tipo                   | Obrigatório | Observação    |
| -------------------- | ---------------------- | ----------- | ------------- |
| `Title`              | `string?`              | Não         | Merge parcial |
| `Persona`            | `string?`              | Não         | —             |
| `Description`        | `string?`              | Não         | —             |
| `AcceptanceCriteria` | `string?`              | Não         | —             |
| `Complexity`         | `UserStoryComplexity?` | Não         | —             |
| `Effort`             | `int?`                 | Não         | —             |
| `Dependencies`       | `string?`              | Não         | —             |
| `Priority`           | `int?`                 | Não         | —             |
| `BusinessValue`      | `BusinessValue?`       | Não         | —             |
| `Status`             | `UserStoryStatus?`     | Não         | —             |
| `BacklogPosition`    | `int?`                 | Não         | —             |
| `AssigneeId`         | `Guid?`                | Não         | —             |


### `UserStoryResponseDto`


| Campo                | Tipo                  | Observação |
| -------------------- | --------------------- | ---------- |
| `Id`                 | `int`                 | —          |
| `EpicId`             | `int`                 | —          |
| `Title`              | `string`              | —          |
| `Persona`            | `string`              | —          |
| `Description`        | `string`              | —          |
| `AcceptanceCriteria` | `string`              | —          |
| `Complexity`         | `UserStoryComplexity` | —          |
| `Effort`             | `int?`                | —          |
| `BacklogPosition`    | `int`                 | —          |
| `Dependencies`       | `string`              | —          |
| `Priority`           | `int`                 | —          |
| `BusinessValue`      | `BusinessValue`       | —          |
| `Status`             | `UserStoryStatus`     | —          |
| `AssigneeId`         | `Guid?`               | —          |
| `CreatedAt`          | `DateTime`            | —          |
| `UpdatedAt`          | `DateTime`            | —          |


### `ReorderUserStoryDto`


| Campo        | Tipo  | Obrigatório | Observação |
| ------------ | ----- | ----------- | ---------- |
| `StoryId`    | `int` | **Sim**     | —          |
| `ToPosition` | `int` | **Sim**     | —          |


### `MoveUserStoryDto`


| Campo        | Tipo  | Obrigatório | Observação |
| ------------ | ----- | ----------- | ---------- |
| `StoryId`    | `int` | **Sim**     | —          |
| `ToEpicId`   | `int` | **Sim**     | —          |
| `ToPosition` | `int` | **Sim**     | —          |


### `ProductBacklogResponseDto`


| Campo       | Tipo                    | Observação |
| ----------- | ----------------------- | ---------- |
| `Id`        | `Guid`                  | —          |
| `ProjectId` | `Guid`                  | —          |
| `Epics`     | `List<EpicResponseDto>` | —          |


### `UpdateBacklogOverviewDto`


| Campo      | Tipo      | Obrigatório | Observação   |
| ---------- | --------- | ----------- | ------------ |
| `Overview` | `string?` | **Sim**     | `[Required]` |


---

## DTOs — Sprint

### `CreateSprintDto`


| Campo           | Tipo       | Obrigatório | Observação                  |
| --------------- | ---------- | ----------- | --------------------------- |
| `Name`          | `string`   | **Sim**     | Validado na entidade        |
| `Goal`          | `string?`  | Não         | —                           |
| `ExecutionPlan` | `string?`  | Não         | —                           |
| `StartDate`     | `DateTime` | **Sim**     | Deve ser < EndDate          |
| `EndDate`       | `DateTime` | **Sim**     | Deve ser > StartDate        |
| `CapacityHours` | `int`      | Não         | Default: `0`, deve ser >= 0 |


### `UpdateSprintDto`


| Campo           | Tipo       | Obrigatório | Observação           |
| --------------- | ---------- | ----------- | -------------------- |
| `Name`          | `string`   | **Sim**     | Validado na entidade |
| `Goal`          | `string?`  | Não         | —                    |
| `ExecutionPlan` | `string?`  | Não         | —                    |
| `StartDate`     | `DateTime` | **Sim**     | Deve ser < EndDate   |
| `EndDate`       | `DateTime` | **Sim**     | Deve ser > StartDate |
| `CapacityHours` | `int`      | Não         | Default: `0`         |


### `SprintResponseDto` (record)


| Campo           | Tipo              | Observação |
| --------------- | ----------------- | ---------- |
| `Id`            | `Guid`            | —          |
| `ProjectId`     | `Guid`            | —          |
| `Name`          | `string`          | —          |
| `Goal`          | `string`          | —          |
| `ExecutionPlan` | `string`          | —          |
| `StartDate`     | `DateTime`        | —          |
| `EndDate`       | `DateTime`        | —          |
| `Status`        | `SprintStatusDto` | —          |
| `CapacityHours` | `int`             | —          |
| `IsArchived`    | `bool`            | —          |
| `ArchivedAt`    | `DateTime?`       | —          |
| `CreatedAt`     | `DateTime`        | —          |
| `UpdatedAt`     | `DateTime`        | —          |


### `CreateSprintItemDto`


| Campo         | Tipo      | Obrigatório | Observação                 |
| ------------- | --------- | ----------- | -------------------------- |
| `UserStoryId` | `int`     | **Sim**     | —                          |
| `Position`    | `int?`    | Não         | Se null, adiciona no final |
| `Notes`       | `string?` | Não         | —                          |


### `UpdateSprintItemDto`


| Campo      | Tipo      | Obrigatório | Observação |
| ---------- | --------- | ----------- | ---------- |
| `Position` | `int`     | **Sim**     | —          |
| `Notes`    | `string?` | Não         | —          |


### `SprintItemResponseDto` (record)


| Campo         | Tipo       | Observação |
| ------------- | ---------- | ---------- |
| `Id`          | `int`      | —          |
| `SprintId`    | `Guid`     | —          |
| `UserStoryId` | `int`      | —          |
| `Position`    | `int`      | —          |
| `Notes`       | `string`   | —          |
| `AddedAt`     | `DateTime` | —          |


---

## DTOs — Board

### `UpdateBoardDto`


| Campo         | Tipo        | Obrigatório | Observação           |
| ------------- | ----------- | ----------- | -------------------- |
| `Name`        | `string`    | **Sim**     | Validado na entidade |
| `Description` | `string?`   | Não         | —                    |
| `BoardType`   | `BoardType` | Não         | Default: `Kanban`    |


### `BoardResponseDto` (record)


| Campo         | Tipo        | Observação |
| ------------- | ----------- | ---------- |
| `Id`          | `Guid`      | —          |
| `ProjectId`   | `Guid`      | —          |
| `SprintId`    | `Guid`      | —          |
| `Name`        | `string`    | —          |
| `Description` | `string`    | —          |
| `BoardType`   | `BoardType` | —          |
| `CreatedAt`   | `DateTime`  | —          |
| `UpdatedAt`   | `DateTime`  | —          |


---

## DTOs — Board Columns

### `CreateBoardColumnDto`


| Campo          | Tipo      | Obrigatório | Observação                 |
| -------------- | --------- | ----------- | -------------------------- |
| `Name`         | `string`  | **Sim**     | Validado na entidade       |
| `Description`  | `string?` | Não         | —                          |
| `Position`     | `int?`    | Não         | Se null, adiciona no final |
| `WipLimit`     | `int?`    | Não         | —                          |
| `Color`        | `string?` | Não         | Formato `#RRGGBB`          |
| `IsDoneColumn` | `bool`    | Não         | Default: `false`           |


### `UpdateBoardColumnDto`


| Campo          | Tipo      | Obrigatório | Observação           |
| -------------- | --------- | ----------- | -------------------- |
| `Name`         | `string`  | **Sim**     | Validado na entidade |
| `Description`  | `string?` | Não         | —                    |
| `WipLimit`     | `int?`    | Não         | —                    |
| `Color`        | `string?` | Não         | Formato `#RRGGBB`    |
| `IsDoneColumn` | `bool`    | Não         | Default: `false`     |


### `BoardColumnResponseDto` (record)


| Campo          | Tipo       | Observação |
| -------------- | ---------- | ---------- |
| `Id`           | `int`      | —          |
| `BoardId`      | `Guid`     | —          |
| `Name`         | `string`   | —          |
| `Description`  | `string`   | —          |
| `Position`     | `int`      | —          |
| `WipLimit`     | `int?`     | —          |
| `Color`        | `string`   | —          |
| `IsDoneColumn` | `bool`     | —          |
| `CreatedAt`    | `DateTime` | —          |
| `UpdatedAt`    | `DateTime` | —          |


---

## DTOs — Board Cards

### `CreateBoardCardDto`


| Campo         | Tipo   | Obrigatório | Observação              |
| ------------- | ------ | ----------- | ----------------------- |
| `UserStoryId` | `int`  | **Sim**     | —                       |
| `Position`    | `int?` | Não         | Se null, entra no final |


### `UpdateBoardCardDto`


| Campo            | Tipo           | Obrigatório | Observação        |
| ---------------- | -------------- | ----------- | ----------------- |
| `Title`          | `string`       | **Sim**     | —                 |
| `Description`    | `string?`      | Não         | —                 |
| `AssigneeId`     | `Guid?`        | Não         | —                 |
| `Priority`       | `CardPriority` | Não         | Default: `Medium` |
| `DueDate`        | `DateTime?`    | Não         | —                 |
| `EstimatedHours` | `int?`         | Não         | —                 |
| `ActualHours`    | `int?`         | Não         | —                 |
| `Color`          | `string?`      | Não         | —                 |


### `BoardCardResponseDto` (record)


| Campo         | Tipo       | Observação |
| ------------- | ---------- | ---------- |
| `Id`          | `int`      | —          |
| `ColumnId`    | `int`      | —          |
| `UserStoryId` | `int`      | —          |
| `Position`    | `int`      | —          |
| `CreatedAt`   | `DateTime` | —          |
| `UpdatedAt`   | `DateTime` | —          |


### `MoveBoardCardDto`


| Campo        | Tipo   | Obrigatório | Observação              |
| ------------ | ------ | ----------- | ----------------------- |
| `ToColumnId` | `int`  | **Sim**     | —                       |
| `ToPosition` | `int?` | Não         | Se null, entra no final |


### `ReorderBoardCardDto`


| Campo        | Tipo  | Obrigatório | Observação            |
| ------------ | ----- | ----------- | --------------------- |
| `CardId`     | `int` | **Sim**     | Sobrescrito pela rota |
| `ToPosition` | `int` | **Sim**     | —                     |


---

## DTOs — Labels

### `CreateLabelDto`


| Campo   | Tipo     | Obrigatório | Observação                          |
| ------- | -------- | ----------- | ----------------------------------- |
| `Name`  | `string` | **Sim**     | Validado na entidade, máx 100 chars |
| `Color` | `string` | **Sim**     | Default: `"#95a5a6"`, formato HEX   |


### `UpdateLabelDto`


| Campo   | Tipo     | Obrigatório | Observação                          |
| ------- | -------- | ----------- | ----------------------------------- |
| `Name`  | `string` | **Sim**     | Validado na entidade, máx 100 chars |
| `Color` | `string` | **Sim**     | Default: `"#95a5a6"`, formato HEX   |


### `LabelResponseDto` (record)


| Campo       | Tipo       | Observação |
| ----------- | ---------- | ---------- |
| `Id`        | `int`      | —          |
| `ProjectId` | `Guid`     | —          |
| `Name`      | `string`   | —          |
| `Color`     | `string`   | —          |
| `CreatedAt` | `DateTime` | —          |
| `UpdatedAt` | `DateTime` | —          |


---

## DTOs — Card Labels

### `AddCardLabelDto`


| Campo     | Tipo  | Obrigatório | Observação |
| --------- | ----- | ----------- | ---------- |
| `LabelId` | `int` | **Sim**     | —          |


### `CardLabelResponseDto` (record)


| Campo       | Tipo       | Observação |
| ----------- | ---------- | ---------- |
| `Id`        | `int`      | —          |
| `CardId`    | `int`      | —          |
| `LabelId`   | `int`      | —          |
| `CreatedAt` | `DateTime` | —          |


---

## DTOs — Card Comments

### `CreateCardCommentDto`


| Campo             | Tipo     | Obrigatório | Observação               |
| ----------------- | -------- | ----------- | ------------------------ |
| `Content`         | `string` | **Sim**     | Validado na entidade     |
| `ParentCommentId` | `int?`   | Não         | Para respostas aninhadas |


### `UpdateCardCommentDto`


| Campo     | Tipo     | Obrigatório | Observação           |
| --------- | -------- | ----------- | -------------------- |
| `Content` | `string` | **Sim**     | Validado na entidade |


### `CardCommentResponseDto` (record)


| Campo             | Tipo       | Observação |
| ----------------- | ---------- | ---------- |
| `Id`              | `int`      | —          |
| `CardId`          | `int`      | —          |
| `UserId`          | `Guid`     | —          |
| `Content`         | `string`   | —          |
| `ParentCommentId` | `int?`     | —          |
| `CreatedAt`       | `DateTime` | —          |
| `UpdatedAt`       | `DateTime` | —          |


---

## DTOs — Card Attachments

### `CreateCardAttachmentDto`


| Campo        | Tipo      | Obrigatório | Observação                          |
| ------------ | --------- | ----------- | ----------------------------------- |
| `FileName`   | `string`  | **Sim**     | Validado na entidade, máx 255 chars |
| `FilePath`   | `string`  | **Sim**     | Validado na entidade, máx 500 chars |
| `FileSize`   | `int?`    | Não         | —                                   |
| `MimeType`   | `string?` | Não         | Máx 100 chars                       |
| `UploadedBy` | `Guid`    | **Sim**     | Vindo do token em produção          |


### `CardAttachmentResponseDto` (record)


| Campo        | Tipo       | Observação |
| ------------ | ---------- | ---------- |
| `Id`         | `int`      | —          |
| `CardId`     | `int`      | —          |
| `FileName`   | `string`   | —          |
| `FilePath`   | `string`   | —          |
| `FileSize`   | `int?`     | —          |
| `MimeType`   | `string`   | —          |
| `UploadedBy` | `Guid`     | —          |
| `CreatedAt`  | `DateTime` | —          |


---

## DTOs — Card Activities

### `CreateCardActivityDto`


| Campo          | Tipo               | Obrigatório | Observação           |
| -------------- | ------------------ | ----------- | -------------------- |
| `UserId`       | `Guid`             | **Sim**     | Validado na entidade |
| `ActivityType` | `CardActivityType` | **Sim**     | Enum                 |
| `OldValue`     | `string?`          | Não         | JSON (jsonb)         |
| `NewValue`     | `string?`          | Não         | JSON (jsonb)         |
| `Description`  | `string?`          | Não         | —                    |


### `CardActivityResponseDto` (record)


| Campo          | Tipo               | Observação |
| -------------- | ------------------ | ---------- |
| `Id`           | `int`              | —          |
| `CardId`       | `int`              | —          |
| `UserId`       | `Guid`             | —          |
| `ActivityType` | `CardActivityType` | —          |
| `OldValue`     | `string`           | —          |
| `NewValue`     | `string`           | —          |
| `Description`  | `string`           | —          |
| `CreatedAt`    | `DateTime`         | —          |


---

## DTOs — Tasks

### `CreateStoryTaskDto`


| Campo            | Tipo      | Obrigatório | Observação           |
| ---------------- | --------- | ----------- | -------------------- |
| `Title`          | `string`  | **Sim**     | Validado na entidade |
| `Description`    | `string?` | Não         | —                    |
| `AssigneeId`     | `Guid?`   | Não         | —                    |
| `EstimatedHours` | `int?`    | Não         | Deve ser >= 0        |
| `Priority`       | `int`     | Não         | Default: `0`         |


### `UpdateStoryTaskDto`


| Campo            | Tipo              | Obrigatório | Observação           |
| ---------------- | ----------------- | ----------- | -------------------- |
| `Title`          | `string`          | **Sim**     | Validado na entidade |
| `Description`    | `string?`         | Não         | —                    |
| `AssigneeId`     | `Guid?`           | Não         | —                    |
| `EstimatedHours` | `int?`            | Não         | Deve ser >= 0        |
| `ActualHours`    | `int?`            | Não         | Deve ser >= 0        |
| `Priority`       | `int`             | Não         | Default: `0`         |
| `Status`         | `StoryTaskStatus` | Não         | Default: `Todo`      |


### `StoryTaskResponseDto` (record)


| Campo            | Tipo       | Observação |
| ---------------- | ---------- | ---------- |
| `Id`             | `int`      | —          |
| `UserStoryId`    | `int`      | —          |
| `Position`       | `int`      | —          |
| `Title`          | `string`   | —          |
| `Description`    | `string`   | —          |
| `AssigneeId`     | `Guid?`    | —          |
| `EstimatedHours` | `int?`     | —          |
| `ActualHours`    | `int?`     | —          |
| `Priority`       | `int`      | —          |
| `CreatedAt`      | `DateTime` | —          |
| `UpdatedAt`      | `DateTime` | —          |


### `ReorderStoryTaskDto`


| Campo        | Tipo  | Obrigatório | Observação |
| ------------ | ----- | ----------- | ---------- |
| `TaskId`     | `int` | **Sim**     | —          |
| `ToPosition` | `int` | **Sim**     | 0-based    |


### `MoveStoryTaskDto`


| Campo            | Tipo  | Obrigatório | Observação            |
| ---------------- | ----- | ----------- | --------------------- |
| `TaskId`         | `int` | **Sim**     | —                     |
| `ToSprintItemId` | `int` | **Sim**     | SprintItem de destino |
| `ToPosition`     | `int` | **Sim**     | 0-based               |


