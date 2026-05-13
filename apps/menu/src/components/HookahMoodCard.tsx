'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useToast } from '@/store/toast';
import { cn } from '@/lib/utils';

interface Props {
  name: string;
  description: string;
  examples: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  index?: number;
}

export function HookahMoodCard({
  name,
  description,
  examples,
  icon,
  gradientFrom,
  gradientTo,
  index = 0,
}: Props) {
  const push = useToast((s) => s.push);
  const t = useTranslations();

  const onClick = () => {
    push(t('toast.kalyanCalled'), 'success');
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.08, 0.5), duration: 0.5 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative overflow-hidden rounded-sm border border-[color:var(--border)] p-6 sm:p-7 text-left cursor-pointer transition hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,97,0.15),transparent_60%)] opacity-50 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl sm:text-2xl uppercase tracking-[0.15em] text-white font-light">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-[280px]">
            {description}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold/80">{examples}</p>
        </div>
        <span className="text-4xl text-gold/40 transition group-hover:text-gold/80 group-hover:scale-110 shrink-0">
          {icon}
        </span>
      </div>
    </motion.button>
  );
}
