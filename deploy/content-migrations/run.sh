#!/usr/bin/env bash
# Одноразовые правки контента (packages/db/content — вне git) через деплой.
#
# Зачем: content-store не в git, а SSH до VDS ходит через раз. Чтобы массовая
# правка JSON меню (КБЖУ, описания и т.п.) доехала до прода тем же путём,
# что и код — git push → крон deploy-vds.sh — сюда кладётся папка
#   deploy/content-migrations/<YYYY-MM-DD-имя>/apply.mjs (+ данные рядом).
#
# Контракт apply.mjs: аргумент $1 — абсолютный путь к packages/db/content;
# должен быть ИДЕМПОТЕНТНЫМ (повторный запуск ничего не меняет) и никогда
# не трогать то, что уже заполнено руками в бэк-офисе — только дописывать
# пустое. Успешный прогон отмечается маркером
#   packages/db/content/.migrations/<имя>.done
# (лежит рядом с данными, т.е. тоже вне git и переживает деплои).
#
# Любая ошибка здесь НЕ должна ронять деплой — вызывающий код оборачивает
# запуск в `|| true`, а сам скрипт не использует set -e.
set -u

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
CONTENT="$ROOT/packages/db/content"
MIGR_DIR="$ROOT/deploy/content-migrations"
DONE_DIR="$CONTENT/.migrations"

log() { echo "[content-migrations $(date '+%Y-%m-%dT%H:%M:%S%z')] $*"; }

if [ ! -d "$CONTENT" ]; then
  log "нет $CONTENT — пропускаю"
  exit 0
fi
mkdir -p "$DONE_DIR"

for dir in "$MIGR_DIR"/*/; do
  [ -d "$dir" ] || continue
  name=$(basename "$dir")
  [ -f "$dir/apply.mjs" ] || continue
  if [ -f "$DONE_DIR/$name.done" ]; then
    continue
  fi
  log "применяю $name"
  if node "$dir/apply.mjs" "$CONTENT"; then
    date '+%Y-%m-%dT%H:%M:%S%z' > "$DONE_DIR/$name.done"
    log "$name — готово"
  else
    log "$name — ОШИБКА (маркер не ставлю, повторю на следующем деплое)"
  fi
done
