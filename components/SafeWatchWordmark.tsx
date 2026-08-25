/**
 * SafeWatch yazı markası.
 * Safe: Erdemir logosu grisi (`brand-safe-gray`).
 * Watch: mevcut Erdemir kırmızısı (`erd-red`).
 */
export default function SafeWatchWordmark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={className}>
      <span className="text-brand-safe-gray">Safe</span>
      <span className="text-erd-red">Watch</span>
    </span>
  );
}
