import { Boxes, Cpu, Database, GitBranch, Layers, Sparkles } from "lucide-react";

import type { StackItem } from "../utils/types";

export const stack: StackItem[] = [
  { name: "Vite + React", icon: Sparkles },
  { name: "Tailwind CSS", icon: Layers },
  { name: ".NET (API) / Node (opcional)", icon: Cpu },
  { name: "PostgreSQL", icon: Database },
  { name: "Docker", icon: Boxes },
  { name: "CI/CD", icon: GitBranch },
];
