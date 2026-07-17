/**
 * Разовый сид начальных аккаунтов бэк-офиса (big_boss + один boss_location
 * на каждую рабочую локацию). Логины НЕ секрет — генерируются кодом из
 * WORKING_SLUGS ниже; секретны только пароли, которые скрипт читает из
 * apps/hub/.env.seed.local (gitignored, никогда не коммитится).
 *
 * Запуск (из packages/db):
 *   pnpm seed-accounts             — реальная запись в Supabase
 *   pnpm seed-accounts --dry-run   — только напечатать таблицу логинов, без записи
 *
 * Идемпотентно — безопасно перезапускать (upsert по login_key), например
 * после добавления новой локации в WORKING_SLUGS.
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { WORKING_SLUGS } from '../src/onboarding.ts';
import { MOCK_LOCATIONS } from '../src/mock-data.ts';

// Не импортируем ../src/accounts.ts / ../src/supabase-client.ts напрямую —
// оба помечены 'server-only' (страховка от случайного попадания
// service-role ключа в клиентский бандл Next.js), а этот скрипт запускается
// голым Node/tsx вне сборки Next — 'server-only' безусловно кидает
// исключение вне контекста бандлера. Поэтому здесь — свой минимальный
// клиент/хэшер, логика 1:1 с packages/db/src/accounts.ts.
function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY не заданы в окружении');
  return createClient(url, key, { auth: { persistSession: false } });
}

function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

const DRY_RUN = process.argv.includes('--dry-run');

// Слаги, где механическая капитализация даёт странный логин — берём
// последнее осмысленное слово вместо полного слага с префиксом бренда.
const LOGIN_OVERRIDES: Record<string, string> = {
  'barvixa-lounge-krylatskoe': 'Krylatskoe',
  'barvixa-lounge-saratov': 'Saratov',
};

function slugToLogin(slug: string): string {
  if (LOGIN_OVERRIDES[slug]) return LOGIN_OVERRIDES[slug];
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

async function upsertAccount(input: {
  login: string;
  password: string;
  role: 'big_boss' | 'boss_location';
  locationSlug: string | null;
  displayName: string;
}) {
  const password_hash = await hashPassword(input.password);
  const { error } = await supabase()
    .from('accounts')
    .upsert(
      {
        login: input.login,
        password_hash,
        role: input.role,
        location_slug: input.locationSlug,
        display_name: input.displayName,
      },
      { onConflict: 'login_key' },
    );
  if (error) throw error;
}

async function main() {
  const locationNames = new Map(MOCK_LOCATIONS.map((l) => [l.slug, l.name]));

  const bigBossLogin = process.env.SEED_BIG_BOSS_LOGIN;
  const bigBossPassword = process.env.SEED_BIG_BOSS_PASSWORD;
  const bossLocationPassword = process.env.SEED_BOSS_LOCATION_PASSWORD;

  if (!DRY_RUN && (!bigBossLogin || !bigBossPassword || !bossLocationPassword)) {
    console.error('Не заданы SEED_BIG_BOSS_LOGIN / SEED_BIG_BOSS_PASSWORD / SEED_BOSS_LOCATION_PASSWORD.');
    console.error('Запусти через: node --env-file=../../apps/hub/.env.seed.local --experimental-strip-types scripts/seed-accounts.ts');
    process.exit(1);
  }

  const rows: { login: string; role: string; location: string }[] = [
    { login: bigBossLogin ?? '(SEED_BIG_BOSS_LOGIN)', role: 'big_boss', location: '—' },
    ...WORKING_SLUGS.map((slug) => ({
      login: slugToLogin(slug),
      role: 'boss_location',
      location: `${slug} (${locationNames.get(slug) ?? '?'})`,
    })),
  ];

  console.table(rows);

  if (DRY_RUN) {
    console.log(`Итого: ${rows.length} аккаунтов. Пароли не показываются (и не запрашивались в dry-run).`);
    return;
  }

  await upsertAccount({
    login: bigBossLogin!,
    password: bigBossPassword!,
    role: 'big_boss',
    locationSlug: null,
    displayName: 'Владелец',
  });

  for (const slug of WORKING_SLUGS) {
    await upsertAccount({
      login: slugToLogin(slug),
      password: bossLocationPassword!,
      role: 'boss_location',
      locationSlug: slug,
      displayName: locationNames.get(slug) ?? slug,
    });
  }

  console.log(`Готово: ${rows.length} аккаунтов заведено/обновлено. Пароли не выводились в консоль.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
