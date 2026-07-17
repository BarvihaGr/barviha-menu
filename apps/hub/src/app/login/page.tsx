import { Suspense } from 'react';
import { LoginBackground } from './LoginBackground';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <LoginBackground />

      <div className="relative w-full max-w-xs rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-8 shadow-[0_0_60px_-15px_color-mix(in_srgb,var(--accent)_35%,transparent)] backdrop-blur-xl">
        <div className="text-center">
          <div className="glitch-text text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
            Barviha
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[color:var(--text)]">Бэк-офис меню</h1>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
