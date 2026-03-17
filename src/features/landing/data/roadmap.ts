import { Cpu, Layers, Sparkles } from "lucide-react";

import type { RoadmapPhase } from "../types/landing.types";

export const roadmap: RoadmapPhase[] = [
  {
    phase: "MVP",
    icon: Sparkles,
    items: [
      "ADRs + workflow",
      "C4 (Context/Container) + versionamento",
      "Kanban/Scrumban + rastreabilidade básica",
      "ERD + geração inicial de migrations",
    ],
  },
  {
    phase: "V1",
    icon: Cpu,
    items: [
      "C4 completo (Component/Code) + diffs visuais",
      "Event Storming avançado",
      "Diff de schema e governança",
      "Integrações (Git, CI/CD) e automações",
    ],
  },
  {
    phase: "V2",
    icon: Layers,
    items: [
      "Assistentes de IA (sugestões e validações)",
      "Insights de arquitetura e impacto",
      "Auditoria e compliance por trilha de mudanças",
      "Marketplace de templates e extensões",
    ],
  },
];
