import { GoogleGenerativeAI } from '@google/generative-ai';
import { COMPONENT_CATALOG } from './catalog-definition';
import type { AetherPetState } from './engine';

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
${Object.entries(COMPONENT_CATALOG)
  .map(([name, cfg]) => {
    const props = (cfg as any).properties?.join(', ') || '';
    const desc = (cfg as any).description || '';
    const variants = (cfg as any).variants ? ` variants: ${(cfg as any).variants.join('|')}` : '';
    const sizes = (cfg as any).sizes ? ` sizes: ${(cfg as any).sizes.join('|')}` : '';
    const expressions = (cfg as any).expressions ? ` expressions: ${(cfg as any).expressions.join('|')}` : '';
    return `- ${name} { ${props} } — ${desc}${variants}${sizes}${expressions}`;
  })
  .join('\n')}

RULES:
1. Always wrap content in a "scene" component first
2. Position pet-avatar using x,y coordinates (0-800, 0-400)
3. Size reflects mood: "small" for sad/sleepy, "normal" for neutral, "big" for happy/excited/dance
4. Include a thought-bubble with what the pet is thinking
5. Action-palette must include all unlocked actions
6. Background variant matches location
7. Mood tint subtly changes background when mood is extreme

OUTPUT: A JSON array of A2UI messages where each message has { surfaceId, components } with component objects containing id and component properties.`;

export async function generateScene(
  petState: AetherPetState,
  thought: string,
  lastAction: string,
): Promise<A2UIComponent[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `CURRENT PET STATE:
- hunger: ${petState.hunger.toFixed(1)}, joy: ${petState.joy.toFixed(1)}, energy: ${petState.energy.toFixed(1)}, bond: ${petState.bond.toFixed(1)}
- mood: ${petState.mood}, location: ${petState.location}, stage: ${petState.stage}
- position: x=${petState.position.x.toFixed(0)}, y=${petState.position.y.toFixed(0)}
- unlocked: ${petState.unlocked.join(', ')}
- interaction count: ${petState.interactionCount}

LAST ACTION: ${lastAction}
PET THOUGHT: "${thought}"

Generate the A2UI scene JSON. Make sure the pet-avatar is positioned correctly and the background matches the location.`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const jsonStr = result.response.text().trim();
  const cleanJson = jsonStr.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  if (Array.isArray(parsed)) {
    return parsed.flatMap((item: any) => item.components || []);
  }
  return parsed.components || [parsed];
}

// Fallback: pre-rendered templates when Gemini is unavailable
export function getFallbackScene(
  petState: AetherPetState,
  thought: string,
): A2UIComponent[] {
  const { mood, location, position, hunger, joy, energy, bond, unlocked } = petState;

  const sizeMap: Record<string, string> = {
    sleepy: 'small', lonely: 'small', hungry: 'normal', anxious: 'small',
    neutral: 'normal', content: 'normal', focused: 'normal',
    joyful: 'big', happy: 'big', euphoric: 'big', affectionate: 'big',
  };

  const exprMap: Record<string, string> = {
    euphoric: 'excited', joyful: 'happy', content: 'neutral', neutral: 'neutral',
    lonely: 'sad', hungry: 'hungry', tired: 'sleepy', anxious: 'grumpy',
    focused: 'neutral', affectionate: 'happy',
  };

  return [
    { id: 'scene', component: { scene: { width: 800, height: 400 } } },
    { id: 'background', component: { background: { variant: location === 'garden' ? 'park' : location === 'sky' ? 'void' : location === 'sanctuary' ? 'golden-room' : 'room', moodTint: mood } } },
    {
      id: 'pet-entity',
      component: {
        'pet-entity': {
          x: position.x, y: position.y,
          size: (sizeMap[mood] as any) || 'normal',
          expression: (exprMap[mood] as any) || 'neutral',
          id: 'pet',
        },
      },
    },
    { id: 'thought-bubble', component: { 'thought-bubble': { text: thought, visible: true } } },
    {
      id: 'stat-bars',
      component: { 'stat-bars': { hunger, happiness: joy, energy, affection: bond } },
    },
    {
      id: 'action-palette',
      component: { 'action-palette': { actions: ['feed', 'play', 'talk', 'rest', 'share-feeling'] } },
    },
  ];
}
