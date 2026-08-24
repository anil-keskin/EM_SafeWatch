import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { ACTIONS } from "@/content/actions";

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
    body: "Hazırlık panelindeki (i) hangi durumda seçeceğinizi anlatır, puanınızı düşürmez. TAK / HEPSİNİ TAK ve sahnedeki HEPSİNİ BELİRLE doğru cevabı giydirir; her kullanım puanı düşürür ve gelişime açık alanı belirginleştirir. Senaryo ipucu da puan düşürür ama ilerlemeyi engellemez.",
  },
  {
    title: "Gereksiz KKD de bir uygunsuzluktur",
    body: "Eksik koruyucu kadar, göreve uygun olmayan fazladan koruyucu seçmek de değerlendirmeye girer.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Görev Kartı",
    body: "Nereye ve neden gittiğinizi, işletmenin ve müteahhidin ne yaptığını, hava ve özel durumları okursunuz.",
  },
  {
    step: "2",
    title: "Tehlike Tanıma",
    body: "Sahnedeki risk noktalarını işaretlersiniz. Bazı noktalar bilinçli olarak sahte konulmuştur. Takılırsanız HEPSİNİ BELİRLE gerçek noktaları işaretler; bu bir çözümdür ve puan düşürür.",
  },
  {
    step: "3",
    title: "Hazırlık ve Denetim",
    body: "Dört karar sekmesini doldurursunuz: kendi donanımınız, yüklenicideki eksikler, işletmedeki uygunsuzluklar ve müdahale kararınız. (i) rehberdir, puan düşürmez. TAK açık ailedeki doğruları, HEPSİNİ TAK tüm sekmenin doğrularını giydirir; çözüm puan düşürür.",
  },
  {
    step: "4",
    title: "Sonuç Kartı",
    body: "Teknik doğruluk ve kontrollük davranışı ayrı ayrı gösterilir; doğrular, eksikler ve gereksiz seçimler kurumsal bir dille açıklanır.",
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
    body: "Demir çelik fabrika personeli. Doğrudan emir verme yetkiniz YOKTUR; ilgili işletme birimine veya İSG'ye bildirirsiniz.",
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
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-erd-red text-xs font-bold text-white">
                {item.step}
              </span>
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
          <div key={rule.title} className="sw-card p-4">
            <h3 className="text-sm font-bold text-erd-charcoal">
              {rule.title}
            </h3>
            <p className="mt-1 text-sm leading-snug text-erd-gray">
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
              Tehlike tanıma, doğru KKD ailesi ve standart eşleşmesi, KKD dışı
              tedbirler, gereksiz koruyucudan kaçınma.
            </p>
          </div>
          <div className="rounded-xl bg-erd-light p-3.5">
            <p className="text-sm font-semibold text-erd-charcoal">
              Kontrollük davranışı
            </p>
            <p className="mt-1 text-xs leading-snug text-erd-gray">
              Çalışanın bağlı olduğu kuruluşu fark etme, doğru kişiye bildirme,
              gerektiğinde işi durdurma, yetki sınırını aşmama, kayıt tutma.
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
              className="rounded-xl border border-erd-line p-3"
            >
              <p className="text-sm font-semibold text-erd-charcoal">
                {action.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-erd-gray">
                {action.description}
              </p>
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
