'use client';
import { useEffect, useMemo, useState } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import KpiCards from '@/components/KpiCards';
import UsageCharts from '@/components/UsageCharts';
import UsageTables from '@/components/UsageTables';
import { getPresetRange } from '@/lib/dateUtils';
import type { NormalizedCostRecord, NormalizedUsageRecord } from '@/lib/usageNormalisation';

export default function Page() {
  const initial = useMemo(() => getPresetRange(7), []);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [usage, setUsage] = useState<NormalizedUsageRecord[]>([]);
  const [costs, setCosts] = useState<NormalizedCostRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      const usageQs = new URLSearchParams({ start_time: String(startTime), end_time: String(endTime), bucket_width: '1d', limit: '31' });
      ['model', 'project_id', 'api_key_id', 'user_id', 'service_tier'].forEach((g) => usageQs.append('group_by', g));
      const costQs = new URLSearchParams({ start_time: String(startTime), end_time: String(endTime), bucket_width: '1d', limit: '31' });
      ['project_id', 'line_item'].forEach((g) => costQs.append('group_by', g));
      try {
        const [usageRes, costRes] = await Promise.all([fetch(`/api/openai/usage?${usageQs}`), fetch(`/api/openai/costs?${costQs}`)]);
        const usageJson = await usageRes.json(); const costJson = await costRes.json();
        if (!usageRes.ok) throw new Error(usageJson.error || 'Usage request failed.');
        if (!costRes.ok) throw new Error(costJson.error || 'Cost request failed.');
        setUsage(usageJson.data); setCosts(costJson.data);
      } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load data.'); }
      finally { setLoading(false); }
    };
    load();
  }, [startTime, endTime]);

  const empty = !loading && !error && usage.length === 0 && costs.length === 0;
  return <main className="mx-auto max-w-7xl space-y-6 p-6">
    <header><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Server-side OpenAI Admin API dashboard</p><h1 className="text-3xl font-bold">OpenAI API token usage and spend</h1><p className="mt-2 max-w-3xl text-slate-600">Live organisation usage from OpenAI API endpoints. The Admin API key is used only inside Next.js API routes and is never sent to the browser.</p></header>
    <DateRangePicker startTime={startTime} endTime={endTime} loading={loading} onChange={(s, e) => { setStartTime(s); setEndTime(e); }} />
    {loading && <div className="rounded-xl border bg-white p-6 text-slate-600 shadow-sm">Loading live OpenAI usage and costs…</div>}
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>}
    {empty && <div className="rounded-xl border bg-white p-8 text-center text-slate-600 shadow-sm">No usage or cost data was returned for this period. Try a wider range or confirm the organisation/project filter.</div>}
    {!loading && !error && !empty && <><KpiCards usage={usage} costs={costs} /><UsageCharts usage={usage} costs={costs} /><UsageTables usage={usage} costs={costs} /></>}
  </main>;
}
