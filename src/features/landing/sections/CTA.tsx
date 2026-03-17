import { Fragment } from "react";
import { ArrowRight, ChevronRight, ShieldCheck, Target } from "lucide-react";

import Card from "../components/Card";
import CheckRow from "../components/CheckRow";
import Icon from "../components/Icon";
import type { FooterLink } from "../types/landing.types";

const footerLinks: FooterLink[] = [
  { label: "Produto", href: "#produto" },
  { label: "Pilares", href: "#pilares" },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
];

export default function CTA() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-20" id="cta">
      <Card className="af-surface-hover overflow-hidden">
        <div className="relative p-8 md:p-10">
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold text-white/80 hover:text-[var(--af-primary)] transition">
                Ready to ship with context?
              </p>
              <h3 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Pare de gerenciar tasks.
                <br />
                Comece a gerenciar{" "}
                <span className="text-white/90 hover:text-[var(--af-primary)] transition">
                  arquitetura + execução
                </span>
                .
              </h3>
              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                Se você quer uma ferramenta ágil que realmente entende software
                (decisões, diagramas e schema), o ArchFlow foi feito pra isso.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  className="group af-surface-sm af-surface-hover af-focus-ring inline-flex items-center justify-center gap-2 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/8 transition"
                >
                  <Icon
                    as={ArrowRight}
                    className="h-4 w-4 group-hover:text-[var(--af-pin)]"
                  />
                  Solicitar acesso
                </a>
                <a
                  href="#"
                  className="group af-surface-sm af-surface-hover af-focus-ring inline-flex items-center justify-center gap-2 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/8 transition"
                >
                  <Icon
                    as={ChevronRight}
                    className="h-4 w-4 group-hover:text-[var(--af-pin)]"
                  />
                  Falar com o time
                </a>
              </div>

              <p className="mt-4 text-xs text-white/55">
                Sem spam. Você recebe um email quando o acesso estiver pronto.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="af-surface-lg af-surface-hover bg-black/50 p-6 transition">
                <div className="flex items-start gap-3">
                  <Icon
                    as={ShieldCheck}
                    className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-white/70">
                      O que você ganha
                    </p>
                    <div className="mt-4 space-y-3">
                      <CheckRow>Rastreabilidade real do ADR ao deploy</CheckRow>
                      <CheckRow>
                        Documentação viva e versionada por sprint
                      </CheckRow>
                      <CheckRow>Menos drift em diagramas e schema</CheckRow>
                      <CheckRow>
                        Menos contexto perdido — mais velocidade com qualidade
                      </CheckRow>
                    </div>
                  </div>
                </div>
              </div>

              <div className="af-surface-lg af-surface-hover bg-white/4 p-6 transition">
                <div className="flex items-start gap-3">
                  <Icon
                    as={Target}
                    className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      "Arquitetura{" "}
                      <span className="text-white/90 hover:text-[var(--af-primary)] transition">
                        É
                      </span>{" "}
                      o projeto."
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      No ArchFlow, arquitetura deixa de ser anexo e vira parte
                      do fluxo — rastreável, versionada e útil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <footer className="af-separator-t mt-10 pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/archflow-logo.png"
              alt="ArchFlow"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-sm font-semibold text-white">ArchFlow</p>
              <p className="text-xs text-white/55">
                Architecture-First Project Management
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {footerLinks.map((link) => (
              <Fragment key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-white/65 hover:text-white hover:underline hover:decoration-[var(--af-primary)] hover:decoration-2 hover:underline-offset-8 transition"
                >
                  {link.label}
                </a>
                {link.href !== "#stack" && <span className="text-white/20">•</span>}
              </Fragment>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-white/45">
          © {new Date().getFullYear()} ArchFlow. All rights reserved.
        </p>
      </footer>
    </section>
  );
}
