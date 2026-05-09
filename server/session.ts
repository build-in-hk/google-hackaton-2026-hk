// ============================================================
// AetherPet — In-Memory Session Management
// ============================================================
// Manages per-user pet sessions with auto-decay on read.
// Thread-safe via Map (single-threaded Node.js event loop).
// ============================================================

import {
  AetherPetState,
  AetherAction,
  processAction,
  applyDecay,
  createInitialState,
} from './engine';

// ── Session Record ──────────────────────────────────────────

interface SessionRecord {
  sessionId: string;
  ownerId: string;
  petName: string;
  state: AetherPetState;
  createdAt: number;
  lastAccessedAt: number;
  isActive: boolean;
}

// ── In-Memory Store ────────────────────────────────────────

const sessions = new Map<string, SessionRecord>();

/** Optional callback fired on every state change (e.g. for WS push). */
type StateChangeHandler = (sessionId: string, newState: AetherPetState) => void;
let stateChangeHandler: StateChangeHandler | null = null;

/** Register a callback for state change events. */
export function onStateChange(handler: StateChangeHandler): void {
  stateChangeHandler = handler;
}

// ── Public API ─────────────────────────────────────────────

/**
 * Create a new pet session.
 * Returns the session ID.
 */
export function createSession(
  ownerId: string,
  petName: string,
  now?: number
): string {
  const sessionId = generateSessionId(ownerId);

  const record: SessionRecord = {
    sessionId,
    ownerId,
    petName,
    state: createInitialState(now),
    createdAt: now ?? Date.now(),
    lastAccessedAt: now ?? Date.now(),
    isActive: true,
  };

  sessions.set(sessionId, record);
  return sessionId;
}

/**
 * Get current pet state for a session.
 * Applies time-based decay before returning (lazy decay).
 */
export function getSessionState(sessionId: string, now?: number): AetherPetState | null {
  const record = sessions.get(sessionId);
  if (!record || !record.isActive) return null;

  const t = now ?? Date.now();
  record.state = applyDecay(record.state, t);
  record.lastAccessedAt = t;

  return { ...record.state }; // immutable copy
}

/**
 * Process an action for a pet session.
 * Applies decay first, then the action, then saves.
 * Returns the new state.
 */
export function processSessionAction(
  sessionId: string,
  action: AetherAction,
  now?: number
): AetherPetState | null {
  const record = sessions.get(sessionId);
  if (!record || !record.isActive) return null;

  const t = now ?? Date.now();

  // Apply decay first (time passed since last interaction)
  record.state = applyDecay(record.state, t);

  // Process the action
  record.state = processAction(sessionId, record.state, action, t);
  record.lastAccessedAt = t;

  // Notify listeners
  stateChangeHandler?.(sessionId, { ...record.state });

  return { ...record.state };
}

/**
 * Get session metadata (without full state).
 */
export function getSessionMeta(sessionId: string): {
  sessionId: string;
  ownerId: string;
  petName: string;
  createdAt: number;
  lastAccessedAt: number;
  isActive: boolean;
} | null {
  const record = sessions.get(sessionId);
  if (!record) return null;

  return {
    sessionId: record.sessionId,
    ownerId: record.ownerId,
    petName: record.petName,
    createdAt: record.createdAt,
    lastAccessedAt: record.lastAccessedAt,
    isActive: record.isActive,
  };
}

/**
 * List all active sessions for an owner.
 */
export function listOwnerSessions(ownerId: string): Array<{
  sessionId: string;
  petName: string;
  state: AetherPetState;
}> {
  const result: Array<{ sessionId: string; petName: string; state: AetherPetState }> = [];

  for (const record of sessions.values()) {
    if (record.ownerId === ownerId && record.isActive) {
      // Apply lazy decay on read
      record.state = applyDecay(record.state);
      result.push({
        sessionId: record.sessionId,
        petName: record.petName,
        state: { ...record.state },
      });
    }
  }

  return result;
}

/**
 * Delete (deactivate) a session.
 */
export function deleteSession(sessionId: string): boolean {
  const record = sessions.get(sessionId);
  if (!record) return false;

  record.isActive = false;
  sessions.delete(sessionId);
  return true;
}

/**
 * Get session count (for monitoring/debugging).
 */
export function getActiveSessionCount(): number {
  return sessions.size;
}

/**
 * Clean up sessions that haven't been accessed within a threshold.
 * Returns the number of sessions removed.
 */
export function purgeStaleSessions(maxIdleMinutes: number = 1440): number {
  const cutoff = Date.now() - maxIdleMinutes * 60_000;
  let count = 0;

  for (const [id, record] of sessions) {
    if (record.lastAccessedAt < cutoff) {
      sessions.delete(id);
      count++;
    }
  }

  return count;
}

// ── Internal Helpers ───────────────────────────────────────

/**
 * Generate a deterministic session ID from owner ID.
 * Uses a simple hash for consistency (can be upgraded to UUID).
 */
function generateSessionId(ownerId: string): string {
  // Simple hash → hex string, prefixed for readability
  let hash = 0;
  for (let i = 0; i < ownerId.length; i++) {
    const char = ownerId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // convert to 32-bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `pet-${hex}-${Date.now().toString(36)}`;
}
