export function NotOnboarded({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-24 text-center">
      <h1 className="text-lg font-medium text-[color:var(--text)]">{name}</h1>
      <p className="max-w-sm text-sm text-[color:var(--muted)]">
        Контент этой локации пока не перенесён в панель. Сейчас редактируется только Арка — она станет
        шаблоном, по которому подключим остальные точки.
      </p>
    </div>
  );
}
