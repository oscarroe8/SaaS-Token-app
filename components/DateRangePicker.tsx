'use client';
import { formatDateInput, parseDateInput } from '@/lib/dateUtils';

type Props = { startTime: number; endTime: number; onChange: (startTime: number, endTime: number) => void; loading: boolean };
export default function DateRangePicker({ startTime, endTime, onChange, loading }: Props) {
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setUTCDate(end.getUTCDate() - (days - 1));
    onChange(parseDateInput(start.toISOString().slice(0, 10)), parseDateInput(end.toISOString().slice(0, 10), true));
  };
  return <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4 shadow-sm">
    <button className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading} onClick={() => setPreset(7)}>Last 7 days</button>
    <button className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading} onClick={() => setPreset(30)}>Last 30 days</button>
    <label className="text-sm font-medium">Start<input type="date" className="mt-1 block rounded-lg border p-2" value={formatDateInput(startTime)} onChange={(e) => onChange(parseDateInput(e.target.value), endTime)} /></label>
    <label className="text-sm font-medium">End<input type="date" className="mt-1 block rounded-lg border p-2" value={formatDateInput(endTime)} onChange={(e) => onChange(startTime, parseDateInput(e.target.value, true))} /></label>
  </div>;
}
