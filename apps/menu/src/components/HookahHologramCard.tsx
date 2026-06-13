'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';

interface Props {
  itemId: string;
  name: string;
  description: string | null;
  price: number;
  photo: string | null;
  locationSlug: string;
}

export function HookahHologramCard({ itemId, name, description, price, photo }: Props) {
  const t = useTranslations('hookah');

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-sm border border-gold bg-gradient-to-br from-[#453324] via-[#2A1B11] to-[#1B110A]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(218,193,120,0.25),transparent_55%)]" />
      <div className="relative grid sm:grid-cols-2 gap-0">
        <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[420px] overflow-hidden">
          {photo ? (
            <Image
              src={photo}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
              className="object-cover"
              style={{ filter: 'brightness(0.8) saturate(0.95)' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-gold/30 bg-black/40">
                <div className="absolute inset-0 rounded-full border border-gold/50 animate-pulse" />
                <span className="text-6xl text-gold">◈</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent pointer-events-none" />
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
            <p className="text-sm leading-relaxed text-foreground/80 max-w-md">{description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl text-gold font-medium">{formatPrice(price)}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <AddToCartButton
              itemId={itemId}
              itemName={name}
              variant="full"
              className="sm:flex-none sm:min-w-[200px]"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
