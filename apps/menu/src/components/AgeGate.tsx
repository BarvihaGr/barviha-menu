'use client';

import { useState, useSyncExternalStore } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslations } from 'next-intl';

const AGE_KEY = 'age-confirmed-18';
const emptySubscribe = () => () => {};

function readConfirmed(): boolean {
  try {
    return localStorage.getItem(AGE_KEY) === '1';
  } catch {
    // Приватный режим/запрет хранилища — спросим заново в следующий заход.
    return false;
  }
}

/**
 * Подтверждение возраста: в меню есть алкоголь и кальяны, эта информация —
 * только для совершеннолетних. Спрашиваем один раз на устройство
 * (localStorage), не на каждый заход. На сервере окно не рендерится вовсе
 * (серверный снимок = «подтверждено»), поэтому содержимое меню остаётся в
 * HTML как было — окно появляется уже после гидратации, под заставкой.
 */
export function AgeGate() {
  const t = useTranslations('age');
  const stored = useSyncExternalStore(emptySubscribe, readConfirmed, () => true);
  const [confirmed, setConfirmed] = useState(false);
  const [denied, setDenied] = useState(false);

  if (stored || confirmed) return null;

  function confirm() {
    try {
      localStorage.setItem(AGE_KEY, '1');
    } catch {
      // хранилище недоступно — пускаем на этот заход
    }
    setConfirmed(true);
  }

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md" />
        <Dialog.Content
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[310] w-[min(380px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-gold bg-card px-7 pb-7 pt-8 text-center shadow-2xl"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-medium tracking-wide text-gold">
            18+
          </div>
          <Dialog.Title className="mt-4 text-base leading-snug text-cream">
            {denied ? t('deniedTitle') : t('title')}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[13px] leading-relaxed text-cream/75">
            {denied ? t('deniedBody') : t('body')}
          </Dialog.Description>

          <div className="mt-5 flex w-full flex-col gap-2.5">
            {denied ? (
              <button
                type="button"
                onClick={() => setDenied(false)}
                className="w-full rounded-sm border border-[color:var(--border)] py-3 text-xs uppercase tracking-[0.15em] text-cream/75 transition hover:text-cream"
              >
                {t('back')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={confirm}
                  className="w-full rounded-sm bg-[#C9A876] py-3 text-xs font-medium uppercase tracking-[0.15em] text-[#2C0A00] transition hover:bg-[#D8BC90]"
                >
                  {t('yes')}
                </button>
                <button
                  type="button"
                  onClick={() => setDenied(true)}
                  className="w-full rounded-sm border border-[color:var(--border)] py-3 text-xs uppercase tracking-[0.15em] text-cream/75 transition hover:text-cream"
                >
                  {t('no')}
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
