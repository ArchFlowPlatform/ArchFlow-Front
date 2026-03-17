import { CheckCircle2 } from "lucide-react";

import Icon from "./Icon";
import type { ChildrenProps } from "../types/landing.types";

export default function CheckRow({ children }: ChildrenProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
        <Icon as={CheckCircle2} className="h-5 w-5 hover:text-[var(--af-pin)]" />
      </span>
      <p className="text-sm text-white/75">{children}</p>
    </div>
  );
}
