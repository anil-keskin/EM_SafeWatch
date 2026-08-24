"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

interface CardHintProps {
  label: string;
  context: string;
  why: string;
  caution?: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

/**
 * Seçilebilir karttaki (i) popover'ı.
 * Puan düşüren senaryo ipucusundan (HintBox) ayrıdır; doğru cevabı söylemez.
 */
export default function CardHint({
  label,
  context,
  why,
  caution,
  open,
  onToggle,
  onClose,
}: CardHintProps) {
  const headingId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ top: 0, left: 8, width: 280 });

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 16);
    let left = rect.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    let top = rect.bottom + 8;
    const estimatedHeight = 180;
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 8);
    }
    setBox({ top, left, width });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onViewport = () => onClose();

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onViewport, true);
    window.addEventListener("resize", onViewport);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onViewport, true);
      window.removeEventListener("resize", onViewport);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white transition-colors ${
          open
            ? "border-[#D32F2F] text-[#D32F2F]"
            : "border-erd-line text-[#546E7A] hover:border-erd-gray hover:text-erd-charcoal"
        }`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${label} — neden seçmeliyim`}
      >
        <Info
          className="h-4 w-4"
          strokeWidth={1.7}
          fill="currentColor"
          fillOpacity={0.32}
          aria-hidden="true"
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-labelledby={headingId}
            style={{
              position: "fixed",
              top: box.top,
              left: box.left,
              width: box.width,
              zIndex: 80,
            }}
            className="rounded-xl border border-erd-line bg-white p-3 text-left shadow-lg"
          >
            <p
              id={headingId}
              className="text-[11px] font-bold uppercase tracking-wide text-erd-red"
            >
              Neden seçmeliyim?
            </p>
            <p className="mt-1.5 text-xs leading-snug text-erd-gray">{context}</p>
            {why ? (
              <p className="mt-2 text-xs leading-snug text-erd-charcoal">{why}</p>
            ) : null}
            {caution ? (
              <p className="mt-2 text-xs leading-snug text-erd-red">
                <span className="font-semibold">Seçmeyin: </span>
                {caution}
              </p>
            ) : null}
          </div>,
          document.body
        )}
    </>
  );
}
