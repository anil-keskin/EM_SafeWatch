import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3,
  ClipboardList,
  HardHat,
  Shield,
  TriangleAlert,
} from "lucide-react";
import AppIcon, { IconWatermark } from "@/components/AppIcon";
import PageShell from "@/components/PageShell";
import { ACTIONS } from "@/content/actions";
import { actionKindGlyph } from "@/lib/icon-theme";
import type { IconTone } from "@/lib/icon-theme";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Nasıl Oynanır | SafeWatch",
};

const RULES = [
  {
    title: "Can sistemi yoktur",
    body: "Oyun asla başarısızlıkla bitmez. Yanlış bir seçim yaptığınızda akış durmaz; sonunda nazik ve öğretici bir geri bildirim alırsınız.",
  },
  {
    title: "Puan bir gelişim göstergesidir",
    body: "Geçme ya da kalma eşiği yoktur. Puan, hangi konuda tekrar yapmanızın faydalı olacağını gösterir.",
  },
  {
    title: "Serbest geçiş",
    body: "Senaryoları istediğiniz sırayla oynayabilirsiniz. Kilitli bölge veya senaryo yoktur.",
  },
  {
    title: "İlerlemeniz saklanır",
    body: "Kaldığınız yerden devam edebilir, tamamladığınız bir senaryoyu tekrar oynayıp en iyi puanınızı geliştirebilirsiniz.",
  },
  {
    title: "Kart rehberi ve kademeli ipucu ayrıdır",
    body: "Hazırlık panelindeki (i) hangi durumda seçeceğinizi anlatır, puanınızı düşürmez. Karta kendiniz tıklamak da sabit kesinti üretmez. TAK / İŞARETLE / SEÇ her özgün aile için 1 puan; HEPSİNİ TAK / SEÇ / BELİRLE kesintiyi 8’e tamamlar (TAK toplamına eklenmez). Tüm aileleri yalnızca TAK ile ve hiç manuel seçim olmadan bitirmek de 8 sayılır. Senaryo ipuçları 2 + 3 + 5 puandır (en fazla 10); HEPSİNİ BELİRLE ile birlikte risk yardımı en fazla 15’tir.",
  },
  {
    title: "Gereksiz KKD de bir uygunsuzluktur",
    body: "Eksik koruyucu kadar, göreve uygun olmayan fazladan koruyucu seçmek de değerlendirmeye girer.",
  },
];

const STEPS: Array<{
  step: string;
  title: string;
  body: string;
  icon: LucideIcon;
  tone: IconTone;
}> = [
  {
    step: "1",
    title: "Görev Kartı",
    body: "Nereye ve neden gittiğinizi, işletmenin ve müteahhidin ne yaptığını, hava ve özel durumları okursunuz.",
    icon: ClipboardList,
    tone: "kkd",
  },
  {
    step: "2",
    title: "Tehlike Tanıma",
    body: "Sahnedeki risk noktalarını işaretlersiniz. Bazı noktalar bilinçli olarak sahte konulmuştur. Noktaya sizin tıklamanız kesinti üretmez. Takılırsanız HEPSİNİ BELİRLE gerçek noktaları işaretler (−8). İpucu kademeleri ayrıdır.",
    icon: TriangleAlert,
    tone: "risk",
  },
  {
    step: "3",
    title: "Hazırlık ve Denetim",
    body: "Dört karar sekmesini doldurursunuz: kendi donanımınız (20), yüklenicideki eksikler (20), işletmedeki gözlem ve müdahale kararınız (25). İşletme sekmesi giydirme ve bağımsız puan değildir; durdurma kartı yalnızca müteahhit içindir. Her sekmede koruma ailelerini İleri ile sırayla gezersiniz. (i) rehberdir, puan düşürmez.",
    icon: HardHat,
    tone: "kkd",
  },
  {
    step: "4",
    title: "Sonuç Kartı",
    body: "Teknik doğruluk ve kontrollük davranışı ayrı ayrı gösterilir; doğrular, eksikler ve gereksiz seçimler kurumsal bir dille açıklanır.",
    icon: BarChart3,
    tone: "nav",
  },
];

