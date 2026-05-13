'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/store/toast';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'floating' | 'inline' | 'large';
  label?: 'waiter' | 'kalyan';
  className?: string;
}

export function CallWaiterButton({ variant = 'inline', label = 'waiter', className }: Props) {
  const push = useToast((s) => s.push);
  const t = useTranslations();
  const tKey = label === 'kalyan' ? 'toast.kalyanCalled' : 'toast.waiterCalled';
  const text = t(label === 'kalyan' ? 'nav.callWaiter' : 'nav.callWaiter');
  const buttonText = label === 'kalyan' ? t('hookah.callKalyan') : t('nav.callWaiter');

  const onClick = () => {
    push(t(tKey), 'success');
  };

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full border border-gold bg-black/80 backdrop-blur-md px-4 py-3 text-xs uppercase tracking-[0.15em] text-gold transition hover:bg-gold hover:text-black cursor-pointer shadow-lg',
          className,
        )}
        aria-label={text}
      >
        <Bell size={16} />
        <span className="hidden sm:inline">{text}</span>
      </button>
    );
  }

  if (variant === 'large') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'w-full flex items-center justify-center gap-3 border border-gold bg-transparent text-gold px-6 py-5 text-xs uppercase tracking-[0.25em] transition hover:bg-gold hover:text-black cursor-pointer',
          className,
        )}
      >
        <Bell size={18} />
        {buttonText}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 border border-[color:var(--border)] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted transition hover:border-gold hover:text-gold cursor-pointer',
        className,
      )}
    >
      <Bell size={12} />
      {buttonText}
    </button>
  );
}
