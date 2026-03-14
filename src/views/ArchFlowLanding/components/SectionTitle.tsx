import { Sparkles } from "lucide-react";

import Icon from "./Icon";
import { cx } from "@/lib/utils/cx";
import type { SectionTitleProps } from "../utils/types";

export default function SectionTitle({
  eyebrow,
  title,
  desc,
  align = "left",
  icon: IconComp = Sparkles,
}: SectionTitleProps) {
  return (
    <div className={cx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <div
          className={cx(
            "mb-3 inline-flex items-center gap-2",
            align === "center" && "justify-center",
          )}
        >
          <span className="group inline-flex items-center">
            <Icon
              as={IconComp}
              className="h-4 w-4 group-hover:text-[var(--af-pin)]"
            />
          </span>
          <p className="text-sm font-medium tracking-wide text-white/70">
            {eyebrow}
          </p>
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 text-base leading-relaxed text-white/70">{desc}</p>
      )}
    </div>
  );
}
