import ResultView from "@/components/ResultView";
import PageShell from "@/components/PageShell";

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
