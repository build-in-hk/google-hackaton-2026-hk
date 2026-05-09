# API keys & model configuration

## Required for the agent (LLM)

The runtime uses CopilotKit `BuiltInAgent` with the **Vercel AI SDK** Google provider.

| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Preferred. [Google AI Studio](https://aistudio.google.com/apikey) API key for Gemini. |
| `GEMINI_API_KEY` | Alternative name; used if `GOOGLE_API_KEY` is unset. |

The underlying resolver also reads `GOOGLE_API_KEY` when the optional `apiKey` field is omitted; we pass through from either variable for convenience.

## Model selection (switch without code changes)

| Variable | Example | Notes |
|----------|---------|--------|
| `LLM_MODEL` | `google/gemini-2.5-flash` | Full `provider/model` string (recommended). |
| `LLM_MODEL` | `gemini-2.5-pro` | Shorthand: normalized to `google/gemini-2.5-pro`. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Used only if `LLM_MODEL` is unset. |

**Gemini 3.x / future IDs:** When Google publishes a model ID (e.g. `gemini-3.1-pro`), set:

```bash
LLM_MODEL=google/gemini-3.1-pro
```

Verify the exact ID in [Google AI Studio](https://aistudio.google.com/) models list; names change over time.

### Using a different provider later

`BuiltInAgent` supports `openai/…`, `anthropic/…`, and `google/…` prefixes (see `@copilotkit/runtime` `resolveModel`). To switch to OpenAI:

```bash
LLM_MODEL=openai/gpt-4o
OPENAI_API_KEY=sk-...
```

Adjust `app/api/copilotkit/route.ts` if you need to pass `apiKey` explicitly for non-Google providers.

## Maps (frontend)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key) key for pin drop. |

If unset, the map shows a placeholder; manual lat/lng inputs still work.

## Optional

| Variable | Purpose |
|----------|---------|
| `COPILOTKIT_TELEMETRY_DISABLED` | Set to `true` to disable CopilotKit OSS telemetry. |
