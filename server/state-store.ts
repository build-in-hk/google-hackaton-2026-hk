import type { PetState } from './types';
import { createInitialState, applyAction, applyDecay, deriveMood } from './game-engine';

interface SessionData {
  pet: PetState;
  sessionId: string;
}

export class StateStore {
  public sessions = new Map<string, SessionData>();

  getOrCreate(sessionId: string): PetState {
    let session = this.sessions.get(sessionId);
    if (!session) {
      const pet = createInitialState();
      session = { pet, sessionId };
      this.sessions.set(sessionId, session);
    }
    // Apply decay before returning
    session.pet = applyDecay(session.pet);
    return session.pet;
  }

  processAction(sessionId: string, actionName: string): PetState {
    const pet = this.getOrCreate(sessionId);
    const updatedPet = applyAction(pet, actionName);
    updatedPet.lastInteractionAt = Date.now();
    
    // Update session
    const session = this.sessions.get(sessionId)!;
    session.pet = updatedPet;
    
    return updatedPet;
  }

  getState(sessionId: string): PetState {
    return this.getOrCreate(sessionId);
  }

  applyDecayToSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.pet = applyDecay(session.pet);
    }
  }

  getSessions(): Map<string, SessionData> {
    return this.sessions;
  }
}
