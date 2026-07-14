'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/store/toast';

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed top-6 left-1/2 z-[200] -translate-x-1/2 flex flex-col gap-2 items-center">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="pointer-events-auto rounded-full border border-gold/40 bg-black/85 backdrop-blur-md text-gold px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-medium shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
