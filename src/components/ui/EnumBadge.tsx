"use client";

import { type EnumOption, getBadgeFor } from "@/lib/enum-labels";

interface EnumBadgeProps<V extends string = string> {
  options: readonly EnumOption<V>[];
  value: string | null | undefined;
  /** Extra Tailwind classes appended to the badge. */
  className?: string;
}

const baseCls =
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium leading-tight";

export default function EnumBadge<V extends string>({
  options,
  value,
  className = "",
}: EnumBadgeProps<V>) {
  const { label, cls } = getBadgeFor(options, value);

  return (
    <span className={`${baseCls} ${cls} ${className}`.trim()}>
      {label}
    </span>
  );
}
