"use client";

import { useMemo, useState } from "react";
import type { EquipmentCategory, EquipmentItem } from "@/lib/types";

interface EquipmentPickerProps {
  categories: EquipmentCategory[];
  items: EquipmentItem[];
  selected: string[];
  onToggle: (code: string) => void;
  disabled?: boolean;
}

/**
 * Ekipman ve tedbir kartları.
 * Kategori filtresi ve arama ile 45+ kart arasından hızlı seçim sağlar.
 * Kart üzerindeki bilgi düğmesi standardı ve "hangi durumda yeterli değildir"
 * açıklamasını gösterir; oyun bir sınav değil, öğretici bir antrenmandır.
 */
export default function EquipmentPicker({
  categories,
  items,
  selected,
  onToggle,
  disabled = false,
}: EquipmentPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const selectedSet = new Set(selected);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    return items
      .filter((item) =>
        activeCategory === "all" ? true : item.category_id === activeCategory
      )
      .filter((item) =>
        q.length === 0
          ? true
          : `${item.name} ${item.standard}`.toLocaleLowerCase("tr").includes(q)
      )
      .sort((a, b) => a.order_index - b.order_index);
  }, [items, activeCategory, query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ekipman ara (örn. baret, gaz, kemer)"
          className="w-full rounded-xl border border-erd-line bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-erd-gray/70 focus:border-erd-red/50"
        />
        {selected.length > 0 && (
          <span className="shrink-0 rounded-lg bg-erd-light px-3 py-2 text-xs font-semibold text-erd-gray">
            {selected.length} seçim
          </span>
        )}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <CategoryChip
          label="Tümü"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {categories
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visible.map((item) => {
          const isSelected = selectedSet.has(item.code);
          const infoOpen = openInfo === item.code;
          return (
            <div
              key={item.code}
              className={`relative rounded-xl border p-2.5 transition-colors ${
                isSelected
                  ? "border-erd-red bg-red-50/60"
                  : "border-erd-line bg-white hover:border-erd-gray/40"
              }`}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => onToggle(item.code)}
                className="flex w-full items-start gap-2 text-left disabled:opacity-60"
                aria-pressed={isSelected}
              >
                <span className="text-xl leading-none text-erd-red">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-snug text-erd-charcoal">
                    {item.name}
                  </span>
                  {item.standard && item.standard !== "—" && (
                    <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-erd-gray">
                      {item.standard}
                    </span>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOpenInfo(infoOpen ? null : item.code)}
                className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-erd-line bg-white text-[10px] font-bold text-erd-gray hover:border-erd-gray"
                aria-label={`${item.name} hakkında bilgi`}
              >
                i
              </button>

              {infoOpen && (
                <div className="mt-2 space-y-1 rounded-lg bg-erd-light p-2 text-[11px] leading-snug text-erd-charcoal">
                  <p>{item.description}</p>
                  {item.not_for && (
                    <p className="text-erd-red">
                      <span className="font-semibold">Dikkat: </span>
                      {item.not_for}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="rounded-xl bg-erd-light px-3 py-6 text-center text-sm text-erd-gray">
          Aramanıza uyan ekipman bulunamadı.
        </p>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-erd-charcoal text-white"
          : "bg-erd-light text-erd-gray hover:bg-erd-line"
      }`}
    >
      {label}
    </button>
  );
}
