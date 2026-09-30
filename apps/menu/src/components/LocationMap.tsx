'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  latitude: number;
  longitude: number;
  className?: string;
}

/** Гость уже один раз открыл карту — дальше показываем её сразу. */
const MAP_OK_KEY = 'osm-map-ok';
const emptySubscribe = () => () => {};

function readMapOk(): boolean {
  try {
    return localStorage.getItem(MAP_OK_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Превью-карта на странице контактов — не интерактивная (сама карта не
 * скроллится/зумится, это просто снимок с меткой), тап всё равно уходит на
 * «Как добраться» ниже. Поэтому все жестовые контролы Leaflet отключены.
 *
 * Тайлы лежат на серверах OpenStreetMap — это единственный запрос сайта к
 * чужому домену (туда уходит IP гостя), поэтому карта грузится только по
 * нажатию «Показать карту», а не сама при открытии страницы. Выбор
 * запоминается на устройстве.
 *
 * Leaflet грузим внутри useEffect, а не обычным import-ом сверху: при загрузке
 * пакет сразу лезет в window, а 'use client' от рендера на сервере не спасает —
 * Next всё равно выполняет модуль при SSR. Из-за статического импорта (и
 * L.icon() на верхнем уровне) вся страница контактов отдавала 500
 * «window is not defined» на всех языках. Тип берём через `import type` —
 * он стирается при сборке и в рантайм не попадает.
 */
export function LocationMap({ latitude, longitude, className }: Props) {
  const t = useTranslations('location');
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const remembered = useSyncExternalStore(emptySubscribe, readMapOk, () => false);
  const [opened, setOpened] = useState(false);
  const shown = remembered || opened;

  useEffect(() => {
    if (!shown || !containerRef.current || mapRef.current) return;
    let cancelled = false;

    void (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      mapRef.current = map;
      // Подпись источника данных обязательна по лицензии OSM; префикс «Leaflet» убираем.
      map.attributionControl.setPrefix(false);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Кастомная метка (чёрный кружок + золотое дерево бренда + хвостик-
      // указатель, см. apps/menu/public/map-marker-tree.png) вместо дефолтной
      // зелёной иконки Leaflet. Исходник 176×220px (@2x) — показываем вполовину.
      const treeIcon = L.icon({
        iconUrl: '/map-marker-tree.png',
        iconSize: [44, 55],
        iconAnchor: [22, 55], // кончик хвостика — точная точка на карте
      });
      L.marker([latitude, longitude], { icon: treeIcon, interactive: false }).addTo(map);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [shown, latitude, longitude]);

  if (!shown) {
    return (
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(MAP_OK_KEY, '1');
          } catch {
            // хранилище недоступно — покажем карту на этот заход
          }
          setOpened(true);
        }}
        className="relative flex h-full w-full flex-col items-center justify-center gap-1.5"
      >
        <span
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(var(--cm-border) 1px, transparent 1px), linear-gradient(90deg, var(--cm-border) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <MapPin size={26} strokeWidth={1.5} className="relative text-[color:var(--cm-accent)]" />
        <span className="relative text-[13px] font-medium text-[var(--cm-text)] underline underline-offset-4">
          {t('showMap')}
        </span>
        <span className="relative px-4 text-[10px] text-[var(--cm-muted)]">{t('mapNote')}</span>
      </button>
    );
  }

  return <div ref={containerRef} className={className} />;
}
