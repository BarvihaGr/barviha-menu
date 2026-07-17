import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getAccountById, resetAccountPassword, setAccountActive } from '@barviha/db/accounts';

const PatchSchema = z.object({
  isActive: z.boolean().optional(),
  password: z.string().min(4).max(200).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = request.headers.get('x-hub-role');
  const accountId = request.headers.get('x-hub-account-id');

  if (role !== 'big_boss' && role !== 'boss_location') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const target = await getAccountById(id);
  if (!target) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });

  // boss_location может менять только тех, кого сам создал (своих менеджеров) —
  // не любой чужой аккаунт по id.
  if (role === 'boss_location' && target.created_by !== accountId) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'некорректные данные' }, { status: 400 });

  if (typeof parsed.data.isActive === 'boolean') await setAccountActive(id, parsed.data.isActive);
  if (parsed.data.password) await resetAccountPassword(id, parsed.data.password);

  return NextResponse.json({ ok: true });
}
