"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { cx } from "@/lib/utils/cx";

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(): SidebarContextValue {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("Sidebar components must be used inside SidebarProvider.");
  }

  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  children,
  className,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  const toggleSidebar = useCallback(() => {
    setOpen(!open);
  }, [open, setOpen]);

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar,
    }),
    [open, setOpen, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-provider"
        className={cx(
          "flex h-[100dvh] min-h-[100dvh] w-full items-stretch overflow-hidden",
          className,
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends ComponentPropsWithoutRef<"aside"> {
  collapsible?: "none" | "offcanvas";
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    { className, collapsible = "none", ...props },
    ref,
  ) => {
    const { open } = useSidebarContext();

    return (
      <aside
        ref={ref}
        data-slot="sidebar"
        data-state={open ? "open" : "closed"}
        data-collapsible={collapsible}
        className={cx(
          "flex h-[100dvh] min-h-[100dvh] shrink-0 flex-col",
          collapsible === "offcanvas"
            ? "fixed left-0 top-0 z-40 transition-transform duration-200 md:relative"
            : "",
          collapsible === "offcanvas" && !open ? "-translate-x-full" : "",
          className,
        )}
        {...props}
      />
    );
  },
);

Sidebar.displayName = "Sidebar";

export const SidebarHeader = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-header"
      className={cx("sticky top-0 z-10 shrink-0", className)}
      {...props}
    />
  );
});

SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-content"
      className={cx("min-h-0 flex-1 overflow-y-auto", className)}
      {...props}
    />
  );
});

SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-footer"
      className={cx("sticky bottom-0 z-10 shrink-0", className)}
      {...props}
    />
  );
});

SidebarFooter.displayName = "SidebarFooter";

export const SidebarInset = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="sidebar-inset"
      className={cx("min-h-0 min-w-0 flex-1", className)}
      {...props}
    />
  );
});

SidebarInset.displayName = "SidebarInset";

export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, onClick, type = "button", ...props }, ref) => {
  const { toggleSidebar } = useSidebarContext();

  return (
    <button
      ref={ref}
      type={type}
      data-slot="sidebar-trigger"
      className={className}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
          toggleSidebar();
        }
      }}
      {...props}
    />
  );
});

SidebarTrigger.displayName = "SidebarTrigger";
