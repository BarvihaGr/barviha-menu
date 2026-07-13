'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BarCategoryOption, CatalogRealm } from '@barviha/db';

const REALM_LABEL: Record<CatalogRealm, string> = { kitchen: 'Кухня', hookah: 'Кальяны', bar: 'Бар' };
const REALMS: CatalogRealm[] = ['kitchen', 'hookah', 'bar'];
const NEW_CATEGORY = '__new__';

interface CategoryOption {
  sub: string;
  label: string;
}

/** Разные разделы Бара иногда называются одинаково (историческое наполнение) —
 * добавляем «(2)», «(3)»… к повторам, чтобы в выпадающем списке было видно,
 * что это разные пункты, хотя название совпадает. */
function labelBarCategories(categories: BarCategoryOption[]): (BarCategoryOption & { label: string })[] {
  const seen = new Map<string, number>();
  return categories.map((c) => {
    const n = (seen.get(c.category) ?? 0) + 1;
    seen.set(c.category, n);
    return { ...c, label: n > 1 ? `${c.category} (${n})` : c.category };
  });
}

export function AddContentEditor({
  slug,
  isBarTemplate,
  catalogCategories,
  barCategories,
}: {
  slug: string;
  isBarTemplate: boolean;
  catalogCategories: Record<CatalogRealm, CategoryOption[]>;
  barCategories: BarCategoryOption[];
}) {
  const router = useRouter();
  const [realm, setRealm] = useState<CatalogRealm>('kitchen');

  return (
    <div className="flex flex-col gap-6 px-8 py-6">
      <div className="flex gap-2">
        {REALMS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRealm(r)}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              realm === r
                ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--text)]'
                : 'border-[color:var(--border)] text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]'
            }`}
          >
            {REALM_LABEL[r]}
          </button>
        ))}
      </div>

      {realm === 'bar' && isBarTemplate ? (
        <BarForms slug={slug} initialCategories={barCategories} onDone={() => router.refresh()} />
      ) : (
        <CatalogForm
          key={realm}
          slug={slug}
          realm={realm}
          categories={catalogCategories[realm]}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}

function CatalogForm({
  slug,
  realm,
  categories,
  onDone,
}: {
  slug: string;
  realm: CatalogRealm;
  categories: CategoryOption[];
  onDone: () => void;
}) {
  const [sub, setSub] = useState(categories[0]?.sub ?? NEW_CATEGORY);
  const [newSub, setNewSub] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [composition, setComposition] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const effectiveSub = sub === NEW_CATEGORY ? newSub.trim() : sub;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !effectiveSub) return;
    setPending(true);
    setMessage(null);
    const res = await fetch(`/api/locations/${slug}/catalog/${realm}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        sub: effectiveSub,
        price: Number(price) || 0,
        weight: weight ? Number(weight) : null,
        description: description.trim() || null,
        composition: composition.trim() || null,
      }),
    });
    setPending(false);
    if (res.ok) {
      setName('');
      setPrice('');
      setWeight('');
      setDescription('');
      setComposition('');
      setMessage('Добавлено');
      onDone();
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage('Не удалось сохранить');
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-md flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
    >
      <div className="text-sm font-medium text-[color:var(--text)]">Новая позиция — {REALM_LABEL[realm]}</div>
      <Field label="Категория">
        <select value={sub} onChange={(e) => setSub(e.target.value)} className="input">
          {categories.map((c) => (
            <option key={c.sub} value={c.sub}>
              {c.label}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ Новая категория…</option>
        </select>
      </Field>
      {sub === NEW_CATEGORY && (
        <Field label="Название новой категории">
          <input value={newSub} onChange={(e) => setNewSub(e.target.value)} className="input" />
        </Field>
      )}
      <Field label="Название">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </Field>
      <Field label="Описание / копирайт">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input" />
      </Field>
      <Field label="Состав">
        <textarea value={composition} onChange={(e) => setComposition(e.target.value)} rows={2} className="input" />
      </Field>
      <div className="flex gap-3">
        <Field label="Цена, ₽">
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
        </Field>
        <Field label={realm === 'bar' ? 'Объём, мл' : 'Грамовка, г'}>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input" />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !name.trim() || !effectiveSub}
          className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--accent-text)] disabled:opacity-50"
        >
          Добавить позицию
        </button>
        {message && <span className="text-xs text-[color:var(--muted)]">{message}</span>}
      </div>
    </form>
  );
}

