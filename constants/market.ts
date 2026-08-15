/**
 * Static shop configuration: what Nour Sweets sells and when the counter is open.
 * The app has no backend, so the catalog taxonomy and opening schedule live here.
 */

import type { IconToken } from '@/constants/icons';

export type CategoryId =
  | 'knafeh'
  | 'baklava'
  | 'maamoul'
  | 'warbat'
  | 'qatayef'
  | 'cheese-desserts'
  | 'traditional'
  | 'cookies'
  | 'puddings'
  | 'candies'
  | 'gift-boxes'
  | 'coffee-tea';

export type Category = {
  id: CategoryId;
  label: string;
  icon: IconToken;
};

export const CATEGORIES: Category[] = [
  { id: 'knafeh', label: 'Knafeh', icon: { md: 'cake-variant', sf: 'birthday.cake.fill' } },
  { id: 'baklava', label: 'Baklava', icon: { md: 'food-croissant', sf: 'square.grid.2x2.fill' } },
  { id: 'maamoul', label: 'Maamoul', icon: { md: 'cookie', sf: 'circle.grid.2x2.fill' } },
  { id: 'warbat', label: 'Warbat', icon: { md: 'food-croissant', sf: 'triangle.fill' } },
  { id: 'qatayef', label: 'Qatayef', icon: { md: 'pan', sf: 'circle.fill' } },
  { id: 'cheese-desserts', label: 'Cheese desserts', icon: { md: 'cheese', sf: 'circle.lefthalf.filled' } },
  { id: 'traditional', label: 'Traditional treats', icon: { md: 'food-variant', sf: 'sparkles' } },
  { id: 'cookies', label: 'Arabic cookies', icon: { md: 'cookie-outline', sf: 'circle.grid.2x2.fill' } },
  { id: 'puddings', label: 'Creamy desserts', icon: { md: 'cup', sf: 'cup.and.saucer.fill' } },
  { id: 'candies', label: 'Lokum & candies', icon: { md: 'candy-outline', sf: 'cube.fill' } },
  { id: 'gift-boxes', label: 'Gift boxes', icon: { md: 'gift-outline', sf: 'gift.fill' } },
  { id: 'coffee-tea', label: 'Coffee & tea', icon: { md: 'coffee-outline', sf: 'cup.and.saucer.fill' } },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, category) => ({ ...acc, [category.id]: category }),
  {} as Record<CategoryId, Category>
);

export function getCategory(id: CategoryId): Category {
  return CATEGORY_BY_ID[id];
}

/* -------------------------------------------------------------------------- */
/*                                Opening hours                               */
/* -------------------------------------------------------------------------- */

export type DayHours = { open: number; close: number } | null;

const hm = (hours: number, minutes = 0) => hours * 60 + minutes;

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Indexed by `Date.prototype.getDay()` — 0 is Sunday. */
export const OPENING_HOURS: DayHours[] = [
  { open: hm(10), close: hm(21) },
  { open: hm(9), close: hm(21) },
  { open: hm(9), close: hm(21) },
  { open: hm(9), close: hm(21) },
  { open: hm(9), close: hm(21) },
  { open: hm(9), close: hm(23) },
  { open: hm(10), close: hm(23) },
];

export function formatTime(minutesSinceMidnight: number): string {
  const hours24 = Math.floor(minutesSinceMidnight / 60) % 24;
  const minutes = minutesSinceMidnight % 60;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function formatDayHours(hours: DayHours): string {
  return hours ? `${formatTime(hours.open)} – ${formatTime(hours.close)}` : 'Closed';
}

export type MarketStatus =
  | { isOpen: true; message: string; closesAt: number }
  | { isOpen: false; message: string; opensAt: number; opensInDays: number };

export function getMarketStatus(now: Date = new Date()): MarketStatus {
  const today = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const todayHours = OPENING_HOURS[today];

  if (todayHours && minutesNow >= todayHours.open && minutesNow < todayHours.close) {
    return {
      isOpen: true,
      message: `Open now · Closes at ${formatTime(todayHours.close)}`,
      closesAt: todayHours.close,
    };
  }

  for (let offset = 0; offset < 7; offset += 1) {
    const day = (today + offset) % 7;
    const hours = OPENING_HOURS[day];
    if (!hours) continue;
    if (offset === 0 && minutesNow >= hours.open) continue;

    const when = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : `on ${DAY_NAMES[day]}`;
    return {
      isOpen: false,
      message: `Closed · Opens ${when} at ${formatTime(hours.open)}`,
      opensAt: hours.open,
      opensInDays: offset,
    };
  }

  return { isOpen: false, message: 'Closed', opensAt: 0, opensInDays: 0 };
}

export const CURRENCY_SYMBOL = '₪';

export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}
