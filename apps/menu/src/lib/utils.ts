import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = '₽'): string {
  return `${price.toLocaleString('ru-RU')} ${currency}`;
}
