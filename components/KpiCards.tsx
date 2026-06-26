import type { NormalizedCostRecord, NormalizedUsageRecord } from '@/lib/usageNormalisation';

type Props = { usage: NormalizedUsageRecord[]; costs: NormalizedCostRecord[] };
const fmt = new Intl.NumberFormat('en-US');

export default function KpiCards({ usage, costs }: Props) {
  const totals = usage.reduce((acc, row) => ({
    input: acc.input + row.inputTokens,
    cached: acc.cached + row.cachedInputTokens,
    output: acc.output + row.outputTokens,
    total: acc.total + row.totalTokens,
    requests: acc.requests + row.numModelRequests
  }), { input: 0, cached: 0, output: 0, total: 0, requests: 0 });
  const cost = costs.reduce((sum, row) => sum + row.amount, 0);
  const cards = [
    ['Input tokens', fmt.format(totals.input)],
    ['Cached input tokens', fmt.format(totals.cached)],
    ['Output tokens', fmt.format(totals.output)],
    ['Total tokens', fmt.format(totals.total)],
    ['Model requests', fmt.format(totals.requests)],
    ['Total cost', `$${cost.toFixed(4)}`]
  ];
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>;
}
