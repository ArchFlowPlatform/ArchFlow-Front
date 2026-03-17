"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Card from "../components/Card";
import PanelScreen from "./PanelScreen";
import ScreenADR from "./ScreenADR";
import ScreenC4 from "./ScreenC4";
import ScreenERD from "./ScreenERD";
import ScreenKanban from "./ScreenKanban";
import { cx } from "@/lib/utils/cx";
import type { HeroPanelScreen } from "../types/landing.types";

export default function HeroAnimatedPanel() {
  const screens = useMemo<HeroPanelScreen[]>(
    () => [
      { key: "adr", title: "ADR — decisão versionada" },
      { key: "c4", title: "C4 — containers conectados" },
      { key: "erd", title: "ERD — schema rastreável" },
      { key: "kb", title: "Kanban — execução com contexto" },
    ],
    [],
  );

  const transitionMs = 500;
  const screenDurationMs = 7500;
  const autoplayIntervalMs = screenDurationMs + transitionMs;

  const [idx, setIdx] = useState(0);
  const pauseUntilRef = useRef(0);

  const [runs, setRuns] = useState<number[]>([0, 0, 0, 0]);
  const lastIdxRef = useRef(-1);

  useEffect(() => {
    if (lastIdxRef.current === idx) return;
    lastIdxRef.current = idx;

    setRuns((prev) => {
      const next = [...prev];
      next[idx] = (next[idx] ?? 0) + 1;
      return next;
    });
  }, [idx]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (now < pauseUntilRef.current) return;
      setIdx((value) => (value + 1) % screens.length);
    }, autoplayIntervalMs);

    return () => clearInterval(timer);
  }, [screens.length, autoplayIntervalMs]);

  const goTo = (screenIndex: number) => {
    setIdx(screenIndex);
    pauseUntilRef.current = Date.now() + autoplayIntervalMs * 2;
  };

  return (
    <Card className={cx("p-0 overflow-hidden h-[420px]", "bg-[#0a0a0a]")}>
      <div className="af-separator-b h-12 flex items-center justify-between px-4">
        <div className="relative h-5 w-full">
          {screens.map((screen, screenIndex) => {
            const isActive = screenIndex === idx;
            return (
              <div
                key={screen.key}
                className={cx(
                  "absolute inset-0 flex items-center transition-all",
                  isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3 pointer-events-none",
                )}
                style={{
                  transitionDuration: `${transitionMs}ms`,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <span className="text-sm font-semibold">{screen.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative h-[calc(420px-48px)]">
        <PanelScreen active={idx === 0}>
          <ScreenADR key={`adr-${runs[0]}`} active={idx === 0} />
        </PanelScreen>

        <PanelScreen active={idx === 1}>
          <ScreenC4 key={`c4-${runs[1]}`} active={idx === 1} />
        </PanelScreen>

        <PanelScreen active={idx === 2}>
          <ScreenERD key={`erd-${runs[2]}`} active={idx === 2} />
        </PanelScreen>

        <PanelScreen active={idx === 3}>
          <ScreenKanban key={`kb-${runs[3]}`} active={idx === 3} />
        </PanelScreen>

        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {screens.map((screen, screenIndex) => {
            const isActive = screenIndex === idx;
            return (
              <button
                key={screen.key}
                type="button"
                onClick={() => goTo(screenIndex)}
                aria-label={`Go to ${screen.key}`}
                className={cx(
                  "af-focus-ring transition-all duration-300 rounded-full",
                  isActive
                    ? "bg-[var(--af-pin)] w-4 h-1.5"
                    : "bg-white/20 w-1.5 h-1.5",
                )}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
