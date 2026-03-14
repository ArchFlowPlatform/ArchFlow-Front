import SprintBacklogPage from "@/views/projects/sprint-backlog/SprintBacklogPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function SprintBacklogRoute({ params }: PageProps) {
  const { projectId } = await params;
  return <SprintBacklogPage projectId={projectId} />;
}
