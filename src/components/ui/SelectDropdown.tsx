"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectDropdownProps {
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** "md" for forms (default), "sm" for compact/inline contexts. */
  size?: "sm" | "md";
  /** Optional label shown at the top of the dropdown panel. */
  panelLabel?: string;
  /** Optional icon rendered before the selected label. */
  icon?: ReactNode;
  className?: string;
  /** Start with panel open (useful for inline-edit contexts). */
  defaultOpen?: boolean;
  /** Fires when the panel is dismissed without selecting a value (click-outside / Escape). */
  onClose?: () => void;
}

/**
 * Custom dropdown matching the SprintSelector design pattern.
 * Replaces native `<select>` across the app for visual consistency.
 */
export default function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Selecionar…",
  disabled = false,
  size = "md",
  panelLabel,
  icon,
  className = "",
  defaultOpen = false,
  onClose,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        onClose?.();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        onClose?.();
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange],
  );

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  const isSm = size === "sm";
  const triggerHeight = isSm ? "h-7" : "h-9";
  const triggerPx = isSm ? "px-2" : "px-3";
  const triggerText = isSm ? "text-xs" : "text-sm";
  const itemPy = isSm ? "py-1.5" : "py-2";
  const itemText = isSm ? "text-xs" : "text-sm";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((c) => !c)}
        className={`af-surface-md af-surface-hover af-focus-ring inline-flex ${triggerHeight} w-full items-center gap-2 bg-white/5 ${triggerPx} text-left ${triggerText} text-white/80 transition hover:border-[color:var(--accent-soft-15)] hover:bg-white/[0.06] disabled:opacity-50`}
      >
        {icon && <span className="shrink-0 text-white/58">{icon}</span>}
        <span className="min-w-0 flex-1 truncate text-white/58">{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Panel */}
      <div
        className={`absolute left-0 top-[calc(100%+0.25rem)] z-30 min-w-full origin-top-left transition duration-150 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="af-surface-md overflow-hidden bg-[#14121a]/98 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur-md">
          {panelLabel && (
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {panelLabel}
            </div>
          )}
          <div className="max-h-56 space-y-0.5 overflow-y-auto" role="listbox">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`af-focus-ring flex w-full items-center justify-between gap-3 px-2.5 ${itemPy} ${itemText} transition ${
                    isSelected
                      ? "af-nav-item-active text-white"
                      : "text-white/72 hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  <span className="truncate font-medium">{option.label}</span>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--accent-soft-35)]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
