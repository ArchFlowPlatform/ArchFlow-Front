import { Database, KanbanSquare, Layers, Search, Target } from "lucide-react";

import type { Pillar } from "../utils/types";

export const pillars: Pillar[] = [
  {
    title: "Architecture-First Project Management",
    icon: Layers,
    bullets: [
      "ADRs integrados (workflow: Proposed → Accepted → Deprecated → Superseded)",
      "C4 Model nativo (Context/Container/Component/Code) com versionamento",
      "Event Storming digital vinculado a stories",
    ],
  },
  {
    title: "Database Schema como cidadão de primeira classe",
    icon: Database,
    bullets: [
      "ERD visual → SQL otimizado (Postgres/MySQL/SQL Server)",
      "Geração de Migrations (ex.: .NET EF Core) e Entities",
      "Diff de schema entre versões (v1 → v2) com rastreio",
    ],
  },
  {
    title: "Agilidade que entende arquitetura",
    icon: KanbanSquare,
    bullets: [
      "Scrumban: fluidez do Kanban + cadência do Scrum",
      "WIP e métricas mais inteligentes (ex.: esforço, fluxo, throughput)",
      "Board com contexto técnico no card (ADR/Diagrama/Schema)",
    ],
  },
  {
    title: "Rastreabilidade real (não só links)",
    icon: Target,
    bullets: [
      "Story ↔ ADR ↔ Diagrama ↔ Migration ↔ Commit/PR ↔ Deploy",
      "Snapshot por sprint: estado do sistema e evolução do design",
      "Onboarding mais rápido: contexto disponível em 1 clique",
    ],
  },
  {
    title: "Plataforma que dev quer usar",
    icon: Search,
    bullets: [
      "Menos burocracia, mais sinal: UI rápida e direta",
      "Busca semântica de decisões e mudanças",
      "Fonte única da verdade: menos drift, menos context switching",
    ],
  },
];
