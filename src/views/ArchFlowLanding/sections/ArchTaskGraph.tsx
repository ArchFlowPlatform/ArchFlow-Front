"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Card from "../components/Card";
import Divider from "../components/Divider";
import SectionTitle from "../components/SectionTitle";

interface FlowNode {
  label: string;
  x: number;
}

interface FlowLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export default function ArchTaskGraph() {
  const ref = useRef<HTMLElement | null>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const nodes = useMemo<FlowNode[]>(
    () => [
      { label: "ADR", x: 60 },
      { label: "Diagrama C4", x: 180 },
      { label: "User Story", x: 300 },
      { label: "Migration", x: 420 },
      { label: "Card", x: 540 },
      { label: "Deploy", x: 660 },
    ],
    [],
  );

  const lines = useMemo<FlowLine[]>(
    () => [
      { x1: 88, y1: 70, x2: 152, y2: 70, delay: 0 },
      { x1: 208, y1: 70, x2: 272, y2: 70, delay: 600 },
      { x1: 328, y1: 70, x2: 392, y2: 70, delay: 1200 },
      { x1: 448, y1: 70, x2: 512, y2: 70, delay: 1800 },
      { x1: 568, y1: 70, x2: 632, y2: 70, delay: 2400 },
    ],
    [],
  );

  const afterLinesMs = 600 * lines.length + 200;

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-4" id="workflow">
      <SectionTitle
        eyebrow="Fluxo visual"
        title="De uma decisão ao deploy — conectados."
      />

      <div className="mt-8">
        <Card className="p-6">
          <div className="flex justify-center">
            <svg
              viewBox="0 0 720 140"
              className="w-full max-w-4xl"
              role="img"
              aria-label="ADR to Deploy flow graph"
              preserveAspectRatio="xMidYMid meet"
            >
              {lines.map((line, index) => (
                <line
                  key={index}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="var(--af-line)"
                  opacity="0.3"
                  strokeWidth="1.5"
                  strokeDasharray="120"
                  strokeDashoffset="120"
                  style={{
                    animation: start ? "drawLine 600ms ease forwards" : "none",
                    animationDelay: start ? `${line.delay}ms` : "0ms",
                  }}
                />
              ))}

              {nodes.map((node, index) => (
                <g
                  key={node.label}
                  className="cursor-pointer"
                  style={{
                    transformOrigin: `${node.x}px 70px`,
                    animation: start
                      ? "nodePulse 2000ms ease-in-out infinite"
                      : "none",
                    animationDelay: start
                      ? `${afterLinesMs + index * 180}ms`
                      : "0ms",
                  }}
                >
                  <circle
                    cx={node.x}
                    cy={70}
                    r={28}
                    fill="#0a0a0a"
                    stroke="var(--af-line)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={node.x}
                    y={74}
                    textAnchor="middle"
                    fontSize="8"
                    fill="rgba(255,255,255,0.75)"
                    style={{ userSelect: "none" }}
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <p className="text-xs text-white/50 text-center mt-4">
            Cada nó é rastreável: clique para ver ADR, diagrama, migration e PR
            vinculados.
          </p>
        </Card>
      </div>

      <Divider />
    </section>
  );
}
