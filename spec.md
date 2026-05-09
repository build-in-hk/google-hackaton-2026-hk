Use this as your Cursor prompt. It is written to force the build toward **runtime-generated UI by the agent**, not a normal map app with AI summaries. A2UI is the declarative UI format, AG-UI is the runtime interaction/transport layer, and CopilotKit is the host framework that renders the agent-produced surfaces, so the prompt below locks the implementation to that stack and to the hackathon’s “no pre-built pages” requirement. [copilotkit](https://www.copilotkit.ai/ag-ui-and-a2ui)

## Cursor prompt

```text
You are helping me build a hackathon project for the Generative UI Global Hackathon.

Project goal:
Build a map-based app where a user drops a pin on a map and an AI research agent tells them what life would actually be like living there. The app is for renters or people evaluating neighborhoods. It should research the internet and other available sources, then generate interactive UI at runtime based on what data is found and what the user cares about.

This is NOT a normal dashboard app.
This is NOT a fixed map UI with predefined tabs like Food / Transit / Rent / Pros & Cons.
This is NOT “a chatbot with cards.”

The core hackathon requirement we must satisfy:
“It’s about proving that AI interfaces can be as rich, specific, and interactive as anything designed by hand — except generated at runtime by the agent itself.”

So the app must follow this product principle:
THE AGENT IS THE FRONTEND.

==================================================
PRODUCT IDEA
==================================================

Working concept:
User drops a pin on Google Maps.
The agent researches what daily life would feel like living there.
The agent then generates the exact UI needed for that location and that user’s situation.

Examples of what the agent may generate at runtime:
- commute analysis surface
- late-night return risk surface
- food and grocery lifestyle surface
- rent reality surface
- pros/cons evidence board
- uncertainty / missing-data follow-up forms
- comparison surface for 2 or more pinned places

The interface must differ depending on:
- the place
- the user’s work location
- work hours
- budget
- whether they rely on bus / MTR / walking / car
- what data is available from research

If the user says:
“I work in Central and often go home at 11:30 PM”
the UI should dynamically become a commute-risk / last-mile / late-night transit interface.

If the user says:
“I care most about cheap food and groceries”
the UI should become a food-access / affordability interface.

If the area has weak transit data,
the agent should generate a follow-up clarification form or uncertainty surface rather than pretending certainty.

==================================================
NON-NEGOTIABLE HACKATHON RULES
==================================================

We must comply with these rules:

1. No pre-built pages.
2. No static dashboard shell as the primary product.
3. No predefined tabs for all places.
4. No fixed workflow like step1/step2/step3 unless the agent explicitly decides to generate that flow at runtime.
5. The main user-facing surface must be created dynamically by the agent.
6. The app should demonstrate something that would be weak or impossible as plain chat.
7. The map can be a stable input control, but the analysis UI must be generated at runtime.

==================================================
MANDATORY TECH STACK
==================================================

Use these technologies and do not substitute unless absolutely required:

Frontend:
- Next.js latest stable with App Router
- TypeScript
- React
- Tailwind CSS
- Google Maps JavaScript API OR Google Maps embed/component integration for pin placement

Agentic UI stack:
- CopilotKit as the app integration/framework
- AG-UI as the runtime interaction protocol between frontend and agent
- A2UI as the declarative runtime UI specification
- Use CopilotKit A2UI renderer for rendering A2UI surfaces in the frontend

Agent/runtime:
- CopilotRuntime configured with A2UI tool injection
- Agent produces A2UI surfaces dynamically
- User interactions from generated UI must be sent back to the agent as structured events/actions

Research/data layer:
- Use web research / scraping / APIs as needed
- Prefer lightweight external APIs if helpful, but the key product behavior is runtime UI generation from the agent
- It is okay to mock some data if needed for the hackathon, but the architecture must support real research

Do NOT build:
- a hand-coded custom UI for every result type
- a static dashboard with AI-filled components
- a fixed comparison page
- a fixed “details drawer” with hardcoded modules

==================================================
ARCHITECTURE REQUIREMENTS
==================================================

Design and implement the app so it works like this:

1. User drops a pin on the map.
2. App captures coordinates and optional address/place context.
3. Agent asks clarifying questions only when necessary.
4. Agent performs research:
   - nearby food options
   - grocery options
   - public transport options
   - morning commute implications
   - evening return implications
   - last bus / last train / transit cutoff if possible
   - typical rent / area price signals
   - notable pros / cons
5. Agent decides what interface should be rendered.
6. Agent emits A2UI payload(s) describing the UI surface.
7. AG-UI streams updates to the frontend.
8. CopilotKit renders the runtime-generated interface.
9. User edits filters / answers follow-up questions / requests comparison.
10. Agent updates or replaces the UI with new A2UI surfaces.

This must feel like a runtime-generated decision surface, not navigation between normal pages.

==================================================
PRODUCT FEATURES
==================================================

Build an MVP with these features:

Core:
- Map with pin drop
- Input for user lifestyle context:
  - work destination
  - usual start time
  - usual finish time
  - transport preferences
  - budget sensitivity
  - food preference importance
- Runtime-generated place analysis UI from the agent
- Pros and cons backed by evidence
- Commute-focused analysis
- Rent-focused analysis
- Food/grocery-focused analysis

Strong stretch feature:
- Compare 2 or 3 pinned locations and generate a comparison UI whose layout is chosen by the agent at runtime

Optional stretch:
- “What changes if I work late?”
- “What changes if I rely on bus only?”
- “What if I optimize for cheap rent vs convenience?”

==================================================
RUNTIME UI DESIGN REQUIREMENTS
==================================================

The agent should be able to generate different A2UI surfaces such as:
- adaptive forms
- evidence cards
- comparison tables
- timelines
- transit risk panels
- pros/cons boards
- recommendation summaries
- uncertainty notices
- action buttons for follow-up exploration
- location comparison surfaces

Important:
Do not hardcode one universal result layout.
Instead, create a runtime rendering system that can render different A2UI component trees based on agent output.

The generated UI should be able to:
- appear
- update
- be replaced entirely
- add follow-up controls
- capture user actions and feed them back to the agent

==================================================
UX REQUIREMENTS
==================================================

The product must clearly show:
- the map pin as the starting point
- the agent researching and progressively building the interface
- that different places produce different UIs
- that changing user context changes the generated interface

The UX should feel like:
“drop a pin, and the agent builds the right place-evaluation interface for me.”

Not:
“drop a pin, and a fixed dashboard fills with data.”

==================================================
IMPLEMENTATION DELIVERABLES
==================================================

Please generate a production-minded hackathon MVP with:

1. Full folder structure
2. Next.js app router setup
3. CopilotKit provider setup
4. AG-UI runtime wiring
5. A2UI renderer wiring
6. Agent runtime setup with A2UI enabled
7. Map component with pin dropping
8. Agent prompt / system prompt for place analysis
9. Tools/interfaces for place research
10. Example A2UI payload shapes for:
   - commute surface
   - food surface
   - rent surface
   - comparison surface
11. Clean UI with minimal but polished styling
12. A sample demo flow in comments or docs

==================================================
CODING APPROACH
==================================================

Important coding approach:
- Start with the minimum architecture that proves the concept
- Keep the code modular
- Prefer simple working implementations over broad abstractions
- Use mock/fallback research data if live integrations slow us down
- But keep the app structure ready for real APIs
- Optimize for a 6-hour hackathon MVP that can demo clearly

==================================================
SUCCESS CRITERIA
==================================================

We win if the demo clearly proves:
1. The map pin is just the trigger.
2. The agent researches and decides what UI to create.
3. The UI is generated at runtime via A2UI.
4. AG-UI carries the runtime interaction between app and agent.
5. CopilotKit renders the generated surfaces.
6. Different places or user constraints create meaningfully different interfaces.
7. This would be much weaker as a plain chatbot.

Please now:
- propose the app architecture
- create the folder structure
- scaffold the Next.js + CopilotKit + A2UI + AG-UI implementation
- implement the first working MVP
- and explain any assumptions briefly as you go
```

## Small tweak

I would also give Cursor this one-liner before the big prompt: “If you are about to create a fixed dashboard, stop and redesign it so the agent decides the surface at runtime.” That reinforces the core rule from A2UI and the hackathon: the client should render component trees and updates emitted by the agent, not predefined pages populated later. [dev](https://dev.to/vishalmysore/a2ui-deep-dive-the-frontend-for-agents-3fb1)

## Best approach

For the build itself, keep only three stable UI elements:

- the map,
- a lightweight context input area,
- a canvas/container for agent-generated surfaces.

Everything else should be emitted as A2UI from the agent and streamed through AG-UI into CopilotKit’s renderer. That is the cleanest way to stay faithful to the stack and to the line you quoted about interfaces being “generated at runtime by the agent itself.” [a2ui](https://a2ui.org/guides/a2ui-with-any-agent-framework/)

If you want, I can next write a **second Cursor prompt** that is shorter and purely engineering-focused, with exact file names and implementation steps.
