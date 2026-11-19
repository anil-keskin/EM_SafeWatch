"use client";

import ActionPicker from "@/components/ActionPicker";
import ActorBadge from "@/components/ActorBadge";
import EquipScreen from "@/components/EquipScreen";
import { FilledIcon } from "@/components/AppIcon";
import { DECISION_TABS } from "@/content/decision-tabs";
import { tabGlyph } from "@/lib/icon-theme";
import type {
  Actor,
  DecisionTab,
  EquipmentCategory,
  EquipmentItem,
  ScenarioAnswers,
} from "@/lib/types";

interface DecisionPanelProps {
  activeTab: DecisionTab;
  onTabChange: (tab: DecisionTab) => void;
  answers: ScenarioAnswers;
  onToggle: (tab: DecisionTab, code: string) => void;
  categories: EquipmentCategory[];
  equipment: EquipmentItem[];
  actors: Actor[];
  correctByTab: Record<DecisionTab, string[]>;
  usedKeys: Set<string>;
  onFillScope: (tab: DecisionTab, scopeId: string) => void;
  onFillTab: (tab: DecisionTab) => void;
}

export { DECISION_TABS };

export const DECISION_TAB_ORDER = DECISION_TABS.map((tab) => tab.id);

export function nextDecisionTab(current: DecisionTab): DecisionTab {
  const index = DECISION_TAB_ORDER.indexOf(current);
  return DECISION_TAB_ORDER[(index + 1) % DECISION_TAB_ORDER.length];
}

export function decisionTabShort(id: DecisionTab): string {
  return DECISION_TABS.find((tab) => tab.id === id)?.short ?? id;
}

const TAB_HELP: Record<DecisionTab, string> = {
  self: "İki katman vardır. Ortam (ortak): alandaki gaz, gürültü, ısı, toz, trafik veya temel saha riski — kim olursa olsun o alana giren herkes. İşe özel: yalnızca o işi fiilen yapan kişide (kaynak, sıvı metal müdahalesi, yüksekte çalışma, kimyasal temas, kapalı hacme giriş, su kenarı, sıcak iş ekibi tedbiri ve senaryodaki diğer özel işler). Siz gözlem/denetim yapıyorsanız işe özel kartı kendinize takmayın.",
  contractor:
    "Denetlediğiniz müteahhit çalışanında EKSİK olan koruyucuları işaretleyin. Bu sekme giydirme değil tespittir. Anlık ciddi ihlalde durdurma yetkiniz müdahale sekmesindedir. Eksiği yoksa hiçbir şey seçmeyin.",
  operator:
    "İşletme personeline KKD giydirmez, talimat da vermezsiniz. Ama gördüğünüz eksiği tespit edip işletme sorumlusuna ve İSG birimine bildirmek görevinizdir. Bu sekme teknik puana girmez; tespitleriniz sonuç ekranında ve tutanakta yer alır.",
  action:
    "Tespitleriniz karşısında hangi adımları atacağınızı seçin. Birden fazla aksiyon seçebilirsiniz; yetki sınırınızı gözetin.",
};

const TAB_SHORT: Record<DecisionTab, string> = {
  self: "Bu sahaya girerken SİZİN takmanız gerekenleri seçin. Karakterin vücuduna ya da bölgelere dokunun.",
  contractor: "Müteahhit çalışanında EKSİK ya da uygun olmayanı işaretleyin. Mavi rozet: şu an üzerinde.",
  operator: "İşletme personelinde EKSİK olanları işaretleyin. Talimat vermezsiniz; tespit edip doğru kanala bildirirsiniz.",
  action: "Tespitlerinize göre atacağınız adımları seçin. Yetki sınırınızı unutmayın.",
};

const ASSIST_LINE: Record<DecisionTab, string | null> = {
  self: "Takıldığınız kartta (i) puan düşürmez. Karta kendiniz tıklamak da sabit kesinti üretmez. TAK aile başına 1, HEPSİNİ TAK kesintiyi 8’e tamamlar.",
  contractor:
    "Takıldığınız kartta (i) puan düşürmez. İŞARETLE yüklenicideki eksiği yazar, ona KKD giydirmez. Aile 1, tüm sekme 8 puanlık yardım etkisidir.",
  operator: null,
  action:
    "Takıldığınız kartta (i) puan düşürmez. Karta kendiniz tıklamak kesinti üretmez. SEÇ grup başına 1, HEPSİNİ SEÇ kesintiyi 8’e tamamlar.",
};

