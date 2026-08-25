import type { ActionOption } from "@/lib/types";

/**
 * Müdahale sekmesindeki sabit aksiyon listesi.
 * Senaryolar bu kodlara referans verir (correct_actions / wrong_actions).
 */
export const ACTIONS: ActionOption[] = [
  {
    code: "gozleme_devam",
    label: "Gözleme devam et",
    description:
      "Ek bir tedbir almadan gözlemi sürdürürsünüz. Yalnızca kayda değer bir uygunsuzluk yoksa doğrudur.",
    kind: "gozlem",
  },
  {
    code: "durdur_muteahhit",
    label: "Müteahhit işini durdur",
    description:
      "Sözleşme kapsamındaki yetkinizle yüklenici çalışmasını durdurursunuz. Anlık ve ciddi risklerde kullanılır. İşletme personelinin işini durduramazsınız.",
    kind: "durdurma",
  },
  {
    code: "bildir_firma",
    label: "Firma saha sorumlusuna bildir",
    description:
      "Yüklenici firmanın kendi saha sorumlusunu çağırıp uygunsuzluğu giderme sorumluluğunu ona verirsiniz.",
    kind: "bildirim",
  },
  {
    code: "bildir_isletme",
    label: "İşletme sorumlusuna bildir",
    description:
      "İşletme personeline KKD giydiremez, doğrudan talimat veremezsiniz; tespiti ilgili işletme birim sorumlusuna iletirsiniz.",
    kind: "bildirim",
  },
  {
    code: "bildir_isg",
    label: "Demir çelik İSG birimine bildir",
    description:
      "İşletme kaynaklı ciddi uygunsuzluklarda tesisin İSG birimini devreye alırsınız.",
    kind: "bildirim",
  },
  {
    code: "ekibi_cikar",
    label: "Kontrollük ekibini risk alanından çıkar",
    description:
      "Kendi ekibiniz üzerinde tam yetkilisiniz. Riski gideremiyorsanız maruziyeti sonlandırırsınız.",
    kind: "durdurma",
  },
  {
    code: "izin_kontrol",
    label: "İş izin şartlarını yeniden kontrol ettir",
    description:
      "İzin kapsamı, ölçüm geçerliliği ve şartların sahadaki karşılığını yeniden doğrulatırsınız.",
    kind: "bildirim",
  },
  {
    code: "kayit_al",
    label: "Uygunsuzluğu kayıt altına al",
    description:
      "Tespiti tarih, yer ve fotoğrafla kaydedersiniz. Tekrarını önlemenin ve izlenebilirliğin temelidir.",
    kind: "kayit",
  },
];

export const ACTION_BY_CODE = new Map(ACTIONS.map((a) => [a.code, a]));

export function actionLabel(code: string): string {
  return ACTION_BY_CODE.get(code)?.label ?? code;
}
