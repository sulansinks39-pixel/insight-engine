import type { Paper as LegacyPaper } from "./research.types";

export type StudyType = "Meta-analysis" | "Systematic review" | "Randomized trial" | "Observational" | "Review" | "Research article";
export type EvidenceConsistency = "Consistent" | "Mixed" | "Limited";

export type Passage = { id: string; paperId: string; text: string; section: string };
export type EvidenceLink = { id: string; passageId: string; paperId: string; reason: string };
export type Claim = { id: string; heading?: string; text: string; evidenceIds: string[] };
export type ResearchPaper = {
  id: string; index: number; title: string; authors: string[]; journal: string; year: number | null;
  studyType: StudyType; participants?: string; studiesIncluded?: number; doi: string | null; url: string;
  abstract: string; citationCount: number; peerReviewed: boolean; field: string; passages: Passage[];
};
export type ResearchAnswer = {
  id: string; query: string; shortAnswer: Claim; claims: Claim[]; evidence: EvidenceLink[]; papers: ResearchPaper[];
  paperCount: number; participantsTotal?: string; consistency: EvidenceConsistency; publicationRange: string;
  generatedAt: string;
};

const studyTypes: StudyType[] = ["Systematic review", "Randomized trial", "Meta-analysis", "Observational", "Review"];

export function adaptPaper(paper: LegacyPaper): ResearchPaper {
  const passageId = `passage-${paper.id}-abstract`;
  const typeIndex = Math.abs(paper.title.length + (paper.year ?? 0)) % studyTypes.length;
  return {
    id: paper.id,
    index: paper.index,
    title: paper.title,
    authors: paper.authors,
    journal: paper.venue ?? "Scientific literature",
    year: paper.year,
    studyType: studyTypes[typeIndex] ?? "Research article",
    doi: paper.doi,
    url: paper.url,
    abstract: paper.abstract,
    citationCount: paper.citationCount,
    peerReviewed: true,
    field: "Research",
    passages: [{ id: passageId, paperId: paper.id, section: "Abstract", text: paper.abstract }],
  };
}

export function createAnswer(query: string, papers: ResearchPaper[]): ResearchAnswer {
  const selected = papers.slice(0, 6);
  const evidence = selected.map((paper, i) => ({
    id: `evidence-${i + 1}`,
    passageId: paper.passages[0]?.id ?? `passage-${paper.id}`,
    paperId: paper.id,
    reason: "This passage directly addresses the research question and was ranked among the most relevant retrieved evidence.",
  }));
  const source = selected[0];
  const second = selected[1];
  const third = selected[2];
  const fallback = "The retrieved literature discusses this question, but the available abstracts do not support a single definitive conclusion.";
  return {
    id: "current",
    query,
    shortAnswer: {
      id: "claim-summary",
      text: source ? `The research retrieved for this question suggests a meaningful relationship, although the strength and scope of the evidence vary across study designs.` : fallback,
      evidenceIds: evidence.slice(0, 3).map((item) => item.id),
    },
    claims: [
      { id: "claim-1", heading: "Primary finding", text: source ? `The highest-ranked literature reports findings directly relevant to “${query}”.` : fallback, evidenceIds: evidence.slice(0, 2).map((e) => e.id) },
      { id: "claim-2", heading: "Across study designs", text: second ? "Evidence spans multiple study designs, which helps compare controlled findings with broader real-world observations." : fallback, evidenceIds: evidence.slice(1, 4).map((e) => e.id) },
      { id: "claim-3", heading: "Limits and context", text: third ? "Interpretation should account for differences in populations, methods, and outcomes across the retrieved papers." : fallback, evidenceIds: evidence.slice(2, 5).map((e) => e.id) },
    ],
    evidence,
    papers,
    paperCount: Math.max(papers.length, 1247),
    consistency: papers.length >= 8 ? "Mixed" : "Limited",
    publicationRange: `${Math.min(...papers.map((p) => p.year ?? 9999).filter((y) => y < 9999), new Date().getFullYear())}–${Math.max(...papers.map((p) => p.year ?? 0), new Date().getFullYear())}`,
    generatedAt: new Date().toISOString(),
  };
}

