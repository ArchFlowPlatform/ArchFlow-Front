"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { Check, Pencil, X } from "lucide-react";
import SelectDropdown, { type SelectOption } from "@/components/ui/SelectDropdown";

const defaultViewCls =
  "group/inline inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition hover:bg-white/[0.06]";
const iconCls =
  "h-3 w-3 shrink-0 text-white/30 opacity-0 transition group-hover/inline:opacity-100";
const inputCls =
  "af-focus-ring w-full rounded border border-white/20 bg-black/40 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-white/30";

const btnCls =
  "af-focus-ring inline-flex h-6 w-6 items-center justify-center rounded transition hover:bg-white/10";

interface BaseProps {
  saving?: boolean;
  /** Override wrapper class in view mode (replaces default hover style). */
  className?: string;
  /** Override text class in view mode. */
  textClassName?: string;
}

// ── Text / Textarea ──

interface InlineTextProps extends BaseProps {
  value: string;
  displayValue?: string;
  placeholder?: string;
  multiline?: boolean;
  onSave: (value: string) => Promise<void>;
}

export function InlineText({
  value,
  displayValue,
  placeholder = "—",
  multiline = false,
  saving = false,
  className,
  textClassName,
  onSave,
}: InlineTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      requestAnimationFrame(() => ref.current?.focus());
    }
  }, [editing, value]);

  const commit = useCallback(async () => {
    // Preserve raw input for multiline fields (acceptance criteria, multiline descriptions).
    // For single-line fields we keep trimming to avoid accidental whitespace edits.
    const nextValue = multiline ? draft : draft.trim();
    if (nextValue !== value) {
      await onSave(nextValue);
    }
    setEditing(false);
  }, [draft, value, onSave, multiline]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
  }, [value]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
      if (e.key === "Enter" && !multiline) void commit();
    },
    [cancel, commit, multiline],
  );

  if (editing) {
    return (
      <div className="flex items-start gap-1">
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            rows={3}
            disabled={saving}
            className={inputCls + " resize-y"}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            disabled={saving}
            className={inputCls}
          />
        )}
        <button type="button" onClick={() => void commit()} disabled={saving} className={btnCls}>
          <Check className="h-3 w-3 text-green-400" />
        </button>
        <button type="button" onClick={cancel} disabled={saving} className={btnCls}>
          <X className="h-3 w-3 text-red-400" />
        </button>
      </div>
    );
  }

  const display = displayValue ?? value;
  const wrapperCls = className ?? defaultViewCls;

  if (multiline) {
    return (
      <div onClick={() => setEditing(true)} className={wrapperCls}>
        <div className={`whitespace-pre-line ${textClassName ?? (display ? "" : "text-white/30")}`}>
          {display || placeholder}
        </div>
        <Pencil className={iconCls} />
      </div>
    );
  }

  return (
    <span onClick={() => setEditing(true)} className={wrapperCls}>
      <span className={textClassName ?? (display ? "" : "text-white/30")}>
        {display || placeholder}
      </span>
      <Pencil className={iconCls} />
    </span>
  );
}

// ── Select ──

interface InlineSelectProps extends BaseProps {
  value: string;
  displayLabel: string;
  options: readonly SelectOption[];
  /** Tailwind color classes (bg + text) for badge-style rendering. */
  badgeCls?: string;
  onSave: (value: string) => Promise<void>;
}

const badgeBaseCls =
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium leading-tight";

export function InlineSelect({
  value,
  displayLabel,
  options,
  saving = false,
  className,
  textClassName,
  badgeCls,
  onSave,
}: InlineSelectProps) {
  const [editing, setEditing] = useState(false);

  const exitEdit = useCallback(() => setEditing(false), []);

  const handleChange = useCallback(
    async (newVal: string) => {
      if (newVal !== value) {
        await onSave(newVal);
      }
      setEditing(false);
    },
    [value, onSave],
  );

  if (editing) {
    return (
      <SelectDropdown
        value={value}
        options={options}
        onChange={(v) => void handleChange(v)}
        disabled={saving}
        size="sm"
        defaultOpen
        onClose={exitEdit}
      />
    );
  }

  const wrapperCls = className ?? defaultViewCls;

  return (
    <span onClick={() => setEditing(true)} className={wrapperCls}>
      {badgeCls ? (
        <span className={`${badgeBaseCls} ${badgeCls}`}>{displayLabel}</span>
      ) : (
        <span className={textClassName}>{displayLabel}</span>
      )}
      <Pencil className={iconCls} />
    </span>
  );
}

