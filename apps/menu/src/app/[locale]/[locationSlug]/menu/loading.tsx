/** Мгновенный скелетон «Меню» — виден сразу при нажатии, пока сервер грузит данные. */
export default function MenuHubLoading() {
  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] -mt-2 min-h-[100svh] w-screen bg-[#111111]">
      <div className="mx-auto w-full max-w-[680px] px-6 pb-32 pt-10 sm:pt-14">
        {/* Заголовок «Меню» */}
        <div className="mb-8 h-9 w-24 animate-pulse rounded-lg bg-white/8 sm:mb-10 sm:h-11" />

        <div className="border-t border-white/[0.08]">
          {['Кухня', 'Бар', 'Кальяны'].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-6 sm:py-7"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex flex-col gap-2.5">
                <div
                  className="animate-pulse rounded-md bg-white/8"
                  style={{ height: 28, width: [120, 80, 160][i] }}
                />
                <div
                  className="animate-pulse rounded-md bg-white/[0.04]"
                  style={{ height: 13, width: [160, 130, 120][i] }}
                />
              </div>
              <div className="h-5 w-5 animate-pulse rounded-full bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
