export type ResearchFocus =
  | "general"
  | "commute"
  | "food"
  | "rent"
  | "risk"
  | "comparison";

export type ResearchBundle = {
  coords: { lat: number; lng: number };
  addressHint?: string;
  focus: ResearchFocus;
  areaLabel: string;
  vibe: string;
  transit: {
    summary: string;
    modes: string[];
    lastTrainApprox?: string;
    nightSafetyNote: string;
  };
  food: {
    summary: string;
    priceSignal: "lower" | "mid" | "higher";
    groceryAccess: string;
  };
  rent: {
    summary: string;
    bedroom1ApproxLocal: string;
    confidence: "low" | "medium" | "high";
  };
  pros: { claim: string; evidence: string }[];
  cons: { claim: string; evidence: string }[];
  dataGaps: string[];
  mock: true;
};

function hashCoords(lat: number, lng: number): number {
  const x = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453);
  return x - Math.floor(x);
}

export function mockResearchBundle(opts: {
  lat: number;
  lng: number;
  addressHint?: string;
  focus?: ResearchFocus;
}): ResearchBundle {
  const focus = opts.focus ?? "general";
  const h = hashCoords(opts.lat, opts.lng);

  const urban = h > 0.45;
  const areaLabel = urban ? "Urban core (mock)" : "Residential / peripheral (mock)";
  const vibe = urban
    ? "Busy sidewalks, short walks to amenities, noisier evenings."
    : "Quieter blocks, longer walks to transit hubs, more green space.";

  return {
    coords: { lat: opts.lat, lng: opts.lng },
    addressHint: opts.addressHint,
    focus,
    areaLabel,
    vibe,
    transit: {
      summary: urban
        ? "Several bus lines within ~400m; rail or rapid transit likely 8–18 min walk depending on exact block (verify live schedules)."
        : "Transit may mean a bus feeder to a hub; last-mile often bike or car (verify stops near the pin).",
      modes: urban ? ["Bus", "Walk", "Metro or LRT (check map)"] : ["Bus", "Bike", "Car"],
      lastTrainApprox: urban ? "~23:30–00:30 (highly city-specific — confirm)" : "Often earlier — confirm",
      nightSafetyNote:
        focus === "risk" || focus === "commute"
          ? "Late return: prefer lit main roads; check real-time ride-hail availability for this micro-area."
          : "Use caution late night on quiet side streets; verify local guidance.",
    },
    food: {
      summary: urban
        ? "Many small eateries; competition tends to keep cheap eats available within a short walk."
        : "Fewer walkable options; supermarkets may be a drive or longer bus trip.",
      priceSignal: urban ? "mid" : "lower",
      groceryAccess: urban
        ? "Convenience stores dense; full-size supermarket within ~10–20 min walk typical."
        : "Plan a weekly grocery run; fresh markets may be sparse.",
    },
    rent: {
      summary: urban
        ? "Rents usually carry a premium for convenience and transit access."
        : "Often better square-foot value; tradeoff is time cost for commute and errands.",
      bedroom1ApproxLocal: urban ? "mock: upper-mid band for the metro" : "mock: mid band for the metro",
      confidence: "low",
    },
    pros: [
      {
        claim: urban ? "Strong everyday convenience" : "More space per dollar",
        evidence: mockEvidence(h, 0),
      },
      {
        claim: urban ? "Shorter errand distances" : "Lower noise in many pockets",
        evidence: mockEvidence(h, 1),
      },
    ],
    cons: [
      {
        claim: urban ? "Noise and crowding" : "Weaker walkable density",
        evidence: mockEvidence(h, 2),
      },
      {
        claim: urban ? "Rent pressure" : "Commute time to central job hubs",
        evidence: mockEvidence(h, 3),
      },
    ],
    dataGaps: [
      "Live transit schedules and real walking distances were not fetched — user should verify in a maps app.",
      "Rent numbers are illustrative only; pull listings for the exact neighborhood.",
    ],
    mock: true,
  };
}

function mockEvidence(h: number, i: number): string {
  const parts = [
    "Synthesized from coarse area pattern (mock research tool — replace with real APIs).",
    `Area hash ${(h + i * 0.07).toFixed(3)} — demo variation only.`,
  ];
  return parts.join(" ");
}
