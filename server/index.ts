// ============================================================
// AetherPet — Express Server
// ============================================================
// Standalone Express server with SSE streaming for real-time
// pet action updates. Consumes the Pet Engine (engine.ts) and
// Session Store (session.ts). Streams A2UI protocol payloads
// over SSE — compatible with the a2ui-tamagotchi frontend.
// ============================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import {
  createSession,
  getSessionState,
  processSessionAction,
  getSessionMeta,
  deleteSession,
  getActiveSessionCount,
  purgeStaleSessions,
} from './session';
import type { AetherAction, AetherPetState, ActionType } from './engine';
import { generateThought, generateUnlockThought } from './thoughts';

// ── Config ──────────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 4000;
const PURGE_INTERVAL_MS = 5 * 60 * 1000; // 5 min
const STALE_THRESHOLD_MINUTES = 30;

// ── App Setup ───────────────────────────────────────────────

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Session-Id'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

// ── Session Housekeeping ────────────────────────────────────

// Periodic stale session purge
setInterval(() => {
  const purged = purgeStaleSessions(STALE_THRESHOLD_MINUTES);
  if (purged > 0) console.log(`[session] purged ${purged} stale sessions`);
}, PURGE_INTERVAL_MS);

// ── SSE Helpers ─────────────────────────────────────────────

