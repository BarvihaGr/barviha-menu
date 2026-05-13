'use client';

import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';
import { Link } from '@/i18n/navigation';

const Spline = lazy(() => import('@splinetool/react-spline').then((m) => ({ default: m.default })));

interface Props {
  itemId: string;
  name: string;
  description: string | null;
  price: number;
  splineUrl: string | null;
  locationSlug: string;
}

export function HookahHologramCard({
  itemId,
  name,
  description,
  price,
  splineUrl,
  locationSlug,
}: Props) {
  const t = useTranslations('hookah');
  const [reveal, setReveal] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-sm border border-gold bg-gradient-to-br from-[#1f1a10] via-[#0e0e0e] to-[#1a1408]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(201,169,97,0.25),transparent_55%)]" />
      <div className="relative grid sm:grid-cols-2 gap-0">
        <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {!reveal && (
            <button
              type="button"
              onClick={() => setReveal(true)}
              className={cn(
                'group flex flex-col items-center gap-4 cursor-pointer transition',
                'hover:scale-105',
              )}
            >
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-gold/30 bg-black/40">
                <div className="absolute inset-0 rounded-full border border-gold/50 animate-pulse" />
                <Sparkles size={48} className="text-gold" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
                {t('viewIn3D')}
              </span>
            </button>
          )}
          {reveal && splineUrl && (
            <Suspense fallback={<SplinePlaceholder loading />}>
              <div className="absolute inset-0">
                <Spline scene={splineUrl} />
              </div>
            </Suspense>
          )}
          {reveal && !splineUrl && <SplinePlaceholder />}
        </div>
        <div className="flex flex-col justify-center gap-5 p-6 sm:p-10">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">
            {t('premiumTitle')}
          </div>
          <h2
            className="text-3xl sm:text-4xl uppercase tracking-[0.1em] font-light"
            style={{
              backgroundImage:
                'linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {name}
          </h2>
          {description && (
            <p className="text-sm leading-relaxed text-white/80 max-w-md">{description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl text-gold font-medium">{formatPrice(price)}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <AddToCartButton itemId={itemId} itemName={name} variant="full" className="sm:flex-none sm:min-w-[200px]" />
            <Link
              href={`/${locationSlug}/item/${itemId}`}
              className="border border-gold text-gold px-6 py-4 text-xs uppercase tracking-[0.25em] transition hover:bg-gold hover:text-black cursor-pointer"
            >
              {t('callKalyanHint')}
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SplinePlaceholder({ loading }: { loading?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1f1a10] via-[#0e0e0e] to-[#1a1408]">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-gold/30 bg-black/40">
        <div
          className={cn(
            'absolute inset-0 rounded-full border border-gold/50',
            loading ? 'animate-spin' : 'animate-pulse',
          )}
        />
        <span className="text-5xl text-gold">◈</span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
        {loading ? 'Loading 3D…' : '3D placeholder'}
      </span>
    </div>
  );
}
