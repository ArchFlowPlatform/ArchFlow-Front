import type { StoryTaskRowView } from "../../views/projects/sprint-backlog/_mocks/sprintBacklog.mock";
import TaskRowCard from "../sprint/TaskRowCard";

interface StoryTaskRowProps {
  task: StoryTaskRowView;
}

export default function StoryTaskRow({ task }: StoryTaskRowProps) {
  return (
    <TaskRowCard
      title={task.title}
      priorityLabel={task.priorityLabel}
      subtitle={task.description}
      metaLabel={task.assignee.name}
      doneHours={task.doneHours}
      estimatedHours={task.estimatedHours}
    />
  );
}
