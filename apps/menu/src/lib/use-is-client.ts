import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * true только на клиенте, после гидратации. Нужен там, где значение зависит
 * от localStorage/zustand-персиста (например счётчик корзины) и на сервере
 * должно быть заведомо другим — иначе гидратация ловит mismatch. Раньше
 * это решалось через useState(false) + useEffect(() => setState(true)) —
 * даёт лишний каскадный ре-рендер после монтирования (react-hooks/set-state-in-effect).
 * useSyncExternalStore — официальный паттерн React именно для этого случая:
 * https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
