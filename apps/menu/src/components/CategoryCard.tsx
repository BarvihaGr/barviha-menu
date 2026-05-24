'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

interface Props {
  href: string;
  title: string;
  subtitle?: string;
  icon: string;
  count?: number;
  index?: number;
  large?: boolean;
}

export function CategoryCard({ href, title, subtitle, icon, count, index = 0, large }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.4 }}
    >
      <Link
        href={href}
        className={`group block overflow-hidden rounded-sm border border-[color:var(--border)] bg-card transition hover:-translate-y-1 hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer ${
          large ? 'aspect-[2/1]' : 'aspect-square'
        }`}
      >
        <div className="relative flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3B2A20] to-[#2A1B11] p-5">
          <span className="text-5xl sm:text-6xl text-gold-dark opacity-40 transition group-hover:opacity-60 group-hover:scale-110">
            {icon}
          </span>
          <h3 className="text-lg sm:text-xl uppercase tracking-[0.2em] text-white font-light">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted text-center">{subtitle}</p>
          )}
          {typeof count === 'number' && (
            <span className="absolute bottom-3 right-3 text-[9px] tracking-[0.2em] text-muted">
              {count}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
