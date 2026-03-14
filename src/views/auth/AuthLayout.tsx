import type { CSSProperties, ReactNode } from "react";

const authLayoutStyle: CSSProperties = {
  fontFamily:
    'Satoshi, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, monospace',
};

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-[var(--site-bg,#16171d)] px-4 py-4 text-white sm:px-6 sm:py-6 md:py-10"
      style={authLayoutStyle}
    >
      <main className="flex w-full items-center justify-center">
        <div className="w-full max-w-[40rem] max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
