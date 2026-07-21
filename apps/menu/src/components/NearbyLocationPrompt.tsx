'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const DISMISS_KEY = 'nearby-location-dismissed';
/** Дальше этого радиуса ближайшая локация не считается «рядом» — не
 * навязываем переключение, если человек просто дома/в другом районе. */
const NEARBY_RADIUS_KM = 1.5;

interface LocPoint {
  slug: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * «Вы рядом с Х — открыть её меню?» — для сценария «добавил на экран домой
 * на Павелецкой, приехал на Киевскую, открыл ту же иконку». Срабатывает
 * ТОЛЬКО если у текущей локации уже проставлены координаты в бэк-офисе
 * (Настройки → координаты) — так фича включается локация-за-локацией без
 * правок кода, пока проставлены только Киевская/Павелецкая/Менделеевская.
 * Ничего не решает за человека — только гейт-модалка-предложение, дальше
 * выбор его. Центрированная модалка (не баннер-полоска сверху) — чтобы
 * читалось как осознанный вопрос, а не фоновое уведомление о cookies.
 */
export function NearbyLocationPrompt({ currentSlug, locations }: { currentSlug: string; locations: LocPoint[] }) {
  const [nearest, setNearest] = useState<LocPoint | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const current = locations.find((l) => l.slug === currentSlug);
    if (current?.latitude == null || current.longitude == null) return; // локация не «включена» под фичу

    const others = locations.filter(
      (l): l is LocPoint & { latitude: number; longitude: number } =>
        l.slug !== currentSlug && l.latitude != null && l.longitude != null,
    );
    if (others.length === 0) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        let best: LocPoint | null = null;
        let bestDist = Infinity;
        for (const c of others) {
          const d = haversineKm(here, { lat: c.latitude, lon: c.longitude });
          if (d < bestDist) {
            bestDist = d;
            best = c;
          }
        }
        if (best && bestDist <= NEARBY_RADIUS_KM) setNearest(best);
      },
      () => {
        // Отказ в доступе или таймаут — молча ничего не показываем, не навязываемся.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, [currentSlug, locations]);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setNearest(null);
  }

  return (
    <Dialog.Root open={nearest != null} onOpenChange={(v) => !v && dismiss()}>
      <AnimatePresence>
        {nearest && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, x: '-50%', y: 'calc(-50% + 16px)', scale: 0.96 }}
                animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
                exit={{ opacity: 0, x: '-50%', y: 'calc(-50% + 16px)', scale: 0.96 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed left-1/2 top-1/2 z-[95] w-[min(380px,calc(100vw-2rem))] rounded-sm border border-gold bg-card text-center shadow-2xl"
              >
                <div className="flex flex-col items-center gap-4 px-7 pb-7 pt-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                    <MapPin size={22} className="text-gold" />
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <div className="text-[9px] uppercase tracking-[0.25em] text-muted">Вы рядом</div>
                    <Dialog.Title className="text-base leading-snug text-cream">
                      Вы находитесь рядом с «{nearest?.name}» — открыть меню этой локации?
                    </Dialog.Title>
                  </div>

                  <div className="mt-1 flex w-full flex-col gap-2.5">
                    <Dialog.Close asChild>
                      <Link
                        href={`/${nearest?.slug}`}
                        onClick={() => sessionStorage.setItem(DISMISS_KEY, '1')}
                        className="w-full rounded-sm bg-gold py-3 text-xs font-medium uppercase tracking-[0.15em] text-black transition hover:bg-gold-light"
                      >
                        Открыть меню
                      </Link>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        onClick={dismiss}
                        className="w-full rounded-sm border border-[color:var(--border)] py-3 text-xs uppercase tracking-[0.15em] text-muted transition hover:text-cream"
                      >
                        Остаться здесь
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
