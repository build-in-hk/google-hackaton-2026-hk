import express from 'express';
import { v4 as uuid } from 'uuid';
import { StateStore } from './state-store';
import { generateScene, getFallbackScene } from './agent';
import { composeScene, goldenPeacefulMorning, goldenLoveOverflow, goldenDanceParty, goldenSweetDreams, goldenMilestone } from './director';

const app = express();
app.use(express.json());
const stateStore = new StateStore();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/api/pets', (_req, res) => {
  const sessions = stateStore.getSessions();
  res.json(Array.from(sessions.values()).map((s) => ({ sessionId: s.sessionId, pet: s.pet })));
});

app.post('/api/pets', (_req, res) => {
  const sessionId = uuid();
  stateStore.getOrCreate(sessionId);
  res.json({ sessionId });
});

app.post('/api/pets/:sessionId/reset', (req, res) => {
  const { sessionId } = req.params;
  stateStore.sessions.set(sessionId, { pet: require('./game-engine').createInitialState(), sessionId });
  res.json(stateStore.sessions.get(sessionId)?.pet || {});
});

app.get('/api/pets/:sessionId', (req, res) => {
  const state = stateStore.getState(req.params.sessionId);
  if (!state) { res.status(404).json({ error: 'Session not found' }); return; }
  res.json({ state });
});

app.post('/api/actions/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  const { action } = req.body as { action: string };

  if (!action || !['feed', 'play', 'sleep', 'talk', 'hug'].includes(action)) {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const pet = stateStore.processAction(sessionId, action);

  // Phase 1: Thinking
  res.write(`data: ${JSON.stringify({
    surfaceUpdate: {
      surfaceId: 'main',
      components: [{ id: 'thought-bubble', component: { 'thought-bubble': { text: '...', visible: true, thinking: true } } }],
    },
  })}\n\n`);

  await sleep(400);

  // Phase 2: Transition
  res.write(`data: ${JSON.stringify({
    surfaceUpdate: {
      surfaceId: 'main',
      components: [{ id: 'pet-avatar', component: { 'pet-avatar': { x: pet.position.x, y: pet.position.y, size: 'normal', expression: 'happy', id: 'pet' } } }],
    },
  })}\n\n`);

  await sleep(400);

  // Phase 3: Final scene (Gemini with fallback)
  const thought = pet.hunger < 25 ? "I'm so hungry! *stomach rumbles* 🍽️" : require('./thoughts').generateThought(pet);
  
  let components: { id: string; component: Record<string, unknown> }[];
  try {
    components = await generateScene(pet, thought, action);
  } catch {
    const directorResult = composeScene(pet);
    components = getFallbackScene(pet, thought);
  }

  res.write(`data: ${JSON.stringify({
    surfaceUpdate: { surfaceId: 'main', components },
    dataModelUpdate: { stats: { hunger: pet.hunger, happiness: pet.happiness, energy: pet.energy, affection: pet.affection } },
  })}\n\n`);

  await sleep(100);
  res.write(`data: ${JSON.stringify({ beginRendering: { surfaceId: 'main', root: 'root' } })}\n\n`);
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', sessions: stateStore.getSessions().size });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
if (require.main === module) {
  app.listen(PORT, () => { console.log(`🐾 A2UI Tamagotchi server on http://localhost:${PORT}`); });
}

export default app;
