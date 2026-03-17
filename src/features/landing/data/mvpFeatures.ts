import {
  BookText,
  Boxes,
  Code2,
  KanbanSquare,
  ShieldCheck,
  Workflow as WorkflowIcon,
} from "lucide-react";

import type { MVPFeature } from "../types/landing.types";

export const mvpFeatures: MVPFeature[] = [
  {
    title: "ADRs integrados",
    icon: BookText,
    desc: "Templates e workflow para decisões. Versionamento e timeline por projeto/epic.",
  },
  {
    title: "C4 Diagrams nativos",
    icon: Boxes,
    desc: "Editor por nível, versionamento por sprint e export (PNG/SVG/Mermaid).",
  },
  {
    title: "Event Storming",
    icon: WorkflowIcon,
    desc: "Board colaborativo para eventos/agregados/bounded contexts, ligados a stories.",
  },
  {
    title: "ERD visual + geração de código",
    icon: Code2,
    desc: "Modelagem de tabelas/relacionamentos com geração de SQL, migrations e entities.",
  },
  {
    title: "Scrumban Board",
    icon: KanbanSquare,
    desc: "Cards com contexto técnico, WIP e métricas de fluxo.",
  },
  {
    title: "Rastreabilidade fim-a-fim",
    icon: ShieldCheck,
    desc: "Do ADR ao deploy/incidente: tudo vinculado e auditável.",
  },
];
