'use client';

/**
 * BOARD — интерактивный чертёж главной страницы Arca по сетке A–G × 1–10.
 *
 * Открывается по /ru/board. Это «скелет» (blueprint), а не финальный дизайн:
 *  - сетка 7×10 видна насквозь (колонки A–G, ряды 1–10);
 *  - каждый модуль — полупрозрачный блок с КОДОВЫМ именем (ВД1, ЛОГО, ДАШ…);
 *  - блоки можно таскать мышкой и тянуть за угол (снап по клеткам);
 *  - выбранный блок двигается стрелками, Shift+стрелки — меняют размер;
 *  - раскладка сохраняется в localStorage; кнопка «Сброс» возвращает дефолт.
 *
 * Цель — дать владельцу полный контроль над расположением/размерами блоков,
 * прежде чем наполнять их реальным контентом.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Info,
  ShoppingBag,
  Flame,
  Star,
  Music,
  Gift,
  MapPin,
  Globe,
  Heart,
  Phone,
  Calendar,
  Coffee,
  Wine,
  Percent,
  Plus,
  Trash2,
  Lock,
  LockOpen,
  type LucideIcon,
} from 'lucide-react';

/** Доступные иконки для блоков (добавлять/убирать). */
const ICONS: Record<string, LucideIcon> = {
  Home,
  Info,
  ShoppingBag,
  Flame,
  Star,
  Music,
  Gift,
  MapPin,
  Globe,
  Heart,
  Phone,
  Calendar,
  Coffee,
  Wine,
  Percent,
};

const COLS = 7;
const ROWS = 20; // каждый «этаж» 1..10 раздроблён по вертикали пополам → .1 / .2
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
const ASPECT = 800 / 390; // высота экрана / ширина
const STORAGE_KEY = 'arca-board-v4'; // v4: пересборка по координатам владельца

/** Подпись ряда: внутренний индекс 0..19 → «1.1», «1.2», «2.1» … */
const rowLabel = (r: number) => `${Math.floor(r / 2) + 1}.${(r % 2) + 1}`;

type GroupKey = 'video' | 'header' | 'promo' | 'work' | 'dash';
const GROUPS: Record<GroupKey, { color: string; label: string }> = {
  video: { color: '#5B8DEF', label: 'Видео' },
  header: { color: '#E5C490', label: 'Шапка' },
  promo: { color: '#46B38A', label: 'Промо' },
  work: { color: '#C9925F', label: 'Рабочая зона' },
  dash: { color: '#F2D69E', label: 'Дашборд' },
};

interface Mod {
  id: string;
  code: string; // кодовое имя — ВД1, ЛОГО…
  name: string; // человекочитаемое описание
  group: GroupKey;
  col: number; // 0..6
  row: number; // 0..9
  w: number; // ширина в клетках
  h: number; // высота в клетках
  z: number;
  icon?: string; // ключ из ICONS — иконка блока (необязательно)
  locked?: boolean; // зафиксирован: не двигается, другие на него не наезжают
  shape?: 'rect' | 'circle'; // форма блока (по умолчанию прямоугольник)
  items?: DashItem[]; // только для дашборда: иконки + подписи
  align?: 'between' | 'center' | 'around'; // выравнивание иконок дашборда
}

/** Иконка на дашборде с подписью. */
interface DashItem {
  icon: string; // ключ из ICONS
  label: string; // подпись под иконкой
}
const DEFAULT_DASH_ITEMS: DashItem[] = [
  { icon: 'Info', label: 'Инфо' },
  { icon: 'Home', label: 'Меню' },
  { icon: 'ShoppingBag', label: 'Корзина' },
];

/** Пересечение двух блоков (в клетках). */
const overlap = (a: { col: number; row: number; w: number; h: number }, b: Mod) =>
  a.col < b.col + b.w && a.col + a.w > b.col && a.row < b.row + b.h && a.row + a.h > b.row;

