"use client";

import ActionPicker from "@/components/ActionPicker";
import ActorBadge from "@/components/ActorBadge";
import EquipmentGlyph from "@/components/EquipmentGlyph";
import EquipmentPicker from "@/components/EquipmentPicker";
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
    "Denetlediğiniz müteahhit çalışanında EKSİK olan koruyucuları işaretleyin. Eksiği yoksa hiçbir şey seçmeyin.",
  operator:
    "İşletme personelinde gözlemlediğiniz uygunsuzlukları işaretleyin. Bu kişilere doğrudan talimat veremezsiniz, ancak tespiti doğru kanala iletmelisiniz. Uygunsuzluk yoksa boş bırakın.",
  action:
    "Tespitleriniz karşısında hangi adımları atacağınızı seçin. Birden fazla aksiyon seçebilirsiniz; yetki sınırınızı gözetin.",
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
    <div className="sw-card">
      <div
        id="decision-tabs"
        className="sticky top-[4.5rem] z-30 flex scroll-mt-[4.75rem] overflow-x-auto border-b border-erd-line bg-erd-light/95 backdrop-blur-sm"
      >
        {DECISION_TABS.map((tab) => {
          const count = answers[tab.id].length;
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
        <p className="text-xs leading-snug text-erd-gray">
          {TAB_HELP[activeTab]}
        </p>
        <p className="text-[11px] leading-snug text-erd-gray">
          Takıldığınız kartta{" "}
          <span className="font-semibold text-erd-charcoal">(i)</span> puan
          düşürmez. TAK / SEÇ / HEPSİNİ TAK doğru cevabı giydirir ve puanınızı
          düşürür.
        </p>

        {activeTab === "contractor" && contractor && (
          <ObservedActor actor={contractor} equipment={equipment} />
        )}
        {activeTab === "operator" && operator && (
          <ObservedActor actor={operator} equipment={equipment} />
        )}
        {activeTab === "contractor" && !contractor && (
          <EmptyActorNote text="Bu senaryoda sahada müteahhit çalışanı bulunmuyor." />
        )}
        {activeTab === "operator" && !operator && (
          <EmptyActorNote text="Bu senaryoda sahada işletme personeli bulunmuyor." />
        )}

        {activeTab === "action" ? (
          <ActionPicker
            selected={answers.action}
            onToggle={(code) => onToggle("action", code)}
            correctCodes={correctByTab.action}
            usedKeys={usedKeys}
            onFillScope={(kind) => onFillScope("action", kind)}
            onFillAll={() => onFillTab("action")}
          />
        ) : (
          <EquipmentPicker
            tab={activeTab}
            categories={categories}
            items={equipment}
            selected={answers[activeTab]}
            onToggle={(code) => onToggle(activeTab, code)}
            correctCodes={correctByTab[activeTab]}
            requiredSelf={correctByTab.self}
            usedKeys={usedKeys}
            onFillScope={(categoryId) => onFillScope(activeTab, categoryId)}
            onFillAll={() => onFillTab(activeTab)}
          />
        )}
      </div>
    </div>
  );
}

/** Denetlenen kişinin şu an üzerinde ne olduğunu gösteren gözlem kartı. */
function ObservedActor({
  actor,
  equipment,
}: {
  actor: Actor;
  equipment: EquipmentItem[];
}) {
  const byCode = new Map(equipment.map((e) => [e.code, e]));
  const current = actor.current_items ?? [];

  return (
    <div className="rounded-xl border border-erd-line bg-erd-light p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <ActorBadge type={actor.type} />
        <span className="text-sm font-semibold text-erd-charcoal">
          {actor.employer}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-snug text-erd-charcoal">
        {actor.activity}
      </p>
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
        Şu an üzerinde gözlemlenenler
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {current.length === 0 && (
          <li className="text-xs text-erd-gray">
            Gözlemlenebilir bir koruyucu yok.
          </li>
        )}
        {current.map((code) => {
          const item = byCode.get(code);
          return (
            <li
              key={code}
              className="flex items-center gap-1.5 rounded-lg border border-erd-line bg-white px-2 py-1 text-[11px] font-medium text-erd-charcoal"
            >
              {item && (
                <EquipmentGlyph
                  code={item.code}
                  categoryId={item.category_id}
                  size="xs"
                />
              )}
              {item?.name ?? code}
            </li>
          );
        })}
      </ul>
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
