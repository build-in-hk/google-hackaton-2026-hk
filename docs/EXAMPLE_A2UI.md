# Example A2UI directions (not copy-paste wire format)

The live wire format is produced by the **`render_a2ui`** tool and processed by `@ag-ui/a2ui-middleware` + `@copilotkit/a2ui-renderer`. Shapes evolve with the A2UI spec — use [A2UI Composer](https://a2ui-composer.ag-ui.com/) for authoritative JSON.

Below are **product-level examples** of what the agent should generate for this app (conceptual).

## 1. Commute / late-night surface

- **Intent:** User works in a distant core and often leaves after 23:00.
- **UI:** Column with timeline (outbound morning, return evening), “last train” callout, walking segment risk note, button actions: `simulate_late_finish`, `compare_to_second_pin`.
- **Data model:** `{ morningLegs: [...], eveningLegs: [...], caveats: [...] }`.

## 2. Food & grocery surface

- **Intent:** User prioritized cheap food and groceries.
- **UI:** List of archetypes (wet market, chain supermarket, budget chains) with distance bands; uncertainty banner if mock data.
- **Data model:** `{ options: [{ name, priceSignal, notes }] }`.

## 3. Rent reality surface

- **Intent:** Budget-sensitive renter.
- **UI:** Card with confidence badge (low/med/high), bullet tradeoffs, link placeholders for “check listings”.
- **Data model:** `{ bandApprox, confidence, drivers: [...] }`.

## 4. Comparison surface (2–3 pins)

- **Intent:** User added another scenario or pin.
- **UI:** Table or side-by-side columns with shared rows: commute, rent signal, food access, cons.
- **Data model:** `{ places: [{ label, scores: {...}, notes }] }`.

## 5. Uncertainty / follow-up form

- **Intent:** Missing transit detail or ambiguous address.
- **UI:** Short adaptive form (select commute mode, confirm work district) with submit action back to agent.

---

In all cases the **layout choice** (cards vs table vs form) should follow from the conversation and research payload — not from a static React route.
