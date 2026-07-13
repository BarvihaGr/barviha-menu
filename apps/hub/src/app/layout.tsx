import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Barviha Hub — бэк-офис меню',
  description: 'Внутренняя панель редактирования диджитал-меню Barviha.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
