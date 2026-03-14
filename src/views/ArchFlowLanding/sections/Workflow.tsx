"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookText, Target, Workflow as WorkflowIcon } from "lucide-react";

import Badge from "../components/Badge";
import Card from "../components/Card";
import CodeBlock from "../components/CodeBlock";
import Divider from "../components/Divider";
import Icon from "../components/Icon";
import SectionTitle from "../components/SectionTitle";
import { steps } from "../data/steps";
import type { TraceLine } from "../utils/types";

export default function Workflow() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const traceLines = useMemo<TraceLine[]>(
    () => [
      { text: "Decisão (ADR)", kind: "normal" },
      { text: "  ↓", kind: "normal" },
      { text: "Diagrama (C4 / Event Storming)", kind: "normal" },
      { text: "  ↓", kind: "normal" },
      { text: "User Story", kind: "normal" },
      { text: "  ↓", kind: "normal" },
      { text: "Database Schema (ERD/Migration)", kind: "normal" },
      { text: "  ↓", kind: "normal" },
      { text: "Card (Scrumban / Sprint)", kind: "normal" },
      { text: "  ↓", kind: "normal" },
      { text: "Commit → PR → Deploy → Incident", kind: "normal" },
      { text: "  ↑____________________________________|", kind: "normal" },
      { text: "           rastreável + versionado", kind: "accent" },
    ],
    [],
  );

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    setVisibleCount(0);

    const interval = setInterval(() => {
      index += 1;
      setVisibleCount(index);
      if (index >= traceLines.length) clearInterval(interval);
    }, 400);

    return () => clearInterval(interval);
  }, [started, traceLines.length]);

  return (
    <section ref={sectionRef} className="mx-auto max-w-6xl px-4 py-4">
      <SectionTitle
        icon={WorkflowIcon}
        eyebrow="Fluxo de trabalho"
        title="Como funciona na prática"
        desc="Do ADR ao card: cada etapa mantém o contexto técnico e reduz retrabalho."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          {steps.map((step) => (
            <Card key={step.k} className="af-surface-hover p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <span className="af-surface-sm af-surface-hover inline-flex h-10 w-10 items-center justify-center bg-white/5 text-sm font-semibold text-white/80 hover:text-[var(--af-primary)] transition">
                    {step.k}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">
                      {step.title}
                    </h3>
                    <span className="inline-flex items-center">
                      <Icon
                        as={step.icon}
                        className="h-5 w-5 hover:text-[var(--af-pin)]"
                      />
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-white/70 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="af-surface-hover p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Traceability graph (exemplo)
              </p>
              <p className="mt-1 text-sm text-white/70">
                Um “mapa” simples do fluxo que o ArchFlow torna navegável.
              </p>
            </div>
            <Badge tone="accent">One-click context</Badge>
          </div>

          <div className="mt-5">
            <CodeBlock>
              {traceLines.map((line, index) => {
                const isVisible = index < visibleCount;
                const isAccent = line.kind === "accent";

                return (
                  <div
                    key={index}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateY(0px)"
                        : "translateY(8px)",
                      transition: "opacity 0.35s ease, transform 0.35s ease",
                      color: isAccent ? "var(--af-primary)" : undefined,
                      animation:
                        isAccent && isVisible
                          ? "afPulse 2s ease-in-out infinite"
                          : "none",
                      whiteSpace: "pre",
                    }}
                  >
                    {line.text}
                  </div>
                );
              })}
            </CodeBlock>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="af-surface-md af-surface-hover bg-white/4 p-4 transition">
              <div className="flex items-start gap-3">
                <Icon
                  as={Target}
                  className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                />
                <div>
                  <p className="text-xs font-semibold text-white/80">
                    Benefício
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Menos “por que isso existe?” no time.
                  </p>
                </div>
              </div>
            </div>
            <div className="af-surface-md af-surface-hover bg-white/4 p-4 transition">
              <div className="flex items-start gap-3">
                <Icon
                  as={BookText}
                  className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                />
                <div>
                  <p className="text-xs font-semibold text-white/80">
                    Benefício
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Menos documentação obsoleta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Divider />
    </section>
  );
}
