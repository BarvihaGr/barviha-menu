/** Показывается вместо каталога, когда локацию выключили в бэк-офисе (is_active: false). */
export function LocationClosedScreen({ locationName }: { locationName: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <div className="text-4xl text-gold-dark opacity-40">◈</div>
      <h1 className="text-xl font-light tracking-[0.05em] text-cream">{locationName}</h1>
      <p className="max-w-xs text-sm text-muted">
        Меню временно недоступно онлайн. Пожалуйста, обратитесь к нашему персоналу.
      </p>
    </div>
  );
}
