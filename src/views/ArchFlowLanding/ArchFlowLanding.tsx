import Navbar from "./components/Navbar";
import CTA from "./sections/CTA";
import ArchTaskGraph from "./sections/ArchTaskGraph";
import Features from "./sections/Features";
import Hero from "./sections/Hero";
import Pillars from "./sections/Pillars";
import ProblemSolution from "./sections/ProblemSolution";
import Workflow from "./sections/Workflow";
import type { ArchFlowWrapperStyle } from "./utils/types";

const PURPLE_PRIMARY = "#6D28D9";
const PURPLE_LINE = "#7C3AED";
const PURPLE_PIN = "#6D28D9";

const wrapperStyle: ArchFlowWrapperStyle = {
  fontFamily:
    'Satoshi, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, monospace',
  "--af-primary": PURPLE_PRIMARY,
  "--af-line": PURPLE_LINE,
  "--af-pin": PURPLE_PIN,
};

export default function ArchFlowLanding() {
  return (
    <div className="min-h-screen w-full bg-[#16171d] text-white" style={wrapperStyle}>
      <Navbar />

      <main className="overflow-x-hidden">
        <Hero />
        <ProblemSolution />
        <Pillars />
        <Features />
        <ArchTaskGraph />
        <Workflow />
        <CTA />
      </main>
    </div>
  );
}
