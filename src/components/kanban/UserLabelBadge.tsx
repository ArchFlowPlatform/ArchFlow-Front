interface UserLabelBadgeProps {
  name: string;
  color: string;
}

function normalizeHexColor(color: string): string {
  const value = color.trim();

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return "#6D28D9";
}

function getContrastTextColor(backgroundColor: string): string {
  const normalized = normalizeHexColor(backgroundColor);
  const red = Number.parseInt(normalized.slice(1, 3), 16);
  const green = Number.parseInt(normalized.slice(3, 5), 16);
  const blue = Number.parseInt(normalized.slice(5, 7), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#111827" : "#FFFFFF";
}

export default function UserLabelBadge({
  name,
  color,
}: UserLabelBadgeProps) {
  const backgroundColor = normalizeHexColor(color);
  const textColor = getContrastTextColor(backgroundColor);

  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {name}
    </span>
  );
}
