const pad = (value: number) => String(value).padStart(2, '0');

/** Local date as yyyy-mm-dd (not UTC, so "today" matches the user's clock). */
export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayISO = () => toISO(new Date());

export function fromISO(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

const isISO = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
  if (!value) return '';
  if (!isISO(value)) return value;
  return fromISO(value).toLocaleDateString(undefined, options);
}

export function formatTime(value: string): string {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatRange(start: string, end: string): string {
  if (!start && !end) return 'Dates not set';
  if (!end) return `${formatDate(start, { month: 'short', year: 'numeric' })} – present`;
  if (!start) return `Until ${formatDate(end, { month: 'short', year: 'numeric' })}`;
  return `${formatDate(start, { month: 'short', year: 'numeric' })} – ${formatDate(end, { month: 'short', year: 'numeric' })}`;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (result.getDay() + 6) % 7; // Monday = 0
  result.setDate(result.getDate() - offset);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export type InternshipStatus = 'Current' | 'Upcoming' | 'Past';

export function internshipStatus(start: string, end: string, today = todayISO()): InternshipStatus {
  if (start && start > today) return 'Upcoming';
  if (end && end < today) return 'Past';
  return 'Current';
}
