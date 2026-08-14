'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';

const DISMISS_KEY = 'nearby-location-dismissed';
/** Кэш последней позиции — localStorage (переживает закрытие вкладки/сессии,
 * в отличие от DISMISS_KEY). Пока кэш свежий, вообще не дёргаем
 * getCurrentPosition заново — меньше вызовов, меньше поводов лишний раз
 * трогать geolocation API.
 *
 * TTL короткий (10 мин), не часы: с enableHighAccuracy:false (см. ниже)
 * сам вызов дешёвый и мгновенный — реального смысла в долгом кэше нет, а
 * вред есть — человек физически переехал в другую точку (Митино →
 * Кремль), а сайт ещё час-два считает его там, где он был раньше, и не
 * предлагает переключиться (баг «не видит, что я тут», найден вживую).
 * Долгий TTL был оправдан только пока geolocation была медленной/дорогой
 * (enableHighAccuracy:true) — это больше не так. */
const POSITION_CACHE_KEY = 'nearby-location-position';
const POSITION_MAX_AGE_MS = 10 * 60 * 1000;
/** Если человек явно отказал в доступе — не долбим его тем же вопросом на
 * каждой новой сессии, ждём сутки. */
const DENIED_KEY = 'nearby-location-denied-at';
const DENIED_RETRY_MS = 24 * 60 * 60 * 1000;
/** Любая другая неудача (таймаут, недоступна позиция) — короткий кулдаун,
 * а не мгновенный повтор на каждой следующей перезагрузке. Без этого
 * зависший/провалившийся запрос (см. enableHighAccuracy ниже) гонял бы
 * системный диалог разрешения на КАЖДЫЙ рефреш подряд, пока не поймает
 * успех — именно так выглядела жалоба «спрашивает каждый раз». */
const LAST_ATTEMPT_KEY = 'nearby-location-last-attempt';
const ATTEMPT_RETRY_MS = 15 * 60 * 1000;
/** Дальше этого радиуса ближайшая локация не считается «рядом» — не
 * навязываем переключение, если человек просто дома/в другом районе.
 * 1.5 км был слишком строг: geolocation без enableHighAccuracy (по
 * вышкам/Wi-Fi, не по GPS-чипу) в городе легко ошибается на 1-2 км, из-за
 * чего фича не срабатывала даже стоя у самого заведения (напр. Митино). */
