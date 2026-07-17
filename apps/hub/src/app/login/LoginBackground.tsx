// Фон входа — единственное место в бэк-офисе, где даём себе больше двух
// акцентных точек: это «витрина» перед входом, а не рабочий экран, где
// пестрота мешала бы. Свечение + эмблема + HUD-подписи — в двух акцентах
// проекта (розовый/циан), тот же «глитч» двойной обводкой, что и везде.
export function LoginBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 42%), radial-gradient(circle at 60% 45%, color-mix(in srgb, var(--accent-2) 14%, transparent) 0%, transparent 38%)',
        }}
      />

      <svg
        viewBox="0 0 400 400"
        className="absolute left-1/2 top-1/2 h-[85vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
      >
        <g fill="none" strokeWidth="1.25" stroke="var(--accent)" transform="translate(-1.5,0)">
          <circle cx="200" cy="200" r="160" />
          <circle cx="200" cy="200" r="110" />
          <path d="M200 20 L200 380 M20 200 L380 200" />
          <path d="M83 83 L317 317 M317 83 L83 317" />
          <path d="M200 40 L230 170 L360 200 L230 230 L200 360 L170 230 L40 200 L170 170 Z" />
        </g>
        <g fill="none" strokeWidth="1.25" stroke="var(--accent-2)" transform="translate(1.5,0)">
          <circle cx="200" cy="200" r="160" />
          <circle cx="200" cy="200" r="110" />
          <path d="M200 20 L200 380 M20 200 L380 200" />
          <path d="M83 83 L317 317 M317 83 L83 317" />
          <path d="M200 40 L230 170 L360 200 L230 230 L200 360 L170 230 L40 200 L170 170 Z" />
        </g>
      </svg>

      <div className="absolute inset-0 font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)] opacity-70">
        <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
          BARVIHA // HUB-01
          <br />
          NODE: MSK-CENTRAL
        </div>
        <div className="absolute right-5 top-5 text-right sm:right-8 sm:top-8">
          ACCESS: RESTRICTED
          <br />
          SIGNAL: LOCKED
        </div>
        <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
          STATUS: AWAITING CODE
        </div>
        <div className="absolute bottom-5 right-5 text-right sm:bottom-8 sm:right-8">
          SYS: WEB-CORE v2
        </div>
      </div>
    </div>
  );
}
