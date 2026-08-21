import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell>
    <div className="sw-card mx-auto max-w-md p-8 text-center">
      <p className="text-4xl font-bold text-erd-red">404</p>
      <h1 className="mt-2 text-xl font-bold text-erd-charcoal">
        Sayfa bulunamadı
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-erd-gray">
        Aradığınız sayfa taşınmış veya hiç var olmamış olabilir.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Link href="/" className="sw-btn-primary">
          Ana Menü
        </Link>
        <Link href="/saha" className="sw-btn-ghost">
          Saha Seçimi
        </Link>
      </div>
    </div>
    </PageShell>
  );
}
