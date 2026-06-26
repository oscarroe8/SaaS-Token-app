'use client';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDateFromSeconds } from '@/lib/dateUtils';
import type { NormalizedCostRecord, NormalizedUsageRecord } from '@/lib/usageNormalisation';

type Props = { usage: NormalizedUsageRecord[]; costs: NormalizedCostRecord[] };

function sumBy<T>(items: T[], key: (item: T) => string, value: (item: T) => number) {
  return Array.from(items.reduce((map, item) => map.set(key(item), (map.get(key(item)) || 0) + value(item)), new Map<string, number>()), ([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
}

export default function UsageCharts({ usage, costs }: Props) {
  const tokensOverTime = sumBy(usage, (r) => formatDateFromSeconds(r.startTime), (r) => r.totalTokens).reverse();
  const costOverTime = sumBy(costs, (r) => formatDateFromSeconds(r.startTime), (r) => r.amount).reverse();
  const byModel = sumBy(usage, (r) => r.model || 'Ungrouped', (r) => r.totalTokens);
  const byProject = sumBy(usage.filter((r) => r.projectId), (r) => r.projectId || 'Unknown', (r) => r.totalTokens);
  const byKey = sumBy(usage.filter((r) => r.apiKeyId), (r) => r.apiKeyId || 'Unknown', (r) => r.totalTokens);
  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="mb-4 font-semibold">{title}</h2><div className="h-72">{children}</div></div>;
  return <div className="grid gap-4 xl:grid-cols-2">
    <ChartCard title="Tokens over time"><ResponsiveContainer><LineChart data={tokensOverTime}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="total" stroke="#2563eb" strokeWidth={2} /></LineChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Cost over time"><ResponsiveContainer><LineChart data={costOverTime}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="total" stroke="#16a34a" strokeWidth={2} /></LineChart></ResponsiveContainer></ChartCard>
    <ChartCard title="Usage by model"><ResponsiveContainer><BarChart data={byModel}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#7c3aed" /></BarChart></ResponsiveContainer></ChartCard>
    {byProject.length > 0 && <ChartCard title="Usage by project"><ResponsiveContainer><BarChart data={byProject}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#ea580c" /></BarChart></ResponsiveContainer></ChartCard>}
    {byKey.length > 0 && <ChartCard title="Usage by API key"><ResponsiveContainer><BarChart data={byKey}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#0891b2" /></BarChart></ResponsiveContainer></ChartCard>}
  </div>;
}
