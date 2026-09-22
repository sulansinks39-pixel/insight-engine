import type { EvidenceLink } from "@/lib/evidence-model";
export function Citation({ evidence, onOpen }: { evidence: EvidenceLink; onOpen: (id: string) => void }) {
  const n = Number(evidence.id.replace(/\D/g, "")) || 1;
  return <button type="button" onClick={() => onOpen(evidence.id)} className="citation-link" aria-label={`Open source ${n}`}>[{n}]</button>;
}
