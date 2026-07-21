'use client';

import { Wifi } from 'lucide-react';
import { Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import { coffeeAccentStyle } from '@/lib/coffee-design';
import { DirectionsMenu } from '../DirectionsMenu';

interface Props {
  locationSlug: string;
  phone: string | null;
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hours: string;
  wifi?: { ssid: string; password: string };
}

/**
 * Экран «КОНТАКТЫ» (lux, по ТЗ «Киевская»): заголовок Canela + список
 * «лейбл / значение» c тонкими золотыми иконками, мини-карта и ссылка
 * «Как добраться». Тёмный люкс-минимализм.
 */
// Wi-Fi для Киевской — заменить на реальные данные
const LOCATION_WIFI: Record<string, { ssid: string; password: string }> = {
  kievskaia: { ssid: 'Barvikha_Kiev', password: 'barvikha2024' },
};

export function CoffeeLuxContacts({ locationSlug, phone, address, latitude, longitude, hours, wifi }: Props) {
  const wifiData = wifi ?? LOCATION_WIFI[locationSlug];
  const rows = [
    phone
      ? { icon: Phone, label: 'Телефон', value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` }
      : null,
    address ? { icon: MapPin, label: 'Адрес', value: address, href: undefined } : null,
    { icon: Clock, label: 'Время работы', value: hours, href: undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] -mt-2 min-h-[100svh] w-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
      style={coffeeAccentStyle(locationSlug)}
    >
      <div className="mx-auto w-full max-w-[680px] px-6 pb-32 pt-10 sm:pt-14">
        <h1 className="mb-8 font-[family-name:var(--font-display)] text-[34px] font-light uppercase tracking-[0.14em] text-[var(--cm-text)] sm:mb-10 sm:text-[44px]">
          Контакты
        </h1>

        <div className="border-t border-[var(--cm-border)]">
          {rows.map((r) => {
            const Icon = r.icon;
            const inner = (
              <>
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[color:var(--cm-accent)]"
                />
                <div className="min-w-0">
                  <div className="font-[family-name:var(--font-sans)] text-[12px] uppercase tracking-[0.18em] text-[var(--cm-muted)]">
                    {r.label}
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-sans)] text-[16px] text-[var(--cm-text)]">
                    {r.value}
                  </div>
                </div>
              </>
            );
            return r.href ? (
              <a
                key={r.label}
                href={r.href}
                className="flex items-start gap-4 border-b border-[var(--cm-border)] py-5 transition-colors hover:text-[color:var(--cm-accent)] cursor-pointer"
              >
                {inner}
              </a>
            ) : (
              <div key={r.label} className="flex items-start gap-4 border-b border-[var(--cm-border)] py-5">
                {inner}
              </div>
            );
          })}
        </div>

        {/* Wi-Fi */}
        {wifiData && (
          <a
            href={`WIFI:T:WPA;S:${wifiData.ssid};P:${wifiData.password};;`}
            className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--cm-border)] bg-[var(--cm-surface)] px-5 py-4 transition-colors hover:bg-[var(--cm-surface-2)] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <Wifi size={20} strokeWidth={1.5} className="text-[color:var(--cm-accent)]" />
              <div>
                <div className="font-[family-name:var(--font-sans)] text-[12px] uppercase tracking-[0.18em] text-[var(--cm-muted)]">
                  Бесплатный Wi-Fi
                </div>
                <div className="mt-0.5 font-[family-name:var(--font-sans)] text-[15px] text-[var(--cm-text)]">
                  {wifiData.ssid}
                </div>
              </div>
            </div>
            <span className="font-[family-name:var(--font-sans)] text-[13px] text-[color:var(--cm-accent)]">
              Подключиться →
            </span>
          </a>
        )}

        {/* Мини-карта + как добраться */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--cm-border)] bg-[var(--cm-surface)]">
          <div className="relative flex h-40 items-center justify-center bg-[var(--cm-surface-2)]">
            {/* Стилизованная сетка-«карта» */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(var(--cm-border) 1px, transparent 1px), linear-gradient(90deg, var(--cm-border) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <MapPin size={34} strokeWidth={1.5} className="relative text-[color:var(--cm-accent)]" />
          </div>
          {address && (
            <DirectionsMenu address={address} latitude={latitude} longitude={longitude}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[var(--cm-surface-2)] cursor-pointer"
              >
                <span className="font-[family-name:var(--font-sans)] text-[14px] text-[var(--cm-text)]">
                  Как добраться
                </span>
                <ArrowRight size={18} strokeWidth={1.5} className="text-[color:var(--cm-accent)]" />
              </button>
            </DirectionsMenu>
          )}
        </div>
      </div>
    </div>
  );
}
