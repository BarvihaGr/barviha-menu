'use client';

import { motion } from 'framer-motion';
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
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.08, 0.5), duration: 0.5 }}
      className={cn(
        'group relative overflow-hidden rounded-sm border border-[color:var(--border)] p-6 sm:p-8 min-h-[220px] flex',
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(218,193,120,0.2),transparent_60%)]" />
      <div className="absolute -right-6 -top-6 text-[140px] leading-none text-white/5 select-none pointer-events-none">
        {icon}
      </div>
      <div className="relative z-10 flex flex-col gap-3 justify-end">
        <span className="text-3xl text-gold/80">{icon}</span>
        <h3 className="text-2xl sm:text-3xl uppercase tracking-[0.12em] text-white font-light">
          {name}
        </h3>
        <p className="text-sm text-white/75 leading-relaxed max-w-[300px]">{description}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-gold/70">{examples}</p>
      </div>
    </motion.article>
  );
}
