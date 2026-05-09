/**
 * Central place to read LLM configuration.
 * The agent uses the Google Gemini API (Google AI Studio) via CopilotKit’s `google/...` model id.
 *
 * Maps use NEXT_PUBLIC_GOOGLE_MAPS_API_KEY only.
 *
 * @see docs/API_KEYS.md
 */

/** BuiltInAgent expects e.g. `google/gemini-2.5-flash` (provider/model). */
export function getModelSpecifier(): string {
  const fromEnv = process.env.LLM_MODEL?.trim();
  if (fromEnv) return normalizeModelSpecifier(fromEnv);

  const geminiOnly = process.env.GEMINI_MODEL?.trim();
  if (geminiOnly) return normalizeModelSpecifier(geminiOnly);

  return "google/gemini-2.5-flash";
}

function normalizeModelSpecifier(raw: string): string {
  const s = raw.trim();
  if (s.includes("/")) return s;
  return `google/${s.replace(/^google[-/]/i, "")}`;
}

/** API key for Gemini; BuiltInAgent also falls back to env if omitted. */
export function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
}
