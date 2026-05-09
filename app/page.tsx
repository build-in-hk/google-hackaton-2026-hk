import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: "Pin Life — agent-built place UI",
  description:
    "Map pin + CopilotKit / AG-UI / A2UI: the agent decides the interface at runtime.",
};

export default function Page() {
  return <HomePage />;
}
