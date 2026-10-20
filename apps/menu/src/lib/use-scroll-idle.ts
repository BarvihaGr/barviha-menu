'use client';

import { useSyncExternalStore } from 'react';

/**
 * «Гость остановил скролл» — общее для всех карточек состояние: пока страницу
 * листают, авто-смена фото в карточках стоит, через IDLE_MS тишины — идёт.
 * Один слушатель scroll/touchmove на окно, сколько бы карточек ни подписалось.
 */
const IDLE_MS = 400;
let idle = true;
let timer: ReturnType<typeof setTimeout> | null = null;
const subs = new Set<() => void>();
let listening = false;

function emit() {
  for (const cb of subs) cb();
}
function onMove() {
  if (idle) {
    idle = false;
    emit();
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    idle = true;
    emit();
  }, IDLE_MS);
}
function subscribe(cb: () => void) {
  subs.add(cb);
  if (!listening) {
    listening = true;
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
  }
  return () => {
    subs.delete(cb);
  };
}
const getIdle = () => idle;
const getServer = () => true;

export function useScrollIdle(): boolean {
  return useSyncExternalStore(subscribe, getIdle, getServer);
}
