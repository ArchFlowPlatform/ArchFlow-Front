import { cx } from "@/lib/utils/cx";
import type { PanelScreenProps } from "../utils/types";

export default function PanelScreen({ active, children }: PanelScreenProps) {
  return (
    <div
      className={cx(
        "absolute inset-0 p-4 flex flex-col transition-all duration-500",
        active
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
      style={{ transform: active ? "translateY(0px)" : "translateY(12px)" }}
    >
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
}
