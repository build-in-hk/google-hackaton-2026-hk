"use client";

import { useEffect, useState } from "react";

type Item = { id: string; text: string; done: boolean };

const STORAGE_KEY = "pin-life-moving-todos-v1";

export function MovingTodoPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Item[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  function add() {
    const text = draft.trim();
    if (!text) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setDraft("");
  }

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Personal moving checklist
      </h2>
      <p className="mt-1 text-xs text-zinc-600">
        Local-only tasks (browser). Not part of the agent-generated analysis surface.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. Tour building at night"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-md bg-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-600"
        >
          Add
        </button>
      </div>
      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto text-sm">
        {items.length === 0 ? (
          <li className="text-zinc-600">No items yet.</li>
        ) : (
          items.map((it) => (
            <li
              key={it.id}
              className="flex items-start gap-2 rounded-md border border-zinc-800 bg-zinc-900/40 px-2 py-1.5"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={it.done}
                onChange={() =>
                  setItems((prev) =>
                    prev.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)),
                  )
                }
              />
              <span
                className={
                  it.done ? "text-zinc-500 line-through" : "text-zinc-300"
                }
              >
                {it.text}
              </span>
              <button
                type="button"
                className="ml-auto text-xs text-zinc-500 hover:text-red-400"
                onClick={() =>
                  setItems((prev) => prev.filter((x) => x.id !== it.id))
                }
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
