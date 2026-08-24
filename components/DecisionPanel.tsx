"use client";

import ActionPicker from "@/components/ActionPicker";
import ActorBadge from "@/components/ActorBadge";
import EquipmentPicker from "@/components/EquipmentPicker";
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

const TABS: Array<{ id: DecisionTab; label: string; short: string }> = [
  { id: "self", label: "Ben ne kullanmalıyım?", short: "Ben" },
  { id: "contractor", label: "Yüklenici ne kullanmalı?", short: "Yüklenici" },
  { id: "operator", label: "İşletmede ne eksik?", short: "İşletme" },
  { id: "action", label: "Nasıl müdahale etmeliyim?", short: "Müdahale" },
];

const TAB_HELP: Record<DecisionTab, string> = {
  self: "Bu göreve çıkarken kendi üzerinizde bulunması gereken koruyucuları, alan tedbirlerini ve giriş koşullarını işaretleyin. Gereksiz seçim de bir uygunsuzluktur.",
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
      <div className="flex overflow-x-auto border-b border-erd-line bg-erd-light">
        {TABS.map((tab) => {
          const count = answers[tab.id].length;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative shrink-0 px-4 py-3 text-xs font-semibold transition-colors sm:text-sm ${
                active
                  ? "bg-white text-erd-charcoal"
                  : "text-erd-gray hover:text-erd-charcoal"
              }`}
            >
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
        {current.map((code) => (
          <li
            key={code}
            className="rounded-lg border border-erd-line bg-white px-2 py-1 text-[11px] font-medium text-erd-charcoal"
          >
            {byCode.get(code)?.icon} {byCode.get(code)?.name ?? code}
          </li>
        ))}
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
