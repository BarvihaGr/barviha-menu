/** Мгновенный скелетон при переходе в раздел — тап ощущается быстрым, без пустого ожидания. */
export default function CategoryLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-[#E7C994]/10" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-2xl bg-gradient-to-b from-[#2A1B11] to-[#1B110A] ring-1 ring-[#E7C994]/10"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
