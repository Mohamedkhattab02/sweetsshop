/**
 * Static market configuration: what the market sells and when it is open.
 *
 * This is a sample app with no backend, so the categories and the opening
 * schedule live here as plain data.
 */

export type CategoryId =
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'bakery'
  | 'meat'
  | 'seafood'
  | 'beverages'
  | 'snacks';

export type Category = {
  id: CategoryId;
  label: string;
  /** MaterialCommunityIcons name, used for chips and image placeholders. */
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'fruits', label: 'Fruits', icon: 'food-apple' },
  { id: 'vegetables', label: 'Vegetables', icon: 'carrot' },
  { id: 'dairy', label: 'Dairy', icon: 'cheese' },
  { id: 'bakery', label: 'Bakery', icon: 'bread-slice' },
  { id: 'meat', label: 'Meat', icon: 'food-drumstick' },
  { id: 'seafood', label: 'Seafood', icon: 'fish' },
  { id: 'beverages', label: 'Beverages', icon: 'bottle-soda' },
  { id: 'snacks', label: 'Snacks', icon: 'cookie' },
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

/** Minutes since midnight, e.g. `{ open: 8 * 60, close: 20 * 60 }`. */
export type DayHours = { open: number; close: number } | null;

const hm = (hours: number, minutes = 0) => hours * 60 + minutes;

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Indexed by `Date.prototype.getDay()` — 0 is Sunday. `null` means closed. */
export const OPENING_HOURS: DayHours[] = [
  null, // Sunday — closed
  { open: hm(8), close: hm(20) }, // Monday
  { open: hm(8), close: hm(20) }, // Tuesday
  { open: hm(8), close: hm(20) }, // Wednesday
  { open: hm(8), close: hm(20) }, // Thursday
  { open: hm(8), close: hm(22) }, // Friday
  { open: hm(9), close: hm(22) }, // Saturday
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

/**
 * Works out whether the market is open at `now`, plus a human-readable summary
 * of the next transition ("Closes at 8:00 PM" / "Opens Monday at 8:00 AM").
 */
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

  // Not open — scan forward (including later today) for the next opening slot.
  for (let offset = 0; offset < 7; offset += 1) {
    const day = (today + offset) % 7;
    const hours = OPENING_HOURS[day];
    if (!hours) continue;
    if (offset === 0 && minutesNow >= hours.open) continue; // already past today's slot

    const when =
      offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : `on ${DAY_NAMES[day]}`;
    return {
      isOpen: false,
      message: `Closed · Opens ${when} at ${formatTime(hours.open)}`,
      opensAt: hours.open,
      opensInDays: offset,
    };
  }

  return { isOpen: false, message: 'Closed', opensAt: 0, opensInDays: 0 };
}

/* -------------------------------------------------------------------------- */
/*                                   Pricing                                  */
/* -------------------------------------------------------------------------- */

export const CURRENCY_SYMBOL = '$';

export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}
