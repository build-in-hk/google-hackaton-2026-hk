import { useState, useCallback, useRef, useEffect } from 'react';
import type { A2UIPayload, StreamPhase } from '../a2ui/types';

const API_BASE = '/api';

function parseSSEChunk(chunk: string): unknown[] {
  const events: unknown[] = [];
  const lines = chunk.split('\n\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const dataStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
    try { events.push(JSON.parse(dataStr)); } catch {}
  }
  return events;
}

function classifyPhase(event: unknown): StreamPhase {
  if (!event || typeof event !== 'object') return 'idle';
  const obj = event as Record<string, unknown>;
  if (obj.beginRendering) return 'rendering';
  if (obj.type === 'done') return 'done';
  if (obj.surfaceUpdate) {
    const su = obj.surfaceUpdate as { components?: Array<{ id: string; component: Record<string, Record<string, unknown>> }> };
    const hasThinking = su.components?.some((c) => {
      const tb = c.component?.['thought-bubble'];
      return tb?.thinking === true || tb?.text === '...';
    });
    return hasThinking ? 'thinking' : 'transition';
  }
  return 'idle';
}

export function useAetherStream() {
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aetherpet-session') : null;
    return saved || '';
  });
  const [payload, setPayload] = useState<A2UIPayload | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [phase, setPhase] = useState<StreamPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const createSession = useCallback(async (): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/pets`, { method: 'POST' });
      if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
      const data = (await res.json()) as { sessionId: string };
      setSessionId(data.sessionId);
      if (typeof window !== 'undefined') localStorage.setItem('aetherpet-session', data.sessionId);
      return data.sessionId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Session creation failed';
      setError(msg); throw err;
    }
  }, []);

  useEffect(() => { if (!sessionId) { createSession().catch(() => {}); } }, [sessionId, createSession]);

  const sendAction = useCallback(async (action: string) => {
    if (!sessionId) await createSession();
    if (isStreaming) return;
    setIsStreaming(true); setPhase('thinking'); setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/actions/${sessionId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }), signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Action failed: ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Response body not readable');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const idx = buffer.lastIndexOf('\n\n');
        if (idx === -1) continue;
        const chunk = buffer.slice(0, idx + 2);
        buffer = buffer.slice(idx + 2);
        for (const event of parseSSEChunk(chunk)) {
          const evt = event as Record<string, unknown>;
          if (evt?.type === 'done') { setPhase('done'); setIsStreaming(false); continue; }
          const p = classifyPhase(event);
          if (p !== 'idle') setPhase(p);
          setPayload(event as A2UIPayload);
        }
      }
      if (phase !== 'done') setPhase('done');
      setIsStreaming(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg); setIsStreaming(false); setPhase('idle');
    } finally { abortRef.current = null; }
  }, [sessionId, isStreaming, createSession, phase]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return { sessionId, payload, isStreaming, phase, sendAction, createSession, error };
}
