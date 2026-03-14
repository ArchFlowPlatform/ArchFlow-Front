import type { CSSProperties } from "react";

import { cx } from "@/lib/utils/cx";
import type { CardProps } from "../utils/types";

const cardStyle: CSSProperties & Record<"--af-surface-shadow", string> = {
  "--af-surface-shadow": "0 24px 70px rgba(0,0,0,.55)",
};

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cx(
        "relative af-surface-lg bg-[#14121a] backdrop-blur-md",
        className,
      )}
      style={cardStyle}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
