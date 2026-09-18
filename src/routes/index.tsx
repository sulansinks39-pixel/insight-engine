import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpenText, Loader2, Sparkles } from "lucide-react";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { AnswerPanel } from "@/components/research/AnswerPanel";
import { PaperCard } from "@/components/research/PaperCard";
import { searchPapers } from "@/lib/research.functions";
import type { Paper } from "@/lib/research.types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Evidence — AI research search engine" },
      {
        name: "description",
        content:
          "Ask a question in plain language and get an answer synthesized from peer-reviewed research, with every claim cited to its source paper.",
      },
      { property: "og:title", content: "Evidence — AI research search engine" },
      {
        property: "og:description",
        content: "Answers grounded in scientific papers, with citations you can check.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "Does intermittent fasting help with weight loss?",
  "Is creatine safe for long-term use?",
  "Do school uniforms improve academic performance?",
  "Does mindfulness meditation reduce anxiety?",
];

type Phase = "idle" | "searching" | "synthesizing" | "done" | "error";

function Index() {
  const search = useServerFn(searchPapers);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 3) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setAsked(trimmed);
      setQuestion(trimmed);
      setPhase("searching");
      setPapers([]);
      setAnswer("");
      setError(null);
      setHighlight(null);

      try {
        const found = await search({ data: { question: trimmed } });
        if (controller.signal.aborted) return;
        setPapers(found);
        if (found.length === 0) {
          setError("No research papers with abstracts matched that question. Try rephrasing it.");
          setPhase("error");
          return;
        }
        setPhase("synthesizing");

        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            question: trimmed,
            papers: found.map(({ index, title, year, authors, venue, citationCount, abstract }) => ({
              index,
              title,
              year,
              authors,
              venue,
              citationCount,
              abstract,
            })),
          }),
        });
        if (!res.ok || !res.body) {
          throw new Error((await res.text()) || `Synthesis failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setAnswer(text);
        }
        setAnswer(text);
        setPhase("done");
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setPhase("error");
      }
    },
    [search],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(question);
  };

  const onCite = (n: number) => {
    setHighlight(n);
    document.getElementById(`paper-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const busy = phase === "searching" || phase === "synthesizing";
  const hasResults = phase !== "idle";

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 pb-24 sm:px-6">
      <header
        className={`flex flex-col items-center text-center transition-all duration-500 ${
          hasResults ? "pt-8 pb-6" : "pt-24 pb-10 sm:pt-32"
        }`}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
          <BookOpenText className="size-3.5 text-primary" />
          Answers from peer-reviewed research
        </div>
        <h1
          className={`font-serif font-medium tracking-tight text-foreground transition-all duration-500 ${
            hasResults ? "text-2xl" : "text-4xl sm:text-6xl"
          }`}
        >
          Evidence
        </h1>
        {!hasResults && (
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Ask a question in plain language. We read the most relevant scientific papers and write
            an answer where every claim links back to its source.
          </p>
        )}
      </header>

      <form onSubmit={onSubmit} className="sticky top-3 z-10">
        <div className="paper-card flex items-center gap-2 p-2 pl-4 focus-within:ring-2 focus-within:ring-ring">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Does caffeine improve memory?"
            aria-label="Research question"
            maxLength={400}
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy || question.trim().length < 3}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>
      </form>

      {!hasResults && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => void run(ex)}
              className="rounded-full border bg-card px-3.5 py-1.5 text-sm text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {hasResults && (
        <section className="mt-8 space-y-6">
          <p className="font-serif text-xl text-foreground sm:text-2xl">“{asked}”</p>

          {phase === "searching" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Searching the literature…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {(phase === "synthesizing" || phase === "done") && (
            <AnswerPanel answer={answer} streaming={phase === "synthesizing"} papers={papers} onCite={onCite} />
          )}

          {papers.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {papers.length} sources
              </h2>
              <ul className="space-y-3">
                {papers.map((p) => (
                  <PaperCard key={p.id} paper={p} highlighted={highlight === p.index} />
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
