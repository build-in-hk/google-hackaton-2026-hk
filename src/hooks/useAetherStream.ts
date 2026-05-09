import { useState, useEffect } from 'react';
import type { A2UIPayload } from '../a2ui/types';

export interface UseAetherStreamOptions {
  sessionId: string;
}

export interface StreamState {
  payload: A2UIPayload | null;
  isConnected: boolean;
}

export type StreamPhase = 'idle' | 'streaming' | 'done';

export function useA2UIStream(options: UseAetherStreamOptions) {
  const sessionId = typeof options === 'string' ? options : options.sessionId;
  const [payload, setPayload] = useState<A2UIPayload>({
    surfaceUpdate: { surfaceId: 'main', components: [] },
  });
  const [isConnected] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendAction = async (action: string) => {
    if (isStreaming) return;
    setIsStreaming(true);

    try {
      const response = await fetch(`http://localhost:3000/api/actions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Action failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              setPayload(parsed);
              setIsStreaming(false);
            } catch { /* ignore */ }
          }
        }
      }
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    const handleEvent = (event: MessageEvent) => {
      if (event.data?.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(event.data.slice(6));
          setPayload(parsed);
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('message', handleEvent);
    return () => window.removeEventListener('message', handleEvent);
  }, []);

  return { payload: payload || null, sendAction, isConnected, isStreaming };
}
