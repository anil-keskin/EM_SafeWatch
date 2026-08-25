"use client";

import { FormEvent, useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  FEEDBACK_CATEGORIES,
  sendFeedback,
  type FeedbackCategory,
} from "@/lib/feedback";

/** Ana ekran geri bildirim formu. Gönderim Resend Netlify Function ile yapılır. */
export default function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("Hata Bildirimi");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const reset = () => {
    setCategory("Hata Bildirimi");
    setName("");
    setEmail("");
    setMessage("");
    setHoney("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (honey.trim()) return;
    const trimmed = message.trim();
    if (trimmed.length < 8) {
      setError("Lütfen mesajınızı biraz daha açın.");
      setStatus("error");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("E-posta formatını kontrol edin veya boş bırakın.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      await sendFeedback(
        { category, name, email, message: trimmed },
        honey
      );
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
      setError("Gönderilemedi. Lütfen biraz sonra yeniden deneyin.");
    }
  };

  return (
    <div className="rounded-2xl border border-erd-line/90 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 text-left"
        aria-expanded={open}
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-erd-red/10 text-erd-red">
          <MessageSquare size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-erd-charcoal">
            Geri Bildirim Gönder
          </span>
          <span className="block text-[11px] text-erd-gray">
            Hata, içerik yanlışı veya öneri
          </span>
        </span>
        <span className="text-xs font-semibold text-erd-red">
          {open ? "Kapat" : "Aç"}
        </span>
      </button>

      {open && (
        <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
              Kategori
            </span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as FeedbackCategory)
              }
              className="mt-1 w-full rounded-xl border border-erd-line bg-white px-3 py-2.5 text-sm text-erd-charcoal outline-none focus:border-erd-red/50"
            >
              {FEEDBACK_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
              Ad Soyad{" "}
              <span className="font-medium normal-case">(opsiyonel)</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-erd-line bg-white px-3 py-2.5 text-sm outline-none focus:border-erd-red/50"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
              E-posta{" "}
              <span className="font-medium normal-case">(opsiyonel)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-erd-line bg-white px-3 py-2.5 text-sm outline-none focus:border-erd-red/50"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-erd-gray">
              Mesaj
            </span>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full resize-y rounded-xl border border-erd-line bg-white px-3 py-2.5 text-sm outline-none focus:border-erd-red/50"
            />
          </label>

          <p className="hidden" aria-hidden>
            <label>
              Bot alanı
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honey}
                onChange={(e) => setHoney(e.target.value)}
              />
            </label>
          </p>

          {status === "sent" && (
            <p className="text-xs leading-relaxed text-emerald-700">
              Geri bildiriminiz alınmıştır.
            </p>
          )}
          {status === "error" && error && (
            <p className="text-xs leading-relaxed text-erd-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="sw-btn-primary w-full py-2.5 text-sm disabled:opacity-60"
          >
            {status === "sending" ? "Gönderiliyor…" : "Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
