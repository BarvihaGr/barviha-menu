import { Disc3 } from 'lucide-react';

/**
 * Данные кодовой карточки-спотлайта. Формат повторяет афиши-референсы
 * (BARVIKHA сверху, крупный заголовок, разделитель-ромб, мета снизу), но
 * собран в коде: наши шрифты (Playfair + Inter) и тёплая палитра вместо чёрного.
 */
export type PromoCardData =
  | { kind: 'dj'; brand: string; eyebrow: string; name: string; date: string; time: string }
  | { kind: 'social'; brand: string; title: string; note: string; socials: string[] }
  | {
      kind: 'afisha';
      brand: string;
      title: string;
      subtitle: string;
      date: string;
      time: string;
      place: string;
    };

/** Тонкий разделитель с ромбом по центру (как на афишах). */
function Divider() {
  return (
    <div className="flex items-center justify-center gap-[2cqw] py-[1.5cqw]">
      <span className="h-px w-[10cqw] bg-[color:var(--gold)]/45" />
      <span className="size-[1.4cqw] rotate-45 bg-[color:var(--gold)]/80" />
      <span className="h-px w-[10cqw] bg-[color:var(--gold)]/45" />
    </div>
  );
}

/** Метка-«пилюля» (дата / время / место). */
function Meta({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-[color:var(--gold)]/35 px-[3cqw] py-[1.2cqw] text-[2.4cqw] font-medium uppercase tracking-[0.25em] text-[color:var(--cream)]/90">
      {children}
    </span>
  );
}

const BRAND = 'font-[family-name:var(--font-display)] tracking-[0.4em] text-[color:var(--gold)]';
const LABEL = 'font-[family-name:var(--font-sans)] uppercase tracking-[0.3em] text-[color:var(--gold)]/70';

export function PromoCard({ card }: { card: PromoCardData }) {
  return (
    <div
      className="@container relative h-full w-full overflow-hidden rounded-2xl"
      style={{
        background:
          'radial-gradient(120% 120% at 50% 0%, #45331F 0%, #2A1B11 45%, #160C05 100%)',
      }}
    >
      {/* тонкая золотая рамка-инсет — фирменная деталь афиш */}
      <div className="pointer-events-none absolute inset-[3.5cqw] rounded-[1.5cqw] border border-[color:var(--gold)]/30" />

      {card.kind === 'dj' && (
        <div className="relative flex h-full items-center gap-[3cqw] px-[8cqw]">
          <div className="flex aspect-square w-[24cqw] shrink-0 items-center justify-center rounded-full border border-[color:var(--gold)]/55 bg-black/25 text-[color:var(--gold)]">
            <Disc3 className="size-[12cqw]" strokeWidth={1.4} />
          </div>
          <div className="flex flex-1 flex-col items-center text-center">
            <span className={`${BRAND} text-[5cqw]`}>{card.brand}</span>
            <span className={`${LABEL} mt-[1cqw] text-[2.5cqw]`}>{card.eyebrow}</span>
            <span className="mt-[1.5cqw] font-[family-name:var(--font-display)] text-[8cqw] font-semibold uppercase leading-none tracking-[0.05em] text-[color:var(--cream)]">
              {card.name}
            </span>
            <Divider />
            <div className="flex items-stretch gap-[2cqw]">
              <Meta>{card.date}</Meta>
              <Meta>{card.time}</Meta>
            </div>
          </div>
        </div>
      )}

      {card.kind === 'social' && (
        <div className="relative flex h-full flex-col items-center justify-center px-[8cqw] text-center">
          <span className={`${BRAND} text-[5cqw]`}>{card.brand}</span>
          <span className="mt-[2cqw] font-[family-name:var(--font-display)] text-[6.5cqw] font-semibold uppercase leading-none tracking-[0.05em] text-[color:var(--cream)]">
            {card.title}
          </span>
          <Divider />
          <span className={`${LABEL} text-[2.4cqw]`}>{card.note}</span>
          <div className="mt-[3cqw] flex items-center gap-[8cqw]">
            {card.socials.map((s) => (
              <div key={s} className="flex flex-col items-center gap-[1.5cqw]">
                <span className="flex aspect-square w-[11cqw] items-center justify-center rounded-full border border-[color:var(--gold)]/55 font-[family-name:var(--font-sans)] text-[3.2cqw] font-bold text-[color:var(--gold)]">
                  {s.slice(0, 2).toUpperCase()}
                </span>
                <span className="font-[family-name:var(--font-sans)] text-[2cqw] uppercase tracking-[0.2em] text-[color:var(--cream)]/70">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {card.kind === 'afisha' && (
        <div className="relative flex h-full flex-col items-center justify-center px-[9cqw] text-center">
          <span className={`${BRAND} text-[5cqw]`}>{card.brand}</span>
          <span className="mt-[2cqw] font-[family-name:var(--font-display)] text-[7cqw] font-semibold uppercase leading-[1.05] tracking-[0.05em] text-[color:var(--cream)]">
            {card.title}
          </span>
          <p className="mt-[2cqw] max-w-[78cqw] font-[family-name:var(--font-sans)] text-[2.7cqw] leading-snug text-[color:var(--cream)]/65">
            {card.subtitle}
          </p>
          <div className="mt-[3.5cqw] flex items-stretch gap-[2cqw]">
            <Meta>{card.date}</Meta>
            <Meta>{card.time}</Meta>
            <Meta>{card.place}</Meta>
          </div>
        </div>
      )}
    </div>
  );
}
