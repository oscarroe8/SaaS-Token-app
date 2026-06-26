export type BucketWidth = '1m' | '1h' | '1d';
export type PresetRange = '7d' | '30d' | 'custom';

export function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function endOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59));
}

export function getPresetRange(days: number): { startTime: number; endTime: number } {
  const now = new Date();
  const end = endOfUtcDay(now);
  const start = startOfUtcDay(new Date(end));
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startTime: toUnixSeconds(start), endTime: toUnixSeconds(end) };
}

export function formatDateFromSeconds(seconds: number): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(seconds * 1000));
}

export function formatDateInput(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

export function parseDateInput(value: string, endOfDay = false): number {
  const date = new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}Z`);
  return toUnixSeconds(date);
}
