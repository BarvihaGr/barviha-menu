'use client';

import { useEffect, useState } from 'react';
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
 * Ничего не решает за человека — только баннер-предложение, дальше выбор его.
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

  if (!nearest) return null;

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setNearest(null);
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/90 px-4 py-3 text-white shadow-lg backdrop-blur-md">
        <span className="flex-1 text-sm leading-snug">Вы рядом с «{nearest.name}» — открыть её меню?</span>
        <Link
          href={`/${nearest.slug}`}
          onClick={() => sessionStorage.setItem(DISMISS_KEY, '1')}
          className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black"
        >
          Открыть
        </Link>
        <button
          type="button"
          onClick={dismiss}
          title="Закрыть"
          className="shrink-0 text-lg leading-none text-white/60"
        >
          ×
        </button>
      </div>
    </div>
  );
}
