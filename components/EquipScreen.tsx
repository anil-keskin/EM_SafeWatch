"use client";

import { useMemo, useState } from "react";
import { Check, Lightbulb, Wand2 } from "lucide-react";
import AppIcon from "@/components/AppIcon";
import CardHint from "@/components/CardHint";
import EquipmentGlyph from "@/components/EquipmentGlyph";
import WorkerAvatar from "@/components/WorkerAvatar";
import { TAB_SELECT_CONTEXT, whySelectFor } from "@/content/card-hints";
import { riskLayerFor, riskLayerLabel } from "@/lib/equipment-layers";
import { categoryGlyph, categoryTone } from "@/lib/icon-theme";
import { SOLUTION_CATEGORY_PENALTY, SOLUTION_FULL_PENALTY } from "@/lib/scoring";
import { codesInCategory, isExactSolved, isScopeSolved } from "@/lib/solutions";
import type { EquipmentCategory, EquipmentItem } from "@/lib/types";

const SHORT: Record<string, string> = {
  bas: "Baş", goz: "Göz/Yüz", solunum: "Solunum", isitme: "İşitme", el: "El", ayak: "Ayak",
  govde: "Gövde", yuksekte: "Yüksekte", olcum: "Ölçüm", alan: "Alan", dokuman: "Doküman",
};

export type EquipMode = "self" | "contractor" | "operator";

const MODE_TEXT: Record<EquipMode, { pickVerb: string; done: string; zoneHint: string }> = {
  self: { pickVerb: "Tak", done: "Takıldı", zoneHint: "Bu bölge için ne takarsınız?" },
  contractor: { pickVerb: "Eksik", done: "Eksik", zoneHint: "Bu bölgede eksik ya da uygun olmayan var mı?" },
  operator: { pickVerb: "Eksik", done: "Eksik", zoneHint: "İşletme personelinde bu bölgede eksik var mı?" },
};

/**
 * Karakter ekipman ekranı (rol yapma oyunlarındaki "envanter" düzeni).
 * Ortada karakter, solda bölge yuvaları; bölgeye dokununca yalnızca o
 * ailenin kartları açılır. Yüklenici/işletme modunda kişinin üzerindekiler
 * "Üzerinde" rozetiyle görünür; oyuncu eksik olanı işaretler.
 */
