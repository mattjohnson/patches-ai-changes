import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDueDate,
  getDueDateStatus,
  getWeekRange,
  getMonthRange,
  sortByDate,
} from '@/lib/dates';
import { addDays, subDays } from 'date-fns';

describe('formatDate', () => {
  it('formats date with default format', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan 15, 2024/);
  });

  it('formats date with custom format', () => {
    const date = '2024-01-15T10:30:00Z';
    const formatted = formatDate(date, 'yyyy-MM-dd');
    expect(formatted).toBe('2024-01-15');
  });

  it('handles Date objects', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan 15, 2024/);
  });
});

describe('formatDateTime', () => {
  it('formats date and time', () => {
    const date = '2024-01-15T14:30:00Z';
    const formatted = formatDateTime(date);
    expect(formatted).toContain('Jan 15, 2024');
  });
});

describe('formatRelativeTime', () => {
  it('returns relative time string', () => {
    const now = new Date();
    const oneHourAgo = subDays(now, 0);
    const formatted = formatRelativeTime(oneHourAgo.toISOString());
    expect(formatted).toContain('ago');
  });
});

describe('formatDueDate', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date();
    const formatted = formatDueDate(today);
    expect(formatted).toBe('Today');
  });

  it('returns "Tomorrow" for tomorrow\'s date', () => {
    const tomorrow = addDays(new Date(), 1);
    const formatted = formatDueDate(tomorrow);
    expect(formatted).toBe('Tomorrow');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const yesterday = subDays(new Date(), 1);
    const formatted = formatDueDate(yesterday);
    expect(formatted).toBe('Yesterday');
  });

  it('returns day name for dates within a week', () => {
    const inFiveDays = addDays(new Date(), 5);
    const formatted = formatDueDate(inFiveDays);
    expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).toContain(formatted);
  });

  it('returns formatted date for dates beyond a week', () => {
    const inTwoWeeks = addDays(new Date(), 14);
    const formatted = formatDueDate(inTwoWeeks);
    expect(formatted).toMatch(/[A-Z][a-z]{2} \d{1,2}/);
  });
});

describe('getDueDateStatus', () => {
  it('returns null for null date', () => {
    expect(getDueDateStatus(null)).toBeNull();
  });

  it('returns "overdue" for past dates', () => {
    const pastDate = subDays(new Date(), 5);
    expect(getDueDateStatus(pastDate)).toBe('overdue');
  });

  it('returns "due-soon" for dates within 3 days', () => {
    const soonDate = addDays(new Date(), 2);
    expect(getDueDateStatus(soonDate)).toBe('due-soon');
  });

  it('returns "upcoming" for dates beyond 3 days', () => {
    const futureDate = addDays(new Date(), 10);
    expect(getDueDateStatus(futureDate)).toBe('upcoming');
  });
});

describe('getWeekRange', () => {
  it('returns start and end of week', () => {
    const range = getWeekRange(new Date('2024-01-17'));
    expect(range.start).toBeDefined();
    expect(range.end).toBeDefined();
    expect(range.start < range.end).toBe(true);
  });
});

describe('getMonthRange', () => {
  it('returns start and end of month', () => {
    const range = getMonthRange(new Date('2024-01-17'));
    expect(range.start).toBeDefined();
    expect(range.end).toBeDefined();
    expect(range.start < range.end).toBe(true);
  });
});

describe('sortByDate', () => {
  const items = [
    { id: '1', date: '2024-01-15T10:00:00Z' },
    { id: '2', date: '2024-01-10T10:00:00Z' },
    { id: '3', date: '2024-01-20T10:00:00Z' },
  ];

  it('sorts by date ascending', () => {
    const sorted = sortByDate(items, 'date', 'asc');
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
    expect(sorted[2].id).toBe('3');
  });

  it('sorts by date descending', () => {
    const sorted = sortByDate(items, 'date', 'desc');
    expect(sorted[0].id).toBe('3');
    expect(sorted[1].id).toBe('1');
    expect(sorted[2].id).toBe('2');
  });

  it('does not mutate original array', () => {
    const original = [...items];
    sortByDate(items, 'date', 'asc');
    expect(items).toEqual(original);
  });
});
