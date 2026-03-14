import { useMemo, useState } from "react";

import { cx } from "@/lib/utils/cx";
import type { User } from "../../types/user";

interface UserAvatarProps {
  user: Pick<User, "name" | "avatarUrl">;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

function getInitials(name: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "AF";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export default function UserAvatar({
  user,
  className,
  imageClassName,
  fallbackClassName,
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = useMemo(() => getInitials(user.name), [user.name]);
  const shouldRenderImage = Boolean(user.avatarUrl) && !imageFailed;

  return (
    <span
      className={cx(
        "inline-flex aspect-square items-center justify-center overflow-hidden rounded-full bg-white/5 text-sm font-semibold text-white/80",
        className,
      )}
      style={{ borderRadius: "9999px" }}
    >
      {shouldRenderImage ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className={cx("h-full w-full rounded-full object-cover", imageClassName)}
          style={{ borderRadius: "9999px" }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={cx("leading-none", fallbackClassName)}>{initials}</span>
      )}
    </span>
  );
}
