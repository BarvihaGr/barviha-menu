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
   && pnpm --filter @barviha/hub build \
   && pnpm --filter @barviha/menu build; then
  pm2 restart barviha-hub barviha-menu >/dev/null
  log "успех, теперь на $AFTER"
else
  log "СБОРКА УПАЛА на $AFTER — откатываю на $BEFORE и пересобираю, чтобы .next остался рабочим"
  git reset --hard "$BEFORE" --quiet
  pnpm install --frozen-lockfile --silent || true
  pnpm --filter @barviha/hub build || true
  pnpm --filter @barviha/menu build || true
  log "откат на $BEFORE завершён (старый процесс не перезапускался, продолжал работать всё это время)"
  exit 1
fi
