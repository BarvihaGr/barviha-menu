import { ChevronRight } from 'lucide-react';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickLocationAddress } from '@/lib/i18n-helpers';
import {
  LOCATION_GROUPS,
  buildLocationTree,
  pickSwitcherName,
  type ResolvedLocationNode,
} from '@/lib/location-theme';

function Nodes({ nodes, locale, depth }: { nodes: ResolvedLocationNode<Location>[]; locale: Locale; depth: number }) {
  return (
    <>
      {nodes.map((node) => (
        <section key={node.key} className="flex flex-col gap-2">
          {/* Группа из одной точки (collapsible: false) подписана самой строкой — как в переключателе. */}
          {node.collapsible && (
            <h2
              className={
                depth === 0
                  ? 'mt-3 text-[11px] uppercase tracking-[0.25em] text-muted'
                  : 'mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-dim'
              }
            >
              {node.label}
            </h2>
          )}
          {node.children && <Nodes nodes={node.children} locale={locale} depth={depth + 1} />}
          {node.locs?.map((l) => {
            const address = pickLocationAddress(l.address, locale);
            return (
              <Link
                key={l.slug}
                href={`/${l.slug}`}
                className="flex items-center justify-between gap-3 rounded-sm border border-border bg-card-elev px-4 py-3 text-left transition hover:border-border-strong"
              >
                <span className="min-w-0">
                  <span className="block text-sm text-cream">{pickSwitcherName(l, locale)}</span>
                  {address && <span className="mt-0.5 block truncate text-xs text-muted">{address}</span>}
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </Link>
            );
          })}
        </section>
      ))}
    </>
  );
}

/**
 * Список открытых локаций ссылками — для корня сайта и заглушки закрытой
 * локации. Группировка и порядок — те же, что в переключателе (LOCATION_GROUPS).
 */
export function LocationLinks({ locations, locale }: { locations: Location[]; locale: Locale }) {
  const tree = buildLocationTree(
    LOCATION_GROUPS,
    new Map(locations.map((l) => [l.slug, l])),
    () => true,
    locale,
  );
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Nodes nodes={tree} locale={locale} depth={0} />
    </div>
  );
}
