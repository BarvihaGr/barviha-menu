import { Suspense } from 'react';
import { GateForm } from './GateForm';

export default function GatePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Barviha</div>
        <h1 className="mt-1 text-xl font-medium text-[color:var(--text)]">Бэк-офис меню</h1>
      </div>
      <Suspense>
        <GateForm />
      </Suspense>
    </div>
  );
}
