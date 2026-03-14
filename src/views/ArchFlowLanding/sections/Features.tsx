import { ArrowRight, Layers, Sparkles } from "lucide-react";

import Badge from "../components/Badge";
import Card from "../components/Card";
import Divider from "../components/Divider";
import Icon from "../components/Icon";
import SectionTitle from "../components/SectionTitle";
import { mvpFeatures } from "../data/mvpFeatures";

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-4" id="features">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle
          icon={Sparkles}
          eyebrow="MVP"
          title="Features desenhadas para reduzir fricção e aumentar contexto"
          desc="O ArchFlow conecta gestão ágil com arquitetura e banco — do jeito que dev trabalha."
        />

        <Card className="af-surface-hover p-6 lg:w-[420px]">
          <div className="flex items-start gap-3">
            <Icon
              as={Layers}
              className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
            />
            <div>
              <p className="text-sm font-semibold text-white">
                Por que isso é diferente?
              </p>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Em vez de “linkar” arquitetura em algum lugar, o produto trata
                arquitetura como entidade de primeira classe — com
                versionamento, diffs e rastreabilidade.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="accent">ADRs</Badge>
                <Badge tone="accent">C4</Badge>
                <Badge tone="accent">ERD</Badge>
                <Badge tone="accent">Scrumban</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mvpFeatures.map((feature) => (
          <Card key={feature.title} className="af-surface-hover p-6">
            <div className="flex items-start gap-3">
              <Icon
                as={feature.icon}
                className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
              />
              <div>
                <h3 className="text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  {feature.desc}
                </p>

                <div className="mt-5">
                  <a
                    href="#cta"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-[var(--af-primary)] transition"
                  >
                    Ver exemplo
                    <ArrowRight className="h-4 w-4 text-white/80 transition group-hover:text-[var(--af-pin)]" />
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Divider />
    </section>
  );
}
