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
#
# 2026-08-25: build_and_swap подменял .next ДАЖЕ когда сборка падала —
# внутри `if A && B && C` bash отключает `set -e`, поэтому провалившийся
# `pnpm build` не прерывал функцию, и следующий `mv .next-building .next`
# затаскивал в бой чужой недособранный каталог (в тот раз — от ручного
# scripts/deploy.sh, запущенного параллельно). Итог: `next start` падал
# с "Could not find a production build" 1200+ раз подряд, nginx отдавал
# страницу техработ. Теперь: сборка проверяется явно (код возврата +
# наличие BUILD_ID), подмена только после успеха, а ручной деплой берёт
# тот же flock — параллельных сборок больше не бывает.
set -euo pipefail

# Работаем из КОПИИ себя: ниже скрипт делает `git reset --hard` по репозиторию,
# в котором сам же и лежит, а bash дочитывает файл по ходу выполнения — правка
# собственного текста на лету рвала бы исполнение посреди функции.
if [ "${BARVIHA_DEPLOY_REEXEC:-}" != "1" ]; then
  cp -f "$0" /tmp/barviha-deploy-run.sh
  chmod +x /tmp/barviha-deploy-run.sh
  BARVIHA_DEPLOY_REEXEC=1 exec /tmp/barviha-deploy-run.sh "$@"
fi

REPO_DIR=/var/www/barviha-app
LOCK=/tmp/barviha-deploy.lock

exec 200>"$LOCK"
flock -n 200 || exit 0  # уже идёт другой прогон — тихо выходим, не копим очередь

log() { echo "[deploy $(date -Is)] $*"; }

# Собирает в .next-building и подменяет боевую .next ТОЛЬКО если сборка
# реально удалась. Любой ранний выход — return 1: вызывающий код уводит
# репозиторий на прошлый коммит, а боевая .next остаётся нетронутой.
build_and_swap() {
  local dir="$1" filter="$2"

  # Остатки прошлого прогона (или чужой параллельной сборки) — не наши,
  # подменять ими бой нельзя.
  rm -rf "$dir/.next-building"

  if ! NEXT_DIST_DIR=.next-building pnpm --filter "$filter" build; then
    log "СБОРКА $filter упала (ненулевой код) — боевую .next не трогаю"
    rm -rf "$dir/.next-building"
    return 1
  fi

  # Двойная страховка: без BUILD_ID `next start` всё равно не поднимется,
  # так что такой каталог в бой не пускаем.
  if [ ! -f "$dir/.next-building/BUILD_ID" ]; then
    log "СБОРКА $filter без BUILD_ID (оборвалась) — боевую .next не трогаю"
    rm -rf "$dir/.next-building"
    return 1
  fi

  rm -rf "$dir/.next-old"
  if [ -d "$dir/.next" ]; then
    mv "$dir/.next" "$dir/.next-old"
  fi
  mv "$dir/.next-building" "$dir/.next"
  # .next-old НЕ удаляем: это откат на случай, если после рестарта
  # приложение не отвечает (см. health_ok/rollback ниже).
}

# Возвращает 0, если приложение реально отвечает на своём порту.
health_ok() {
  local port="$1" path="$2" i code
  for i in 1 2 3 4 5 6 7 8 9 10; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "http://127.0.0.1:$port$path" || echo 000)
    case "$code" in 2??|3??) return 0 ;; esac
    sleep 3
  done
  log "health-check провален: порт $port отдал '$code'"
  return 1
}

# Возврат прошлой сборки на место (если она сохранилась).
rollback_next() {
  local dir="$1"
  if [ -d "$dir/.next-old" ]; then
    rm -rf "$dir/.next-broken"
    mv "$dir/.next" "$dir/.next-broken"
    mv "$dir/.next-old" "$dir/.next"
    log "вернул прошлую сборку $dir/.next (сломанная лежит в .next-broken)"
  fi
}

drop_old() {
  rm -rf "$1/.next-old"
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
  if health_ok 3000 /arka && health_ok 3100 /back-off; then
    drop_old apps/hub
    drop_old apps/menu
    log "успех, теперь на $AFTER"
  else
    log "ПОСЛЕ РЕСТАРТА приложение не отвечает — откатываю сборку и код на $BEFORE"
    rollback_next apps/menu
    rollback_next apps/hub
    git reset --hard "$BEFORE" --quiet
    pm2 restart barviha-hub barviha-menu >/dev/null
    exit 1
  fi
else
  log "СБОРКА УПАЛА на $AFTER — откатываю на $BEFORE и пересобираю, чтобы .next остался рабочим"
  git reset --hard "$BEFORE" --quiet
  pnpm install --frozen-lockfile --silent || true
  build_and_swap apps/hub @barviha/hub || true
  build_and_swap apps/menu @barviha/menu || true
  drop_old apps/hub
  drop_old apps/menu
  log "откат на $BEFORE завершён (старый процесс не перезапускался, продолжал работать всё это время)"
  exit 1
fi
