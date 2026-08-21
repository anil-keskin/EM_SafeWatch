import { Bell, Shield, Target, Users } from "lucide-react";

const PRINCIPLES = [
  { icon: Shield, top: "Güvenli Çalış", bottom: "Kendini Koru" },
  { icon: Users, top: "Doğru Donan", bottom: "Doğru Kullan" },
  { icon: Bell, top: "Fark Et", bottom: "Bildir, Önle" },
  { icon: Target, top: "HEDEFİMİZ", bottom: "Sıfır Kaza", emphasize: true },
];

/** Ana sayfanın altındaki koyu ilke şeridi. */
export default function PrinciplesBar() {
  return (
    <footer className="relative overflow-hidden bg-erd-charcoal">
      <svg
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-40 text-erd-red opacity-90"
        viewBox="0 0 160 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M40 80 C90 70 110 20 160 0 V80 Z" />
      </svg>

      <ul className="relative mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
        {PRINCIPLES.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.top}
              className="flex items-center gap-3 px-4 py-4 sm:justify-center sm:px-6"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-erd-red/40 text-erd-red">
                <Icon size={18} strokeWidth={2} />
              </span>
              <span className="leading-tight">
                <span
                  className={`block text-xs font-bold uppercase tracking-wide ${
                    item.emphasize ? "text-erd-red" : "text-white"
                  }`}
                >
                  {item.top}
                </span>
                <span className="block text-[11px] text-white/70">{item.bottom}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}