// ── Number ──

interface InlineNumberProps extends BaseProps {
  value: number | null;
  displayValue?: string;
  placeholder?: string;
  min?: number;
  onSave: (value: number) => Promise<void>;
}

export function InlineNumber({
  value,
  displayValue,
  placeholder = "—",
  min = 0,
  saving = false,
  className,
  textClassName,
  onSave,
}: InlineNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value ?? ""));
      requestAnimationFrame(() => ref.current?.focus());
    }
  }, [editing, value]);

  const commit = useCallback(async () => {
    const num = Number(draft);
    if (!Number.isNaN(num) && num !== value) {
      await onSave(num);
    }
    setEditing(false);
  }, [draft, value, onSave]);

  const cancel = useCallback(() => {
    setDraft(String(value ?? ""));
    setEditing(false);
  }, [value]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
      if (e.key === "Enter") void commit();
    },
    [cancel, commit],
  );

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={ref}
          type="number"
          min={min}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          disabled={saving}
          className={inputCls + " w-20"}
        />
        <button type="button" onClick={() => void commit()} disabled={saving} className={btnCls}>
          <Check className="h-3 w-3 text-green-400" />
        </button>
        <button type="button" onClick={cancel} disabled={saving} className={btnCls}>
          <X className="h-3 w-3 text-red-400" />
        </button>
      </div>
    );
  }

  const display = displayValue ?? String(value ?? 0);
  const wrapperCls = className ?? defaultViewCls;

  return (
    <span onClick={() => setEditing(true)} className={wrapperCls}>
      <span className={textClassName ?? (display ? "" : "text-white/30")}>
        {display || placeholder}
      </span>
      <Pencil className={iconCls} />
    </span>
  );
}

// ── Color ──

interface InlineColorProps extends BaseProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export function InlineColor({ value, saving = false, className, onSave }: InlineColorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "#3498db");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value || "#3498db");
      requestAnimationFrame(() => ref.current?.focus());
    }
  }, [editing, value]);

  const commit = useCallback(async () => {
    if (draft !== value) {
      await onSave(draft);
    }
    setEditing(false);
  }, [draft, value, onSave]);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={ref}
          type="color"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border border-white/10 bg-transparent"
        />
        <button type="button" onClick={() => void commit()} disabled={saving} className={btnCls}>
          <Check className="h-3 w-3 text-green-400" />
        </button>
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className={btnCls}>
          <X className="h-3 w-3 text-red-400" />
        </button>
      </div>
    );
  }

  const color = value || "#3498db";
  const wrapperCls = className ?? defaultViewCls;

  return (
    <span onClick={() => setEditing(true)} className={wrapperCls}>
      <span
        className="inline-block h-4 w-4 rounded-sm border border-white/10"
        style={{ backgroundColor: color }}
      />
      <Pencil className={iconCls} />
    </span>
  );
}

// ── Member select ──

interface MemberOption {
  userId: string;
  name: string;
}

interface InlineMemberSelectProps extends BaseProps {
  value: string | null;
  displayLabel: string;
  members: MemberOption[];
  onSave: (value: string | null) => Promise<void>;
}

export function InlineMemberSelect({
  value,
  displayLabel,
  members,
  saving = false,
  className,
  textClassName,
  onSave,
}: InlineMemberSelectProps) {
  const [editing, setEditing] = useState(false);

  const memberOptions: SelectOption[] = [
    { value: "", label: "Sem responsável" },
    ...members.map((m) => ({ value: m.userId, label: m.name })),
  ];

  const exitEdit = useCallback(() => setEditing(false), []);

  const handleChange = useCallback(
    async (newVal: string) => {
      const resolved = newVal || null;
      if (resolved !== value) {
        await onSave(resolved);
      }
      setEditing(false);
    },
    [value, onSave],
  );

  if (editing) {
    return (
      <SelectDropdown
        value={value ?? ""}
        options={memberOptions}
        onChange={(v) => void handleChange(v)}
        disabled={saving}
        size="sm"
        defaultOpen
        onClose={exitEdit}
      />
    );
  }

  const wrapperCls = className ?? defaultViewCls;

  return (
    <span onClick={() => setEditing(true)} className={wrapperCls}>
      <span className={textClassName ?? "af-text-secondary"}>{displayLabel}</span>
      <Pencil className={iconCls} />
    </span>
  );
}
