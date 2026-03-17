import { Sparkles } from "lucide-react";

import Icon from "./Icon";
import type { LogoPillProps } from "../types/landing.types";

export default function LogoPill({
  children,
  icon: IconComp = Sparkles,
}: LogoPillProps) {
  return (
    <div className="group af-surface-sm af-surface-hover inline-flex items-center gap-2 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white transition">
      <Icon as={IconComp} className="h-4 w-4 group-hover:text-[var(--af-pin)]" />
      {children}
    </div>
  );
}
