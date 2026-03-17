import ProductBacklogPage from "@/features/projects/pages/ProductBacklogPage";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProductBacklogRoute({ params }: PageProps) {
  const { projectId } = await params;
  return <ProductBacklogPage projectId={projectId} />;
}
