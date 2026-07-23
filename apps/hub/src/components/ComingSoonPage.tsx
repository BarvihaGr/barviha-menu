export function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8">
      <div className="flex max-w-md flex-col items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <span className="rounded-full bg-[color:var(--accent)]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--accent)]">
          Скоро
        </span>
        <h1 className="glitch-text text-xl font-black tracking-tight text-[color:var(--text)]">{title}</h1>
        <p className="text-sm text-[color:var(--muted)]">{description}</p>
      </div>
    </div>
  );
}
