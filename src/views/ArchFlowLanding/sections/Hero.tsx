"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookText, ChevronRight, Layers, Target } from "lucide-react";

import Accent from "../components/Accent";
import Badge from "../components/Badge";
import Card from "../components/Card";
import Icon from "../components/Icon";
import Marquee from "../components/Marquee";
import HeroAnimatedPanel from "../hero-panel/HeroAnimatedPanel";
import { cx } from "@/lib/utils/cx";

export default function Hero() {
  const fullWord = "arquitetura.";
  const [typed, setTyped] = useState("");
  const [titleDone, setTitleDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    setTyped("");
    setTitleDone(false);

    intervalId = setInterval(() => {
      i += 1;
      setTyped(fullWord.slice(0, i));
      if (i >= fullWord.length) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
        setTitleDone(true);
      }
    }, 60);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div
        className="relative mx-auto max-w-6xl px-4 pt-16 pb-10 md:pt-20 md:pb-16"
        id="top"
      >
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Architecture-First</Badge>
              <Badge>Agile by Design</Badge>
              <Badge>Traceability</Badge>
            </div>

            <h1 className="max-w-3xl text-4xl md:text-6xl tracking-tight text-white">
              A ferramenta que entende{" "}
              <span className="text-white">
                <span>{typed}</span>
                <span
                  className={cx(
                    "ml-1 inline-block w-[1px] h-[1em] align-middle",
                    titleDone && "opacity-0",
                  )}
                  style={{
                    background: "var(--af-pin)",
                    animation: titleDone
                      ? "none"
                      : "afCursorBlink 700ms linear infinite",
                  }}
                />
              </span>{" "}
              Não só tasks.
            </h1>

            <p className="max-w-2xl text-base md:text-lg leading-relaxed text-white/75">
              O <span className="text-white font-medium">ArchFlow</span> coloca{" "}
              <Accent>decisões arquiteturais</Accent>, <Accent>diagramas</Accent> e{" "}
              <Accent>schema</Accent> no centro da gestão ágil — com
              rastreabilidade completa do conceito ao deploy.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#cta"
                className="group af-surface-sm af-surface-hover af-focus-ring inline-flex items-center justify-center gap-2 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/8 transition"
              >
                <Icon
                  as={ArrowRight}
                  className="h-4 w-4 group-hover:text-[var(--af-pin)]"
                />
                Solicitar acesso
              </a>
              <a
                href="#produto"
                className="group af-surface-sm af-surface-hover af-focus-ring inline-flex items-center justify-center gap-2 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/8 transition"
              >
                <Icon
                  as={ChevronRight}
                  className="h-4 w-4 group-hover:text-[var(--af-pin)]"
                />
                Ver como funciona
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroAnimatedPanel />
          </div>
        </div>

        <div className="mt-10 grid w-full gap-4 md:grid-cols-3">
          <Card className="af-surface-hover p-5">
            <div className="flex items-start gap-3">
              <Icon
                as={Layers}
                className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  Menos fragmentação
                </p>
                <p className="mt-1 text-sm text-white/70">
                  ADRs, diagramas, board e schema no mesmo produto — reduz
                  context switching.
                </p>
              </div>
            </div>
          </Card>

          <Card className="af-surface-hover p-5">
            <div className="flex items-start gap-3">
              <Icon
                as={BookText}
                className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
              />
              <div>
                <p className="text-sm font-medium text-white">Documentação viva</p>
                <p className="mt-1 text-sm text-white/70">
                  Versionamento por sprint e vínculo com execução: menos drift.
                </p>
              </div>
            </div>
          </Card>

          <Card className="af-surface-hover p-5">
            <div className="flex items-start gap-3">
              <Icon
                as={Target}
                className="h-5 w-5 mt-0.5 hover:text-[var(--af-pin)]"
              />
              <div>
                <p className="text-sm font-medium text-white">Onboarding rápido</p>
                <p className="mt-1 text-sm text-white/70">
                  Contexto técnico acessível por card: por que foi feito assim?
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 w-full">
          <Marquee />
        </div>
      </div>
    </section>
  );
}
