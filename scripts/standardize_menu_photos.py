#!/usr/bin/env python3
"""
Стандартизация фото меню «АРКА» (Pillow, без OpenCV/rembg).

Цель — единый аппетитный вид белофоновых каталожных фото под СВЕТЛЫЙ UI:
  1) Баланс белого по «белой точке» фона: фон каждого фото приводится к
     единому тёпло-нейтральному тону (нейтрализуем холодные и перегретые кадры).
  2) Мягкая нормализация экспозиции: тёмные выбросы подтягиваются к целевой
     яркости, пересветы слегка осаживаются. Коррекция ОГРАНИЧЕНА по силе.
  3) Единый лёгкий пресет: насыщенность + микроконтраст.

Все коррекции «capped» — хорошие кадры почти не трогаем, чиним выбросы.

Использование:
  python3 scripts/standardize_menu_photos.py --preview   # 8 файлов → preview/
  python3 scripts/standardize_menu_photos.py --apply      # все из бэкапа → live
"""
import argparse, glob, os, sys
from PIL import Image, ImageEnhance, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_BACKUP = os.path.join(ROOT, ".image-backup")            # пристина-исходники
LIVE_DIR   = os.path.join(ROOT, "apps/menu/public/menu")    # отдаётся сайтом
PREVIEW_DIR= os.path.join(ROOT, "scripts/_preview")

# --- целевые ориентиры (из замеров по всему набору) ---
TARGET_LUMA = 82.0          # средняя яркость кластера большинства
TARGET_WARM = 12.0          # R-B фона: лёгкое тепло, премиально, не клинически
# пределы силы коррекций (чтобы не «передавить»)
WB_GAIN_MIN, WB_GAIN_MAX = 0.90, 1.10     # ±10% по каналам
EXP_MIN, EXP_MAX = 0.92, 1.18             # экспозиция: -8%..+18%
SATURATION = 1.05
CONTRAST   = 1.03
# Тёмностильные «геройские» кадры (бургеры на чёрном и т.п.): доля глубоких
# теней велика. Их НЕЛЬЗЯ осветлять — подъём теней на уже сжатом WebP
# вытаскивает наружу макроблоки (бандинг) и убивает задуманный тёмный муд.
DARK_FRAME_SHADOW = 0.40   # >40% пикселей в глубокой тени → не поднимаем экспозицию
SHADOW_LUMA = 40           # порог «глубокой тени» по L

PREVIEW_FILES = [
    "kitchen-salads-tartar-iz-tunca.webp",      # холодный
    "kitchen-salads-tartar-iz-lososia.webp",    # холодный
    "kitchen-hot-goviazhi-rebra-kopchenye-s-sousom-iz-elovyh-shis.webp",  # тёплый
    "kitchen-pasta-lapsha-s-kuricei-i-krevetkami-v-souse-kokosovyi-.webp",# тёплый
    "kitchen-burgers-burger-barviha-s-dvoinoi-kotletoi-koniachnym-sou.webp", # тёмный
    "kitchen-burgers-burger-klassika-s-kotletoi-iz-mramornoi-goviadin.webp", # тёмный
    "bar-cocktails-negroni.webp",               # эталон-бокал
    "bar-wine-herederos-del-marques-de-riscal-verdejo.webp",  # светлый
]


def clamp(v, lo, hi):
    return max(lo, min(hi, v))


