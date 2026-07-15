'use client';

/**
 * Экран ввода кода доступа к тестовой локации «Арка» — см. middleware.ts:
 * без валидной cookie любой запрос на /{locale}/arka* сюда и попадает, даже
 * если пришли по прямой ссылке. После верного кода — жёсткий редирект на
 * `next` (страница, которую изначально просили), чтобы middleware сразу
 * увидел свежую cookie.
 */

import { Suspense, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { safeNextPath } from '@/lib/safe-next';

const CODE_LENGTH = 4;

function ArkaGateForm() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'), `/${params.locale}/arka`);

  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (value: string) => {
    setPending(true);
    setError(false);
    try {
      const res = await fetch('/api/arka-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      if (!res.ok) {
        setError(true);
        setCode('');
        setPending(false);
        return;
      }
      // Жёсткая навигация — чтобы middleware перечитал уже установленную cookie.
      window.location.href = next;
    } catch {
      setError(true);
      setCode('');
      setPending(false);
    }
  };

  const onDigits = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(false);
    if (digits.length === CODE_LENGTH) submit(digits);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        autoFocus
        inputMode="numeric"
        pattern="[0-9]*"
        value={code}
        onChange={(e) => onDigits(e.target.value)}
        disabled={pending}
        aria-label="Код доступа"
        className="w-[180px] rounded-2xl border border-white/15 bg-white/5 px-4 py-3.5 text-center text-[24px] tracking-[0.6em] text-white outline-none transition focus:border-white/40 disabled:opacity-50"
        placeholder="••••"
      />
      {error && <p className="text-[12px] text-red-400">Неверный код, попробуйте ещё раз</p>}
    </div>
  );
}

export default function ArkaGatePage() {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center gap-8 bg-[#151515] px-6 text-center">
      <div>
        <div className="text-[11px] uppercase tracking-[0.4em] text-white/40">Barvikha Group</div>
        <h1 className="mt-2 text-[20px] font-medium uppercase tracking-[0.1em] text-white/90">Код доступа</h1>
        <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/50">
          Раздел в разработке — введите код, чтобы продолжить
        </p>
      </div>

      <Suspense fallback={null}>
        <ArkaGateForm />
      </Suspense>
    </div>
  );
}
