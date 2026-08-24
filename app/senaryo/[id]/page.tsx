import ScenarioPlayer from "@/components/ScenarioPlayer";
import PageShell from "@/components/PageShell";
import { SCENARIOS } from "@/content/scenarios";

export function generateStaticParams() {
  return SCENARIOS.map((scenario) => ({ id: scenario.slug }));
}

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
