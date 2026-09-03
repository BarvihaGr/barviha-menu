#!/usr/bin/env bash
# «Врач» боевого VDS: смотрит состояние Барвиха-меню и чинит типовые поломки.
#
# Задуман как ЕДИНСТВЕННОЕ, что может выполнить ключ внешнего бота-наблюдателя:
# в /root/.ssh/authorized_keys ключ прописан с forced command на этот файл, без
# pty и без проброса портов. Поэтому команда приходит не аргументом, а в
# переменной SSH_ORIGINAL_COMMAND, и её нельзя выполнять как есть — только
# сверять с белым списком ниже (иначе `ssh bot@host "status; rm -rf /"`
# выполнил бы вторую половину строки).
#
# Команды:
#   status  — JSON: pm2, health-эндпоинт, диск, коммит. Ничего не меняет.
#   fix     — чинит найденное: пересобирает пропавшую/битую .next, поднимает
#             упавший процесс, чистит мусор при нехватке места. Идемпотентно:
#             если всё здорово — не делает ничего.
#   deploy  — принудительно подтягивает origin/main и пересобирает (то же, что
#             делает крон, но не дожидаясь его).
#   logs    — хвост лога автодеплоя и лога ошибок pm2.
#
# Все изменяющие команды берут общий flock с крон-автодеплоем
# (deploy/deploy-vds.sh) — параллельные сборки на этом сервере уже роняли прод.
set -uo pipefail

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

REPO_DIR=/var/www/barviha-app
LOCK=/tmp/barviha-deploy.lock
MENU_PORT=3000
HUB_PORT=3100
DEPLOY_LOG=/var/log/barviha-deploy.log
DOCTOR_LOG=/var/log/barviha-doctor.log

# Действия, которые скрипт реально выполнил — уходят в JSON-ответ боту.
ACTIONS=()
act() {
  ACTIONS+=("$1")
  echo "[doctor $(date -Is)] $1" >> "$DOCTOR_LOG"
}

json_escape() { python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))'; }

json_array() {
  local out="[" first=1 a
  for a in ${ACTIONS+"${ACTIONS[@]}"}; do
    [ $first -eq 1 ] || out+=","
    first=0
    out+=$(printf '%s' "$a" | json_escape)
  done
  printf '%s]' "$out"
}

# --- сбор состояния -------------------------------------------------------

pm2_json() {
  pm2 jlist 2>/dev/null | python3 -c '
import json,sys
try: d=json.load(sys.stdin)
except Exception: print("[]"); raise SystemExit
out=[]
for p in d:
    e=p.get("pm2_env",{})
    out.append({"name":p.get("name"),"status":e.get("status"),
                "restarts":e.get("restart_time"),"uptime_sec":int((e.get("pm_uptime") or 0)/1000)})
print(json.dumps(out,ensure_ascii=False))
' || echo "[]"
}

health_token() {
  # Токен лежит рядом с приложением; читаем без исполнения файла окружения.
  grep -h '^BARVIHA_HEALTH_TOKEN=' "$REPO_DIR/apps/menu/.env.production.local" 2>/dev/null \
    | tail -1 | cut -d= -f2- | tr -d '"'"'"' \r'
}

health_json() {
  local tok
  tok=$(health_token)
  curl -s -m 15 -H "Authorization: Bearer $tok" "http://127.0.0.1:$MENU_PORT/api/health" 2>/dev/null || echo '{}'
}

http_code() { curl -s -o /dev/null -w '%{http_code}' -m 15 "$1" 2>/dev/null || echo 000; }

build_ok() { [ -f "$REPO_DIR/apps/menu/.next/BUILD_ID" ]; }

# --- починка --------------------------------------------------------------