// ── МАКЕТ домашнего экрана (пересборка по координатам владельца) ──
// row/h — в полу-клетках (1 «этаж» = 2 единицы).
const DEFAULTS: Mod[] = [
  // видео-обложка — нравится как есть, зафиксировано
  { id: 'vd1', code: 'ВД1', name: 'Видео-обложка', group: 'video', col: 0, row: 0, w: 7, h: 7, z: 0, locked: true },

  // шапка: пилюли ближе к центру (с краёв убраны)
  { id: 'lok', code: 'ЛОК', name: 'Локация', group: 'header', col: 1, row: 0, w: 1, h: 2, z: 10, shape: 'circle', icon: 'MapPin' },
  { id: 'yaz', code: 'ЯЗЫК', name: 'Язык', group: 'header', col: 5, row: 0, w: 1, h: 2, z: 10, shape: 'circle', icon: 'Globe' },

  // надпись «Барвиха Лаунж» — текст, чуть ниже (между C1.1 и C1.2)
  { id: 'logo', code: 'ЛОГО', name: 'Барвиха Лаунж', group: 'header', col: 2, row: 1, w: 3, h: 2, z: 11 },

  // подпись-слоган на герое
  { id: 'hero', code: 'ТЕКСТ', name: 'Вкус, выжженный по дереву', group: 'promo', col: 0, row: 4, w: 5, h: 2, z: 11 },

  // карусель: афиши + спецпредложения + соцсети (A4.2–B5.1)
  { id: 'af1', code: 'АФ1', name: 'Афиши · Спец · Соцсети', group: 'promo', col: 0, row: 7, w: 2, h: 2, z: 12, icon: 'Music' },

  // круглые кнопки-категории: Кухня по центру (D6.2), Кальян (B7.2), Бар (F7.2)
  { id: 'cat2', code: 'КУХ', name: 'Кухня', group: 'work', col: 3, row: 11, w: 2, h: 3, z: 14, shape: 'circle', icon: 'Coffee' },
  { id: 'cat1', code: 'КАЛ', name: 'Кальян', group: 'work', col: 1, row: 13, w: 2, h: 3, z: 14, shape: 'circle', icon: 'Flame' },
  { id: 'cat3', code: 'БАР', name: 'Бар', group: 'work', col: 5, row: 13, w: 2, h: 3, z: 14, shape: 'circle', icon: 'Wine' },

  // нижний дашборд — нравится как фиксируется
  { id: 'dash', code: 'ДАШ', name: 'Инфо · Дом · Корзина', group: 'dash', col: 2, row: 17, w: 3, h: 2, z: 20, items: DEFAULT_DASH_ITEMS, align: 'between' },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const cellLabel = (m: Mod) =>
  `${LETTERS[m.col]}${rowLabel(m.row)}–${LETTERS[Math.min(COLS - 1, m.col + m.w - 1)]}${rowLabel(m.row + m.h - 1)}`;

// ── Настоящие ассеты для режима «Просмотр» ──────────────────────
const HERO_VIDEO = '/locations/arka/hero.mp4';
const HERO_POSTER = '/locations/arka/poster.jpg';
const CAT_SLICE: Record<string, string> = {
  cat1: '/wood/slice-3d-0.webp',
  cat2: '/wood/slice-3d-1.webp',
  cat3: '/wood/slice-3d-2.webp',
};

interface Slide {
  img: string;
  tag: string;
  title: string;
}
// Афиши + спецпредложения + соцсети — всё в одной карусели.
const CAROUSEL_SLIDES: Slide[] = [
  { img: '/menu-photos/p3.webp', tag: 'Афиша', title: 'DJ-сет · Пятница 22:00' },
  { img: '/menu-photos/p5.webp', tag: 'Спецпредложение', title: 'Сет шефа −20%' },
  { img: '/menu-photos/p1.webp', tag: 'Соцсети', title: '@barvikha.lounge' },
];

/** Что показать в модалке при тапе по плитке в режиме «Просмотр». */
interface PreviewModalData {
  eyebrow: string;
  title: string;
  image?: string;
  icon?: string;
  body?: string;
  rows?: Slide[];
}

// Короткие описания для модалок категорий и пунктов дашборда.
const CAT_DESC: Record<string, string> = {
  cat1: 'Табаки, авторские миксы и кальяны на любой вкус.',
  cat2: 'Закуски, горячее и основные блюда от шефа.',
  cat3: 'Коктейли, вино и крепкий бар.',
};
const DASH_DESC: Record<string, string> = {
  Инфо: 'Адрес, часы работы и контакты заведения.',
  Меню: 'Вернуться на главный экран меню.',
  Дом: 'Вернуться на главный экран меню.',
  Корзина: 'Ваш заказ — собранные позиции и итог.',
};

/**
 * Бесконечная бегущая лента слайдов — непрерывный линейный сдвиг,
 * бесшовная петля (без рывков): дублируем набор и едем 0% → -50%.
 */
function MiniCarousel({ slides }: { slides: Slide[] }) {
  const track = [...slides, ...slides]; // два набора для бесшовной петли
  const duration = slides.length * 3.4; // плавно: ~3.4с на слайд

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="flex h-full"
        style={{ width: `${track.length * 100}%` }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {track.map((s, idx) => (
          <div key={idx} className="relative h-full shrink-0" style={{ width: `${100 / track.length}%` }}>
            <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-[7px] uppercase tracking-[0.2em] text-[#E5C490]">{s.tag}</div>
              <div className="text-[9px] font-semibold leading-tight text-[#F4E9D5]">{s.title}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/** Один блок макета, отрисованный РЕАЛЬНЫМ контентом по координатам сетки. */
function PreviewBlock({
  m,
  cw,
  ch,
  onOpen,
}: {
  m: Mod;
  cw: number;
  ch: number;
  onOpen: (d: PreviewModalData) => void;
}) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: m.col * cw,
    top: m.row * ch,
    width: m.w * cw,
    height: m.h * ch,
    zIndex: m.z,
  };
  const Icon = m.icon ? ICONS[m.icon] : null;

  // Видео-обложка
  if (m.group === 'video') {
    return (
      <div style={style} className="overflow-hidden">
        <video
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#1B110A]" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(196,146,98,0.18), transparent 60%)' }} />
      </div>
    );
  }

  // Надпись «Барвиха Лаунж» (текст-вордмарк, не картинка)
  if (m.id === 'logo') {
    return (
      <div style={style} className="flex flex-col items-center justify-center text-center">
        <span
          className="leading-none text-[#F4E9D5] drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
          style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}
        >
          Барвиха
        </span>
        <span className="mt-1 pl-[0.5em] text-[9px] uppercase tracking-[0.5em] text-[#E5C490]">Lounge</span>
      </div>
    );
  }

  // Круглые кнопки-категории на спиле
  if (CAT_SLICE[m.id] || (m.group === 'work' && m.shape === 'circle')) {
    const dia = Math.min(m.w * cw, m.h * ch);
    const slice = CAT_SLICE[m.id] ?? '/wood/slice-3d-0.webp';
    return (
      <div style={style} className="flex items-center justify-center">
        <div
          onClick={() =>
            onOpen({ eyebrow: 'Категория', title: m.name, image: slice, icon: m.icon, body: CAT_DESC[m.id] })
          }
          className="relative cursor-pointer overflow-hidden rounded-full ring-1 ring-[#C49262]/45 transition-transform hover:scale-[1.04] active:scale-95"
          style={{ width: dia, height: dia, boxShadow: '0 14px 32px -10px rgba(0,0,0,0.75)' }}
        >
          <img src={slice} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/25" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-[#F4E9D5]">
            {Icon && <Icon size={Math.max(14, dia * 0.2)} />}
            <span className="text-[11px] font-semibold tracking-wide drop-shadow">{m.name}</span>
          </div>
        </div>
      </div>
    );
  }

  // Нижний дашборд — иконки/подписи/выравнивание из настроек
  if (m.id === 'dash' || m.group === 'dash') {
    const items = m.items ?? DEFAULT_DASH_ITEMS;
    const justify =
      m.align === 'center' ? 'justify-center gap-7' : m.align === 'around' ? 'justify-around' : 'justify-between px-6';
    return (
      <div style={style} className="flex items-center">
        <div
          className={`flex h-full max-h-[52px] w-full items-center rounded-[1.4rem] bg-black/45 text-[#F4E9D5] ring-1 ring-white/10 backdrop-blur ${justify}`}
        >
          {items.map((it, idx) => {
            const Ic = ICONS[it.icon] ?? Home;
            return (
              <button
                key={idx}
                onClick={() =>
                  onOpen({ eyebrow: 'Дашборд', title: it.label || 'Пункт', icon: it.icon, body: DASH_DESC[it.label] })
                }
                className="flex cursor-pointer flex-col items-center gap-0.5 px-1 text-[#F4E9D5] transition hover:scale-110"
              >
                <Ic size={17} />
                {it.label && <span className="text-[7px] tracking-wide text-[#F4E9D5]/75">{it.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Пилюли шапки (локация / язык)
  if (m.group === 'header') {
    const txt = m.id === 'lok' ? 'Барвиха' : m.id === 'yaz' ? 'RU' : m.code;
    const headTitle = m.id === 'lok' ? 'Локация' : m.id === 'yaz' ? 'Язык' : m.name;
    const headBody =
      m.id === 'lok'
        ? 'Барвиха · Рублёво. Нажмите, чтобы сменить заведение.'
        : m.id === 'yaz'
          ? 'Русский · English · 中文'
          : undefined;
    return (
      <div style={style} className="flex items-center justify-center">
        <button
          onClick={() => onOpen({ eyebrow: 'Шапка', title: headTitle, icon: m.icon, body: headBody })}
          className="flex cursor-pointer items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10px] text-[#F4E9D5] ring-1 ring-white/10 backdrop-blur transition hover:scale-105"
        >
          {Icon && <Icon size={12} />}
          <span className="font-medium">{txt}</span>
        </button>
      </div>
    );
  }

  // Подпись-заголовок на герое
  if (m.id === 'hero') {
    return (
      <div style={style} className="flex flex-col justify-center px-1">
        <span className="text-[8px] uppercase tracking-[0.35em] text-[#C49262]">Barvikha · Arca</span>
        <span className="text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.1 }}>
          {m.name}
        </span>
      </div>
    );
  }

  // Карусель (афиши + спецпредложения + соцсети)
  if (m.group === 'promo') {
    return (
      <div style={style}>
        <div
          onClick={() =>
            onOpen({ eyebrow: 'Афиша · Спец · Соцсети', title: 'События и предложения', rows: CAROUSEL_SLIDES })
          }
          className="relative h-full w-full cursor-pointer overflow-hidden rounded-2xl ring-1 ring-[#C49262]/30 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)] transition-transform active:scale-[0.98]"
        >
          <MiniCarousel slides={CAROUSEL_SLIDES} />
        </div>
      </div>
    );
  }

  // Прочее — мягкая карточка с названием
  return (
    <div style={style}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl bg-white/5 text-center text-[#F4E9D5] ring-1 ring-[#C49262]/20">
        {Icon && <Icon size={18} />}
        <span className="px-1 text-[10px] leading-tight">{m.name}</span>
      </div>
    </div>
  );
}

/** «Красивое окошко» поверх экрана телефона — раскрывает детали плитки. */
function PreviewModal({ data, onClose }: { data: PreviewModalData | null; onClose: () => void }) {
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data, onClose]);

  const Ic = data?.icon ? ICONS[data.icon] : undefined;

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="absolute inset-0 z-[80] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px]" />
          <motion.div
            className="relative m-3 w-[calc(100%-1.5rem)] overflow-hidden rounded-3xl border border-[#C49262]/30 bg-[#160C06]"
            style={{ boxShadow: '0 30px 70px -20px rgba(0,0,0,0.9)' }}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {data.image && (
              <div className="relative h-36 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#160C06] via-transparent to-transparent" />
              </div>
            )}
            <div className="p-6">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#C49262]">{data.eyebrow}</div>
              <div
                className="mt-1 flex items-center gap-2 text-[#F4E9D5]"
                style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500 }}
              >
                {Ic ? <Ic size={22} className="text-[#C49262]" /> : null}
                {data.title}
              </div>
              {data.body && <p className="mt-3 text-sm leading-relaxed text-[#F4E9D5]/70">{data.body}</p>}
              {data.rows && (
                <div className="mt-4 flex flex-col gap-2">
                  {data.rows.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2 ring-1 ring-[#C49262]/15"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.img} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.25em] text-[#C49262]">{r.tag}</div>
                        <div className="text-sm text-[#F4E9D5]">{r.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-[#C49262] py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#160C06]"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BoardPage() {
  const [mods, setMods] = useState<Mod[]>(DEFAULTS);
  const [sel, setSel] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [layering, setLayering] = useState(true); // разрешить наложение блоков друг на друга
  const [op, setOp] = useState(0.12);
  const [cw, setCw] = useState(390);
  const [preview, setPreview] = useState(false);
  const [pcw, setPcw] = useState(360);
  const [previewModal, setPreviewModal] = useState<PreviewModalData | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<null | {
    id: string;
    mode: 'move' | 'resize';
    sx: number;
    sy: number;
    col: number;
    row: number;
    w: number;
    h: number;
  }>(null);

  // загрузка сохранённой раскладки
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Mod[];
        // мержим по id, чтобы новые дефолтные блоки не терялись
        setMods(DEFAULTS.map((d) => saved.find((s) => s.id === d.id) ?? d));
      }
    } catch {
      /* ignore */
    }
  }, []);

  // автосохранение
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mods));
    } catch {
      /* ignore */
    }
  }, [mods]);

  // измеряем ширину канваса
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    setCw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // измеряем ширину телефона в режиме просмотра
  useEffect(() => {
    if (!preview) return;
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setPcw(el.clientWidth));
    ro.observe(el);
    setPcw(el.clientWidth);
    return () => ro.disconnect();
  }, [preview]);

  const canvasH = cw * ASPECT;
  const cellW = cw / COLS;
  const cellH = canvasH / ROWS;

  const startDrag = (e: React.PointerEvent, m: Mod, mode: 'move' | 'resize') => {
    e.stopPropagation();
    setSel(m.id);
    if (m.locked) return; // заблокирован — только выделяем, не двигаем
    drag.current = { id: m.id, mode, sx: e.clientX, sy: e.clientY, col: m.col, row: m.row, w: m.w, h: m.h };
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dcol = Math.round((e.clientX - d.sx) / cellW);
    const drow = Math.round((e.clientY - d.sy) / cellH);
    setMods((ms) => {
      const locked = layering ? [] : ms.filter((o) => o.locked && o.id !== d.id);
      return ms.map((m) => {
        if (m.id !== d.id) return m;
        const cand =
          d.mode === 'move'
            ? { col: clamp(d.col + dcol, 0, COLS - m.w), row: clamp(d.row + drow, 0, ROWS - m.h), w: m.w, h: m.h }
            : { col: m.col, row: m.row, w: clamp(d.w + dcol, 1, COLS - m.col), h: clamp(d.h + drow, 1, ROWS - m.row) };
        if (locked.some((o) => overlap(cand, o))) return m; // упёрлись в заблокированный — стоим
        return { ...m, ...cand };
      });
    });
  };

  const endDrag = () => {
    drag.current = null;
  };

  // клавиатура: стрелки — двигать, Shift+стрелки — менять размер
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!sel) return;
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const delta = map[e.key];
      if (!delta) return;
      e.preventDefault();
      setMods((ms) => {
        const locked = layering ? [] : ms.filter((o) => o.locked && o.id !== sel);
        return ms.map((m) => {
          if (m.id !== sel || m.locked) return m; // заблокированный не двигаем
          const cand = e.shiftKey
            ? { col: m.col, row: m.row, w: clamp(m.w + delta[0], 1, COLS - m.col), h: clamp(m.h + delta[1], 1, ROWS - m.row) }
            : { col: clamp(m.col + delta[0], 0, COLS - m.w), row: clamp(m.row + delta[1], 0, ROWS - m.h), w: m.w, h: m.h };
          if (locked.some((o) => overlap(cand, o))) return m;
          return { ...m, ...cand };
        });
      });
    },
    [sel, layering],
  );
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const reset = () => {
    setMods(DEFAULTS);
    setSel(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // правка одного блока
  const updateMod = (id: string, patch: Partial<Mod>) =>
    setMods((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  // порядок слоёв
  const bringFront = (id: string) =>
    setMods((ms) => {
      const maxZ = Math.max(...ms.map((m) => m.z));
      return ms.map((m) => (m.id === id ? { ...m, z: maxZ + 1 } : m));
    });
  const sendBack = (id: string) =>
    setMods((ms) => {
      const minZ = Math.min(...ms.map((m) => m.z));
      return ms.map((m) => (m.id === id ? { ...m, z: minZ - 1 } : m));
    });
  const stepLayer = (id: string, dir: 1 | -1) =>
    setMods((ms) => ms.map((m) => (m.id === id ? { ...m, z: m.z + dir } : m)));

  // удалить блок
  const removeMod = (id: string) => {
    setMods((ms) => ms.filter((m) => m.id !== id));
    setSel((s) => (s === id ? null : s));
  };

  // добавить новый блок (по центру сверху). shape — прямоугольник или круг
  const addMod = (shape: 'rect' | 'circle' = 'rect') => {
    const id = `m${mods.reduce((mx, m) => Math.max(mx, Number(m.id.replace(/\D/g, '')) || 0), 0) + 1}`;
    const next: Mod =
      shape === 'circle'
        ? { id, code: 'КРГ', name: 'Круг', group: 'work', col: 2, row: 4, w: 2, h: 3, z: 30, shape: 'circle' }
        : { id, code: 'НОВ', name: 'Новый блок', group: 'work', col: 2, row: 4, w: 2, h: 2, z: 30, shape: 'rect' };
    setMods((ms) => [...ms, next]);
    setSel(id);
  };

  const selMod = mods.find((m) => m.id === sel) ?? null;
  const isDash = selMod?.id === 'dash' || selMod?.group === 'dash';
  const dashItems = isDash && selMod ? selMod.items ?? DEFAULT_DASH_ITEMS : [];
  const setDashItems = (next: DashItem[]) => selMod && updateMod(selMod.id, { items: next });
  const moveDashItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= dashItems.length) return;
    const next = [...dashItems];
    const a = next[idx];
    const b = next[j];
    if (!a || !b) return;
    next[idx] = b;
    next[j] = a;
    setDashItems(next);
  };

  // ── РЕЖИМ ПРОСМОТРА: макет с настоящим контентом ──────────────
  if (preview) {
    const pCellW = pcw / COLS;
    const pH = pcw * ASPECT;
    const pCellH = pH / ROWS;
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button
            onClick={() => setPreview(false)}
            className="rounded-full border border-[#C49262]/40 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-[#F4E9D5]/80 hover:border-[#C49262]"
          >
            ← Редактор
          </button>
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#C49262]">Просмотр макета</span>
        </div>

        <div className="mt-8 flex justify-center">
          {/* корпус телефона */}
          <div
            className="relative"
            style={{
              padding: 11,
              borderRadius: '3rem',
              background: 'linear-gradient(160deg,#1a120b,#0a0604)',
              boxShadow: '0 45px 100px -35px rgba(0,0,0,0.9)',
            }}
          >
            <div
              ref={previewRef}
              className="relative overflow-hidden rounded-[2.4rem] ring-1 ring-[#C49262]/15"
              style={{
                width: 'min(390px, 86vw)',
                height: pH,
                background: 'radial-gradient(120% 90% at 50% 0%, #2A1B11, #120A05)',
              }}
            >
              {mods.map((m) => (
                <PreviewBlock key={m.id} m={m} cw={pCellW} ch={pCellH} onOpen={setPreviewModal} />
              ))}

              {/* модалка деталей плитки — поверх экрана телефона */}
              <PreviewModal data={previewModal} onClose={() => setPreviewModal(null)} />

              {/* чёлка-динамик + индикатор */}
              <div className="pointer-events-none absolute left-1/2 top-0 z-[60] flex h-5 w-32 -translate-x-1/2 items-center justify-center gap-1.5 rounded-b-2xl bg-[#0a0604]">
                <span className="h-1 w-8 rounded-full bg-[#241910]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#241910]" />
              </div>
              <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-[60] h-1 w-28 -translate-x-1/2 rounded-full bg-[#F4E9D5]/30" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <header className="mx-auto max-w-6xl">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[#C49262]">Barvikha · Arca · Blueprint</div>
        <h1 className="mt-1 text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 500 }}>
          Сетка управления — A–G × 1.1–10.2
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F4E9D5]/55">
          Чертёж главной. Тяни блоки мышкой, тяни за нижний-правый угол — меняешь размер (всё прилипает к клеткам).
          Выбранный блок двигается <span className="text-[#C49262]">стрелками</span>,{' '}
          <span className="text-[#C49262]">Shift+стрелки</span> — размер. Раскладка сохраняется автоматически.
        </p>
      </header>

      {/* Тулбар */}
      <div className="mx-auto mt-5 flex max-w-6xl flex-wrap items-center gap-4">
        <button
          onClick={() => setPreview(true)}
          className="rounded-full border border-[#E5C490] bg-[#E5C490]/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E5C490] hover:bg-[#E5C490]/25"
        >
          ▶ Просмотр
        </button>
        <button
          onClick={() => setShowGrid((v) => !v)}
          className="rounded-full border border-[#C49262]/40 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-[#F4E9D5]/80 hover:border-[#C49262]"
        >
          Сетка: {showGrid ? 'вкл' : 'выкл'}
        </button>
        <button
          onClick={() => setLayering((v) => !v)}
          className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.15em] ${
            layering ? 'border-[#E5C490] bg-[#E5C490]/15 text-[#E5C490]' : 'border-[#C49262]/40 text-[#F4E9D5]/80 hover:border-[#C49262]'
          }`}
          title="Разрешить блокам накладываться друг на друга"
        >
          Наложение: {layering ? 'вкл' : 'выкл'}
        </button>
        <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#F4E9D5]/70">
          Прозрачность
          <input type="range" min={0.04} max={0.5} step={0.02} value={op} onChange={(e) => setOp(Number(e.target.value))} />
        </label>
        <button
          onClick={() => addMod('rect')}
          className="flex items-center gap-1.5 rounded-full border border-[#46B38A]/60 bg-[#46B38A]/10 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-[#F4E9D5] hover:border-[#46B38A]"
        >
          <Plus size={13} /> Блок
        </button>
        <button
          onClick={() => addMod('circle')}
          className="flex items-center gap-1.5 rounded-full border border-[#46B38A]/60 bg-[#46B38A]/10 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-[#F4E9D5] hover:border-[#46B38A]"
        >
          <Plus size={13} /> <span className="inline-block h-3 w-3 rounded-full border border-current" /> Круг
        </button>
        <button
          onClick={reset}
          className="rounded-full border border-[#C49262]/40 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-[#F4E9D5]/80 hover:border-[#C49262]"
        >
          Сброс
        </button>
      </div>

      <div className="mx-auto mt-6 grid max-w-6xl items-start gap-10 lg:grid-cols-[auto_1fr]">
        {/* ── Канвас с сеткой ── */}
        <div>
          {/* линейка-буквы сверху */}
          <div className="ml-7 grid" style={{ width: 'min(390px, 80vw)', gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {LETTERS.map((l) => (
              <div key={l} className="pb-1 text-center text-[10px] font-medium tracking-widest text-[#C49262]/70">
                {l}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* линейка-цифры слева */}
            <div className="flex w-7 flex-col" style={{ height: cw * ASPECT }}>
              {Array.from({ length: ROWS }).map((_, i) => (
                <div
                  key={i}
                  className={`flex flex-1 items-center justify-center text-[9px] font-medium ${
                    i % 2 === 0 ? 'text-[#C49262]/70' : 'text-[#C49262]/35'
                  }`}
                >
                  {rowLabel(i)}
                </div>
              ))}
            </div>

            {/* собственно экран */}
            <div
              ref={canvasRef}
              onPointerMove={onMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerDown={() => setSel(null)}
              className="relative touch-none overflow-hidden rounded-[2.4rem] border-4 border-[#0a0604] bg-[#120A05] ring-1 ring-[#C49262]/15"
              style={{
                width: 'min(390px, 80vw)',
                height: canvasH,
                boxShadow: '0 30px 70px -25px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(0,0,0,0.6)',
              }}
            >
              {/* чёлка-динамик телефона */}
              <div className="pointer-events-none absolute left-1/2 top-0 z-50 flex h-5 w-32 -translate-x-1/2 items-center justify-center gap-1.5 rounded-b-2xl bg-[#0a0604]">
                <span className="h-1 w-8 rounded-full bg-[#241910]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#241910]" />
              </div>
              {/* нижний индикатор-полоска */}
              <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-28 -translate-x-1/2 rounded-full bg-[#F4E9D5]/25" />
              {/* сетка */}
              {showGrid && (
                <div className="pointer-events-none absolute inset-0">
                  {Array.from({ length: ROWS }).map((_, r) =>
                    Array.from({ length: COLS }).map((__, c) => (
                      <div
                        key={`${c}-${r}`}
                        className="absolute border-[0.5px] border-[#C49262]/15"
                        style={{ left: c * cellW, top: r * cellH, width: cellW, height: cellH }}
                      >
                        <span className="absolute left-1 top-0.5 text-[7px] text-[#C49262]/25">
                          {LETTERS[c]}
                          {rowLabel(r)}
                        </span>
                      </div>
                    )),
                  )}
                </div>
              )}

              {/* модули */}
              {mods.map((m) => {
                const g = GROUPS[m.group];
                const selected = sel === m.id;
                const Icon = m.icon ? ICONS[m.icon] : null;
                return (
                  <div
                    key={m.id}
                    onPointerDown={(e) => startDrag(e, m, 'move')}
                    className={`absolute flex select-none flex-col items-center justify-center rounded-md text-center transition-[border-color,box-shadow] ${
                      m.locked ? 'cursor-default' : 'cursor-move'
                    }`}
                    style={{
                      left: m.col * cellW,
                      top: m.row * cellH,
                      width: m.w * cellW,
                      height: m.h * cellH,
                      zIndex: m.z + (selected ? 100 : 0),
                      background: `${g.color}${Math.round(op * 255).toString(16).padStart(2, '0')}`,
                      border: `1.5px ${m.locked ? 'solid' : selected ? 'solid' : 'dashed'} ${g.color}${selected || m.locked ? '' : 'aa'}`,
                      boxShadow: selected ? `0 0 0 2px ${g.color}88, 0 6px 20px rgba(0,0,0,0.4)` : 'none',
                      borderRadius: m.shape === 'circle' ? '50%' : undefined,
                    }}
                  >
                    {/* замок */}
                    {m.locked && (
                      <span
                        className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0a0604]/80"
                        style={{ color: g.color }}
                      >
                        <Lock size={9} />
                      </span>
                    )}
                    {/* иконка блока */}
                    {Icon && <Icon size={Math.min(m.w, m.h) > 2 ? 22 : 16} className="mb-1 text-[#F4E9D5]" />}

                    {/* бейдж кода */}
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#120A05]"
                      style={{ background: g.color }}
                    >
                      {m.code}
                    </span>
                    {m.h > 2 && <span className="mt-1 px-1 text-[8px] leading-tight text-[#F4E9D5]/75">{m.name}</span>}

                    {/* спец-контент дашборда — три иконки */}
                    {m.id === 'dash' && (
                      <div className="mt-1 flex items-center gap-3 text-[#F4E9D5]/85">
                        <Info size={14} />
                        <Home size={16} />
                        <ShoppingBag size={14} />
                      </div>
                    )}

                    {/* ручка ресайза */}
                    {!m.locked && (
                      <span
                        onPointerDown={(e) => startDrag(e, m, 'resize')}
                        className="absolute -bottom-1 -right-1 h-4 w-4 cursor-se-resize rounded-sm"
                        style={{ background: g.color, opacity: selected ? 1 : 0.5 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Панель управления / легенда ── */}
        <aside className="lg:pt-7">
          {/* ── Редактор выбранного блока ── */}
          {selMod && (
            <div className="mb-6 rounded-2xl border border-[#C49262]/30 bg-[#1B110A]/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.3em] text-[#C49262]">Редактор блока</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateMod(selMod.id, { locked: !selMod.locked })}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] ${
                      selMod.locked
                        ? 'border-[#E5C490] bg-[#E5C490]/15 text-[#E5C490]'
                        : 'border-[#C49262]/40 text-[#F4E9D5]/80 hover:border-[#C49262]'
                    }`}
                  >
                    {selMod.locked ? <Lock size={13} /> : <LockOpen size={13} />}
                    {selMod.locked ? 'Заблокирован' : 'Заблокировать'}
                  </button>
                  <button
                    onClick={() => removeMod(selMod.id)}
                    className="flex items-center gap-1.5 rounded-md border border-[#E5675A]/50 px-2.5 py-1 text-[11px] text-[#E5A29A] hover:border-[#E5675A] hover:text-[#E5675A]"
                  >
                    <Trash2 size={13} /> Удалить
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="col-span-1 flex flex-col gap-1 text-[10px] uppercase tracking-wider text-[#F4E9D5]/50">
                  Код
                  <input
                    value={selMod.code}
                    onChange={(e) => updateMod(selMod.id, { code: e.target.value })}
                    className="rounded-md border border-[#C49262]/25 bg-[#120A05] px-2 py-1.5 text-[13px] text-[#F4E9D5] outline-none focus:border-[#C49262]"
                  />
                </label>
                <label className="col-span-1 flex flex-col gap-1 text-[10px] uppercase tracking-wider text-[#F4E9D5]/50">
                  Группа (цвет)
                  <select
                    value={selMod.group}
                    onChange={(e) => updateMod(selMod.id, { group: e.target.value as GroupKey })}
                    className="rounded-md border border-[#C49262]/25 bg-[#120A05] px-2 py-1.5 text-[13px] text-[#F4E9D5] outline-none focus:border-[#C49262]"
                  >
                    {(Object.keys(GROUPS) as GroupKey[]).map((gk) => (
                      <option key={gk} value={gk}>
                        {GROUPS[gk].label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-[10px] uppercase tracking-wider text-[#F4E9D5]/50">
                  Название
                  <input
                    value={selMod.name}
                    onChange={(e) => updateMod(selMod.id, { name: e.target.value })}
                    className="rounded-md border border-[#C49262]/25 bg-[#120A05] px-2 py-1.5 text-[13px] text-[#F4E9D5] outline-none focus:border-[#C49262]"
                  />
                </label>
              </div>

              {/* Дашборд: иконки + расположение */}
              {isDash && (
                <div className="mt-3 rounded-xl border border-[#C49262]/25 bg-[#120A05]/60 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#E5C490]">Иконки дашборда</span>
                    <button
                      onClick={() => setDashItems([...dashItems, { icon: 'Star', label: 'Новое' }])}
                      className="rounded-md border border-[#46B38A]/50 bg-[#46B38A]/10 px-2 py-0.5 text-[10px] text-[#F4E9D5] hover:border-[#46B38A]"
                    >
                      ＋ иконка
                    </button>
                  </div>

                  {/* выравнивание */}
                  <div className="mt-2 flex gap-1.5">
                    {([['between', 'Разнести'], ['center', 'По центру'], ['around', 'Равномерно']] as const).map(
                      ([val, lbl]) => {
                        const active = (selMod?.align ?? 'between') === val;
                        return (
                          <button
                            key={val}
                            onClick={() => updateMod(selMod!.id, { align: val })}
                            className={`rounded-md border px-2 py-1 text-[10px] ${
                              active ? 'border-[#C49262] bg-[#C49262]/15 text-[#F4E9D5]' : 'border-[#C49262]/20 text-[#F4E9D5]/55 hover:border-[#C49262]/50'
                            }`}
                          >
                            {lbl}
                          </button>
                        );
                      },
                    )}
                  </div>

                  {/* список иконок */}
                  <div className="mt-2 space-y-1.5">
                    {dashItems.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <select
                          value={it.icon}
                          onChange={(e) => setDashItems(dashItems.map((x, i) => (i === idx ? { ...x, icon: e.target.value } : x)))}
                          className="w-24 shrink-0 rounded-md border border-[#C49262]/25 bg-[#120A05] px-1.5 py-1 text-[11px] text-[#F4E9D5] outline-none focus:border-[#C49262]"
                        >
                          {Object.keys(ICONS).map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                        <input
                          value={it.label}
                          placeholder="подпись"
                          onChange={(e) => setDashItems(dashItems.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))}
                          className="min-w-0 flex-1 rounded-md border border-[#C49262]/25 bg-[#120A05] px-2 py-1 text-[12px] text-[#F4E9D5] outline-none focus:border-[#C49262]"
                        />
                        <button
                          onClick={() => moveDashItem(idx, -1)}
                          className="rounded border border-[#C49262]/20 px-1.5 py-1 text-[10px] text-[#F4E9D5]/70 hover:border-[#C49262]/50"
                        >
                          ◀
                        </button>
                        <button
                          onClick={() => moveDashItem(idx, 1)}
                          className="rounded border border-[#C49262]/20 px-1.5 py-1 text-[10px] text-[#F4E9D5]/70 hover:border-[#C49262]/50"
                        >
                          ▶
                        </button>
                        <button
                          onClick={() => setDashItems(dashItems.filter((_, i) => i !== idx))}
                          className="rounded border border-[#E5675A]/40 px-1.5 py-1 text-[10px] text-[#E5A29A] hover:border-[#E5675A]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Слой (наложение) */}
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#F4E9D5]/50">
                <span>Слой</span>
                <span className="font-mono text-[#C49262]">z {selMod.z}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => bringFront(selMod.id)}
                  className="rounded-md border border-[#C49262]/30 px-2.5 py-1 text-[11px] text-[#F4E9D5]/85 hover:border-[#C49262]"
                >
                  ⤒ На самый верх
                </button>
                <button
                  onClick={() => stepLayer(selMod.id, 1)}
                  className="rounded-md border border-[#C49262]/30 px-2.5 py-1 text-[11px] text-[#F4E9D5]/85 hover:border-[#C49262]"
                >
                  ↑ Выше
                </button>
                <button
                  onClick={() => stepLayer(selMod.id, -1)}
                  className="rounded-md border border-[#C49262]/30 px-2.5 py-1 text-[11px] text-[#F4E9D5]/85 hover:border-[#C49262]"
                >
                  ↓ Ниже
                </button>
                <button
                  onClick={() => sendBack(selMod.id)}
                  className="rounded-md border border-[#C49262]/30 px-2.5 py-1 text-[11px] text-[#F4E9D5]/85 hover:border-[#C49262]"
                >
                  ⤓ На самый низ
                </button>
              </div>

              {/* Форма блока */}
              <div className="mt-3 text-[10px] uppercase tracking-wider text-[#F4E9D5]/50">Форма</div>
              <div className="mt-2 flex gap-2">
                {(['rect', 'circle'] as const).map((sh) => {
                  const active = (selMod.shape ?? 'rect') === sh;
                  return (
                    <button
                      key={sh}
                      onClick={() => updateMod(selMod.id, { shape: sh })}
                      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px] ${
                        active ? 'border-[#C49262] bg-[#C49262]/15 text-[#F4E9D5]' : 'border-[#C49262]/20 text-[#F4E9D5]/55 hover:border-[#C49262]/50'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 border border-current ${sh === 'circle' ? 'rounded-full' : 'rounded-[2px]'}`}
                      />
                      {sh === 'circle' ? 'Круг' : 'Прямоугольник'}
                    </button>
                  );
                })}
              </div>

              {/* Иконка: добавить / убрать */}
              <div className="mt-3 text-[10px] uppercase tracking-wider text-[#F4E9D5]/50">Иконка</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateMod(selMod.id, { icon: undefined })}
                  className={`flex h-8 w-8 items-center justify-center rounded-md border text-[10px] ${
                    !selMod.icon ? 'border-[#C49262] bg-[#C49262]/15 text-[#F4E9D5]' : 'border-[#C49262]/20 text-[#F4E9D5]/50'
                  }`}
                  title="Без иконки"
                >
                  ✕
                </button>
                {(Object.keys(ICONS) as string[]).map((key) => {
                  const Ic = ICONS[key];
                  const active = selMod.icon === key;
                  if (!Ic) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => updateMod(selMod.id, { icon: key })}
                      title={key}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                        active ? 'border-[#C49262] bg-[#C49262]/15 text-[#F4E9D5]' : 'border-[#C49262]/20 text-[#F4E9D5]/55 hover:border-[#C49262]/50'
                      }`}
                    >
                      <Ic size={15} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#F4E9D5]/50">
                <span>Позиция/размер — тяни мышкой или стрелками</span>
                <span className="font-mono text-[#C49262]">{cellLabel(selMod)}</span>
              </div>
            </div>
          )}

          <div className="text-[11px] uppercase tracking-[0.35em] text-[#C49262]">Кодовые имена · живые координаты</div>
          <p className="mt-2 text-sm text-[#F4E9D5]/60">
            Кликай по строке — подсветит блок. «+ Блок» добавит новый, в редакторе можно сменить иконку/поля или удалить.
          </p>

          <div className="mt-5 space-y-5">
            {(Object.keys(GROUPS) as GroupKey[]).map((gk) => {
              const list = mods.filter((m) => m.group === gk);
              if (list.length === 0) return null;
              const g = GROUPS[gk];
              return (
                <div key={gk}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: g.color }} />
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#F4E9D5]/70">{g.label}</span>
                  </div>
                  <ul className="space-y-1">
                    {list.map((m) => (
                      <li key={m.id}>
                        <button
                          onClick={() => setSel(m.id)}
                          className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                            sel === m.id ? 'border-[#C49262] bg-[#C49262]/10' : 'border-[#C49262]/15 hover:border-[#C49262]/40'
                          }`}
                        >
                          <span
                            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#120A05]"
                            style={{ background: g.color }}
                          >
                            {m.code}
                          </span>
                          <span className="flex-1 text-[12px] text-[#F4E9D5]/80">{m.name}</span>
                          {m.locked && <Lock size={11} className="shrink-0 text-[#E5C490]" />}
                          <span className="shrink-0 font-mono text-[11px] text-[#C49262]">{cellLabel(m)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
