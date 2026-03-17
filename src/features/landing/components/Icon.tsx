import { cx } from "@/lib/utils/cx";
import type { IconComponentProps } from "../types/landing.types";

export default function Icon({ as: As, className }: IconComponentProps) {
  return (
    <As
      className={cx("h-4 w-4 text-white/80 transition", className)}
      aria-hidden="true"
    />
  );
}
