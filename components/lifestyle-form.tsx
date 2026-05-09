"use client";

export type LifestyleContext = {
  workDestination: string;
  startTime: string;
  endTime: string;
  transport: string;
  budget: string;
  foodImportance: string;
};

const field =
  "mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600";

export function LifestyleForm({
  value,
  onChange,
}: {
  value: LifestyleContext;
  onChange: (v: LifestyleContext) => void;
}) {
  const patch = (partial: Partial<LifestyleContext>) =>
    onChange({ ...value, ...partial });

  return (
    <div className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/80 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Lifestyle context
      </h2>
      <label className="block text-xs font-medium text-zinc-400">
        Work / study destination
        <input
          className={field}
          value={value.workDestination}
          onChange={(e) => patch({ workDestination: e.target.value })}
          placeholder="e.g. Central, District 1, Downtown"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-medium text-zinc-400">
          Usual start
          <input
            type="time"
            className={field}
            value={value.startTime}
            onChange={(e) => patch({ startTime: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium text-zinc-400">
          Usual end
          <input
            type="time"
            className={field}
            value={value.endTime}
            onChange={(e) => patch({ endTime: e.target.value })}
          />
        </label>
      </div>
      <label className="block text-xs font-medium text-zinc-400">
        Transport
        <input
          className={field}
          value={value.transport}
          onChange={(e) => patch({ transport: e.target.value })}
          placeholder="bus, metro, walk, bike, car…"
        />
      </label>
      <label className="block text-xs font-medium text-zinc-400">
        Budget sensitivity
        <select
          className={field}
          value={value.budget}
          onChange={(e) => patch({ budget: e.target.value })}
        >
          <option value="tight">Tight</option>
          <option value="moderate">Moderate</option>
          <option value="flexible">Flexible</option>
        </select>
      </label>
      <label className="block text-xs font-medium text-zinc-400">
        Food &amp; groceries importance
        <select
          className={field}
          value={value.foodImportance}
          onChange={(e) => patch({ foodImportance: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
    </div>
  );
}