const NEARBY_RADIUS_KM = 3;

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
  // Временная диагностика вживую (?debugGeo=1) — на телефоне нет консоли
  // разработчика под рукой, а логику «почему не сработало» (кэш/denied/
  // дистанция) иначе не увидеть без физического доступа к устройству.
  const debugOn = useSearchParams().get('debugGeo') === '1';
  const [debug, setDebug] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const dbg: Record<string, string> = {};
    const finish = (reason: string) => {
      if (debugOn) {
        dbg.result = reason;
        setDebug(dbg);
      }
    };

    if (typeof window === 'undefined' || !navigator.geolocation) return finish('no geolocation API');
    if (sessionStorage.getItem(DISMISS_KEY)) return finish('DISMISS_KEY set this tab — попап уже закрывали в этой вкладке');

    const current = locations.find((l) => l.slug === currentSlug);
    dbg.currentSlug = `${currentSlug} (lat=${current?.latitude ?? '—'}, lon=${current?.longitude ?? '—'})`;
    if (current?.latitude == null || current.longitude == null) return finish('текущая локация без координат');

    const others = locations.filter(
      (l): l is LocPoint & { latitude: number; longitude: number } =>
        l.slug !== currentSlug && l.latitude != null && l.longitude != null,
    );
    dbg.othersWithCoords = String(others.length);
    if (others.length === 0) return finish('нет других локаций с координатами');

    function pickNearest(here: { lat: number; lon: number }, source: string) {
      dbg.position = `${here.lat.toFixed(5)}, ${here.lon.toFixed(5)} (${source})`;
      let best: LocPoint | null = null;
      let bestDist = Infinity;
      for (const c of others) {
        const d = haversineKm(here, { lat: c.latitude, lon: c.longitude });
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      dbg.nearest = best ? `${best.name} (${best.slug})` : '—';
      dbg.distanceKm = bestDist.toFixed(2);
      dbg.radiusKm = String(NEARBY_RADIUS_KM);
      if (best && bestDist <= NEARBY_RADIUS_KM) {
        setNearest(best);
        finish(`сработало — предложил ${best.name}`);
      } else {
        finish(`ближайшая ${dbg.nearest} в ${dbg.distanceKm} км — дальше радиуса ${NEARBY_RADIUS_KM} км`);
      }
    }

    // 1) Свежая кэшированная позиция — используем её, вообще не трогая
    // geolocation API (ни разрешения, ни системного диалога).
    const cachedRaw = localStorage.getItem(POSITION_CACHE_KEY);
    if (cachedRaw) {
      try {
        const cached = JSON.parse(cachedRaw) as { lat: number; lon: number; at: number };
        const ageMin = (Date.now() - cached.at) / 60000;
        if (Date.now() - cached.at < POSITION_MAX_AGE_MS) {
          pickNearest({ lat: cached.lat, lon: cached.lon }, `кэш, ${ageMin.toFixed(1)} мин назад`);
          return;
        }
      } catch {
        // битый кэш — игнорируем, пойдём обычным путём ниже
      }
    }

    // 2) Недавно явно отказали в доступе — не спрашиваем повторно раньше срока.
    const deniedAt = Number(localStorage.getItem(DENIED_KEY) ?? 0);
    if (deniedAt && Date.now() - deniedAt < DENIED_RETRY_MS) {
      return finish(`DENIED_KEY ещё активен (${(((DENIED_RETRY_MS - (Date.now() - deniedAt)) / 3600000)).toFixed(1)} ч осталось)`);
    }

    // 2b) Недавняя неудачная попытка (таймаут и т.п.) — короткий кулдаун,
    // чтобы не повторять запрос на каждый следующий рефреш подряд.
    const lastAttempt = Number(localStorage.getItem(LAST_ATTEMPT_KEY) ?? 0);
    if (lastAttempt && Date.now() - lastAttempt < ATTEMPT_RETRY_MS) {
      return finish(`LAST_ATTEMPT_KEY кулдаун ещё активен (${(((ATTEMPT_RETRY_MS - (Date.now() - lastAttempt)) / 60000)).toFixed(1)} мин осталось)`);
    }

    function requestPosition() {
      localStorage.setItem(LAST_ATTEMPT_KEY, String(Date.now()));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          dbg.accuracyM = String(Math.round(pos.coords.accuracy));
          localStorage.setItem(POSITION_CACHE_KEY, JSON.stringify({ ...here, at: Date.now() }));
          localStorage.removeItem(DENIED_KEY);
          localStorage.removeItem(LAST_ATTEMPT_KEY);
          pickNearest(here, `getCurrentPosition, точность ±${Math.round(pos.coords.accuracy)}м`);
        },
        (err) => {
          // code 1 = PERMISSION_DENIED — запоминаем, чтобы не спрашивать
          // на каждой следующей сессии, пока не пройдут сутки.
          if (err.code === 1) localStorage.setItem(DENIED_KEY, String(Date.now()));
          finish(`getCurrentPosition ошибка: code=${err.code} (${err.message})`);
        },
        // enableHighAccuracy:true (реальный GPS-чип) внутри помещения часто
        // не успевает получить фикс — запрос виснет до таймаута, ничего не
        // кэшируется, и на следующей перезагрузке всё повторяется с тем же
        // системным диалогом разрешения заново («спрашивает каждый раз» —
        // это оно). Позиционирование по Wi-Fi/вышкам отвечает почти мгновенно
        // и работает из помещения; радиус «рядом» (NEARBY_RADIUS_KM = 3 км)
        // уже специально подобран с запасом под его меньшую точность.
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
      );
    }

    // 3) Permissions API, если есть — уже выданное разрешение не покажет
    // системный диалог повторно в любом случае, но так мы ещё и пропускаем
    // вызов вовсе, если человек уже отказал на уровне браузера (state
    // 'denied'), не дожидаясь колбэка с ошибкой.
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          dbg.permissionState = status.state;
          if (status.state === 'denied') return finish('Permissions API: denied');
          requestPosition();
        })
        .catch(requestPosition);
    } else {
      requestPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug, locations, debugOn]);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setNearest(null);
  }

  return (
    <>
      {debugOn && debug && (
        <div className="fixed bottom-2 left-2 right-2 z-[999] max-h-[45vh] overflow-y-auto rounded-lg border border-lime-400 bg-black/90 p-3 font-mono text-[10px] leading-relaxed text-lime-300">
          <div className="mb-1 text-[9px] uppercase tracking-widest text-lime-500">geo debug</div>
          {Object.entries(debug).map(([k, v]) => (
            <div key={k}>
              <span className="text-lime-500">{k}:</span> {v}
            </div>
          ))}
        </div>
      )}
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
                      Вы находитесь рядом с «Барвиха Lounge {nearest?.name}» — открыть меню локации?
                    </Dialog.Title>
                  </div>

                  <div className="mt-1 flex w-full flex-col gap-2.5">
                    <Dialog.Close asChild>
                      <Link
                        href={`/${nearest?.slug}`}
                        onClick={() => sessionStorage.setItem(DISMISS_KEY, '1')}
                        className="w-full rounded-sm bg-[#C9A876] py-3 text-xs font-medium uppercase tracking-[0.15em] text-[#2C0A00] transition hover:bg-[#D8BC90]"
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
    </>
  );
}
