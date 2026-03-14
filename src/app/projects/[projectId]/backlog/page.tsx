import ProductBacklogPage from "@/views/projects/backlog/ProductBacklogPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProductBacklogRoute({ params }: PageProps) {
  const { projectId } = await params;
  return <ProductBacklogPage projectId={projectId} />;
}
