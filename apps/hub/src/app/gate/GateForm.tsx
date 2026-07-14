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
    <form onSubmit={onSubmit} className="flex w-full max-w-xs flex-col gap-3">
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(false);
        }}
        placeholder="Код доступа"
        className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center text-lg tracking-widest text-[color:var(--text)] outline-none focus:border-[color:var(--accent)]"
      />
      {error && <p className="text-center text-sm text-[color:var(--danger)]">Неверный код</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="rounded-lg bg-[color:var(--accent)] py-3 text-sm font-medium text-[color:var(--accent-text)] disabled:opacity-50"
      >
        {loading ? 'Проверяю…' : 'Войти'}
      </button>
    </form>
  );
}
