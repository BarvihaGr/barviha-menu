'use client';

import { useSyncExternalStore } from 'react';

/**
 * Один общий «тик» для всех каруселей фото в карточках списка: раз в
 * TICK_MS номер кадра растёт на единицу, и все карточки на экране
 * переключаются строго одновременно. Пока гость листает страницу, счётчик
 * стоит (кадры не меняются под пальцем), через IDLE_MS после остановки —
 * снова идёт. Таймер один на страницу и живёт, только пока есть хотя бы одна
 * подписанная карточка.
 */
export const TICK_MS = 2000;
const IDLE_MS = 450;
let tick = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let moving = false;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const subs = new Set<() => void>();

function onMove() {
  moving = true;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    moving = false;
  }, IDLE_MS);
}

function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) {
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    timer = setInterval(() => {
      if (moving) return;
      tick++;
      for (const s of subs) s();
    }, TICK_MS);
  }
  return () => {
    subs.delete(cb);
    if (subs.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
      window.removeEventListener('scroll', onMove);
      window.removeEventListener('touchmove', onMove);
    }
  };
}
export const getTick = () => tick;
const getServer = () => 0;

export function usePhotoTick(): number {
  return useSyncExternalStore(subscribe, getTick, getServer);
}

// prefers-reduced-motion как внешнее состояние (без setState в эффекте)
const RM_QUERY = '(prefers-reduced-motion: reduce)';
function subscribeRM(cb: () => void) {
  const mql = window.matchMedia(RM_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
const getRM = () => window.matchMedia(RM_QUERY).matches;
const getRMServer = () => false;
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeRM, getRM, getRMServer);
}