export default function EquipScreen({
  mode,
  categories,
  items,
  selected,
  onToggle,
  worn = [],
  caption,
  correctCodes,
  requiredSelf,
  usedKeys,
  onFillScope,
  onFillAll,
}: {
  mode: EquipMode;
  categories: EquipmentCategory[];
  items: EquipmentItem[];
  selected: string[];
  onToggle: (code: string) => void;
  worn?: string[];
  caption: string;
  correctCodes: string[];
  requiredSelf?: string[];
  usedKeys: Set<string>;
  onFillScope?: (categoryId: string) => void;
  onFillAll?: () => void;
}) {
  const cats = useMemo(
    () => categories.slice().sort((a, b) => a.order_index - b.order_index),
    [categories]
  );
  const [active, setActive] = useState<string>(cats[0]?.id ?? "bas");
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const selectedSet = new Set(selected);
  const wornSet = new Set(worn);
  const text = MODE_TEXT[mode];
  const assistTab = mode === "operator" ? null : mode;

  const catItems = (id: string) =>
    items.filter((i) => i.category_id === id).sort((a, b) => a.order_index - b.order_index);
  const visible = catItems(active);
  const activeCat = cats.find((c) => c.id === active);
  const activeIndex = cats.findIndex((c) => c.id === active);
  const scopeCodes = codesInCategory(items, active);
  const scopeSolved = isScopeSolved(selected, correctCodes, scopeCodes);
  const tabSolved = isExactSolved(selected, correctCodes);
  const scopeHelpUsed = assistTab ? usedKeys.has(`${assistTab}:cat:${active}`) || usedKeys.has(`${assistTab}:all`) : false;
  const allHelpUsed = assistTab ? usedKeys.has(`${assistTab}:all`) : false;

  const pickZone = (id: string) => {
    setActive(id);
    setOpenInfo(null);
  };

  return (
    <div className="@container">
      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 @3xl:grid-cols-[13rem_minmax(0,1fr)] @3xl:gap-4">
        {/* Karakter */}
        <div className="self-start @3xl:sticky @3xl:top-36 @3xl:row-span-3">
          <div className="w-full">
            <WorkerAvatar
              equipment={items}
              worn={mode === "self" ? selected : worn}
              flagged={mode === "self" ? [] : selected}
              caption={caption}
              tone={mode === "self" ? "self" : mode === "contractor" ? "contractor" : "operator"}
              onZone={pickZone}
              activeZone={active}
            />
          </div>
        </div>

          {/* bölge yuvaları */}
          <div className="grid min-w-0 grid-cols-3 content-start gap-1.5 @3xl:flex @3xl:flex-wrap">
            {cats.map((c) => {
              const ids = catItems(c.id).map((i) => i.code);
              const picked = ids.filter((code) => selectedSet.has(code)).length;
              const on = ids.filter((code) => wornSet.has(code)).length;
              const isActive = c.id === active;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickZone(c.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1.5 text-[10px] font-semibold leading-tight transition-all @3xl:flex-row @3xl:gap-1.5 @3xl:px-2.5 @3xl:text-xs ${
                    isActive
                      ? "border-erd-charcoal bg-erd-charcoal text-white shadow-md"
                      : "border-erd-line bg-white text-erd-charcoal hover:border-erd-gray/50"
                  }`}
                >
                  <AppIcon icon={categoryGlyph(c.id)} tone={categoryTone(c.id)} size="xs" onDark={isActive} />
                  {SHORT[c.id] ?? c.name}
                  {picked > 0 && (
                    <span
                      className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-white @3xl:static @3xl:ring-0 ${
                        mode === "self" ? "bg-emerald-500" : "bg-erd-red"
                      }`}
                    >
                      {picked}
                    </span>
                  )}
                  {mode !== "self" && on > 0 && picked === 0 && (
                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sky-400 @3xl:static" title="Üzerinde bu bölgeden donanım var" />
                  )}
                </button>
              );
            })}
          </div>

          {/* aktif bölge */}
          <div className="col-span-2 min-w-0 rounded-2xl border border-erd-line bg-erd-light/40 p-3 @3xl:col-span-1 @3xl:col-start-2 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-erd-gray">
                  {activeIndex + 1}/{cats.length} · {activeCat?.name}
                </p>
                <p className="text-sm font-bold text-erd-charcoal">{text.zoneHint}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {assistTab && onFillScope && (
                  <button
                    type="button"
                    onClick={() => onFillScope(active)}
                    disabled={scopeSolved}
                    className="inline-flex items-center gap-1 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Bu bölgenin doğrusunu gösterir"
                  >
                    <Lightbulb size={13} /> Bu bölgeyi göster {scopeHelpUsed ? "" : `−${SOLUTION_CATEGORY_PENALTY}`}
                  </button>
                )}
                {activeIndex < cats.length - 1 && (
                  <button
                    type="button"
                    onClick={() => pickZone(cats[activeIndex + 1].id)}
                    className="rounded-lg bg-erd-charcoal px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-black"
                  >
                    Sonraki bölge →
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 @xl:grid-cols-3">
              {visible.map((item) => {
                const isSel = selectedSet.has(item.code);
                const isWorn = wornSet.has(item.code);
                const infoOpen = openInfo === item.code;
                return (
                  <div
                    key={item.code}
                    className={`relative rounded-2xl border-2 bg-white transition-all duration-200 ${
                      isSel
                        ? mode === "self"
                          ? "border-emerald-500 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.9)]"
                          : "border-erd-red shadow-[0_8px_20px_-12px_rgba(225,37,27,0.9)]"
                        : "border-transparent ring-1 ring-erd-line hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggle(item.code)}
                      aria-pressed={isSel}
                      className="flex h-full w-full flex-col items-start gap-1.5 p-3 pr-9 text-left"
                    >
                      <span className={`transition-transform ${isSel ? "scale-110" : ""}`}>
                        <EquipmentGlyph code={item.code} categoryId={item.category_id} size="md" />
                      </span>
                      <span className="text-[13px] font-bold leading-tight text-erd-charcoal">{item.name}</span>
                      <span className="mt-auto flex flex-wrap gap-1">
                        {isWorn && (
                          <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">Üzerinde</span>
                        )}
                        {item.standard && item.standard !== "—" && (
                          <span className="rounded-md bg-erd-charcoal/5 px-1.5 py-0.5 text-[10px] font-semibold text-erd-gray">
                            {item.standard}
                          </span>
                        )}
                        {mode === "self" && (
                          <span className="rounded-md bg-erd-charcoal/5 px-1.5 py-0.5 text-[10px] text-erd-gray">
                            {riskLayerLabel(riskLayerFor(item.code, requiredSelf))}
                          </span>
                        )}
                      </span>
                    </button>
                    {isSel && (
                      <span
                        className={`sw-pop pointer-events-none absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-white ${
                          mode === "self" ? "bg-emerald-500" : "bg-erd-red"
                        }`}
                        aria-hidden
                      >
                        {mode === "self" ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-black">!</span>}
                      </span>
                    )}
                    <div className="absolute right-1.5 top-1.5">
                      <CardHint
                        label={item.name}
                        context={TAB_SELECT_CONTEXT[mode === "operator" ? "contractor" : mode]}
                        why={item.why_select?.trim() || whySelectFor(item.code, item.description)}
                        caution={item.not_for || undefined}
                        open={infoOpen}
                        onToggle={() => setOpenInfo(infoOpen ? null : item.code)}
                        onClose={() => setOpenInfo(null)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {visible.length === 0 && (
              <p className="py-6 text-center text-sm text-erd-gray">Bu bölgede kart yok.</p>
            )}
          </div>

          {assistTab && onFillAll && (
            <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-erd-gray @3xl:col-span-1 @3xl:col-start-2">
              <span>
                {selected.length} {mode === "self" ? "donanım seçildi" : "eksik işaretlendi"} · (i) açıklamaları puan düşürmez
              </span>
              <button
                type="button"
                onClick={onFillAll}
                disabled={tabSolved}
                className="inline-flex items-center gap-1 font-semibold text-erd-gray underline-offset-2 hover:text-erd-charcoal hover:underline disabled:opacity-40"
              >
                <Wand2 size={12} /> Tümünü göster {allHelpUsed ? "" : `(−${SOLUTION_FULL_PENALTY})`}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
