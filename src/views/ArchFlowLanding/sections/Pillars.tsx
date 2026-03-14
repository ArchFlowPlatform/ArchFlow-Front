import { ChevronRight, Layers } from "lucide-react";

import Card from "../components/Card";
import Divider from "../components/Divider";
import Icon from "../components/Icon";
import SectionTitle from "../components/SectionTitle";
import { pillars } from "../data/pillars";

export default function Pillars() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-4" id="pilares">
      <SectionTitle
        icon={Layers}
        eyebrow="Diferenciais"
        title="5 pilares que mudam a forma como times constroem software"
        desc="Arquitetura deixa de ser um anexo e vira o centro do fluxo: decisão, design, execução e evolução — rastreáveis."
        align="center"
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="af-surface-hover p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
              <Icon
                as={pillar.icon}
                className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
              />
            </div>

            <div className="mt-4 space-y-3">
              {pillar.bullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center">
                    <Icon
                      as={ChevronRight}
                      className="h-4 w-4 hover:text-[var(--af-pin)]"
                    />
                  </span>
                  <p className="text-sm text-white/70 leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Divider />
    </section>
  );
}
