import KanbanPage from "@/views/projects/kanban/KanbanPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function KanbanRoute({ params }: PageProps) {
  const { projectId } = await params;
  return <KanbanPage projectId={projectId} />;
}
