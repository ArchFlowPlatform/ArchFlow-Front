import UserAvatar from "../ui/UserAvatar";
import EnumBadge from "@/components/ui/EnumBadge";
import type { KanbanCardView } from "@/features/projects/mocks/kanban.mock";
import { getInlineCardSystemBadges } from "@/features/projects/mocks/kanban.mock";
import { BUSINESS_VALUE_OPTIONS, STORY_STATUS_OPTIONS } from "@/lib/enum-labels";
import SystemBadge from "./SystemBadge";
import UserLabelBadge from "./UserLabelBadge";

interface KanbanCardProps {
  card: KanbanCardView;
  onOpen: (cardId: string) => void;
  isDragging?: boolean;
  onDragStart: (cardId: string) => void;
  onDragEnd: () => void;
}

export default function KanbanCard({
  card,
  onOpen,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const systemBadges = getInlineCardSystemBadges(card) ?? [];
  const footerBadges = [
    ...(card.userLabels ?? []).map((label) => ({
      key: label.id,
      kind: "user" as const,
      label,
    })),
    ...systemBadges.map((badge) => ({
      key: badge,
      kind: "system" as const,
      badge,
    })),
  ];

  return (
    <button
      type="button"
      draggable
      onClick={() => onOpen(card.id)}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", card.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(card.id);
      }}
      onDragEnd={onDragEnd}
      className={`af-surface-md af-surface-hover af-accent-hover w-full bg-white/[0.03] px-3 py-3 text-left transition ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">{card.title}</h3>
          <p className="af-text-tertiary text-[11px]">{card.persona}</p>
        </div>

        <p
          className="af-text-secondary text-[11px] leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.description}
        </p>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap content-start items-center gap-1.5">
              {footerBadges.map((item) =>
                item.kind === "user" ? (
                  <UserLabelBadge
                    key={item.key}
                    name={item.label.name}
                    color={item.label.color}
                  />
                ) : (
                  <SystemBadge key={item.key}>{item.badge}</SystemBadge>
                ),
              )}
              <EnumBadge options={BUSINESS_VALUE_OPTIONS} value={card.businessValue} />
              <EnumBadge options={STORY_STATUS_OPTIONS} value={card.status} />
            </div>
          </div>

          <UserAvatar
            user={card.assignee}
            className="af-surface-sm h-7 w-7 shrink-0 self-end bg-black/20 text-[10px] font-semibold text-white/80"
            fallbackClassName="text-[10px] font-semibold"
          />
        </div>
      </div>
    </button>
  );
}
