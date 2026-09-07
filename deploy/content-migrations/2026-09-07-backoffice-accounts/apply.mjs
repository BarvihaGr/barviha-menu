// Аккаунты бэк-офиса → файловое хранилище packages/db/content/accounts.json
// (Supabase, где они жили раньше, 2026-09-07 перестал резолвиться — см.
// packages/db/src/accounts.ts).
//
//   usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Заводит:
//   • 27 админов локаций (роль manager) из accounts.json рядом — по ТЗ
//     пароль = логин, хэшируется bcrypt прямо здесь, в git секретов нет;
//   • директора (роль big_boss) — логин и УЖЕ ГОТОВЫЙ bcrypt-хэш берутся из
//     окружения HUB_DIRECTOR_LOGIN / HUB_DIRECTOR_PASSWORD_HASH, а если их нет
//     в process.env — из apps/hub/.env.production.local или .env.local
//     (крон деплоя не подгружает .env сам). Пароль директора нигде в
//     открытом виде не хранится.
//
// Идемпотентно: существующие login_key не трогаем (руками сменённые пароли
// переживают повторный прогон). Если директорских переменных нет — админов
// всё равно записываем, но выходим с кодом 3, чтобы маркер .done не ставился
// и директор доехал следующим деплоем, как только переменные появятся.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) {
  console.error('usage: node apply.mjs <packages/db/content>');
  process.exit(2);
}

// bcryptjs — зависимость packages/db; резолвим относительно её package.json,
// а не отсюда (pnpm не хойстит пакеты в корень).
const require = createRequire(join(contentDir, '..', 'package.json'));
const bcrypt = require('bcryptjs');

const manifest = JSON.parse(readFileSync(join(here, 'accounts.json'), 'utf-8'));
const file = join(contentDir, 'accounts.json');

/** @type {any[]} */
let rows = [];
if (existsSync(file)) {
  const parsed = JSON.parse(readFileSync(file, 'utf-8'));
  if (Array.isArray(parsed)) rows = parsed;
}
const existing = new Set(rows.map((r) => r.login_key));
const log = [];

function pushRow(row) {
  rows.push(row);
  existing.add(row.login_key);
}

// ── Админы локаций ──
for (const m of manifest.managers) {
  const login_key = m.login.trim().toLowerCase();
  if (existing.has(login_key)) {
    log.push(`= ${m.login} (${m.name}) уже есть — пропускаю`);
    continue;
  }
  pushRow({
    id: randomUUID(),
    login: m.login,
    login_key,
    password_hash: bcrypt.hashSync(m.login, 10),
    role: 'manager',
    location_slug: m.slug,
    display_name: `Админ ${m.name}`,
    created_by: null,
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
  });
  log.push(`+ ${m.login} → ${m.slug} (${m.name})`);
}

// ── Директор ──
function envFromFiles(keys) {
  const out = {};
  for (const k of keys) if (process.env[k]) out[k] = process.env[k];
  const candidates = [
    join(contentDir, '..', '..', '..', 'apps', 'hub', '.env.production.local'),
    join(contentDir, '..', '..', '..', 'apps', 'hub', '.env.local'),
  ];
  for (const f of candidates) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf-8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (!keys.includes(k) || out[k]) continue;
      out[k] = vRaw.replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

const env = envFromFiles(['HUB_DIRECTOR_LOGIN', 'HUB_DIRECTOR_PASSWORD_HASH']);
let directorMissing = false;
if (env.HUB_DIRECTOR_LOGIN && /^\$2[aby]\$\d\d\$/.test(env.HUB_DIRECTOR_PASSWORD_HASH ?? '')) {
  const login_key = env.HUB_DIRECTOR_LOGIN.trim().toLowerCase();
  if (existing.has(login_key)) {
    log.push(`= директор ${env.HUB_DIRECTOR_LOGIN} уже есть — пропускаю`);
  } else {
    pushRow({
      id: randomUUID(),
      login: env.HUB_DIRECTOR_LOGIN.trim(),
      login_key,
      password_hash: env.HUB_DIRECTOR_PASSWORD_HASH,
      role: 'big_boss',
      location_slug: null,
      display_name: 'Директор',
      created_by: null,
      is_active: true,
      last_login_at: null,
      created_at: new Date().toISOString(),
    });
    log.push(`+ директор ${env.HUB_DIRECTOR_LOGIN} (big_boss)`);
  }
} else {
  directorMissing = true;
  log.push('! HUB_DIRECTOR_LOGIN / HUB_DIRECTOR_PASSWORD_HASH не найдены — директор не заведён, повторю на следующем деплое');
}

// Атомарная запись — тем же форматом, что пишет бэк-офис (см. content-store.ts).
const tmp = `${file}.tmp-${process.pid}`;
writeFileSync(tmp, JSON.stringify(rows, null, 2) + '\n', 'utf-8');
renameSync(tmp, file);

for (const l of log) console.log(l);
console.log(`accounts.json: всего ${rows.length} аккаунтов`);
if (directorMissing) process.exit(3);
