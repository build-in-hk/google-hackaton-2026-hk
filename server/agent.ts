/**
 * agent.ts — Gemini integration for A2UI JSON generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AetherPetState } from './game-engine';
import { CREATIVE_DIRECTOR_SYSTEM_PROMPT, getGoldenScene } from './director';
import { generateUnlockThought } from './thoughts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

export interface GeminiResponse {
  surfaceId: string;
  components: A2UIComponent[];
}

export interface A2UIComponent {
  id: string;
  component: Record<string, unknown>;
}

const CATALOG_SYSTEM_PROMPT = `You are the Creative Director for A2UI Tamagotchi. Generate A2UI JSON that displays a pet's current state beautifully.

CUSTOM COMPONENT CATALOG:
- scene { width, height } — viewport container
- background { variant: "room"|"park"|"bedroom"|"void"|"golden-room", moodTint? }
- pet-entity { x, y, size: "small"|"normal"|"big", expression, id: "pet" }
- stat-bars { hunger, happiness, energy, affection }
- thought-bubble { text, visible }
- action-palette { actions }
- inventory-slot { items }

RULES:
1. Wrap content in a "scene" component first
2. Position pet-entity using x,y (0-800, 0-400)
3. Size reflects stage: "small"=egg/baby, "normal"=youth/adult, "big"=elder
4. Include thought-bubble with current thought
5. Background variant matches location
6. Output a JSON array of { surfaceId, components } messages

OUTPUT ONLY valid A2UI JSON. No markdown wrapping.`;

export async function generateScene(
  petState: AetherPetState,
  thought: string,
  lastAction: string,
): Promise<A2UIComponent[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `CURRENT PET STATE:
- hunger: ${petState.hunger}, energy: ${petState.energy}, joy: ${petState.joy}, bond: ${petState.bond}
- mood: ${petState.mood}, location: ${petState.location}, stage: ${petState.stage}
- position: x=${petState.position.x.toFixed(0)}, y=${petState.position.y.toFixed(0)}
- unlocked: ${petState.unlocked.join(', ')}
- interactionCount: ${petState.interactionCount}
- total interactions: ${petState.interactionCount}

LAST ACTION: ${lastAction}
PET THOUGHT: "${thought}"

Generate the A2UI scene JSON. Make sure the pet entity is positioned correctly and the background matches the location. Include a thought bubble with the pet's current thought.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const jsonStr = result.response.text().trim();
  const cleanJson = jsonStr.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  if (Array.isArray(parsed)) {
    return parsed.flatMap(item => item.components || []);
  }
  return parsed.components || [parsed];
}

export function getFallbackScene(petState: AetherPetState, thought: string): A2UIComponent[] {
  const components = getGoldenScene(petState);
  // Update thought bubble text
  const bubbleComp = components.find((c) => c.id === 'thought-bubble');
  if (bubbleComp && bubbleComp.component['thought-bubble']) {
    (bubbleComp.component['thought-bubble'] as any).text = thought;
  }
  return components;
}
