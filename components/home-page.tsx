"use client";

import { useMemo, useState } from "react";
import { useCopilotReadable } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { LifestyleForm, type LifestyleContext } from "@/components/lifestyle-form";
import { MapPinPicker } from "@/components/map-pin-picker";
import { MovingTodoPanel } from "@/components/moving-todo-panel";

const defaultLife: LifestyleContext = {
  workDestination: "",
  startTime: "09:00",
  endTime: "18:00",
  transport: "walk, metro",
  budget: "moderate",
  foodImportance: "high",
};

type Pin = { lat: number; lng: number };

export function HomePage() {
  const [pin, setPin] = useState<Pin | null>(null);
  const [manualLat, setManualLat] = useState("22.2975");
  const [manualLng, setManualLng] = useState("114.1723");
  const [addressHint, setAddressHint] = useState("");
  const [life, setLife] = useState<LifestyleContext>(defaultLife);

  const readablePayload = useMemo(
    () => ({
      pin,
      addressHint: addressHint.trim() || undefined,
      lifestyle: life,
      hint: "Call research_neighborhood with lat/lng, then render_a2ui. Weight UI toward user priorities.",
    }),
    [pin, addressHint, life],
  );

  useCopilotReadable({
    description:
      "Map pin (lat/lng), optional address hint, and lifestyle context for place analysis",
    value: JSON.stringify(readablePayload, null, 2),
  });

  function applyManualCoords() {
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPin({ lat, lng });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
      <aside className="flex w-full flex-col gap-3 md:w-[360px] md:shrink-0">
        <header className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-4">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
            Pin Life
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Three stable panels: map, your context, and the agent canvas. Everything
            else should arrive as{" "}
            <span className="text-zinc-300">A2UI</span> via AG-UI — not a prefab
            dashboard.
          </p>
        </header>
        <LifestyleForm value={life} onChange={setLife} />
        <MovingTodoPanel />
        <label className="block text-xs font-medium text-zinc-400">
          Address hint (optional)
          <input
            className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            value={addressHint}
            onChange={(e) => setAddressHint(e.target.value)}
            placeholder="Neighborhood name, district, city"
          />
        </label>
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Manual coordinates
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-zinc-400">
              Lat
              <input
                className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
              />
            </label>
            <label className="text-xs text-zinc-400">
              Lng
              <input
                className="mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={applyManualCoords}
            className="mt-3 w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
          >
            Set pin from values
          </button>
        </div>
        <p className="text-xs text-zinc-600">
          See <code className="text-zinc-500">docs/SETUP.md</code> and{" "}
          <code className="text-zinc-500">docs/API_KEYS.md</code>.
        </p>
      </aside>
      <section className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="min-h-[280px] flex-1 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-lg shadow-black/20 md:min-h-[320px]">
          <MapPinPicker pin={pin} onPin={setPin} />
        </div>
        <div className="flex min-h-[440px] flex-1 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-lg shadow-black/20">
          <CopilotChat
            className="h-full"
            instructions="Always ground place analysis in the readable context. Prefer render_a2ui for the main UX."
            labels={{
              title: "Agent canvas",
              initial:
                pin == null
                  ? "Drop a pin (or set coordinates), tune your context, then ask what living there would feel like — e.g. late-night commute from Central, cheap groceries, or rent vs convenience."
                  : `Pinned ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}. Ask for the angle you care about; the UI should reshuffle — not switch to a fixed tabbed dashboard.`,
            }}
          />
        </div>
      </section>
    </main>
  );
}
