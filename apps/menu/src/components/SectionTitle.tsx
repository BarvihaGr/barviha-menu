export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="my-6 flex items-center gap-4 text-base uppercase tracking-[0.2em] text-gold font-light">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      <span className="px-2 whitespace-nowrap">{children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </h2>
  );
}