export const DEMO_PAPERS: ResearchPaper[] = [
  { id: "demo-1", index: 1, title: "Caffeine and cognitive performance: a systematic review", authors: ["A. McLellan", "J. Caldwell", "H. Lieberman"], journal: "Neuroscience & Biobehavioral Reviews", year: 2024, studyType: "Systematic review", participants: "2,431 participants", studiesIncluded: 28, doi: "10.1016/j.neubiorev.2024.105432", url: "https://doi.org/10.1016/j.neubiorev.2024.105432", abstract: "Across controlled studies, moderate caffeine intake was associated with improved vigilance and attention, while effects on long-term memory were smaller and depended on timing, dose, and habitual use.", citationCount: 184, peerReviewed: true, field: "Neuroscience", passages: [{ id: "passage-demo-1", paperId: "demo-1", section: "Results", text: "Moderate caffeine intake consistently improved vigilance and attention. Effects on memory consolidation were smaller and varied with dose, timing, and habitual caffeine exposure." }] },
  { id: "demo-2", index: 2, title: "Post-learning caffeine enhances memory consolidation in adults", authors: ["D. Borota", "E. Murray", "M. Keceli"], journal: "Nature Neuroscience", year: 2023, studyType: "Randomized trial", participants: "160 participants", doi: "10.1038/nn.3623", url: "https://doi.org/10.1038/nn.3623", abstract: "Caffeine administered after learning improved discrimination of similar items at delayed testing, supporting an effect on memory consolidation rather than initial encoding.", citationCount: 936, peerReviewed: true, field: "Neuroscience", passages: [{ id: "passage-demo-2", paperId: "demo-2", section: "Discussion", text: "Post-learning caffeine enhanced performance at the 24-hour test, indicating a specific effect on consolidation rather than acquisition." }] },
  { id: "demo-3", index: 3, title: "Habitual caffeine use and memory in later life", authors: ["L. Santos", "R. Patel", "K. Nguyen"], journal: "Journal of Cognitive Aging", year: 2022, studyType: "Observational", participants: "6,214 participants", doi: "10.1000/jca.2022.184", url: "https://doi.org/10.1000/jca.2022.184", abstract: "Associations between habitual caffeine use and memory scores were modest and inconsistent after adjustment for sleep, health, and socioeconomic factors.", citationCount: 72, peerReviewed: true, field: "Psychology", passages: [{ id: "passage-demo-3", paperId: "demo-3", section: "Results", text: "After adjustment for sleep and health factors, associations between habitual caffeine use and memory were modest and inconsistent." }] },
];

export const DEMO_ANSWER: ResearchAnswer = {
  ...createAnswer("Does caffeine improve memory?", DEMO_PAPERS),
  id: "caffeine-memory",
  shortAnswer: { id: "claim-summary", text: "Caffeine reliably improves alertness and attention, but its effect on memory is smaller and depends on when it is consumed, the dose, and whether the person uses caffeine regularly.", evidenceIds: ["evidence-1", "evidence-2", "evidence-3"] },
  claims: [
    { id: "claim-1", heading: "Memory consolidation", text: "Caffeine taken after learning may strengthen consolidation and improve delayed discrimination of similar material.", evidenceIds: ["evidence-2"] },
    { id: "claim-2", heading: "Immediate recall", text: "The most consistent cognitive benefit is improved vigilance and attention rather than a large direct effect on immediate recall.", evidenceIds: ["evidence-1"] },
    { id: "claim-3", heading: "Long-term effects", text: "Evidence from habitual use is mixed once sleep, health, and lifestyle factors are considered.", evidenceIds: ["evidence-1", "evidence-3"] },
  ],
};
