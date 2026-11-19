/**
 * Saha diyaloğu: yetki sınırı ve iletişim antrenmanı.
 *
 * Turlar senaryonun kendi verisinden üretilir (yüklenici eksikleri, işletme
 * personeli, iş izni, doğru aksiyonlar). Böylece her senaryoda ayrı içerik
 * yazmadan gerçekçi bir saha konuşması çıkar. Her seçeneğin gerekçesi
 * kurumsal ve öğretici dilde yazılmıştır.
 */

import type { EquipmentItem, Scenario } from "@/lib/types";

export type Verdict = "dogru" | "yetki" | "zayif";

export interface DialogueOption {
  id: string;
  text: string;
  verdict: Verdict;
  feedback: string;
  /** Karşı tarafın bu cevaba tepkisi. */
  reply: string;
}

export interface DialogueRound {
  id: string;
  speaker: { role: "yuklenici" | "isletme"; title: string; org: string };
  situation: string;
  line: string;
  options: DialogueOption[];
}

export interface DialoguePick {
  roundId: string;
  optionId: string;
  verdict: Verdict;
}

export interface DialogueResult {
  correct: number;
  total: number;
  picks: (DialoguePick & { line: string; answer: string; feedback: string; speaker: string })[];
}

const WEARABLE = new Set(["bas", "goz", "solunum", "isitme", "el", "ayak", "govde", "yuksekte", "olcum"]);

