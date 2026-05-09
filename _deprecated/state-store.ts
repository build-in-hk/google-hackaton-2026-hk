// ============================================================
// state-store.ts — Session management using parent engine
// ============================================================

import type { AetherPetState, AetherAction, InteractionEntry } from './game-engine';
import { processAction, applyDecay, createInitialState } from './game-engine';

interface SessionRecord {
  sessionId: string;
  ownerId: string;
  petName: string;
  state: AetherPetState;
  createdAt: number;
  lastAccessedAt: number;
}

export class StateStore {
  public sessions = new Map<string, SessionRecord>();

  getOrCreate(sessionId: string): AetherPetState {
    let session = this.sessions.get(sessionId);
    if (!session) {
      const pet = createInitialState();
      session = { sessionId, ownerId: sessionId, petName: 'Pet', state: pet, createdAt: pet.createdAt, lastAccessedAt: pet.lastActionAt };
      this.sessions.set(sessionId, session);
    }
    // Apply decay on read
    session.state = applyDecay(session.state);
    session.lastAccessedAt = Date.now();
    return session.state;
  }

  processAction(sessionId: string, action: AetherAction): AetherPetState {
    const record = this.sessions.get(sessionId);
    if (!record) {
      const pet = createInitialState();
      this.sessions.set(sessionId, { sessionId, ownerId: sessionId, petName: 'Pet', state: pet, createdAt: pet.createdAt, lastAccessedAt: pet.lastActionAt });
      return this.processAction(sessionId, action);
    }

    record.state = applyDecay(record.state);
    record.state = processAction(record.state, action);
    record.lastAccessedAt = Date.now();
    return { ...record.state };
  }

  getState(sessionId: string): AetherPetState | undefined {
    const session = this.sessions.get(sessionId);
    return session ? session.state : undefined;
  }

  resetSession(sessionId: string) {
    const pet = createInitialState();
    this.sessions.set(sessionId, { sessionId, ownerId: sessionId, petName: 'Pet', state: pet, createdAt: pet.createdAt, lastAccessedAt: pet.lastActionAt });
    return pet;
  }

  getSessions() {
    return this.sessions;
  }
}
