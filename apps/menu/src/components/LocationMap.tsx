'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  latitude: number;
  longitude: number;
  className?: string;
}

/**
 * Превью-карта на странице контактов — не интерактивная (сама карта не
 * скроллится/зумится, это просто снимок с меткой), тап всё равно уходит на
 * «Как добраться» ниже. Поэтому все жестовые контролы Leaflet отключены.
 *
 * Leaflet грузим внутри useEffect, а не обычным import-ом сверху: при загрузке
 * пакет сразу лезет в window, а 'use client' от рендера на сервере не спасает —
 * Next всё равно выполняет модуль при SSR. Из-за статического импорта (и
 * L.icon() на верхнем уровне) вся страница контактов отдавала 500
 * «window is not defined» на всех языках. Тип берём через `import type` —
 * он стирается при сборке и в рантайм не попадает.
 */
export function LocationMap({ latitude, longitude, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
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
        attributionControl: false,
      });
      mapRef.current = map;

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
  }, [latitude, longitude]);

  return <div ref={containerRef} className={className} />;
}
