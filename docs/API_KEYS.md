# API keys & model configuration

## Agent (LLM) — Google Gemini API

The CopilotKit `BuiltInAgent` uses the **Google Gemini API** (Google AI Studio / Generative Language API) with a `GOOGLE_API_KEY`-style key — not Vertex.

| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Preferred. [Get an API key](https://aistudio.google.com/apikey). |
| `GEMINI_API_KEY` | Alternative name if `GOOGLE_API_KEY` is unset. |

## Model selection

| Variable | Example | Notes |
|----------|---------|--------|
| `LLM_MODEL` | `google/gemini-2.5-flash` | Full `provider/model` string (recommended). |
| `LLM_MODEL` | `gemini-2.5-pro` | Shorthand: normalized to `google/gemini-2.5-pro`. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Used only if `LLM_MODEL` is unset. |

If both are unset, the default is `google/gemini-2.5-flash`.

## Maps (frontend only)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key) key for the pin map. **Not** used for the LLM. |

If unset, the map shows a placeholder; manual lat/lng inputs still work.

## Optional

| Variable | Purpose |
|----------|---------|
| `COPILOTKIT_TELEMETRY_DISABLED` | Set to `true` to disable CopilotKit OSS telemetry. |
