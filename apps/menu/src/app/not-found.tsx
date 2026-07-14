import Link from 'next/link';
import './globals.css';

// Подстраховка на случай путей, которые не подхватывает next-intl middleware
// (у него всегда есть локаль-префикс) — основной сценарий закрывает
// src/app/[locale]/not-found.tsx. Свой html/body, т.к. корневого layout.tsx
// нет — его роль на локализованных путях играет [locale]/layout.tsx.
export default function RootNotFound() {
  return (
    <html lang="ru">
      <body style={{ margin: 0, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#F5E6D3', color: '#2C0A00', textAlign: 'center', padding: 24 }}>
        <div>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5, marginBottom: 12 }}>Barvikha Lounge</p>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 12px' }}>Страница не найдена</h1>
          <Link href="/" style={{ color: '#2C0A00', textDecoration: 'underline' }}>На главную</Link>
        </div>
      </body>
    </html>
  );
}
