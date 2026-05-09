import { NextRequest } from "next/server";
import { CopilotRuntime } from "@copilotkit/runtime";
import {
  BuiltInAgent,
  createCopilotRuntimeHandler,
  defineTool,
} from "@copilotkit/runtime/v2";
import { z } from "zod";
import { getModelSpecifier, getGoogleApiKey } from "@/lib/llm-config";
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

/** Multi-route mode so GET /threads, POST /agent/:id/run, etc. all work (not single-route POST-only). */
const handleRequest = createCopilotRuntimeHandler({
  runtime: runtime.instance,
  basePath: "/api/copilotkit",
  mode: "multi-route",
  cors: true,
});

export function GET(req: NextRequest) {
  return handleRequest(req);
}

export function POST(req: NextRequest) {
  return handleRequest(req);
}

export function PATCH(req: NextRequest) {
  return handleRequest(req);
}

export function DELETE(req: NextRequest) {
  return handleRequest(req);
}

export function OPTIONS(req: NextRequest) {
  return handleRequest(req);
}
