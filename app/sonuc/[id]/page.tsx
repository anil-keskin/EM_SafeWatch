import ResultView from "@/components/ResultView";
import PageShell from "@/components/PageShell";
import { SCENARIOS } from "@/content/scenarios";
import { isPublished } from "@/lib/incident";

export function generateStaticParams() {
  // Yayında olmayan senaryo için rota üretilmez.
  return SCENARIOS.filter(isPublished).map((scenario) => ({
    id: scenario.slug,
  }));
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageShell>
      <ResultView slug={id} />
    </PageShell>
  );
}
