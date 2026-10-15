#!/usr/bin/env bash
# Крон-обёртка синхронизации меню с Google Таблицей (см. sync.mjs, config.json).
# Ставится на сервере в /etc/cron.d/barviha-sheet-sync, раз в 10 минут:
#   3-59/10 * * * * root /var/www/barviha-app/deploy/sheet-sync/run-server.sh   (не в одну минуту с деплоем, он идёт по */2)
# Лог: /var/log/barviha-sheet-sync.log. Отчёты: <content>/.sheet-sync/.
set -u
APP=${APP:-/var/www/barviha-app}
CONTENT=${CONTENT:-/var/www/barviha-data/content}
LOG=${LOG:-/var/log/barviha-sheet-sync.log}
LOCK=/run/lock/barviha-sheet-sync.lock

# не пересекаться с самим собой и с деплоем (он тоже может править контент).
# Деплой проверяем по его flock-файлу, а не по pgrep: `pgrep -f deploy-vds.sh`
# совпадал с самим кроном деплоя и синхронизация молча не запускалась ни разу
# (15.10.2026).
exec 9>"$LOCK"
flock -n 9 || exit 0
if ! flock -n /tmp/barviha-deploy.lock -c true; then exit 0; fi

cd "$APP" || exit 0
PATH=/usr/local/bin:/usr/bin:/bin:$PATH
node deploy/sheet-sync/sync.mjs --content "$CONTENT" --apply >>"$LOG" 2>&1