# Пересборка приложения с атомарной подменой .next. Возвращает 1, если сборка
# не удалась — боевую .next в этом случае не трогаем (см. deploy/deploy-vds.sh).
rebuild() {
  local app="$1" dir="$2"
  rm -rf "$dir/.next-building"
  if ! (cd "$REPO_DIR" && NEXT_DIST_DIR=.next-building pnpm --filter "$app" build) >> "$DOCTOR_LOG" 2>&1; then
    act "сборка $app упала — боевую .next не трогал, смотри $DOCTOR_LOG"
    rm -rf "$dir/.next-building"
    return 1
  fi
  if [ ! -f "$dir/.next-building/BUILD_ID" ]; then
    act "сборка $app прошла без BUILD_ID — подмену отменил"
    rm -rf "$dir/.next-building"
    return 1
  fi
  rm -rf "$dir/.next-old"
  [ -d "$dir/.next" ] && mv "$dir/.next" "$dir/.next-old"
  mv "$dir/.next-building" "$dir/.next"
  rm -rf "$dir/.next-old"
  act "пересобрал $app и подменил .next"
}

wait_healthy() {
  local port="$1" i code
  for i in $(seq 1 12); do
    code=$(http_code "http://127.0.0.1:$port/")
    case "$code" in 2??|3??) return 0 ;; esac
    sleep 3
  done
  return 1
}

