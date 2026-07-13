import { Suspense } from 'react';
import { GateForm } from './GateForm';

export default function GatePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <div className="glitch-text text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
          Barviha
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[color:var(--text)]">Бэк-офис меню</h1>
      </div>
      <Suspense>
        <GateForm />
      </Suspense>
    </div>
  );
}
