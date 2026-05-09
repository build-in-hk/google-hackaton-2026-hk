/**
 * Central place to read LLM configuration. Swap models without code changes.
 *
 * @see docs/API_KEYS.md
 */

/** CopilotKit BuiltInAgent expects e.g. `google/gemini-2.5-flash` (provider/model). */
export function getModelSpecifier(): string {
  const fromEnv = process.env.LLM_MODEL?.trim();
  if (fromEnv) return normalizeModelSpecifier(fromEnv);

  const geminiOnly = process.env.GEMINI_MODEL?.trim();
  if (geminiOnly) return normalizeModelSpecifier(geminiOnly);

  // Default tuned for Google AI Studio; override via LLM_MODEL when Google ships new IDs.
  return "google/gemini-2.5-flash";
}

function normalizeModelSpecifier(raw: string): string {
  const s = raw.trim();
  if (s.includes("/")) return s;
  return `google/${s.replace(/^google[-/]/i, "")}`;
}

/** Vercel AI SDK Google provider reads GOOGLE_API_KEY; we also accept GEMINI_API_KEY. */
export function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
}
