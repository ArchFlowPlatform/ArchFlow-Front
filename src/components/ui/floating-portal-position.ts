"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/** Above modal overlays (z-50) and confirm (z-60). */
const DROPDOWN_Z_INDEX = 100;
const GAP_PX = 4;
const FALLBACK_PANEL_HEIGHT = 280;

export interface FloatingPortalPositionOptions {
  /** Defaults to {@link DROPDOWN_Z_INDEX}. Use higher values for nested menus. */
  zIndex?: number;
  /** When set, used as `minWidth` on the panel (e.g. fixed menu width in px). */
  minWidth?: CSSProperties["minWidth"];
}

/**
 * Fixed positioning for dropdown panels portaled to `document.body`,
 * so parent `overflow` cannot clip them. Updates on scroll (capture) and resize.
 */
export function useFloatingPortalPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  align: "left" | "right",
  options?: FloatingPortalPositionOptions,
): { panelRef: RefObject<HTMLDivElement | null>; style: CSSProperties } {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!open) {
      setStyle({});
      return;
    }

    function compute() {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const r = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const panel = panelRef.current;
      const panelH = panel?.offsetHeight ?? FALLBACK_PANEL_HEIGHT;
      const measuredW = panel?.getBoundingClientRect().width ?? 0;
      const anchorW = Math.max(r.width, anchor.offsetWidth);
      const minWNum =
        typeof options?.minWidth === "number" ? options.minWidth : null;
      const panelW =
        measuredW > 1
          ? measuredW
          : Math.max(anchorW, minWNum ?? anchorW);

      let top = r.bottom + GAP_PX;
      if (top + panelH > vh - 8 && r.top - GAP_PX - panelH >= 8) {
        top = r.top - GAP_PX - panelH;
      }
      top = Math.max(8, Math.min(top, vh - panelH - 8));

      let left =
        align === "right" ? r.right - panelW : r.left;
      const widthForClamp = Math.max(panelW, r.width, minWNum ?? 0);
      left = Math.max(8, Math.min(left, vw - widthForClamp - 8));

      const z = options?.zIndex ?? DROPDOWN_Z_INDEX;
      const minWidthStyle =
        options?.minWidth !== undefined ? options.minWidth : r.width;

      setStyle({
        position: "fixed",
        top,
        left,
        minWidth: minWidthStyle,
        zIndex: z,
      });
    }

    compute();
    const raf = requestAnimationFrame(() => compute());

    const panel = panelRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && panel
        ? new ResizeObserver(() => {
            requestAnimationFrame(compute);
          })
        : null;
    if (panel) ro?.observe(panel);

    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
    };
  }, [open, anchorRef, align, options?.zIndex, options?.minWidth]);

  return { panelRef, style };
}
