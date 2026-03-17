import {
  GitBranch,
  Layers,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";

import Card from "../components/Card";
import CheckRow from "../components/CheckRow";
import CodeBlock from "../components/CodeBlock";
import Divider from "../components/Divider";
import Icon from "../components/Icon";
import SectionTitle from "../components/SectionTitle";

export default function ProblemSolution() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14" id="produto">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionTitle
            icon={Search}
            eyebrow="O problema real"
            title="Ferramentas ágeis não entendem software — só trabalho."
            desc="Jira/Confluence/diagramas/schema vivem separados. A arquitetura vira link perdido e a documentação fica obsoleta."
          />

          <div className="mt-6 space-y-3">
            <CheckRow>Decisões arquiteturais somem em wikis</CheckRow>
            <CheckRow>Diagramas ficam desatualizados</CheckRow>
            <CheckRow>Schema não conversa com backlog</CheckRow>
            <CheckRow>Ninguém sabe o PORQUÊ das escolhas</CheckRow>
          </div>

          <div className="mt-8">
            <Card className="af-surface-hover p-6">
              <div className="flex items-start gap-3">
                <Icon
                  as={Target}
                  className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    A questão central
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Como construir software de qualidade se as suas ferramentas
                    não entendem arquitetura?
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <SectionTitle
            icon={Layers}
            eyebrow="A solução"
            title="Architecture-First, Agile by Design."
            desc="No ArchFlow, o backlog nasce do contexto técnico: ADR → Diagrama → Story → Schema → Card → Deploy."
          />

          <div className="mt-6">
            <CodeBlock>{`ADR #5: "Usar CQRS para separar leitura/escrita"
├─ Contexto: Sistema com alta carga de leitura
├─ Decisão: Implementar CQRS com Event Sourcing
├─ Consequências: +Escalabilidade, +Complexidade
└─ Status: Aceito (2025-01-15)

Story: "Implementar Command Handler para CreateOrder"
├─ Vinculada a: ADR #5, Container Diagram v2.3
└─ Schema necessário: Tabela orders_events

Kanban Card:
├─ 📐 ADR vinculado (1 clique)
├─ 🎨 Diagrama atualizado (v2.3)
├─ 🗄️ Migration gerada
└─ ✅ Critérios e testes com contexto`}</CodeBlock>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card className="af-surface-hover p-5">
              <div className="flex items-start gap-3">
                <Icon
                  as={ShieldCheck}
                  className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Fonte única
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Tudo versionado e vinculado ao trabalho real.
                  </p>
                </div>
              </div>
            </Card>
            <Card className="af-surface-hover p-5">
              <div className="flex items-start gap-3">
                <Icon
                  as={GitBranch}
                  className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Menos drift
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Diagramas e schema evoluem junto com o sprint.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Divider />
    </section>
  );
}
