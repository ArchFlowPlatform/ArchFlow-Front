"use client";

import { useEffect, useState } from "react";

import { cx } from "@/lib/utils/cx";
import type { ChildrenProps, ScreenProps } from "../utils/types";

interface FieldProps {
  label: string;
  value: string;
  visible: boolean;
}

interface RevealBlockProps extends ChildrenProps {
  show: boolean;
}

interface TinyListProps {
  title: string;
  items: string[];
}

function Field({ label, value, visible }: FieldProps) {
  return (
    <div
      className={cx(
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      )}
      style={{ color: "rgba(255,255,255,0.85)" }}
    >
      <div className="flex gap-2 font-mono text-xs">
        <span style={{ color: "rgba(255,255,255,0.50)" }}>{label}:</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function RevealBlock({ show, children }: RevealBlockProps) {
  return (
    <div
      className={cx(
        "transition-all duration-500",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      )}
    >
      {children}
    </div>
  );
}

function TinyList({ title, items }: TinyListProps) {
  return (
    <div className="af-surface-md bg-white/5 p-3">
      <p className="text-[10px] font-semibold text-white/70">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-[10px] text-white/50 leading-snug">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScreenADR({ active }: ScreenProps) {
  const fullTitle = "Usar CQRS para separar leitura/escrita";
  const [typed, setTyped] = useState("");
  const [titleDone, setTitleDone] = useState(false);

  const [showCtx, setShowCtx] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [statusAccepted, setStatusAccepted] = useState(false);

  const [showMore, setShowMore] = useState(false);
  const [showDeep, setShowDeep] = useState(false);

  useEffect(() => {
    if (!active) {
      setTyped("");
      setTitleDone(false);
      setShowCtx(false);
      setShowDecision(false);
      setShowStatus(false);
      setStatusAccepted(false);
      setShowMore(false);
      setShowDeep(false);
      return;
    }

    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    intervalId = setInterval(() => {
      i += 1;
      setTyped(fullTitle.slice(0, i));
      if (i >= fullTitle.length && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        setTitleDone(true);
      }
    }, 50);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [active]);

  useEffect(() => {
    if (!active || !titleDone) return;

    const t1 = setTimeout(() => setShowCtx(true), 800);
    const t2 = setTimeout(() => setShowDecision(true), 1400);
    const t3 = setTimeout(() => setShowStatus(true), 2000);
    const t4 = setTimeout(() => setStatusAccepted(true), 2400);
    const t5 = setTimeout(() => setShowMore(true), 2800);
    const t6 = setTimeout(() => setShowDeep(true), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [active, titleDone]);

  return (
    <div className="h-full min-h-0">
      <div className="af-surface-lg h-full min-h-0 bg-black/40 overflow-hidden flex flex-col">
        <div className="af-separator-b flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="af-surface-sm inline-flex items-center bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-white/80">
              ADR #5
            </span>

            <span className="af-surface-sm inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 text-[10px] font-semibold">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "#4ade80" }}
              />
              <span style={{ color: "rgba(255,255,255,0.85)" }}>Accepted</span>
            </span>

            <span className="af-surface-sm hidden sm:inline-flex items-center bg-white/5 px-2.5 py-1 text-[10px] text-white/60">
              Impact: Medium
            </span>
          </div>

          <span className="text-[10px] text-white/40">v1.0 • 2025-01-15</span>
        </div>

        <div className="px-4 py-4 flex-1 min-h-0 flex flex-col">
          <div
            className="text-sm font-semibold min-h-[22px]"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {typed}
            <span
              className={cx(
                "ml-0.5 inline-block w-[1px] h-[14px] align-middle",
                titleDone ? "opacity-0" : "opacity-100",
              )}
              style={{
                background: "var(--af-pin)",
                animation: titleDone
                  ? "none"
                  : "afCursorBlink 700ms linear infinite",
              }}
            />
          </div>

          <div className="mt-4 space-y-3">
            <Field
              label="Problema"
              value="Leitura saturando API e banco em picos"
              visible={showCtx}
            />
            <Field
              label="Contexto"
              value="Sistema com alta carga de leitura (orders)"
              visible={showCtx}
            />
            <Field
              label="Decisão"
              value="Event Sourcing + CQRS (read model separado)"
              visible={showDecision}
            />

            <div
              className={cx(
                "transition-all duration-500",
                showStatus
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3",
              )}
            >
              <div className="flex items-center gap-2 font-mono text-xs">
                <span style={{ color: "rgba(255,255,255,0.50)" }}>Status:</span>
                <div className="relative h-5 w-24">
                  <span
                    className={cx(
                      "af-surface-sm absolute inset-0 inline-flex items-center justify-center px-2 text-[10px] bg-white/5 transition-opacity duration-500",
                      statusAccepted ? "opacity-0" : "opacity-100",
                    )}
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    Proposed
                  </span>
                  <span
                    className={cx(
                      "af-surface-sm absolute inset-0 inline-flex items-center justify-center px-2 text-[10px] bg-white/5 transition-opacity duration-500",
                      statusAccepted ? "opacity-100" : "opacity-0",
                    )}
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    Accepted
                  </span>
                </div>
              </div>
            </div>

            <RevealBlock show={showMore}>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <TinyList
                  title="Alternativas"
                  items={[
                    "Cache agressivo (Redis) + invalidation",
                    "Read replicas + tuning",
                    "CQRS sem Event Sourcing",
                  ]}
                />
                <TinyList
                  title="Trade-offs"
                  items={[
                    "Mais componentes para operar",
                    "Consistência eventual em leitura",
                    "Mais complexidade de debug",
                  ]}
                />
                <TinyList
                  title="Impacto"
                  items={[
                    "API Gateway: rotas read/write",
                    "Order Service: handlers/consumers",
                    "Read Model: projeções",
                  ]}
                />
                <TinyList
                  title="Observabilidade"
                  items={[
                    "Tracing por correlation-id",
                    "Lag da projeção (SLO)",
                    "Alertas de falha de consumer",
                  ]}
                />
              </div>
            </RevealBlock>

            <RevealBlock show={showDeep}>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="af-surface-md bg-white/5 p-3">
                  <p className="text-[10px] font-semibold text-white/70">
                    Plano de rollout
                  </p>
                  <p className="mt-1 text-[10px] text-white/50 leading-snug">
                    1) Read model em paralelo · 2) Shadow traffic · 3) Cutover
                    por feature flag
                  </p>
                </div>
                <div className="af-surface-md bg-white/5 p-3">
                  <p className="text-[10px] font-semibold text-white/70">
                    Critérios de aceite
                  </p>
                  <p className="mt-1 text-[10px] text-white/50 leading-snug">
                    p95 read &lt; 120ms · erro &lt; 0.5% · lag &lt; 5s
                  </p>
                </div>
                <div className="af-surface-md bg-white/5 p-3">
                  <p className="text-[10px] font-semibold text-white/70">
                    Riscos
                  </p>
                  <p className="mt-1 text-[10px] text-white/50 leading-snug">
                    Projeção inconsistente · reprocessamento · duplicidade de
                    eventos
                  </p>
                </div>
                <div className="af-surface-md bg-white/5 p-3">
                  <p className="text-[10px] font-semibold text-white/70">
                    Links
                  </p>
                  <p className="mt-1 text-[10px] text-white/50 leading-snug">
                    Story • PR • Migration • Runbook
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {["CQRS", "Event Sourcing", "Orders", "Read Model"].map((tag) => (
                  <span
                    key={tag}
                    className="af-surface-sm inline-flex items-center bg-[var(--af-pin)]/20 px-2 py-0.5 text-[9px] font-semibold text-[var(--af-pin)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </RevealBlock>
          </div>

          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
