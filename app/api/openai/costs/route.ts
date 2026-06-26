import { NextRequest, NextResponse } from 'next/server';
import { fetchAllOpenAICosts, OpenAIAdminError, validateAdminQuery } from '@/lib/openaiAdmin';
import { normalizeCostBuckets } from '@/lib/usageNormalisation';

export async function GET(request: NextRequest) {
  try {
    const query = validateAdminQuery(request.nextUrl.searchParams);
    const raw = await fetchAllOpenAICosts(query);
    return NextResponse.json({ data: normalizeCostBuckets(raw.data), raw });
  } catch (error) {
    const status = error instanceof OpenAIAdminError ? error.status : 400;
    const message = error instanceof Error ? error.message : 'Unable to fetch costs.';
    return NextResponse.json({ error: message }, { status });
  }
}
