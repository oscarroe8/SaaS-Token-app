export type UsageGroupBy = 'model' | 'project_id' | 'api_key_id' | 'user_id' | 'batch' | 'service_tier' | 'line_item';

export type NormalizedUsageRecord = {
  startTime: number;
  endTime: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  totalTokens: number;
  numModelRequests: number;
  model: string | null;
  projectId: string | null;
  apiKeyId: string | null;
  userId: string | null;
  serviceTier: string | null;
};

export type NormalizedCostRecord = {
  startTime: number;
  endTime: number;
  amount: number;
  currency: string;
  lineItem: string | null;
  projectId: string | null;
  apiKeyId: string | null;
  quantity: number | null;
};

export type OpenAIUsageBucket = { start_time: number; end_time: number; results?: OpenAIUsageResult[] };
export type OpenAIUsageResult = {
  input_tokens?: number | null;
  input_cached_tokens?: number | null;
  cached_input_tokens?: number | null;
  output_tokens?: number | null;
  num_model_requests?: number | null;
  model?: string | null;
  project_id?: string | null;
  api_key_id?: string | null;
  user_id?: string | null;
  service_tier?: string | null;
};
export type OpenAIUsageResponse = { data?: OpenAIUsageBucket[]; has_more?: boolean; next_page?: string | null };

export type OpenAICostBucket = { start_time: number; end_time: number; results?: OpenAICostResult[] };
export type OpenAICostResult = {
  amount?: { value?: number | null; currency?: string | null } | number | null;
  line_item?: string | null;
  project_id?: string | null;
  api_key_id?: string | null;
  quantity?: number | null;
};
export type OpenAICostResponse = { data?: OpenAICostBucket[]; has_more?: boolean; next_page?: string | null };

const n = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const s = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);

export function normalizeUsageBuckets(buckets: OpenAIUsageBucket[] = []): NormalizedUsageRecord[] {
  return buckets.flatMap((bucket) => {
    const results = bucket.results?.length ? bucket.results : [{} as OpenAIUsageResult];
    return results.map((result) => {
      const inputTokens = n(result.input_tokens);
      const cachedInputTokens = n(result.input_cached_tokens ?? result.cached_input_tokens);
      const outputTokens = n(result.output_tokens);
      return {
        startTime: bucket.start_time,
        endTime: bucket.end_time,
        inputTokens,
        cachedInputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        numModelRequests: n(result.num_model_requests),
        model: s(result.model),
        projectId: s(result.project_id),
        apiKeyId: s(result.api_key_id),
        userId: s(result.user_id),
        serviceTier: s(result.service_tier)
      };
    });
  });
}

export function normalizeCostBuckets(buckets: OpenAICostBucket[] = []): NormalizedCostRecord[] {
  return buckets.flatMap((bucket) => {
    const results = bucket.results?.length ? bucket.results : [{} as OpenAICostResult];
    return results.map((result) => {
      const amount = typeof result.amount === 'number' ? result.amount : n(result.amount?.value);
      const currency = typeof result.amount === 'object' && result.amount?.currency ? result.amount.currency : 'usd';
      return {
        startTime: bucket.start_time,
        endTime: bucket.end_time,
        amount,
        currency,
        lineItem: s(result.line_item),
        projectId: s(result.project_id),
        apiKeyId: s(result.api_key_id),
        quantity: typeof result.quantity === 'number' ? result.quantity : null
      };
    });
  });
}
