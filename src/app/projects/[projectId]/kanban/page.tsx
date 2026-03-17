import KanbanPage from "@/features/projects/pages/KanbanPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function KanbanRoute({ params }: PageProps) {
  const { projectId } = await params;
  return <KanbanPage projectId={projectId} />;
}
