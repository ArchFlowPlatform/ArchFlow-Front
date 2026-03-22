import type { SprintItem } from "@/types/sprint";

/**
 * Label for sprint items in selects and lists — uses API `userStory` fields only.
 * Does not use "User story #id" style identifiers.
 */
export function getSprintItemUserStoryLabel(item: SprintItem): string {
  const title = item.userStory?.title?.trim();
  if (title) return title;

  const desc = item.userStory?.description?.trim();
  if (desc) {
    return desc.length > 100 ? `${desc.slice(0, 97)}…` : desc;
  }

  return "User story sem título";
}
