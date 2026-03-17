# ArchFlow

## Visão Geral

Este repositório contém a aplicação **ArchFlow** – frontend de gerenciamento de projetos orientado a arquitetura (architecture-driven project management).

A aplicação utiliza **Next.js 15** com App Router e estrutura **feature-first**, preparada para integração com API backend.

### Tecnologias

* **Next.js 15** (App Router)
* **React 19**
* **Tailwind CSS**
* **Recharts**
* **Axios** (camada de serviços)
* **Zod** (validação)
* **shadcn/ui** (componentes base)

### Estrutura do Projeto

A estrutura segue arquitetura **feature-first** e **Next.js App Router**. As rotas ficam em `app/` e importam componentes de página das features; a camada `views/` foi removida. Detalhes em [`docs/REFACTOR-REMOVE-VIEWS-COMPLETION.md`](docs/REFACTOR-REMOVE-VIEWS-COMPLETION.md).

```
src/
├── app/                  # Next.js App Router (/, /signin, /projects, /projects/[id]/backlog|kanban|sprint…)
├── components/           # UI compartilhada (auth, backlog, kanban, layout, projects, sprint, ui)
├── features/             # Lógica por feature
│   ├── auth/             # Login, cadastro (components, api, context, types)
│   ├── landing/          # Landing (components, data, sections, hero-panel, types)
│   └── projects/         # Projetos: pages (hub, backlog, kanban, sprint-backlog, sprint) + mocks
├── contexts/             # Contextos React (ex.: ProjectSprintContext)
├── hooks/                # Hooks reutilizáveis
├── lib/                  # Utilitários, http-client, schemas
├── mocks/                # Dados mock compartilhados (backend, users)
├── services/             # Camada de API (Axios)
└── types/                # Tipos TypeScript compartilhados
```

### Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

---

## Objetivo

O ArchFlow é a aplicação de gestão de projetos que combina:

* Navegação entre projetos e times
* Product Backlog (epics e user stories)
* Sprint Backlog e planejamento de sprint
* Quadro Kanban
* Visão de Sprint com burndown e métricas
* Estados de tela (vazio, carregamento, etc.)

Parte das funcionalidades utiliza **dados mockados** enquanto a integração com a API backend avança; a estrutura (services, features, tipos) está preparada para consumo real da API.

---

## Funcionalidades

* **Landing** – página inicial e apresentação do produto
* **Autenticação** – sign in e sign up (fluxos preparados para API)
* **Projetos** – hub de projetos, backlog do produto, kanban, sprint backlog e tela de sprint com gráfico de burndown e painel de tarefas

---

## Próximos passos

* Integração completa com **API backend**
* Substituição progressiva de mocks por dados reais via serviços (Axios)
* Autenticação e sessão vinculadas à API

---

## Resumo

Este repositório é o **frontend da aplicação ArchFlow**: aplicação real em **Next.js 15**, com arquitetura feature-first e App Router, em evolução para integração total com a API backend.
