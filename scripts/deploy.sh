#!/usr/bin/env bash
# Деплой на боевой VDS — запускать НА СЕРВЕРЕ из /var/www/barviha-app.
#
# Собирает в отдельную .next-building, а не поверх боевой .next — иначе
# `next build` поверх .next живого `next start` время от времени ловит
# гонку (сервер читает манифест в момент, когда сборка его как раз
# переписывает) и валится с "client reference manifest does not exist" /
# "Failed to find Server Action". Раньше это вызывало шквал рестартов pm2
# прямо во время работы пользователя в бэк-офисе. Подмена директории —
# один rename (atomic на одной файловой системе), окно риска — доли секунды
# вместо всего времени сборки.
set -euo pipefail
cd "$(dirname "$0")/.."

# ОДИН И ТОТ ЖЕ ЛОК с крон-автодеплоем (deploy/deploy-vds.sh, крон каждые
# 2 минуты). Без него два `next build` шли по одному и тому же каталогу
# одновременно: 2026-08-25 это уронило прод — крон подменил боевую .next
# чужим недособранным .next-building, и next start падал 1200+ раз подряд.
# Ждём до 20 минут, а не выходим сразу: ручной деплой обычно зовут осознанно.
LOCK=/tmp/barviha-deploy.lock
exec 200>"$LOCK"
if ! flock -w 1200 200; then
  echo "не дождался лока $LOCK (идёт автодеплой?) — попробуй ещё раз" >&2
  exit 1
fi

git pull

deploy_app() {
  local app="$1" pm2_name="$2"
  echo "==> $app"
  rm -rf "apps/${app#@barviha/}/.next-building"
  NEXT_DIST_DIR=.next-building pnpm --filter "$app" build
  # Без BUILD_ID каталог нерабочий — в бой такое не подменяем.
  if [ ! -f "apps/${app#@barviha/}/.next-building/BUILD_ID" ]; then
    echo "сборка $app без BUILD_ID — прерываю, боевую .next не трогаю" >&2
    exit 1
  fi
  rm -rf "apps/${app#@barviha/}/.next-old"
  if [ -d "apps/${app#@barviha/}/.next" ]; then
    mv "apps/${app#@barviha/}/.next" "apps/${app#@barviha/}/.next-old"
  fi
  mv "apps/${app#@barviha/}/.next-building" "apps/${app#@barviha/}/.next"
  pm2 restart "$pm2_name"
  rm -rf "apps/${app#@barviha/}/.next-old"
}

deploy_app "@barviha/menu" barviha-menu
deploy_app "@barviha/hub" barviha-hub

pm2 save
echo "done"
