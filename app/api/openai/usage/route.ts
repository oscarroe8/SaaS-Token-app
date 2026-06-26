import { NextRequest, NextResponse } from 'next/server';
import { fetchAllOpenAIUsage, OpenAIAdminError, validateAdminQuery } from '@/lib/openaiAdmin';
import { normalizeUsageBuckets } from '@/lib/usageNormalisation';

export async function GET(request: NextRequest) {
  try {
    const query = validateAdminQuery(request.nextUrl.searchParams);
    const raw = await fetchAllOpenAIUsage(query);
    return NextResponse.json({ data: normalizeUsageBuckets(raw.data), raw });
  } catch (error) {
    const status = error instanceof OpenAIAdminError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'Unable to fetch usage.';
    return NextResponse.json({ error: message }, { status });
  }
}
