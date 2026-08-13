#!/usr/bin/env bash
# Автосинхронизация VDS с origin/main: если в git есть новые коммиты —
# подтягивает, ставит зависимости, собирает hub+menu и рестартует PM2.
# Живёт и коммитится в репо (не только на сервере), чтобы правки в сам
# процесс деплоя тоже проходили через git, а не заводились на сервере
# отдельно — именно расхождение "ручных" правок на VDS с origin/main уже
# один раз ломало git pull на проде (см. project memory).
#
# Запускается по крону на VDS каждые пару минут (см. README ниже) —
# НЕ предназначен для запуска с локальной машины.
#
# Атомарная подмена .next (собираем в .next-building, потом одним rename
# меняем местами с боевой .next) — как в scripts/deploy.sh. Раньше этот
# крон-скрипт собирал билд прямо поверх живой .next, пока next start её же
# читал: это ловило гонку ("Could not find a production build" /
# "Failed to find Server Action") и роняло сайт на ~минуту при каждом из
# десятков деплоев в день — то самое "виснет-тупит" при статусе 200.
#
# Безопасность при неудачной сборке: если build падает, откатываем git
# обратно на последний рабочий коммит и пересобираем на нём же — .next
# на диске всегда остаётся в рабочем состоянии, PM2 не рестартуется на
# сломанную сборку (см. project memory про 502 из-за незавершённого .next).
set -euo pipefail

REPO_DIR=/var/www/barviha-app
LOCK=/tmp/barviha-deploy.lock

exec 200>"$LOCK"
flock -n 200 || exit 0  # уже идёт другой прогон — тихо выходим, не копим очередь

log() { echo "[deploy $(date -Is)] $*"; }

build_and_swap() {
  local dir="$1" filter="$2"
  NEXT_DIST_DIR=.next-building pnpm --filter "$filter" build
  rm -rf "$dir/.next-old"
  if [ -d "$dir/.next" ]; then
    mv "$dir/.next" "$dir/.next-old"
  fi
  mv "$dir/.next-building" "$dir/.next"
  rm -rf "$dir/.next-old"
}

cd "$REPO_DIR"

BEFORE=$(git rev-parse HEAD)
git fetch origin main --quiet
AFTER=$(git rev-parse origin/main)

if [ "$BEFORE" = "$AFTER" ]; then
  exit 0  # нечего катить
fi

log "обновление $BEFORE -> $AFTER"
git reset --hard origin/main --quiet

if pnpm install --frozen-lockfile --silent \
   && build_and_swap apps/hub @barviha/hub \
   && build_and_swap apps/menu @barviha/menu; then
  pm2 restart barviha-hub barviha-menu >/dev/null
  log "успех, теперь на $AFTER"
else
  log "СБОРКА УПАЛА на $AFTER — откатываю на $BEFORE и пересобираю, чтобы .next остался рабочим"
  git reset --hard "$BEFORE" --quiet
  pnpm install --frozen-lockfile --silent || true
  build_and_swap apps/hub @barviha/hub || true
  build_and_swap apps/menu @barviha/menu || true
  log "откат на $BEFORE завершён (старый процесс не перезапускался, продолжал работать всё это время)"
  exit 1
fi
