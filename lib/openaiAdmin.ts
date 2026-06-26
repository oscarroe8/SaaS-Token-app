import type { BucketWidth } from './dateUtils';
import type { OpenAICostResponse, OpenAIUsageResponse, UsageGroupBy } from './usageNormalisation';

const OPENAI_BASE_URL = 'https://api.openai.com/v1/organization';
const ALLOWED_BUCKET_WIDTHS = new Set(['1m', '1h', '1d']);
const ALLOWED_GROUP_BY = new Set(['model', 'project_id', 'api_key_id', 'user_id', 'batch', 'service_tier', 'line_item']);
const MAX_LIMIT = 180;
const MAX_PAGES = 50;

export type ValidatedAdminQuery = {
  start_time: number;
  end_time?: number;
  bucket_width: BucketWidth;
  group_by: UsageGroupBy[];
  limit: number;
  page?: string;
};

export class OpenAIAdminError extends Error {
  constructor(public status: number, message: string, public requestId?: string | null) {
    super(message);
  }
}

export function validateAdminQuery(searchParams: URLSearchParams): ValidatedAdminQuery {
  const start = Number(searchParams.get('start_time'));
  const endParam = searchParams.get('end_time');
  const end = endParam ? Number(endParam) : undefined;
  const bucket = searchParams.get('bucket_width') || '1d';
  const limit = Math.min(Number(searchParams.get('limit') || '31'), MAX_LIMIT);
  const groupBy = searchParams.getAll('group_by').flatMap((value) => value.split(',')).filter(Boolean);

  if (!Number.isInteger(start) || start <= 0) throw new Error('start_time must be a positive Unix timestamp in seconds.');
  if (end !== undefined && (!Number.isInteger(end) || end <= start)) throw new Error('end_time must be greater than start_time.');
  if (!ALLOWED_BUCKET_WIDTHS.has(bucket)) throw new Error('bucket_width must be one of 1m, 1h or 1d.');
  if (!Number.isInteger(limit) || limit < 1) throw new Error('limit must be a positive integer.');
  for (const group of groupBy) {
    if (!ALLOWED_GROUP_BY.has(group)) throw new Error(`Unsupported group_by value: ${group}.`);
  }

  return {
    start_time: start,
    end_time: end,
    bucket_width: bucket as BucketWidth,
    group_by: groupBy as UsageGroupBy[],
    limit,
    page: searchParams.get('page') || undefined
  };
}

function buildHeaders(): HeadersInit {
  const apiKey = process.env.OPENAI_ADMIN_API_KEY;
  if (!apiKey) throw new OpenAIAdminError(500, 'OPENAI_ADMIN_API_KEY is not configured on the server.');
  const headers: HeadersInit = { Authorization: `Bearer ${apiKey}` };
  if (process.env.OPENAI_ORG_ID) headers['OpenAI-Organization'] = process.env.OPENAI_ORG_ID;
  if (process.env.OPENAI_PROJECT_ID) headers['OpenAI-Project'] = process.env.OPENAI_PROJECT_ID;
  return headers;
}

function buildUrl(path: '/usage/completions' | '/costs', query: ValidatedAdminQuery, page?: string): string {
  const params = new URLSearchParams();
  params.set('start_time', String(query.start_time));
  if (query.end_time) params.set('end_time', String(query.end_time));
  params.set('bucket_width', query.bucket_width);
  params.set('limit', String(query.limit));
  if (page) params.set('page', page);
  for (const group of query.group_by) params.append('group_by', group);
  return `${OPENAI_BASE_URL}${path}?${params.toString()}`;
}

function userMessage(status: number): string {
  if (status === 401) return 'OpenAI rejected the Admin API key. Check OPENAI_ADMIN_API_KEY.';
  if (status === 403) return 'This key does not have permission to access organisation usage or costs.';
  if (status === 429) return 'OpenAI rate limit reached. Please wait and try again.';
  if (status >= 500) return 'OpenAI is temporarily unavailable. Please try again shortly.';
  return 'OpenAI returned an unexpected error.';
}

async function fetchPage<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: buildHeaders(), cache: 'no-store' });
  const requestId = response.headers.get('x-request-id');
  if (requestId) console.info(`OpenAI admin request id: ${requestId}`);
  if (!response.ok) throw new OpenAIAdminError(response.status, userMessage(response.status), requestId);
  return response.json() as Promise<T>;
}

export async function fetchAllOpenAIUsage(query: ValidatedAdminQuery): Promise<OpenAIUsageResponse> {
  const all: NonNullable<OpenAIUsageResponse['data']> = [];
  let page = query.page;
  let hasMore = true;
  for (let i = 0; hasMore && i < MAX_PAGES; i += 1) {
    const res = await fetchPage<OpenAIUsageResponse>(buildUrl('/usage/completions', query, page));
    all.push(...(res.data || []));
    hasMore = Boolean(res.has_more && res.next_page);
    page = res.next_page || undefined;
  }
  return { data: all, has_more: false, next_page: null };
}

export async function fetchAllOpenAICosts(query: ValidatedAdminQuery): Promise<OpenAICostResponse> {
  const all: NonNullable<OpenAICostResponse['data']> = [];
  let page = query.page;
  let hasMore = true;
  for (let i = 0; hasMore && i < MAX_PAGES; i += 1) {
    const res = await fetchPage<OpenAICostResponse>(buildUrl('/costs', query, page));
    all.push(...(res.data || []));
    hasMore = Boolean(res.has_more && res.next_page);
    page = res.next_page || undefined;
  }
  return { data: all, has_more: false, next_page: null };
}
