import type { ChildrenProps } from "../types/landing.types";

export default function Accent({ children }: ChildrenProps) {
  return (
    <span className="text-white">
      <span className="text-white/90 hover:text-[var(--af-primary)] transition">
        {children}
      </span>
    </span>
  );
}