/** Write a JSONL-over-SSE data line. Safe if response already ended. */
function sseData(res: Response, payload: Record<string, unknown>) {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/** Initialize SSE headers and flush immediately. */
function initSSE(res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

/** Delay utility. */
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ── A2UI Component Builders ────────────────────────────────

/** Map engine Mood → A2UI expression string. */
function moodToExpression(mood: string): string {
  const map: Record<string, string> = {
    euphoric: 'excited',
    joyful: 'happy',
    content: 'happy',
    neutral: 'neutral',
    lonely: 'sad',
    hungry: 'hungry',
    tired: 'sleepy',
    anxious: 'grumpy',
    focused: 'neutral',
    affectionate: 'happy',
  };
  return map[mood] || 'neutral';
}

/** Map engine Mood → background variant. */
function moodToBackground(mood: string, location: string): string {
  if (location === 'garden') return 'park';
  if (location === 'sky') return 'void';
  if (location === 'sanctuary') return 'golden-room';
  if (mood === 'tired' || mood === 'anxious') return 'bedroom';
  return 'room';
}

/** Phase 1: Thinking bubble component. */
function buildThinkingBubble(thought: string): Record<string, unknown> {
  return {
    surfaceUpdate: {
      surfaceId: 'main',
      components: [
        {
          id: 'thought-bubble',
          component: {
            'thought-bubble': { text: thought, visible: true, thinking: true },
          },
        },
      ],
    },
  };
}

/** Phase 2: Pet transition — move pet, show mood expression. */
function buildTransition(state: AetherPetState, action: string): Record<string, unknown> {
  const expression = moodToExpression(state.mood);
  return {
    surfaceUpdate: {
      surfaceId: 'main',
      components: [
        {
          id: 'pet-entity',
          component: {
            'pet-entity': {
              x: state.position.x,
              y: state.position.y,
              size: 'normal',
              expression,
              id: 'pet',
            },
          },
        },
        {
          id: 'mood-orb',
          component: {
            'mood-orb': { mood: expression, size: 24 },
          },
        },
      ],
    },
  };
}

/** Phase 3: Full scene — background, pet, stats, actions. */
function buildFullScene(
  state: AetherPetState,
  thought: string,
  newUnlocks: string[],
): Record<string, unknown> {
  const expression = moodToExpression(state.mood);
  const bgVariant = moodToBackground(state.mood, state.location);

  const components: Array<{ id: string; component: Record<string, unknown> }> = [
    {
      id: 'background',
      component: {
        background: { variant: bgVariant, moodTint: expression },
      },
    },
    {
      id: 'pet-entity',
      component: {
        'pet-entity': {
          x: state.position.x,
          y: state.position.y,
          size: state.stage === 'egg' ? 'small' : state.stage === 'elder' ? 'big' : 'normal',
          expression,
          id: 'pet',
        },
      },
    },
    {
      id: 'thought-bubble',
      component: {
        'thought-bubble': { text: thought, visible: true, thinking: false },
      },
    },
    {
      id: 'stat-bars',
      component: {
        'stat-bars': {
          hunger: state.hunger,
          happiness: state.joy,
          energy: state.energy,
          affection: state.bond,
        },
      },
    },
    {
      id: 'action-palette',
      component: {
        'action-palette': { actions: ['feed', 'play', 'talk', 'rest', 'share-feeling'] },
      },
    },
  ];

  // Add unlock notification if new features unlocked
  if (newUnlocks.length > 0) {
    components.push({
      id: 'unlock-toast',
      component: {
        'unlock-toast': { unlocks: newUnlocks },
      },
    });
  }

  return {
    surfaceUpdate: { surfaceId: 'main', components },
    dataModelUpdate: {
      stats: {
        hunger: state.hunger,
        happiness: state.joy,
        energy: state.energy,
        affection: state.bond,
      },
      data: {
        stage: state.stage,
        location: state.location,
        interactionCount: state.interactionCount,
      },
    },
  };
}

// ── Routes ──────────────────────────────────────────────────

/**
 * Health check
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    activeSessions: getActiveSessionCount(),
    timestamp: Date.now(),
  });
});

/**
 * POST /api/pets
 * Create a new pet session. Returns { sessionId }.
 * This is the endpoint the frontend calls on first load.
 */
app.post('/api/pets', (req, res) => {
  const { ownerId, petName } = req.body as { ownerId?: string; petName?: string };
  const id = ownerId || uuid();
  const name = petName || 'AetherPet';

  const sessionId = createSession(id, name);
  res.status(201).json({ sessionId });
});

/**
 * GET /api/pets
 * List all active sessions (debug/admin).
 */
app.get('/api/pets', (_req, res) => {
  res.json({
    count: getActiveSessionCount(),
  });
});

/**
 * POST /api/pets/:sessionId/reset
 * Reset a session to initial state.
 */
app.post('/api/pets/:sessionId/reset', (req, res) => {
  const { sessionId } = req.params;
  deleteSession(sessionId);

  // Create fresh session with same ID
  createSession(sessionId, 'AetherPet');
  const state = getSessionState(sessionId);

  if (!state) {
    return res.status(500).json({ error: 'Reset failed' });
  }

  res.json({ sessionId, state });
});

/**
 * GET /api/pets/:sessionId
 * Get current state for a session.
 */
app.get('/api/pets/:sessionId', (req, res) => {
  const state = getSessionState(req.params.sessionId);
  if (!state) {
    return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
  }
  const meta = getSessionMeta(req.params.sessionId);
  res.json({ sessionId: req.params.sessionId, state, meta });
});

/**
 * POST /api/actions/:sessionId
 * Process a pet action and stream 3-phase SSE updates.
 *
 * Body: { "action": "feed" | "play" | "talk" | "rest" | "share-feeling" }
 *
 * SSE Protocol (A2UI wire format):
 *   1. surfaceUpdate — thinking bubble
 *   2. surfaceUpdate — pet transition (position + expression)
 *   3. surfaceUpdate + dataModelUpdate — full scene
 *   4. beginRendering — commit signal
 *   5. { type: "done" } — stream end
 */
app.post('/api/actions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { action }: { action: string } = req.body;

  // Validate action type
  const validActions: ActionType[] = ['feed', 'play', 'talk', 'rest', 'share-feeling'];
  const actionType = action as ActionType;

  if (!actionType || !validActions.includes(actionType)) {
    return res.status(400).json({
      error: 'INVALID_ACTION',
      message: `Action must be one of: ${validActions.join(', ')}`,
      received: action,
    });
  }

  // Check session exists, create if not
  let meta = getSessionMeta(sessionId);
  if (!meta) {
    // Auto-create session for convenience
    createSession(sessionId, 'AetherPet');
  }

  // Capture old state before action for unlock diff
  const oldState = getSessionState(sessionId);

  // Process action through engine + session store
  const aetherAction: AetherAction = { type: actionType };
  const newState = processSessionAction(sessionId, aetherAction);

  if (!newState) {
    return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
  }

  // Compute newly unlocked features
  const oldUnlocked = oldState ? oldState.unlocked : [];
  const newUnlocks = newState.unlocked.filter((id) => !oldUnlocked.includes(id));

  // Generate thought text — prioritize unlock thoughts if new features unlocked
  let thought: string;
  if (newUnlocks.length > 0) {
    thought = generateUnlockThought(newUnlocks[0]);
  } else {
    thought = generateThought(newState, actionType);
  }

  // ── Initialize SSE stream ──
  initSSE(res);

  // ── Phase 1: Thinking (immediate, ~150ms) ──
  sseData(res, buildThinkingBubble(thought || '...'));

  await sleep(150);
  if (res.writableEnded) return;

  // ── Phase 2: Transition (~150–450ms) ──
  // Pet moves, expression changes, mood orb appears
  sseData(res, buildTransition(newState, actionType));

  await sleep(300);
  if (res.writableEnded) return;

  // ── Phase 3: Full Scene (~450–650ms) ──
  // Complete scene with background, stats, actions
  sseData(res, buildFullScene(newState, thought, newUnlocks));

  await sleep(100);
  if (res.writableEnded) return;

  // ── Render commit signal ──
  sseData(res, {
    beginRendering: { surfaceId: 'main', root: 'root' },
  });

  // ── Done ──
  sseData(res, { type: 'done' });

  res.end();
});

// ── Error Handling ──────────────────────────────────────────

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('[server:error]', err.message);

  // If SSE stream already started, push error event
  if (res.headersSent && typeof res.getHeader('Content-Type') === 'string' && (res.getHeader('Content-Type') as string).includes('event-stream')) {
    sseData(res, {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [{
          id: 'error-toast',
          component: { 'error-toast': { message: 'Something went wrong' } },
        }],
      },
    });
    res.end();
    return;
  }

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', path: req.originalUrl });
});

// ── Start ───────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🐾 AetherPet server running on http://localhost:${PORT}`);
  console.log(`   POST /api/pets            — create session`);
  console.log(`   GET  /api/pets            — list sessions`);
  console.log(`   GET  /api/pets/:id        — get state`);
  console.log(`   POST /api/actions/:id     — SSE action stream`);
  console.log(`   POST /api/pets/:id/reset  — reset session`);
  console.log(`   GET  /api/health          — health check`);
});

export default app;
