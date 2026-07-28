'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  latitude: number;
  longitude: number;
  className?: string;
}

// Кастомная метка (чёрный кружок + золотое дерево бренда + хвостик-указатель,
// см. apps/menu/public/map-marker-tree.png) вместо дефолтной зелёной иконки
// Leaflet. Исходник 176×220px (@2x) — на карте показываем в половину.
const treeIcon = L.icon({
  iconUrl: '/map-marker-tree.png',
  iconSize: [44, 55],
  iconAnchor: [22, 55], // кончик хвостика — точная точка на карте
});

/**
 * Превью-карта на странице контактов — не интерактивная (сама карта не
 * скроллится/зумится, это просто снимок с меткой), тап всё равно уходит на
 * «Как добраться» ниже. Поэтому все жестовые контролы Leaflet отключены.
 */
export function LocationMap({ latitude, longitude, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

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

    L.marker([latitude, longitude], { icon: treeIcon, interactive: false }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude]);

  return <div ref={containerRef} className={className} />;
}
