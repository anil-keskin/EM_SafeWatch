"use client";

import { FileText, Printer } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import OyakMark from "@/components/OyakMark";
import { actionLabel } from "@/content/actions";
import { useAuth } from "@/lib/auth";
import type { EquipmentItem, Scenario, ScenarioResult, Zone } from "@/lib/types";

/**
 * Saha Kontrollük Gözlem Tutanağı.
 * Oyuncunun kendi tespitlerinden üretilir (doğru cevaplardan değil):
 * sahada gerçekten dolduracağı belgenin aynısını görür ve yazdırabilir.
 * Simülasyon kaydı olduğu her sayfada açıkça yazılıdır.
 */
export default function AuditReport({
  scenario,
  zone,
  result,
  equipment,
}: {
  scenario: Scenario;
  zone?: Zone;
  result: ScenarioResult;
  equipment: EquipmentItem[];
}) {
  const { displayName } = useAuth();
  const byCode = new Map(equipment.map((e) => [e.code, e]));
  const name = (code: string) => byCode.get(code)?.name ?? code;
  const s = result.sections;
  const hazards = [...s.hazards.hits, ...s.hazards.extras].map(
    (code) => scenario.hazards.find((h) => h.code === code)?.label ?? code
  );
  const contractorFindings = [...s.contractor.hits, ...s.contractor.extras];
  const actions = [...s.actions.hits, ...s.actions.extras];
  const contractor = scenario.actors.find((a) => a.type === "yuklenici");
  const date = new Date(result.completedAt);
  const docNo = `SW-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${scenario.slug.slice(0, 6).toUpperCase()}`;
  const b = scenario.briefing;

  const conditions = (
    [
      ["Hava / ortam", b.hava],
      ["İş izni", b.is_izni],
      ["Gaz durumu", b.gaz],
      ["Sıcaklık", b.sicaklik],
      ["Yükseklik / kot", b.yukseklik],
    ] as const
  ).filter(([, v]) => Boolean(v));

  return (
    <section className="sw-card overflow-hidden">
      <div className="sw-no-print flex flex-wrap items-center justify-between gap-3 border-b border-erd-line bg-erd-light/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-erd-red" />
          <div>
            <p className="text-sm font-bold text-erd-charcoal">Saha gözlem tutanağınız</p>
            <p className="text-xs text-erd-gray">Kendi tespitlerinizden hazırlandı. Sahada dolduracağınız belgenin aynısı.</p>
          </div>
        </div>
        <button type="button" onClick={() => window.print()} className="sw-btn-primary inline-flex items-center gap-2">
          <Printer size={16} /> Yazdır / PDF
        </button>
      </div>

      <div className="sw-print-area relative bg-white p-5 text-erd-charcoal sm:p-8">
        <span className="pointer-events-none absolute right-6 top-24 rotate-[-12deg] select-none rounded border-2 border-erd-red/30 px-3 py-1 text-sm font-black tracking-widest text-erd-red/30">
          EĞİTİM KAYDI
        </span>

        <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-erd-charcoal pb-4">
          <div className="flex items-center gap-3">
            <OyakMark size="header" />
            <span className="h-10 w-px bg-erd-line" />
            <BrandMark size="header" />
          </div>
          <div className="text-right text-[11px] leading-tight text-erd-gray">
            <p>Belge No: <span className="font-mono font-semibold text-erd-charcoal">{docNo}</span></p>
            <p>Tarih: {date.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })}</p>
          </div>
        </header>

        <h2 className="mt-5 text-center text-lg font-black uppercase tracking-wide sm:text-xl">
          Saha Kontrollük Gözlem Tutanağı
        </h2>
        <p className="text-center text-[11px] text-erd-gray">
          SafeWatch saha simülasyonunda oluşturulmuştur; resmi kayıt yerine geçmez.
        </p>

        <table className="mt-5 w-full border-collapse text-xs">
          <tbody>
            {(
              [
                ["Bölge", zone?.name ?? "—"],
                ["Konum", b.konum ?? "—"],
                ["Gözlem konusu", scenario.title],
                ["Kontrollük görevi", b.gorev ?? "—"],
                ["Kontrollük personeli", displayName],
                ["Yüklenici", contractor ? `${contractor.employer} — ${contractor.activity}` : "Sahada yüklenici yok"],
              ] as const
            ).map(([k, v]) => (
              <tr key={k}>
                <th className="w-40 border border-erd-line bg-erd-light px-2.5 py-1.5 text-left font-semibold">{k}</th>
                <td className="border border-erd-line px-2.5 py-1.5">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {conditions.length > 0 && (
          <ReportBlock no="1" title="Saha koşulları">
            <ul className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
              {conditions.map(([k, v]) => (
                <li key={k}><span className="font-semibold">{k}:</span> {v}</li>
              ))}
            </ul>
          </ReportBlock>
        )}

        <ReportBlock no="2" title="Tespit edilen riskler">
          {hazards.length === 0 ? (
            <Empty>Risk tespiti kaydedilmedi.</Empty>
          ) : (
            <ol className="list-decimal space-y-0.5 pl-5 text-xs">
              {hazards.map((h) => <li key={h}>{h}</li>)}
            </ol>
          )}
        </ReportBlock>

        <ReportBlock no="3" title="Yüklenici uygunsuzlukları ve talep edilen düzeltici faaliyet">
          {contractorFindings.length === 0 ? (
            <Empty>Yüklenici personelinde KKD uygunsuzluğu kaydedilmedi.</Empty>
          ) : (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-erd-light">
                  <th className="border border-erd-line px-2 py-1 text-left">#</th>
                  <th className="border border-erd-line px-2 py-1 text-left">Uygunsuzluk</th>
                  <th className="border border-erd-line px-2 py-1 text-left">Düzeltici faaliyet</th>
                  <th className="border border-erd-line px-2 py-1 text-left">Sorumlu</th>
                  <th className="border border-erd-line px-2 py-1 text-left">Termin</th>
                </tr>
              </thead>
              <tbody>
                {contractorFindings.map((code, i) => (
                  <tr key={code}>
                    <td className="border border-erd-line px-2 py-1">{i + 1}</td>
                    <td className="border border-erd-line px-2 py-1">{name(code)} eksik / uygun değil</td>
                    <td className="border border-erd-line px-2 py-1">{name(code)} temin edilip doğru kullanılacak</td>
                    <td className="border border-erd-line px-2 py-1">Yüklenici saha sorumlusu</td>
                    <td className="border border-erd-line px-2 py-1">İşe devam etmeden önce</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ReportBlock>

        <ReportBlock no="4" title="Kontrollük tarafından yapılan işlemler">
          {actions.length === 0 ? (
            <Empty>İşlem kaydedilmedi.</Empty>
          ) : (
            <ul className="space-y-0.5 text-xs">
              {actions.map((a) => <li key={a}>☑ {actionLabel(a)}</li>)}
            </ul>
          )}
        </ReportBlock>

        <ReportBlock no="5" title="Simülasyon değerlendirmesi">
          <p className="text-xs">
            Teknik doğruluk <strong>%{result.technical}</strong> · Kontrollük davranışı <strong>%{result.behavior}</strong>
            {" · "}Gözden kaçan: {s.hazards.misses.length} risk, {s.self.misses.length} kişisel KKD, {s.contractor.misses.length} yüklenici eksiği, {s.actions.misses.length} işlem.
          </p>
        </ReportBlock>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-[11px]">
          {["Kontrollük Personeli", "Yüklenici Saha Sorumlusu", "İşletme Temsilcisi"].map((role, i) => (
            <div key={role}>
              <div className="flex h-12 items-end justify-center border-b border-erd-charcoal pb-1 font-semibold">
                {i === 0 ? displayName : ""}
              </div>
              <p className="mt-1 text-erd-gray">{role}<br />Ad Soyad / İmza</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportBlock({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 break-inside-avoid">
      <h3 className="mb-2 border-b border-erd-line pb-1 text-xs font-bold uppercase tracking-wide">
        {no}. {title}
      </h3>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs italic text-erd-gray">{children}</p>;
}
