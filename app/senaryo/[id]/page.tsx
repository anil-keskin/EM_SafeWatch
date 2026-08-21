import ScenarioPlayer from "@/components/ScenarioPlayer";
import PageShell from "@/components/PageShell";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageShell>
      <ScenarioPlayer slug={id} />
    </PageShell>
  );
}
