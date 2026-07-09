import { Link } from '@/i18n/navigation';

interface Props {
  heroVideo?: string | null;
}

const QUICK_LINKS = [
  { href: '/arka/menu', label: 'Меню' },
  { href: '/arka/locations', label: 'Локации' },
  { href: '/arka/news', label: 'Новости' },
];

/** Геро главной — видео/градиент/лого, как у Timeless. Своя реализация, не HeroSection. */
export function ArkaHero({ heroVideo }: Props) {
  return (
    <section className="relative flex h-[86vh] min-h-[560px] w-full items-end overflow-hidden">
      {heroVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--arka-bg)]" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, var(--arka-bg) 8%, rgba(27,17,10,0.25) 55%, rgba(27,17,10,0.15) 100%)' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-14 sm:px-8 sm:pb-20">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[var(--arka-accent)]">
          Москва · Рублёво
        </div>
        <h1
          className="mt-2 text-[64px] uppercase leading-[0.92] text-[var(--arka-text)] sm:text-[100px]"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          Арка
        </h1>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-[var(--arka-muted)]">
          Lounge · бар · кальянная. Атмосфера тёплого золота и тишины в центре Москвы.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-[var(--arka-border)] px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-[var(--arka-text)] transition-colors duration-300 hover:border-[var(--arka-accent)] hover:text-[var(--arka-accent)]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