cleanup_disk() {
  local free_gb
  free_gb=$(df -BG --output=avail "$REPO_DIR" | tail -1 | tr -dc '0-9')
  if [ "${free_gb:-99}" -lt 5 ]; then
    rm -rf "$REPO_DIR"/apps/*/.next-old "$REPO_DIR"/apps/*/.next-broken "$REPO_DIR"/apps/*/.next-building
    pm2 flush >/dev/null 2>&1
    act "мало места (${free_gb}G) — снёс .next-old/.next-broken/.next-building и очистил логи pm2"
  fi
}

do_fix() {
  cleanup_disk

  # 1. Сборка на месте? Именно её пропажа роняла прод 2026-08-25.
  if ! build_ok; then
    act "нет apps/menu/.next/BUILD_ID — приложение поднято без рабочей сборки"
    rebuild @barviha/menu "$REPO_DIR/apps/menu" || return 1
    pm2 restart barviha-menu >/dev/null 2>&1 && act "перезапустил barviha-menu"
  fi

  # 2. Процессы подняты?
  local st
  for p in barviha-menu barviha-hub; do
    st=$(pm2 jlist 2>/dev/null | python3 -c "
import json,sys
try: d=json.load(sys.stdin)
except Exception: print('unknown'); raise SystemExit
print(next((x['pm2_env'].get('status','unknown') for x in d if x.get('name')=='$p'),'missing'))
")
    if [ "$st" != "online" ]; then
      act "$p в состоянии '$st' — поднимаю"
      pm2 restart "$p" >/dev/null 2>&1 || pm2 start "$p" >/dev/null 2>&1
    fi
  done

  # 3. Отвечает ли меню после всего этого.
  if ! wait_healthy "$MENU_PORT"; then
    act "меню не отвечает на :$MENU_PORT — пробую полную пересборку"
    rebuild @barviha/menu "$REPO_DIR/apps/menu" || return 1
    pm2 restart barviha-menu >/dev/null 2>&1
    wait_healthy "$MENU_PORT" || { act "меню не поднялось и после пересборки — нужен человек"; return 1; }
    act "меню поднялось после пересборки"
  fi

  if ! wait_healthy "$HUB_PORT"; then
    act "бэк-офис не отвечает на :$HUB_PORT — перезапускаю"
    pm2 restart barviha-hub >/dev/null 2>&1
    wait_healthy "$HUB_PORT" || act "бэк-офис так и не ответил — нужен человек"
  fi

  [ ${#ACTIONS[@]} -eq 0 ] && act "всё исправно, чинить нечего"
  return 0
}

do_deploy() {
  cd "$REPO_DIR" || return 1
  local before after
  before=$(git rev-parse HEAD)
  git fetch origin main --quiet
  after=$(git rev-parse origin/main)
  if [ "$before" = "$after" ]; then
    act "уже на последнем коммите ${after:0:12} — деплоить нечего"
    return 0
  fi
  git reset --hard origin/main --quiet
  pnpm install --frozen-lockfile --silent >> "$DOCTOR_LOG" 2>&1
  act "подтянул ${before:0:12} -> ${after:0:12}"
  rebuild @barviha/hub "$REPO_DIR/apps/hub" || { git reset --hard "$before" --quiet; act "откатил код на ${before:0:12}"; return 1; }
  rebuild @barviha/menu "$REPO_DIR/apps/menu" || { git reset --hard "$before" --quiet; act "откатил код на ${before:0:12}"; return 1; }
  pm2 restart barviha-hub barviha-menu >/dev/null 2>&1
  wait_healthy "$MENU_PORT" || { act "после деплоя меню не отвечает — запускаю fix"; do_fix; }
  act "деплой завершён на ${after:0:12}"
}

# --- вывод ----------------------------------------------------------------

print_status() {
  local pm2j health menu_code hub_code ext_code disk commit
  pm2j=$(pm2_json)
  health=$(health_json)
  menu_code=$(http_code "http://127.0.0.1:$MENU_PORT/")
  hub_code=$(http_code "http://127.0.0.1:$HUB_PORT/back-off")
  ext_code=$(http_code "https://menu.barvikhagroup.ru/arka")
  disk=$(df -h "$REPO_DIR" | tail -1 | awk '{print $4" свободно из "$2" ("$5" занято)"}')
  commit=$(cd "$REPO_DIR" && git rev-parse --short HEAD 2>/dev/null || echo unknown)
  python3 - "$pm2j" "$health" "$menu_code" "$hub_code" "$ext_code" "$disk" "$commit" "$(json_array)" <<'PY'
import json,sys,datetime
pm2j,health,menu,hub,ext,disk,commit,actions=sys.argv[1:9]
def j(s,d):
    try: return json.loads(s)
    except Exception: return d
health=j(health,{})
checks=health.get('checks',[])
problems=[c for c in checks if c.get('status')=='fail']
warns=[c for c in checks if c.get('status')=='warn']
pm2=j(pm2j,[])
down=[p for p in pm2 if p.get('name','').startswith('barviha') and p.get('status')!='online']
healthy = menu in ('200','307','308') and ext in ('200','307','308') and not problems and not down
print(json.dumps({
  'ok': healthy,
  'status': 'ok' if healthy else ('fail' if (problems or down or ext not in ('200','307','308')) else 'warn'),
  'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'commit': commit,
  'http': {'menu_local': menu, 'hub_local': hub, 'site_public': ext},
  'pm2': pm2,
  'disk': disk,
  'health': health,
  'problems': [c.get('name') for c in problems],
  'warnings': [c.get('name') for c in warns],
  'actions': j(actions,[]),
}, ensure_ascii=False, indent=2))
PY
}

print_result() {
  printf '{\n  "command": "%s",\n  "actions": %s,\n  "status_after":\n' "$1" "$(json_array)"
  print_status
  printf '}\n'
}

# Общий лок с крон-автодеплоем: держим его на всё время изменяющей команды,
# чтобы наша сборка и сборка крона не шли одновременно (это уже роняло прод).
take_lock() {
  exec 200>"$LOCK"
  if ! flock -w 1800 200; then
    echo '{"ok": false, "error": "не дождался лока деплоя за 30 минут"}' >&2
    exit 3
  fi
}

# --- разбор команды -------------------------------------------------------

# Через forced command команда приходит в SSH_ORIGINAL_COMMAND; при ручном
# запуске — обычным аргументом. Берём первое непустое и сверяем со списком.
CMD="${1:-${SSH_ORIGINAL_COMMAND:-status}}"
CMD="${CMD%% *}"   # отбрасываем всё после первого пробела: аргументов у команд нет

case "$CMD" in
  status|"")
    print_status
    ;;
  fix)
    take_lock
    do_fix >/dev/null
    print_result fix
    ;;
  deploy)
    take_lock
    do_deploy >/dev/null
    print_result deploy
    ;;
  logs)
    echo "=== $DEPLOY_LOG (30) ==="; tail -30 "$DEPLOY_LOG" 2>/dev/null
    echo "=== $DOCTOR_LOG (30) ==="; tail -30 "$DOCTOR_LOG" 2>/dev/null
    echo "=== pm2 barviha-menu error (30) ==="; tail -30 /root/.pm2/logs/barviha-menu-error.log 2>/dev/null
    ;;
  help|--help|-h)
    echo "команды: status | fix | deploy | logs"
    ;;
  *)
    echo "{\"ok\": false, \"error\": \"неизвестная команда\", \"allowed\": [\"status\",\"fix\",\"deploy\",\"logs\"]}" >&2
    exit 2
    ;;
esac