const ROLES = [
  {
    label: "Kontrollük",
    className: "bg-blue-50 text-blue-800 border border-blue-200",
    body: "Sizsiniz. Erdemir Mühendislik personeli olarak kendi ekibiniz üzerinde tam yetkilisiniz.",
  },
  {
    label: "Yüklenici",
    className: "bg-erd-light text-erd-charcoal border border-erd-line",
    body: "Denetlediğiniz müteahhit çalışanı. Sözleşme kapsamında işi durdurma yetkiniz vardır.",
  },
  {
    label: "İşletme",
    className: "bg-red-50 text-erd-red border border-red-200",
    body: "Demir çelik fabrika personeli. KKD giydiremez, doğrudan emir veremezsiniz. Eksiği tespit eder, işletme birimine veya İSG'ye bildirirsiniz. Durdurma yetkisi yalnızca yüklenici içindir.",
  },
];

export default function NasilOynanirPage() {
  return (
    <PageShell className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-erd-charcoal">
          Nasıl Oynanır
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-erd-gray">
          SafeWatch bir sınav değil, saha refleksinizi geliştirmeye yönelik bir
          antrenman aracıdır. Sistem tanı koymaz; yalnızca gelişim göstergesi
          üretir.
        </p>
      </header>

      <section className="sw-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Senaryo Akışı
        </h2>
        <ol className="mt-3 space-y-3">
          {STEPS.map((item) => (
            <li key={item.step} className="flex gap-3">
              <AppIcon icon={item.icon} tone={item.tone} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-erd-charcoal">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-erd-gray">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sw-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Karakter Grupları ve Yetki
        </h2>
        <ul className="mt-3 space-y-2.5">
          {ROLES.map((role) => (
            <li
              key={role.label}
              className="rounded-xl border border-erd-line p-3.5"
            >
              <span className={`sw-badge ${role.className}`}>{role.label}</span>
              <p className="mt-1.5 text-sm leading-snug text-erd-charcoal">
                {role.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {RULES.map((rule) => (
          <div key={rule.title} className="sw-card relative overflow-hidden p-4">
            <IconWatermark icon={Shield} tone="kkd" />
            <h3 className="relative text-sm font-bold text-erd-charcoal">
              {rule.title}
            </h3>
            <p className="relative mt-1 text-sm leading-snug text-erd-gray">
              {rule.body}
            </p>
          </div>
        ))}
      </section>

      <section className="sw-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Puanlama
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-erd-light p-3.5">
            <p className="text-sm font-semibold text-erd-charcoal">
              Teknik doğruluk
            </p>
            <p className="mt-1 text-xs leading-snug text-erd-gray">
              Tehlike tanıma (35), kendi donanım (20) ve yüklenici donanımı
              (20). Ham tavan 75’tir; bar 0–100’e ölçeklenir. İşletme sekmesi
              bu bara girmez.
            </p>
          </div>
          <div className="rounded-xl bg-erd-light p-3.5">
            <p className="text-sm font-semibold text-erd-charcoal">
              Kontrollük davranışı
            </p>
            <p className="mt-1 text-xs leading-snug text-erd-gray">
              Nasıl müdahale etmeliyim? kararı (25 ham puan). Teknik barın
              kopyası değildir. Yoğun otomatik yardımda (en az iki ipucu ve bir
              çözüm, veya iki hazırlık sekmesinde çözüm) gösterge en fazla 90
              olabilir.
            </p>
          </div>
          <div className="rounded-xl bg-erd-light p-3.5 sm:col-span-2">
            <p className="text-sm font-semibold text-erd-charcoal">
              Toplam gelişim puanı
            </p>
            <p className="mt-1 text-xs leading-snug text-erd-gray">
              35 + 20 + 20 + 25 = 100. Yanlış veya gereksiz seçim teknik
              doğruluğu düşürür; TAK / HEPSİNİ TAK ayrı bir yardım etkisidir.
              İkisi aynı şey sayılmaz.
            </p>
          </div>
        </div>
      </section>

      <section className="sw-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-erd-gray">
          Müdahale Seçenekleri
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {ACTIONS.map((action) => (
            <li
              key={action.code}
              className="relative overflow-hidden rounded-xl border border-erd-line p-3"
            >
              <IconWatermark
                icon={actionKindGlyph(action.kind).icon}
                tone={actionKindGlyph(action.kind).tone}
              />
              <div className="relative flex items-start gap-2.5">
                <AppIcon
                  icon={actionKindGlyph(action.kind).icon}
                  tone={actionKindGlyph(action.kind).tone}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-erd-charcoal">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-erd-gray">
                    {action.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/saha" className="sw-btn-primary">
          Saha Seçimine Git
        </Link>
        <Link href="/" className="sw-btn-ghost">
          Ana Menü
        </Link>
      </div>
    </PageShell>
  );
}
