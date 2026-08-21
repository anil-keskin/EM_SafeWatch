export default function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