function BarForms({
  slug,
  initialCategories,
  onDone,
}: {
  slug: string;
  initialCategories: BarCategoryOption[];
  onDone: () => void;
}) {
  const [categories, setCategories] = useState(labelBarCategories(initialCategories));

  return (
    <div className="flex flex-col gap-6">
      <NewBarCategoryForm
        slug={slug}
        onCreated={(cat, index) => {
          setCategories((prev) => labelBarCategories([...prev, { index, category: cat }]));
          onDone();
        }}
      />
      <NewBarItemForm slug={slug} categories={categories} onDone={onDone} />
    </div>
  );
}

function NewBarCategoryForm({
  slug,
  onCreated,
}: {
  slug: string;
  onCreated: (cat: string, index: number) => void;
}) {
  const [category, setCategory] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = category.trim();
    if (!name) return;
    setPending(true);
    setMessage(null);
    const res = await fetch(`/api/locations/${slug}/bar-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: name }),
    });
    const data = (await res.json().catch(() => null)) as { ok: boolean; index?: number } | null;
    setPending(false);
    if (res.ok && data?.ok && data.index != null) {
      setCategory('');
      setMessage('Добавлено');
      onCreated(name, data.index);
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage('Не удалось сохранить');
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-md flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
    >
      <div className="text-sm font-medium text-[color:var(--text)]">Новый раздел Бара</div>
      <Field label="Название раздела">
        <input value={category} onChange={(e) => setCategory(e.target.value)} className="input" />
      </Field>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !category.trim()}
          className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--accent-text)] disabled:opacity-50"
        >
          Добавить раздел
        </button>
        {message && <span className="text-xs text-[color:var(--muted)]">{message}</span>}
      </div>
    </form>
  );
}

function NewBarItemForm({
  slug,
  categories,
  onDone,
}: {
  slug: string;
  categories: (BarCategoryOption & { label: string })[];
  onDone: () => void;
}) {
  const [categoryIndex, setCategoryIndex] = useState(categories[0]?.index ?? -1);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<1 | 2>(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.index === categoryIndex)) {
      setCategoryIndex(categories[0]!.index);
    }
  }, [categories, categoryIndex]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (categoryIndex < 0 || !name.trim() || !price.trim()) return;
    setPending(true);
    setMessage(null);
    const res = await fetch(`/api/locations/${slug}/bar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryIndex,
        name: name.trim(),
        price: price.trim(),
        volume: volume.trim() || null,
        description: description.trim() || null,
        type,
      }),
    });
    setPending(false);
    if (res.ok) {
      setName('');
      setPrice('');
      setVolume('');
      setDescription('');
      setMessage('Добавлено');
      onDone();
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage('Не удалось сохранить');
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-md flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
    >
      <div className="text-sm font-medium text-[color:var(--text)]">Новая позиция Бара</div>
      {categories.length === 0 ? (
        <div className="text-xs text-[color:var(--muted)]">Сначала добавьте раздел выше.</div>
      ) : (
        <>
          <Field label="Раздел">
            <select
              value={categoryIndex}
              onChange={(e) => setCategoryIndex(Number(e.target.value))}
              className="input"
            >
              {categories.map((c) => (
                <option key={c.index} value={c.index}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Название">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </Field>
          <Field label="Описание / состав">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="input" />
          </Field>
          <div className="flex gap-3">
            <Field label="Цена(ы), ₽ — через /, если вариаций несколько">
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
            </Field>
            <Field label="Объём — через /, синхронно с ценами">
              <input value={volume} onChange={(e) => setVolume(e.target.value)} className="input" />
            </Field>
          </div>
          <Field label="Тип карточки">
            <select value={type} onChange={(e) => setType(Number(e.target.value) as 1 | 2)} className="input">
              <option value={1}>1 — своё фото</option>
              <option value={2}>2 — общее фото категории</option>
            </select>
          </Field>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending || !name.trim() || !price.trim()}
              className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--accent-text)] disabled:opacity-50"
            >
              Добавить позицию
            </button>
            {message && <span className="text-xs text-[color:var(--muted)]">{message}</span>}
          </div>
        </>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[color:var(--muted)]">
      {label}
      {children}
    </label>
  );
}
