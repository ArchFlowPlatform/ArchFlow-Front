import type { CSSProperties, ReactNode } from "react";

import { cx } from "@/lib/utils/cx";

const cardStyle: CSSProperties & Record<"--af-surface-shadow", string> = {
  "--af-surface-shadow": "0 24px 70px rgba(0,0,0,.55)",
};

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  bodyClassName?: string;
}

export default function AuthCard({
  children,
  title,
  subtitle,
  className,
  bodyClassName,
}: AuthCardProps) {
  return (
    <section
      className={cx(
        "relative af-surface-lg overflow-hidden bg-[#14121a] backdrop-blur-md",
        className,
      )}
      style={cardStyle}
    >
      <header className="af-separator-b px-5 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
        <h1 className="text-[1.65rem] leading-tight tracking-tight text-white sm:text-[1.9rem]">
          {title}
        </h1>
        {subtitle ? (
          <p className="af-text-secondary mt-1.5 text-sm leading-relaxed sm:mt-2">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div
        className={cx(
          "px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
