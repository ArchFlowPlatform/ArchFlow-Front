"use client";

import { useEffect, useRef, useState } from "react";

import type { ScreenProps } from "../utils/types";

type TableId = "users" | "orders" | "items";

interface ERDTable {
  id: TableId;
  x: number;
  y: number;
  name: string;
  delay: number;
  fields: string[];
}

interface TableProps {
  table: ERDTable;
  active: boolean;
  visibleFields: Record<TableId, number>;
}

interface RelationshipProps {
  active: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

function Table({ table, active, visibleFields }: TableProps) {
  const count = visibleFields[table.id] ?? 0;

  return (
    <g
      style={{
        opacity: 0,
        transform: "translateY(12px)",
        transformOrigin: `${table.x + 70}px ${table.y + 55}px`,
        animation: active ? "erdIn 500ms ease forwards" : "none",
        animationDelay: active ? `${table.delay}ms` : "0ms",
      }}
    >
      <rect
        x={table.x}
        y={table.y}
        width="140"
        height="92"
        fill="#0a0a0a"
        stroke="rgba(255,255,255,0.10)"
      />
      <rect
        x={table.x}
        y={table.y}
        width="140"
        height="24"
        fill="#0a0a0a"
        stroke="var(--af-line)"
        strokeWidth="1.2"
      />
      <text
        x={table.x + 10}
        y={table.y + 16}
        fontSize="9"
        fontWeight="700"
        fill="rgba(255,255,255,0.85)"
      >
        {table.name}
      </text>
      <line
        x1={table.x}
        y1={table.y + 26}
        x2={table.x + 140}
        y2={table.y + 26}
        stroke="rgba(255,255,255,0.10)"
      />

      {table.fields.map((field, index) => {
        const visible = index < count;
        const isPK = field.includes("(PK)");
        const isFK = field.includes("(FK)");

        return (
          <text
            key={field}
            x={table.x + 10}
            y={table.y + 44 + index * 14}
            fontSize="8"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
            fill={visible ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0)"}
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 200ms ease",
            }}
          >
            {(isPK || isFK) && (
              <tspan fill="var(--af-pin)">
                {isPK ? "PK " : isFK ? "FK " : ""}
              </tspan>
            )}
            <tspan>{field.replace("(PK)", "").replace("(FK)", "")}</tspan>
          </text>
        );
      })}
    </g>
  );
}

function Relationship({ active, x1, y1, x2, y2, delay }: RelationshipProps) {
  const dash = 220;

  return (
    <path
      d={`M ${x1} ${y1} L ${x2} ${y2}`}
      fill="none"
      stroke="var(--af-line)"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.85"
      strokeDasharray={dash}
      strokeDashoffset={dash}
      style={{
        animation: active ? "erdDraw 600ms ease forwards" : "none",
        animationDelay: active ? `${delay}ms` : "0ms",
      }}
    />
  );
}

export default function ScreenERD({ active }: ScreenProps) {
  const tables: ERDTable[] = [
    {
      id: "users",
      x: 22,
      y: 30,
      name: "users",
      delay: 0,
      fields: ["id (PK)", "name", "email"],
    },
    {
      id: "orders",
      x: 190,
      y: 30,
      name: "orders",
      delay: 500,
      fields: ["id (PK)", "user_id (FK)", "status"],
    },
    {
      id: "items",
      x: 190,
      y: 128,
      name: "order_items",
      delay: 1000,
      fields: ["id (PK)", "order_id(FK)", "product_id"],
    },
  ];

  const [visibleFields, setVisibleFields] = useState<Record<TableId, number>>({
    users: 0,
    orders: 0,
    items: 0,
  });
  const runIdRef = useRef(0);

  useEffect(() => {
    runIdRef.current += 1;
    const runId = runIdRef.current;

    setVisibleFields({ users: 0, orders: 0, items: 0 });
    if (!active) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    tables.forEach((table) => {
      table.fields.forEach((_, index) => {
        const timerId = setTimeout(() => {
          if (runIdRef.current !== runId) return;
          setVisibleFields((prev) => ({
            ...prev,
            [table.id]: Math.max(prev[table.id], index + 1),
          }));
        }, table.delay + 250 + index * 80);

        timers.push(timerId);
      });
    });

    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="h-full min-h-0">
      <div className="af-surface-lg h-full min-h-0 bg-black/40 p-3 flex flex-col">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-[10px] font-semibold text-white/70">
            ERD (exemplo)
          </p>
          <span className="text-[10px] text-white/40">schema v1</span>
        </div>

        <div className="mt-2 flex-1 min-h-0 flex items-center justify-center">
          <svg
            viewBox="0 0 340 250"
            className="w-full max-w-[360px]"
            preserveAspectRatio="xMidYMid meet"
          >
            <Relationship
              active={active}
              x1={22 + 140}
              y1={34 + 52}
              x2={190}
              y2={34 + 52}
              delay={850}
            />
            <Relationship
              active={active}
              x1={190 + 70}
              y1={30 + 92}
              x2={190 + 70}
              y2={128}
              delay={1500}
            />
            {tables.map((table) => (
              <Table
                key={table.id}
                table={table}
                active={active}
                visibleFields={visibleFields}
              />
            ))}
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 px-2 pb-2">
          <div className="af-surface-md bg-white/5 p-3">
            <p className="text-[10px] font-semibold text-white/70">Regras</p>
            <p className="mt-1 text-[10px] text-white/50">
              users 1—N orders, orders 1—N items
            </p>
          </div>
          <div className="af-surface-md bg-white/5 p-3">
            <p className="text-[10px] font-semibold text-white/70">Geração</p>
            <p className="mt-1 text-[10px] text-white/50">
              Migration + Entity + Types vinculados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
