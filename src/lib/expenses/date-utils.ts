import { MonthOption } from '@/types/expense';

export const TIMEZONE = 'Asia/Kolkata';

// Expense tracker begins from October 2026
export const TRACKER_START_YEAR = 2026;
export const TRACKER_START_MONTH = 10; // October
const STATIC_DEFAULT_DATE = '2026-10-21';

/**
 * Returns today's date formatted as 'YYYY-MM-DD' in Asia/Kolkata timezone.
 * Returns deterministic date during SSR/prerender to prevent prerender deopt errors.
 */
export function getTodayDateString(): string {
  if (typeof window === 'undefined') {
    return STATIC_DEFAULT_DATE;
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return STATIC_DEFAULT_DATE;
  }
}

/**
 * Returns the current year and month (1-12) in Asia/Kolkata timezone.
 * Defaults to starting month (October 2026) if current is earlier.
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  if (typeof window === 'undefined') {
    return { year: TRACKER_START_YEAR, month: TRACKER_START_MONTH };
  }
  const today = getTodayDateString();
  const [yearStr, monthStr] = today.split('-');
  const y = parseInt(yearStr, 10) || TRACKER_START_YEAR;
  const m = parseInt(monthStr, 10) || TRACKER_START_MONTH;

  // If earlier than start of tracker, default to October 2026
  if (y < TRACKER_START_YEAR || (y === TRACKER_START_YEAR && m < TRACKER_START_MONTH)) {
    return { year: TRACKER_START_YEAR, month: TRACKER_START_MONTH };
  }

  return { year: y, month: m };
}

/**
 * Computes the month boundary dates:
 * month_start: 'YYYY-MM-01' (inclusive)
 * next_month_start: 'YYYY-MM-01' of the next month (exclusive)
 */
export function getMonthBounds(year: number, month: number): {
  monthStart: string;
  nextMonthStart: string;
} {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const monthStart = `${year}-${pad(month)}-01`;

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const nextMonthStart = `${nextYear}-${pad(nextMonth)}-01`;

  return { monthStart, nextMonthStart };
}

/**
 * Formats a calendar date string 'YYYY-MM-DD' for user display.
 * e.g., '2026-10-21' -> '21 Oct 2026'
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  if (!yearStr || !monthStr || !dayStr) return dateStr;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  return `${day} ${months[monthIndex]} ${yearStr}`;
}

/**
 * Returns month label, e.g. "October 2026"
 */
export function getMonthLabel(year: number, month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[month - 1]} ${year}`;
}

/**
 * Generates options for a month selector dropdown starting from October 2026.
 */
export function getAvailableMonthOptions(centerYear?: number, centerMonth?: number): MonthOption[] {
  const current = getCurrentYearMonth();
  const maxYear = Math.max(centerYear ?? current.year, TRACKER_START_YEAR + 1);

  const options: MonthOption[] = [];

  // Start from October 2026 and build forward through maxYear (or 12 months ahead)
  let y = TRACKER_START_YEAR;
  let m = TRACKER_START_MONTH;

  while (y < maxYear || (y === maxYear && m <= 12)) {
    const { monthStart, nextMonthStart } = getMonthBounds(y, m);
    options.push({
      year: y,
      month: m,
      label: getMonthLabel(y, m),
      start_date: monthStart,
      end_date_exclusive: nextMonthStart,
    });

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  // Reverse so newest month is on top
  return options.reverse();
}

/**
 * Returns the previous and next month given year and month,
 * with canGoPrev constrained by the October 2026 start.
 */
export function getNeighborMonths(year: number, month: number): {
  prev: { year: number; month: number };
  next: { year: number; month: number };
  canGoPrev: boolean;
} {
  const canGoPrev = !(year <= TRACKER_START_YEAR && month <= TRACKER_START_MONTH);

  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }

  if (!canGoPrev) {
    prevYear = TRACKER_START_YEAR;
    prevMonth = TRACKER_START_MONTH;
  }

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  return {
    prev: { year: prevYear, month: prevMonth },
    next: { year: nextYear, month: nextMonth },
    canGoPrev,
  };
}
