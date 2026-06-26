# OpenAI API Usage and Spend Dashboard

A production-ready MVP dashboard for viewing live OpenAI API organisation token usage and costs. It uses Next.js, TypeScript, Tailwind CSS, Recharts and server-side API routes that call OpenAI Admin/organisation endpoints with `fetch`.

## What this app tracks

- OpenAI API token usage from `https://api.openai.com/v1/organization/usage/completions`.
- OpenAI API costs from `https://api.openai.com/v1/organization/costs`.
- Breakdowns by date, model, project, API key, user and service tier when OpenAI returns those fields for your query.

This does **not** track private ChatGPT web app conversations or consumer ChatGPT usage. It only tracks OpenAI API organisation/admin usage available to your API organisation.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Set `OPENAI_ADMIN_API_KEY` in `.env.local`.

   You need an OpenAI Admin API key with permission to read organisation usage and cost data. Create or retrieve this key from your OpenAI platform organisation/admin settings, then paste it as:

   ```bash
   OPENAI_ADMIN_API_KEY=sk-admin-...
   ```

4. Optionally set `OPENAI_ORG_ID` and `OPENAI_PROJECT_ID` to scope requests.

## Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

## Security notes

- `OPENAI_ADMIN_API_KEY` is used only inside `app/api/openai/*` server routes.
- Do not use `NEXT_PUBLIC_` for the admin key.
- The app validates all supported query parameters before calling OpenAI.
- API routes call fixed OpenAI endpoints only; arbitrary external URLs are not accepted.
- OpenAI request IDs are logged on the server for debugging. The admin key is never logged.

## Dashboard features

- Last 7 days, last 30 days and custom date controls.
- KPI cards for input tokens, cached input tokens, output tokens, total tokens, model requests and cost.
- Charts for tokens over time, cost over time, usage by model, and optional project/API-key charts.
- Sortable daily usage, model breakdown and cost line item tables.
- Helpful loading, error and empty states.

## Troubleshooting

### 401 Unauthorized

Check that `OPENAI_ADMIN_API_KEY` is set in `.env.local`, that the server was restarted after editing environment variables, and that the value is an Admin API key.

### 403 Forbidden

The key is valid but does not have permission to access organisation usage/cost endpoints, or your organisation/project headers do not match the key's access. Verify your admin permissions and optional `OPENAI_ORG_ID` / `OPENAI_PROJECT_ID` values.

### Empty data

Confirm the selected date range contains OpenAI API traffic. Try Last 30 days, remove optional project scoping, or check whether the organisation has usage for the completions endpoint. New usage/cost data may not be immediately available.
