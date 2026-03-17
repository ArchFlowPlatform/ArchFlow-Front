import {
  BookText,
  Boxes,
  Database,
  KanbanSquare,
  Layers,
  Search,
  ShieldCheck,
  Workflow as WorkflowIcon,
} from "lucide-react";

import LogoPill from "./LogoPill";

export default function Marquee() {
  return (
    <div className=" relative overflow-hidden">
      <div className="flex whitespace-nowrap">
        <div className="animate-[marquee_22s_linear_infinite] flex items-center gap-3 py-4 pr-6">
          <LogoPill icon={Layers}>Architecture-First</LogoPill>
          <LogoPill icon={BookText}>ADRs</LogoPill>
          <LogoPill icon={Boxes}>C4 Model</LogoPill>
          <LogoPill icon={WorkflowIcon}>Event Storming</LogoPill>
          <LogoPill icon={Database}>ERD → Migrations</LogoPill>
          <LogoPill icon={KanbanSquare}>Scrumban</LogoPill>
          <LogoPill icon={ShieldCheck}>Traceability</LogoPill>
          <LogoPill icon={Search}>Single Source of Truth</LogoPill>
        </div>
        <div
          className="animate-[marquee_22s_linear_infinite] flex items-center gap-3 py-4 pr-6"
          aria-hidden="true"
        >
          <LogoPill icon={Layers}>Architecture-First</LogoPill>
          <LogoPill icon={BookText}>ADRs</LogoPill>
          <LogoPill icon={Boxes}>C4 Model</LogoPill>
          <LogoPill icon={WorkflowIcon}>Event Storming</LogoPill>
          <LogoPill icon={Database}>ERD → Migrations</LogoPill>
          <LogoPill icon={KanbanSquare}>Scrumban</LogoPill>
          <LogoPill icon={ShieldCheck}>Traceability</LogoPill>
          <LogoPill icon={Search}>Single Source of Truth</LogoPill>
        </div>
      </div>
    </div>
  );
}