def white_point(im):
    """Средний цвет ярких пикселей (фон/блик) — референс белой точки."""
    small = im.resize((96, 96))
    px = list(small.getdata())
    lum = [(0.299*r + 0.587*g + 0.114*b, (r, g, b)) for r, g, b in px]
    lum.sort(key=lambda x: x[0], reverse=True)
    top = lum[: max(1, len(lum) // 12)]  # верхние ~8%
    n = len(top)
    r = sum(p[1][0] for p in top) / n
    g = sum(p[1][1] for p in top) / n
    b = sum(p[1][2] for p in top) / n
    return r, g, b


def shadow_fraction(im):
    """Доля пикселей в глубокой тени (по уменьшенной копии) — детектор тёмного кадра."""
    small = im.resize((96, 96)).convert("L")
    px = small.getdata()
    dark = sum(1 for v in px if v < SHADOW_LUMA)
    return dark / len(px)


def process(im):
    im = im.convert("RGB")

    # Тёмностильный геройский кадр (бургер на чёрном и т.п.)?
    # У него нет нейтральной белой точки — самый яркий пиксель это ТЁПЛАЯ еда
    # (булка), а не референс. WB по ней кулит весь кадр (gb≈1.1) и на near-black
    # фоне вытаскивает макроблоки WebP в синий бандинг. Осветление — то же.
    # Такие кадры уже консистентны между собой → не трогаем (только лёгкая
    # насыщенность, безопасная для нейтральных теней).
    dark_frame = shadow_fraction(im) > DARK_FRAME_SHADOW

    # 1) Баланс белого по белой точке: тянем фон к тёпло-нейтрали.
    if not dark_frame:
        r, g, b = white_point(im)
        base = (r + g + b) / 3.0
        if base > 1:
            # цель: яркие пиксели нейтральны, но R чуть выше B (тёплый белый)
            tgt_r = base + TARGET_WARM * 0.5
            tgt_g = base
            tgt_b = base - TARGET_WARM * 0.5
            gr = clamp(tgt_r / r, WB_GAIN_MIN, WB_GAIN_MAX)
            gg = clamp(tgt_g / g, WB_GAIN_MIN, WB_GAIN_MAX)
            gb = clamp(tgt_b / b, WB_GAIN_MIN, WB_GAIN_MAX)
            lut = (
                [clamp(int(i * gr), 0, 255) for i in range(256)] +
                [clamp(int(i * gg), 0, 255) for i in range(256)] +
                [clamp(int(i * gb), 0, 255) for i in range(256)]
            )
            im = im.point(lut)

    # 2) Нормализация экспозиции (capped) — только для светлых каталожных кадров.
    if not dark_frame:
        luma = ImageStat.Stat(im).mean
        cur = 0.299*luma[0] + 0.587*luma[1] + 0.114*luma[2]
        if cur > 1:
            exp = clamp(TARGET_LUMA / cur, EXP_MIN, EXP_MAX)
            # к единице приглушаем (мягче), чтобы не выбеливать уже нормальные
            exp = 1.0 + (exp - 1.0) * 0.7
            im = ImageEnhance.Brightness(im).enhance(exp)

    # 3) Единый пресет. Контраст пивотит на mean и сместил бы тени тёмного
    # кадра — поэтому для dark_frame применяем только насыщенность.
    im = ImageEnhance.Color(im).enhance(SATURATION)
    if not dark_frame:
        im = ImageEnhance.Contrast(im).enhance(CONTRAST)
    return im


def run(files, out_dir, src_dir):
    os.makedirs(out_dir, exist_ok=True)
    for name in files:
        src = os.path.join(src_dir, name)
        if not os.path.exists(src):
            print("  SKIP (нет файла):", name); continue
        im = Image.open(src)
        out = process(im)
        out.save(os.path.join(out_dir, name), "WEBP", quality=88, method=6)
        print("  ok:", name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    if a.preview:
        print("PREVIEW →", PREVIEW_DIR)
        run(PREVIEW_FILES, PREVIEW_DIR, SRC_BACKUP)
    elif a.apply:
        files = [os.path.basename(f) for f in glob.glob(os.path.join(SRC_BACKUP, "*.webp"))]
        print(f"APPLY {len(files)} файлов из бэкапа → {LIVE_DIR}")
        run(files, LIVE_DIR, SRC_BACKUP)
    else:
        print("укажи --preview или --apply"); sys.exit(1)
    print("готово.")


if __name__ == "__main__":
    main()
