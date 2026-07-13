import { TabNav } from './TabNav';

export function Header({ name, slug }: { name: string; slug: string }) {
  return (
    <div>
      <div className="px-8 pt-6 text-lg font-medium text-[color:var(--text)]">{name}</div>
      <TabNav slug={slug} />
    </div>
  );
}
