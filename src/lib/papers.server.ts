import type { Paper } from "./research.types";

type OpenAlexWork = {
  id: string;
  doi: string | null;
  title: string | null;
  publication_year: number | null;
  cited_by_count: number;
  authorships?: { author: { display_name: string } }[];
  primary_location?: {
    source?: { display_name?: string } | null;
    landing_page_url?: string | null;
  } | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  open_access?: { oa_url?: string | null } | null;
  type?: string;
};

function rebuildAbstract(index: Record<string, number[]> | null | undefined): string {
  if (!index) return "";
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const p of positions) words[p] = word;
  }
  return words.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export async function fetchPapers(question: string, limit = 12): Promise<Paper[]> {
  const params = new URLSearchParams({
    search: question,
    "per-page": String(limit),
    filter: "has_abstract:true,type:article|review,is_paratext:false",
    select:
      "id,doi,title,publication_year,cited_by_count,authorships,primary_location,abstract_inverted_index,open_access,type",
    mailto: "research-engine@lovable.app",
  });

  const res = await fetch(`https://api.openalex.org/works?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paper search failed [${res.status}]: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { results: OpenAlexWork[] };

  return json.results
    .filter((w) => w.title)
    .map((w, i) => {
      const abstract = rebuildAbstract(w.abstract_inverted_index);
      return {
        index: i + 1,
        id: w.id,
        title: w.title ?? "Untitled",
        year: w.publication_year,
        authors: (w.authorships ?? []).slice(0, 4).map((a) => a.author.display_name),
        venue: w.primary_location?.source?.display_name ?? null,
        citationCount: w.cited_by_count,
        doi: w.doi,
        url:
          w.open_access?.oa_url ??
          w.doi ??
          w.primary_location?.landing_page_url ??
          w.id,
        abstract: abstract.length > 1600 ? `${abstract.slice(0, 1600)}…` : abstract,
        type: w.type ?? "article",
      } satisfies Paper;
    })
    .filter((p) => p.abstract.length > 80);
}
