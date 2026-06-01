/**
 * Простая стилизованная иконка кальяна — мундштук, шланг, чаша, колба.
 * Используем currentColor чтобы наследовала текущий text-color.
 */
export function HookahIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* Чаша сверху */}
      <path d="M24 8 L40 8 L38 14 L26 14 Z" />
      {/* Узкая шейка */}
      <line x1="32" y1="14" x2="32" y2="20" />
      {/* Узкий тубус */}
      <rect x="29" y="20" width="6" height="22" rx="1" />
      {/* Колба (овал внизу) */}
      <ellipse cx="32" cy="48" rx="14" ry="9" />
      {/* Декоративная линия на колбе (отблеск) */}
      <path d="M22 46 Q26 52 32 53" opacity="0.55" />
      {/* Шланг — выходит вбок, изгибается, заканчивается мундштуком */}
      <path d="M46 44 Q56 42 56 32 Q56 22 50 22" />
      {/* Мундштук */}
      <line x1="50" y1="20" x2="50" y2="24" strokeWidth="3.5" />
    </svg>
  );
}
