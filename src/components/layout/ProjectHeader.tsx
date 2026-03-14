import type { ReactNode } from "react";
import { Search } from "lucide-react";

import type { User } from "../../types/user";
import UserAvatar from "../ui/UserAvatar";

interface ProjectHeaderProps {
  title: string;
  subtitleChip?: string;
  description?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  user: User;
  rightSlot?: ReactNode;
}

export default function ProjectHeader({
  title,
  subtitleChip,
  description,
  showSearch = false,
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange,
  user,
  rightSlot,
}: ProjectHeaderProps) {
  return (
    <header className="af-separator-b flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-white sm:text-xl">{title}</h1>
        </div>

        {description ? <p className="af-text-secondary text-sm">{description}</p> : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {rightSlot ? <div className="order-1">{rightSlot}</div> : null}

        {showSearch ? (
          <div className="order-2">
            <label className="af-surface-md af-input-shell af-focus-ring af-text-secondary flex h-9 min-w-[15rem] items-center gap-2 bg-white/5 px-3 text-sm sm:min-w-[19rem]">
              <Search
                className="af-input-icon af-text-tertiary h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <input
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/38"
              />
            </label>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={user.name}
          className="af-surface-md af-surface-hover af-focus-ring order-3 inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/5 text-xs font-semibold text-white/80 transition hover:text-white"
          style={{ borderRadius: "9999px" }}
        >
          <UserAvatar
            user={user}
            className="h-full w-full bg-transparent text-xs font-semibold text-white/80"
            fallbackClassName="text-xs font-semibold"
          />
        </button>
      </div>
    </header>
  );
}
