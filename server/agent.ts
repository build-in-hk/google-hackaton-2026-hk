import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'demo-key');

export interface GeminiResponse {
  surfaceId: string;
  components: A2UIComponent[];
}

interface A2UIComponent {
  id: string;
  component: Record<string, unknown>;
}

const CATALOG_SYSTEM_PROMPT = `You are a creative director for a Tamagotchi virtual pet. You generate A2UI JSON to display the pet's current state.

CUSTOM COMPONENT CATALOG:
- scene { width, height, children } — viewport container with relative positioning
- background { variant: "room"|"park"|"bedroom"|"void"|"golden-room", moodTint? } — full-bleed gradient backdrop
- pet-avatar { x, y, size: "small"|"normal"|"big", expression: "neutral"|"happy"|"sad"|"sleepy"|"excited"|"dance", id: "pet" } — the pet character
- stat-bars { hunger, happiness, energy, affection: number } — horizontal progress bars (0-100)
- thought-bubble { text, visible: boolean } — floating text bubble above pet
- action-palette { actions: string[] } — grid of available actions
- inventory-slot { items: string[] } — collected items display

RULES:
1. Always wrap content in a "scene" component first
2. Position pet-avatar using x,y coordinates (0-800, 0-400)
3. Size reflects mood: "small" for sad/sleepy, "normal" for neutral, "big" for happy/excited/dance
4. Include a thought-bubble with what the pet is thinking
5. Action-palette must include all unlocked actions (feed, play, sleep, talk) plus any new ones
6. Background variant matches location
7. Mood tint subtly changes background when mood is extreme

OUTPUT: A JSON array of A2UI messages where each message has { surfaceId, components } with component objects containing id and component properties.`;

export async function generateScene(
  petState: any,
  thought: string,
  lastAction: string,
): Promise<A2UIComponent[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `CURRENT PET STATE:
- hunger: ${petState.hunger.toFixed(1)}, happiness: ${petState.happiness.toFixed(1)}, energy: ${petState.energy.toFixed(1)}, affection: ${petState.affection.toFixed(1)}
- mood: ${petState.mood}, location: ${petState.location}
- position: x=${petState.position.x.toFixed(0)}, y=${petState.position.y.toFixed(0)}
- unlocked components: ${petState.unlockedComponents.join(', ')}
- inventory: ${petState.inventory.length > 0 ? petState.inventory.join(', ') : '(empty)'}
- total interactions: ${petState.totalInteractions}

LAST ACTION: ${lastAction}
PET THOUGHT: "${thought}"

Generate the A2UI scene JSON. Make sure the pet avatar is positioned correctly and the background matches the location. Include a thought bubble with the pet's current thought.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const jsonStr = result.response.text().trim();
  
  // Parse JSON, handling markdown code blocks
  const cleanJson = jsonStr.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  
  // Handle both array and object response formats
  if (Array.isArray(parsed)) {
    return parsed.flatMap(item => item.components || []);
  }
  return parsed.components || [parsed];
}

// Fallback: pre-rendered templates when Gemini is unavailable
export function getFallbackScene(petState: any, thought: string): A2UIComponent[] {
  const { mood, location, position, hunger, happiness, energy, affection, unlockedComponents } = petState;

  const sizeMap: Record<string, string> = {
    sleepy: 'small', sad: 'small', hungry: 'normal', grumpy: 'normal',
    neutral: 'normal', happy: 'big', excited: 'big', dance: 'big',
  };

  const actions = ['feed', 'play', 'sleep', 'talk'].concat(
    unlockedComponents.includes('hug-button') ? ['hug'] : []
  );

  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    {
      id: 'background',
      component: { background: { variant: location, moodTint: mood !== 'neutral' ? mood : undefined } },
    },
    {
      id: 'pet-avatar',
      component: {
        'pet-avatar': {
          x: position.x, y: position.y, size: sizeMap[mood],
          expression: mood, id: 'pet',
        },
      },
    },
    {
      id: 'thought-bubble',
      component: { 'thought-bubble': { text: thought, visible: true } },
    },
    {
      id: 'stat-bars',
      component: {
        'stat-bars': {
          hunger, happiness, energy, affection,
        },
      },
    },
    {
      id: 'action-palette',
      component: { 'action-palette': { actions } },
    },
  ];
}
