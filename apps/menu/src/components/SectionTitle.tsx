export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="my-6 text-center font-[family-name:var(--font-sans)] text-[11px] font-light uppercase tracking-[0.3em] text-gold sm:text-[13px]">
      {children}
    </h2>
  );
}
