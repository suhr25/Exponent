// ─── Market Hours Utility (IST-based) ────────────────────────────────────────

import nseHolidays from '@/data/nse_holidays.json';

type MarketStatus = 'open' | 'preopen' | 'closed' | 'holiday';

const IST_OFFSET = 5.5 * 60; // IST is UTC+5:30 in minutes

/** Convert any Date to IST components */
function toIST(date: Date = new Date()): { hours: number; minutes: number; day: number; dateStr: string } {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + IST_OFFSET * 60000);
  return {
    hours: istDate.getHours(),
    minutes: istDate.getMinutes(),
    day: istDate.getDay(), // 0=Sun, 6=Sat
    dateStr: istDate.toISOString().split('T')[0], // YYYY-MM-DD
  };
}

/** Get current IST time as formatted string */
export function getISTTime(date: Date = new Date()): string {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + IST_OFFSET * 60000);
  return istDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

/** Check if a date is an NSE holiday */
export function isHoliday(date: Date = new Date()): boolean {
  const { dateStr } = toIST(date);
  return nseHolidays.holidays.some(h => h.date === dateStr);
}

/** Check if a date falls on a weekend */
export function isWeekend(date: Date = new Date()): boolean {
  const { day } = toIST(date);
  return day === 0 || day === 6;
}

/** Check if market is in pre-open session (9:00-9:15 IST) */
export function isPreOpen(date: Date = new Date()): boolean {
  if (isWeekend(date) || isHoliday(date)) return false;
  const { hours, minutes } = toIST(date);
  const totalMin = hours * 60 + minutes;
  return totalMin >= 540 && totalMin < 555; // 9:00 to 9:15
}

/** Check if market is open (9:15-15:30 IST, weekdays, non-holidays) */
export function isMarketOpen(date: Date = new Date()): boolean {
  if (isWeekend(date) || isHoliday(date)) return false;
  const { hours, minutes } = toIST(date);
  const totalMin = hours * 60 + minutes;
  return totalMin >= 555 && totalMin < 930; // 9:15 to 15:30
}

/** Get comprehensive market status */
export function getMarketStatus(date: Date = new Date()): MarketStatus {
  if (isHoliday(date)) return 'holiday';
  if (isWeekend(date)) return 'closed';
  if (isPreOpen(date)) return 'preopen';
  if (isMarketOpen(date)) return 'open';
  return 'closed';
}

/** Get the next market open time */
export function getNextMarketOpen(date: Date = new Date()): Date {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + IST_OFFSET * 60000);

  // Move to next day if market is already closed today
  const { hours, minutes } = toIST(date);
  const totalMin = hours * 60 + minutes;
  if (totalMin >= 930) {
    istDate.setDate(istDate.getDate() + 1);
  }

  // Skip weekends and holidays
  let attempts = 0;
  while (attempts < 14) {
    const dayOfWeek = istDate.getDay();
    const dateStr = istDate.toISOString().split('T')[0];
    const isHol = nseHolidays.holidays.some(h => h.date === dateStr);

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHol) {
      istDate.setHours(9, 15, 0, 0);
      // Convert back from IST to local
      const utcTarget = istDate.getTime() - IST_OFFSET * 60000 - date.getTimezoneOffset() * 60000;
      return new Date(utcTarget);
    }

    istDate.setDate(istDate.getDate() + 1);
    attempts++;
  }

  return istDate;
}

/** Get holiday name if today is a holiday */
export function getHolidayName(date: Date = new Date()): string | null {
  const { dateStr } = toIST(date);
  const holiday = nseHolidays.holidays.find(h => h.date === dateStr);
  return holiday?.name || null;
}

/** Status display info */
export function getMarketStatusInfo(date: Date = new Date()): {
  status: MarketStatus;
  label: string;
  color: string;
  dotColor: string;
} {
  const status = getMarketStatus(date);
  switch (status) {
    case 'open':
      return { status, label: 'Market Open', color: 'text-emerald-400', dotColor: 'bg-emerald-400' };
    case 'preopen':
      return { status, label: 'Pre-Open', color: 'text-yellow-400', dotColor: 'bg-yellow-400' };
    case 'holiday':
      return { status, label: `Holiday — ${getHolidayName(date) || 'Market Closed'}`, color: 'text-zinc-400', dotColor: 'bg-zinc-500' };
    case 'closed':
    default:
      return { status, label: 'Market Closed', color: 'text-red-400', dotColor: 'bg-red-400' };
  }
}
