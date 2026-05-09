import { NextRequest, NextResponse } from "next/server";
import { CopilotRuntime } from "@copilotkit/runtime";
import {
  BuiltInAgent,
  createCopilotRuntimeHandler,
  defineTool,
} from "@copilotkit/runtime/v2";
import { z } from "zod";
import { getGoogleApiKey, getModelSpecifier } from "@/lib/llm-config";
import { mockResearchBundle } from "@/lib/research/mock-research";
import { PLACE_ANALYSIS_SYSTEM_PROMPT } from "@/lib/agent/prompts";

const researchNeighborhood = defineTool({
  name: "research_neighborhood",
  description:
    "Collect neighborhood signals for a map pin. MVP uses deterministic mock data; swap implementation for real web/API research.",
  parameters: z.object({
    lat: z.number(),
    lng: z.number(),
    addressHint: z.string().optional(),
    focus: z
      .enum(["general", "commute", "food", "rent", "risk", "comparison"])
      .optional(),
  }),
  execute: async (args) => mockResearchBundle(args),
});

type CopilotFetchHandler = (req: NextRequest) => Promise<Response> | Response;

let copilotHandler: CopilotFetchHandler | null = null;
let copilotInitError: Error | null = null;

function getCopilotHandler():
  | { handler: CopilotFetchHandler }
  | { error: Error } {
  if (copilotInitError) return { error: copilotInitError };
  if (copilotHandler) return { handler: copilotHandler };
  try {
    const runtime = new CopilotRuntime({
      agents: {
        default: new BuiltInAgent({
          model: getModelSpecifier(),
          apiKey: getGoogleApiKey(),
          prompt: PLACE_ANALYSIS_SYSTEM_PROMPT,
          tools: [researchNeighborhood],
          maxSteps: 24,
          temperature: 0.65,
        }),
      },
      a2ui: {
        injectA2UITool: true,
      },
    });

    copilotHandler = createCopilotRuntimeHandler({
      runtime: runtime.instance,
      basePath: "/api/copilotkit",
      mode: "multi-route",
      cors: true,
    });
    return { handler: copilotHandler };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    copilotInitError = err;
    return { error: err };
  }
}

function jsonInitError(error: Error) {
  return NextResponse.json(
    {
      error: error.message,
      code: "COPILOTKIT_INIT_FAILED",
    },
    { status: 503 },
  );
}

/** Multi-route mode so GET /threads, POST /agent/:id/run, etc. all work (not single-route POST-only). */
function dispatch(req: NextRequest) {
  const result = getCopilotHandler();
  if ("error" in result) {
    return jsonInitError(result.error);
  }
  return result.handler(req);
}

export function GET(req: NextRequest) {
  return dispatch(req);
}

export function POST(req: NextRequest) {
  return dispatch(req);
}

export function PATCH(req: NextRequest) {
  return dispatch(req);
}

export function DELETE(req: NextRequest) {
  return dispatch(req);
}

export function OPTIONS(req: NextRequest) {
  return dispatch(req);
}
