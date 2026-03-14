import { BookText, Boxes, Database, GitBranch } from "lucide-react";

import type { WorkflowStep } from "../utils/types";

export const steps: WorkflowStep[] = [
  {
    k: "01",
    title: "Decisão arquitetural (ADR) vira contexto real",
    desc: "ADRs como entidades do produto: versionadas, buscáveis e vinculáveis à execução.",
    icon: BookText,
  },
  {
    k: "02",
    title: "Diagramas nativos (C4 / Event Storming) conectados ao trabalho",
    desc: "Arquitetura deixa de ser link perdido — passa a ser parte do fluxo.",
    icon: Boxes,
  },
  {
    k: "03",
    title: "Stories com rastreabilidade fim-a-fim",
    desc: "Da decisão ao deploy: Story ↔ Schema ↔ Commit/PR ↔ Incidente.",
    icon: GitBranch,
  },
  {
    k: "04",
    title: "Schema e migrations no mesmo lugar",
    desc: "ERD visual + geração de migrations/entities; reduz drift e retrabalho.",
    icon: Database,
  },
];
