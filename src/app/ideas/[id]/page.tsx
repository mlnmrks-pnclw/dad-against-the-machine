import { IdeaCreator } from "@/components/creator/IdeaCreator";

export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IdeaCreator ideaId={id} />;
}
