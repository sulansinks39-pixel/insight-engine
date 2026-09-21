import type { ResearchAnswer } from "./evidence-model";
const KEY = "evidence.current-research.v2";
export function saveResearch(answer: ResearchAnswer) { if (typeof window !== "undefined") sessionStorage.setItem(KEY, JSON.stringify(answer)); }
export function readResearch(): ResearchAnswer | null {
  if (typeof window === "undefined") return null;
  try { const raw = sessionStorage.getItem(KEY); return raw ? (JSON.parse(raw) as ResearchAnswer) : null; } catch { return null; }
}