/** Seçenek sırası senaryoya göre sabit ama doğru cevap hep aynı yerde değil. */
function shuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildDialogue(scenario: Scenario, equipment: EquipmentItem[]): DialogueRound[] {
  const byCode = new Map(equipment.map((e) => [e.code, e]));
  const name = (code: string) => byCode.get(code)?.name ?? code;
  const contractor = scenario.actors.find((a) => a.type === "yuklenici");
  const operator = scenario.actors.find((a) => a.type === "isletme");
  const actions = new Set(scenario.correct_actions);
  const rounds: DialogueRound[] = [];

  // 1) Yüklenici şefi eksik KKD için göz yumulmasını ister.
  const gap = scenario.contractor_gaps.find((c) => WEARABLE.has(byCode.get(c)?.category_id ?? ""));
  if (contractor && gap) {
    const item = name(gap);
    const stop = actions.has("durdur_muteahhit");
    rounds.push({
      id: "kkd-pazarlik",
      speaker: { role: "yuklenici", title: "Müteahhit saha şefi", org: contractor.employer },
      situation: `${item} eksikliğini fark ettiniz ve ekibe söylediniz. Saha şefi yanınıza geliyor.`,
      line: `Şefim, ${item.toLocaleLowerCase("tr")} şu an depoda kaldı. İş beş dakikalık, bitirince hemen takarız. Bu seferlik göz yumun, iş programı sıkışık.`,
      options: shuffle(
        [
          {
            id: "net",
            text: stop
              ? `Olmaz. ${item} gelmeden bu iş devam etmez; çalışmayı şu an durduruyorum. Firma saha sorumlunuza da bildiriyorum.`
              : `${item} tamamlanmadan bu noktada çalışma yok. Eksik gelene kadar bekleyin; durumu firma sorumlunuza iletip kayda alıyorum.`,
            verdict: "dogru" as const,
            feedback:
              "KKD eksikliği pazarlık konusu değildir. Yüklenici çalışmasını durdurma yetkiniz sözleşme kapsamındadır; eksiği firma saha sorumlusuna iletmek doğru kanaldır. Net, sakin ve gerekçeli talimat işbirliğini korur.",
            reply: "Tamam şefim, haklısınız. Hemen getirtiyorum, gelene kadar kimse başlamıyor.",
          },
          {
            id: "goz-yum",
            text: "Peki, çabuk bitirin ama bir dahakine dikkat edin.",
            verdict: "zayif" as const,
            feedback:
              "Göz yummak uygunsuzluğu onaylamaktır. Bir olay olursa kayıtlara 'kontrollük gördü ve izin verdi' olarak geçer. Beş dakikalık işler, kazaların en sık görüldüğü işlerdir.",
            reply: "Sağ olun şefim, iki dakikada bitiriyoruz.",
          },
          {
            id: "kendi-kkd",
            text: `Al, bende yedek ${item.toLocaleLowerCase("tr")} var; bunu tak, devam edin.`,
            verdict: "zayif" as const,
            feedback:
              "İyi niyetli ama yanlış. KKD temini, uygunluğu ve eğitimi çalışanın işvereninin, yani yüklenicinin yükümlülüğüdür (6331 sayılı Kanun, KKD Kullanımı Hakkında Yönetmelik). Kendi donanımınızı vermek sistemi atlar ve sorumluluğu üstlenmenize yol açar.",
            reply: "Eyvallah şefim, siz olmasanız ne yapardık.",
          },
          {
            id: "tehdit",
            text: "Sizi bu sahadan attırırım, firmanıza ceza kesilecek!",
            verdict: "zayif" as const,
            feedback:
              "Tehdit dili eksiği çözmez, işbirliğini bozar ve sahada gizlemeyi artırır. Yaptırımı sözleşme süreci belirler; sizin işiniz net talimat ve doğru kanala bildirimdir.",
            reply: "Abi niye bağırıyorsun, tamam getiriyoruz...",
          },
        ],
        scenario.slug + "r1"
      ),
    });
  }

  // 2) İşletme ile yetki sınırı.
  if (operator) {
    const opGap = scenario.operator_gaps[0];
    if (opGap) {
      const item = name(opGap);
      rounds.push({
        id: "isletme-yetki",
        speaker: { role: "isletme", title: "İşletme personeli", org: operator.employer },
        situation: `İşletme personelinde ${item.toLocaleLowerCase("tr")} eksik. Uyardığınızda tepki geliyor.`,
        line: "Kontrolör bey, biz işletmeyiz. Bizim KKD'mize siz karışamazsınız, siz müteahhide bakın.",
        options: shuffle(
          [
            {
              id: "kanal",
              text: `Size talimat vermiyorum. Ama ${item.toLocaleLowerCase("tr")} eksikliğini işletme sorumlunuza ve İSG birimine bildiriyorum; kaydını da alıyorum.`,
              verdict: "dogru" as const,
              feedback:
                "Doğru. İşletme personeline doğrudan talimat yetkiniz yoktur, ama gördüğünüz tehlikeyi tehlikenin sahibine (işletme sorumlusu) ve kurumsal İSG birimine bildirmek yükümlülüğünüzdür.",
              reply: "Peki, siz bildirin. Amirim gelince konuşuruz.",
            },
            {
              id: "talimat",
              text: `Ben kontrolüm. ${item} takmadan burada çalışamazsın, hemen alanı terk et!`,
              verdict: "yetki" as const,
              feedback:
                "Yetki aşımı. Niyetiniz doğru olsa da işletme personeline talimat veremezsiniz; bu sorumluluk karmaşası yaratır ve işletmeyle ilişkiyi zedeler. Doğru yol işletme sorumlusu ve İSG birimine bildirmektir.",
              reply: "Sen kimsin de bana alan terk ettiriyorsun? Amirime şikâyet edeceğim.",
            },
            {
              id: "sessiz",
              text: "Haklısınız, beni ilgilendirmez.",
              verdict: "zayif" as const,
              feedback:
                "Yetkiniz olmaması sorumluluğunuzun olmadığı anlamına gelmez. Gördüğünüz tehlikeyi bildirmemek, bir olay sonrası 'gördü ama söylemedi' sonucunu doğurur.",
              reply: "Tamam o zaman.",
            },
          ],
          scenario.slug + "r2"
        ),
      });
    } else {
      rounds.push({
        id: "izolasyon",
        speaker: { role: "isletme", title: "İşletme vardiya amiri", org: operator.employer },
        situation: "İşletme vardiya amiri telsizden size ulaşıyor.",
        line: "Bizim ekip yetişemiyor. Müteahhit başlamadan önce hattaki vanayı sizin ekip kapatıversin, iş hızlansın.",
        options: shuffle(
          [
            {
              id: "isletme-sorumlu",
              text: "İzolasyon işletmenin sorumluluğunda. Vanayı sizin yetkili personeliniz kapatıp kilitlemeli; teyidi iş iznine işlendikten sonra iş başlar.",
              verdict: "dogru" as const,
              feedback:
                "Doğru. Enerji/akış izolasyonu ve kilitleme işletmenin sorumluluğundadır. Kontrollük izolasyonu yapmaz, teyit edilip iş iznine işlendiğini kontrol eder.",
              reply: "Anlaşıldı, operatörü gönderiyorum. Kilit-etiket yapılınca haber veririz.",
            },
            {
              id: "biz-kapatalim",
              text: "Tamam, bizim ekipten biri kapatsın, beklemeyelim.",
              verdict: "yetki" as const,
              feedback:
                "Yetki aşımı. İşletmenin tesisatına müdahale etmek sizin görev tanımınızda değildir; yanlış vana, eksik kilitleme veya izinsiz müdahale ciddi olaylara yol açar.",
              reply: "Süper, hangi vana olduğunu çocuklara tarif ederim.",
            },
            {
              id: "bekle",
              text: "Bizi ilgilendirmez, siz bilirsiniz.",
              verdict: "zayif" as const,
              feedback:
                "Müdahale etmemek doğru ama yeterli değil. İzolasyonun nasıl yapılacağını netleştirmek ve iş izni teyidi olmadan işin başlamayacağını belirtmek kontrollüğün işidir.",
              reply: "Peki, bakarız bir şekilde.",
            },
          ],
          scenario.slug + "r2b"
        ),
      });
    }
  }

  // 3) İş izni / ölçüm güncelliği.
  if (actions.has("izin_kontrol") && contractor) {
    rounds.push({
      id: "izin",
      speaker: { role: "yuklenici", title: "Müteahhit saha şefi", org: contractor.employer },
      situation: scenario.briefing.is_izni
        ? `İş izni notu: "${scenario.briefing.is_izni}"`
        : "İş izninin koşulları sahadaki durumla örtüşmüyor.",
      line: "İzin sabah imzalandı, ölçüm de yapıldı. Tekrar ölçtürmeye gerek yok, başlayalım.",
      options: shuffle(
        [
          {
            id: "yeniden",
            text: "İzin, ölçüm anındaki koşullar için geçerlidir. Süre geçti ve koşullar değişti; ölçüm tekrarlanıp izne işlenmeden başlamayın.",
            verdict: "dogru" as const,
            feedback:
              "Doğru. İş izni bir kâğıt değil, belirli koşullara verilmiş onaydır. Ölçümün üzerinden zaman geçtiyse veya ortam değiştiyse izin şartları yeniden kontrol ettirilir.",
            reply: "Peki şefim, ölçüm ekibini çağırıyorum.",
          },
          {
            id: "imzaliysa",
            text: "İmzalıysa sorun yok, başlayabilirsiniz.",
            verdict: "zayif" as const,
            feedback:
              "İmza, koşulların hâlâ geçerli olduğunu göstermez. Gaz birikmesi, sıcaklık veya kapsam değişikliği izni geçersiz kılabilir.",
            reply: "Tamamdır, başlıyoruz.",
          },
          {
            id: "ben-olcerim",
            text: "Ben dedektörümle bakayım, temizse ben onay veririm, başlarsınız.",
            verdict: "yetki" as const,
            feedback:
              "Yetki aşımı. Kişisel dedektörünüz kendi güvenliğiniz içindir. Giriş öncesi ölçümü resmileştirmek ve izni onaylamak iş izni sisteminin yetkilisine aittir.",
            reply: "Siz ölçtüyseniz tamam, başlıyoruz o zaman.",
          },
        ],
        scenario.slug + "r3"
      ),
    });
  }

  // 4) Kayıt: "tutanağa yazmasanız?"
  if (contractor) {
    rounds.push({
      id: "kayit",
      speaker: { role: "yuklenici", title: "Müteahhit saha şefi", org: contractor.employer },
      situation: "Eksikler giderildi. Ayrılmadan önce şef bir ricada bulunuyor.",
      line: "Şefim eksikleri tamamladık. Tutanağa yazmasanız olmaz mı? Firmada başımız ağrır.",
      options: shuffle(
        [
          {
            id: "kayit-al",
            text: "Kayda alıyorum. Amaç ceza değil, tekrarını önlemek. Giderildiğini de aynı tutanağa yazıyorum.",
            verdict: "dogru" as const,
            feedback:
              "Doğru. Kayıt altına alınmayan uygunsuzluk izlenemez ve tekrar eder. Giderildiğini de yazmak hem adil hem de iyi bir kontrollük pratiğidir.",
            reply: "Peki, giderildi diye de yazarsanız sorun yok.",
          },
          {
            id: "yazmam",
            text: "Madem giderildi, bu seferlik yazmıyorum.",
            verdict: "zayif" as const,
            feedback:
              "Kayıtsız uygunsuzluk, istatistikte görünmez ve kök neden analizi yapılamaz. Aynı eksik başka vardiyada tekrar eder.",
            reply: "Sağ olun şefim, unutmayız.",
          },
          {
            id: "pazarlik",
            text: "Yazmam ama bundan sonra her eksiğiniz için sözleşme cezası işletirim.",
            verdict: "zayif" as const,
            feedback:
              "Kayıt ile yaptırım arasında pazarlık yapılmaz. Kayıt standart prosedürdür; yaptırım kararı sözleşme yönetimine aittir.",
            reply: "Anlaştık şefim.",
          },
        ],
        scenario.slug + "r4"
      ),
    });
  }

  return rounds;
}

export function summarizeDialogue(rounds: DialogueRound[], picks: DialoguePick[]): DialogueResult {
  const seen = new Set<string>();
  const rows = picks
    .filter((p) => (seen.has(p.roundId) ? false : (seen.add(p.roundId), true)))
    .map((p) => {
      const round = rounds.find((r) => r.id === p.roundId);
      const option = round?.options.find((o) => o.id === p.optionId);
      if (!round || !option) return null;
      return {
        ...p,
        line: round.line,
        answer: option.text,
        feedback: option.feedback,
        speaker: `${round.speaker.title} · ${round.speaker.org}`,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  return {
    correct: rows.filter((r) => r.verdict === "dogru").length,
    total: rounds.length,
    picks: rows,
  };
}