export default function DecisionPanel({
  activeTab,
  onTabChange,
  answers,
  onToggle,
  categories,
  equipment,
  actors,
  correctByTab,
  usedKeys,
  onFillScope,
  onFillTab,
}: DecisionPanelProps) {
  const contractor = actors.find((a) => a.type === "yuklenici");
  const operator = actors.find((a) => a.type === "isletme");

  return (
    <div id="decision-panel" className="sw-card scroll-mt-[5rem]">
      <div
        id="decision-tabs"
        className="sticky top-[3.75rem] z-30 flex overflow-x-auto md:top-[4.5rem] border-b border-erd-line bg-erd-light/95 backdrop-blur-sm"
      >
        {DECISION_TABS.map((tab) => {
          const count = tab.id === "operator" ? 0 : answers[tab.id].length;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                active
                  ? "bg-white text-erd-charcoal"
                  : "text-erd-gray hover:text-erd-charcoal"
              }`}
            >
              <FilledIcon
                icon={tabGlyph(tab.id).icon}
                tone={active ? tabGlyph(tab.id).tone : "nav"}
                size={18}
              />
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {count > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-erd-red px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-erd-red" />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-xl bg-erd-light/70 px-3.5 py-2.5">
          <p className="text-sm font-medium leading-snug text-erd-charcoal">
            {TAB_SHORT[activeTab]}
          </p>
          <details className="mt-1 text-xs text-erd-gray">
            <summary className="cursor-pointer font-semibold text-erd-gray hover:text-erd-charcoal">
              Ayrıntılı kural
            </summary>
            <p className="mt-1.5 leading-snug">{TAB_HELP[activeTab]}</p>
            {ASSIST_LINE[activeTab] && (
              <p className="mt-1.5 leading-snug">{ASSIST_LINE[activeTab]}</p>
            )}
          </details>
        </div>

        {activeTab === "action" ? (
          <ActionPicker
            selected={answers.action}
            onToggle={(code) => onToggle("action", code)}
            correctCodes={correctByTab.action}
            usedKeys={usedKeys}
            onFillScope={(kind) => onFillScope("action", kind)}
            onFillAll={() => onFillTab("action")}
          />
        ) : activeTab === "self" ? (
          <EquipScreen
            key="self"
            mode="self"
            categories={categories}
            items={equipment}
            selected={answers.self}
            onToggle={(code) => onToggle("self", code)}
            caption="Siz · Kontrollük"
            correctCodes={correctByTab.self}
            requiredSelf={correctByTab.self}
            usedKeys={usedKeys}
            onFillScope={(cat) => onFillScope("self", cat)}
            onFillAll={() => onFillTab("self")}
          />
        ) : (() => {
          const isContractor = activeTab === "contractor";
          const actor = isContractor ? contractor : operator;
          if (!actor) {
            return (
              <EmptyActorNote
                text={
                  isContractor
                    ? "Bu senaryoda sahada müteahhit çalışanı bulunmuyor."
                    : "Bu senaryoda sahada işletme personeli bulunmuyor."
                }
              />
            );
          }
          return (
            <div className="space-y-3">
              <ActorLine actor={actor} />
              <EquipScreen
                key={activeTab}
                mode={isContractor ? "contractor" : "operator"}
                categories={categories}
                items={equipment}
                selected={isContractor ? answers.contractor : answers.operator}
                onToggle={(code) => onToggle(activeTab, code)}
                worn={actor.current_items ?? []}
                caption={`${actor.employer}`}
                correctCodes={correctByTab[activeTab]}
                usedKeys={usedKeys}
                onFillScope={isContractor ? (cat) => onFillScope("contractor", cat) : undefined}
                onFillAll={isContractor ? () => onFillTab("contractor") : undefined}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/** Denetlenen kişi: kim, ne yapıyor. Üzerindekiler kartlarda "Üzerinde" rozetiyle görünür. */
function ActorLine({ actor }: { actor: Actor }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-erd-line bg-white px-3 py-2">
      <ActorBadge type={actor.type} />
      <span className="text-sm font-semibold text-erd-charcoal">{actor.employer}</span>
      <span className="text-sm text-erd-gray">· {actor.activity}</span>
    </div>
  );
}

function EmptyActorNote({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-erd-light px-3.5 py-3 text-sm text-erd-gray">
      {text} Bu sekmede seçim yapmadan devam edebilirsiniz.
    </p>
  );
}
