'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiPath } from '@/lib/base-path';

export function GateForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch(apiPath('/api/hub-gate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get('next') || '/');
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex w-full flex-col gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]"
        >
          <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
          <path d="M7.5 10.5V7.25a4.5 4.5 0 0 1 9 0V10.5" />
        </svg>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Код доступа"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] py-3 pl-10 pr-4 text-center text-lg tracking-widest text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
        />
      </div>
      {error && <p className="text-center text-sm text-[color:var(--danger)]">Неверный код</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="group flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-[color:var(--accent-text)] transition disabled:opacity-50"
        style={{ background: 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--accent-2)))' }}
      >
        {loading ? 'Проверяю…' : 'Войти'}
        {!loading && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </button>
    </form>
  );
}
