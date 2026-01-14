import {
  format,
  formatDistanceToNow,
  parseISO,
  isAfter,
  isBefore,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
} from 'date-fns';
import { enUS, enGB, es, fr, de } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  'en-US': enUS,
  'en-GB': enGB,
  es: es,
  fr: fr,
  de: de,
};

export const getLocale = (localeCode = 'en-US'): Locale => {
  return locales[localeCode] || enUS;
};

export const formatDate = (
  date: string | Date,
  formatStr = 'MMM d, yyyy',
  localeCode = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: getLocale(localeCode) });
};

export const formatDateTime = (
  date: string | Date,
  localeCode = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a', { locale: getLocale(localeCode) });
};

export const formatRelativeTime = (
  date: string | Date,
  localeCode = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: getLocale(localeCode),
  });
};

export const formatDueDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return 'Today';
  }
  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }

  const daysUntil = differenceInDays(dateObj, new Date());

  if (daysUntil > 0 && daysUntil <= 7) {
    return format(dateObj, 'EEEE');
  }

  return format(dateObj, 'MMM d');
};

export const getDueDateStatus = (
  date: string | Date | null
): 'overdue' | 'due-soon' | 'upcoming' | null => {
  if (!date) return null;

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const threeDaysFromNow = addDays(now, 3);

  if (isPast(dateObj) && !isToday(dateObj)) {
    return 'overdue';
  }
  if (isBefore(dateObj, threeDaysFromNow)) {
    return 'due-soon';
  }
  return 'upcoming';
};

export const getWeekRange = (date: Date = new Date()) => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
};

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const getDateRangeLabel = (start: Date, end: Date): string => {
  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');
  const startYear = format(start, 'yyyy');
  const endYear = format(end, 'yyyy');

  if (startYear !== endYear) {
    return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }
  return `${startMonth} ${format(start, 'd')} - ${format(end, 'd')}, ${startYear}`;
};

export const sortByDate = <T extends { [key: string]: any }>(
  items: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = a[key] ? parseISO(a[key] as string) : new Date(0);
    const dateB = b[key] ? parseISO(b[key] as string) : new Date(0);

    if (order === 'asc') {
      return isAfter(dateA, dateB) ? 1 : -1;
    }
    return isBefore(dateA, dateB) ? 1 : -1;
  });
};

export { addDays, subDays, parseISO, isAfter, isBefore };
