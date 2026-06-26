'use client';
import { useMemo, useState } from 'react';
import { formatDateFromSeconds } from '@/lib/dateUtils';
import type { NormalizedCostRecord, NormalizedUsageRecord } from '@/lib/usageNormalisation';

type Props = { usage: NormalizedUsageRecord[]; costs: NormalizedCostRecord[] };
type Cell = string | number | null;
type Row = Record<string, Cell>;
type DailyAccumulator = { date: string; inputTokens: number; cachedInputTokens: number; outputTokens: number; totalTokens: number; requests: number };
type ModelAccumulator = { model: string; totalTokens: number; requests: number };
const nf = new Intl.NumberFormat('en-US');

function SortableTable({ title, rows }: { title: string; rows: Row[] }) {
  const [sort, setSort] = useState<string>(Object.keys(rows[0] || {})[0] || '');
  const [asc, setAsc] = useState(true);
  const sorted = [...rows].sort((a, b) => String(a[sort] ?? '').localeCompare(String(b[sort] ?? ''), undefined, { numeric: true }) * (asc ? 1 : -1));
  const headers = Object.keys(rows[0] || {});
  return <div className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold">{title}</h2><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr>{headers.map((h) => <th key={h} className="cursor-pointer border-b p-2 text-left" onClick={() => { setAsc(sort === h ? !asc : true); setSort(h); }}>{h}</th>)}</tr></thead><tbody>{sorted.map((row, i) => <tr key={i} className="odd:bg-slate-50">{headers.map((h) => <td key={h} className="p-2">{row[h] ?? '—'}</td>)}</tr>)}</tbody></table></div></div>;
}

export default function UsageTables({ usage, costs }: Props) {
  const daily = useMemo<Row[]>(() => Array.from(usage.reduce((map, r) => {
    const date = formatDateFromSeconds(r.startTime);
    const row = map.get(date) || { date, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, totalTokens: 0, requests: 0 };
    row.inputTokens += r.inputTokens; row.cachedInputTokens += r.cachedInputTokens; row.outputTokens += r.outputTokens; row.totalTokens += r.totalTokens; row.requests += r.numModelRequests;
    map.set(date, row); return map;
  }, new Map<string, DailyAccumulator>()).values()).map((r) => ({ ...r, inputTokens: nf.format(r.inputTokens), cachedInputTokens: nf.format(r.cachedInputTokens), outputTokens: nf.format(r.outputTokens), totalTokens: nf.format(r.totalTokens), requests: nf.format(r.requests) })), [usage]);
  const models = useMemo<Row[]>(() => Array.from(usage.reduce((map, r) => {
    const model = r.model || 'Ungrouped'; const row = map.get(model) || { model, totalTokens: 0, requests: 0 };
    row.totalTokens += r.totalTokens; row.requests += r.numModelRequests; map.set(model, row); return map;
  }, new Map<string, ModelAccumulator>()).values()).map((r) => ({ ...r, totalTokens: nf.format(r.totalTokens), requests: nf.format(r.requests) })), [usage]);
  const costRows: Row[] = costs.map((c) => ({ date: formatDateFromSeconds(c.startTime), lineItem: c.lineItem || 'Total', amount: c.amount.toFixed(6), currency: c.currency, projectId: c.projectId, apiKeyId: c.apiKeyId, quantity: c.quantity }));
  return <div className="grid gap-4"><SortableTable title="Daily usage" rows={daily} /><SortableTable title="Model breakdown" rows={models} /><SortableTable title="Cost line items" rows={costRows} /></div>;
}
