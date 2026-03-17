import type { ScreenProps } from "../types/landing.types";

interface C4Node {
  id: string;
  x: number;
  y: number;
  title: string;
  sub: string;
  delay: number;
}

interface C4Edge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export default function ScreenC4({ active }: ScreenProps) {
  const mountKey = active ? "on" : "off";

  const nodes: C4Node[] = [
    { id: "user", x: 22, y: 50, title: "User", sub: "[Person]", delay: 0 },
    {
      id: "fe",
      x: 138,
      y: 50,
      title: "Frontend",
      sub: "[Container]",
      delay: 300,
    },
    {
      id: "gw",
      x: 254,
      y: 50,
      title: "API Gateway",
      sub: "[Container]",
      delay: 600,
    },
    {
      id: "svc",
      x: 254,
      y: 124,
      title: "Order Service",
      sub: "[Container]",
      delay: 900,
    },
    {
      id: "db",
      x: 254,
      y: 194,
      title: "PostgreSQL",
      sub: "[DB]",
      delay: 1200,
    },
  ];

  const edges: C4Edge[] = [
    { id: "e1", x1: 22 + 80, y1: 50 + 18, x2: 138, y2: 50 + 18, delay: 450 },
    { id: "e2", x1: 138 + 80, y1: 50 + 18, x2: 254, y2: 50 + 18, delay: 750 },
    { id: "e3", x1: 254 + 40, y1: 50 + 36, x2: 254 + 40, y2: 124, delay: 1050 },
    {
      id: "e4",
      x1: 254 + 40,
      y1: 124 + 36,
      x2: 254 + 40,
      y2: 194,
      delay: 1350,
    },
  ];

  return (
    <div key={mountKey} className="h-full min-h-0">
      <div className="af-surface-lg h-full min-h-0 bg-black/40 p-3 flex flex-col">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-[10px] font-semibold text-white/70">
            Container diagram (simplificado)
          </p>
          <span className="text-[10px] text-white/40">v2.3</span>
        </div>

        <div className="mt-2 flex-1 min-h-0 flex items-center justify-center">
          <svg
            viewBox="0 0 340 260"
            className="w-full max-w-[360px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {edges.map((edge) => (
              <line
                key={edge.id}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="var(--af-line)"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.85"
                strokeDasharray="120"
                strokeDashoffset="120"
                style={{
                  animation: active ? `c4Draw 600ms ease ${edge.delay}ms forwards` : "none",
                }}
              />
            ))}

            {nodes.map((node) => (
              <g
                key={node.id}
                style={{
                  opacity: 0,
                  transform: "scale(0.88)",
                  transformOrigin: `${node.x + 40}px ${node.y + 18}px`,
                  animation: active ? `c4In 500ms ease ${node.delay}ms forwards` : "none",
                }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width="80"
                  height="36"
                  rx="8"
                  fill="#0a0a0a"
                  stroke="var(--af-line)"
                  strokeWidth="1.2"
                />
                <text
                  x={node.x + 40}
                  y={node.y + 15}
                  textAnchor="middle"
                  fontSize="9"
                  fill="rgba(255,255,255,0.8)"
                >
                  {node.title}
                </text>
                <text
                  x={node.x + 40}
                  y={node.y + 28}
                  textAnchor="middle"
                  fontSize="7"
                  fill="rgba(255,255,255,0.4)"
                >
                  {node.sub}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 px-2 pb-2">
          <div className="af-surface-md bg-white/5 p-3">
            <p className="text-[10px] font-semibold text-white/70">Fluxo</p>
            <p className="mt-1 text-[10px] text-white/50">
              User → FE → Gateway → Service → DB
            </p>
          </div>
          <div className="af-surface-md bg-white/5 p-3">
            <p className="text-[10px] font-semibold text-white/70">Motivo</p>
            <p className="mt-1 text-[10px] text-white/50">
              Separar responsabilidades e escalar leitura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
