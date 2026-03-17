import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type ClassValue = string | false | null | undefined;
export type BadgeTone = "default" | "accent" | "solid" | "subtle";
export type SectionTitleAlign = "left" | "center";
export type HeroPanelScreenKey = "adr" | "c4" | "erd" | "kb";
export type TraceLineKind = "normal" | "accent";
export type CSSVariableName = "--af-primary" | "--af-line" | "--af-pin";

export type ArchFlowWrapperStyle = CSSProperties &
  Record<CSSVariableName, string>;

export interface ChildrenProps {
  children: ReactNode;
}

export interface ClassNameProps extends ChildrenProps {
  className?: string;
}

export interface ScreenProps {
  active: boolean;
}

export interface IconComponentProps {
  as: LucideIcon;
  className?: string;
}

export interface BadgeProps extends ChildrenProps {
  tone?: BadgeTone;
}

export interface CardProps extends ClassNameProps {}

export interface CodeBlockProps extends ChildrenProps {}

export interface SectionTitleProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  align?: SectionTitleAlign;
  icon?: LucideIcon;
}

export interface LogoPillProps extends ChildrenProps {
  icon?: LucideIcon;
}

export interface PanelScreenProps extends ChildrenProps {
  active: boolean;
}

export interface WorkflowStep {
  k: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

export interface Pillar {
  title: string;
  icon: LucideIcon;
  bullets: string[];
}

export interface MVPFeature {
  title: string;
  icon: LucideIcon;
  desc: string;
}

export interface RoadmapPhase {
  phase: string;
  icon: LucideIcon;
  items: string[];
}

export interface StackItem {
  name: string;
  icon: LucideIcon;
}

export interface HeroPanelScreen {
  key: HeroPanelScreenKey;
  title: string;
}

export interface TraceLine {
  text: string;
  kind: TraceLineKind;
}

export interface NavbarLink {
  label: string;
  id: string;
}

export interface FooterLink {
  label: string;
  href: string;
}
