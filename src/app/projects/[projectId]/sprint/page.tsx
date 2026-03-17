import SprintPage from "@/features/projects/pages/SprintPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function SprintRoute({ params }: PageProps) {
  const { projectId } = await params;
  return <SprintPage projectId={projectId} />;
}
