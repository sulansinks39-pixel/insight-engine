import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpenText, Loader2, Menu, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AnswerPanel } from "@/components/research/AnswerPanel";
import { PaperCard } from "@/components/research/PaperCard";
import { useAuth } from "@/hooks/useAuth";
import { getConversation, saveTurn } from "@/lib/history.functions";
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

type Turn = {
  question: string;
  answer: string;
  papers: Paper[];
  status: "searching" | "synthesizing" | "done" | "error";
  error?: string;
};

function Index() {
  const { session, loading: authLoading } = useAuth();
  const signedIn = !!session;

  const search = useServerFn(searchPapers);
  const persistTurn = useServerFn(saveTurn);
  const loadConversation = useServerFn(getConversation);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [highlight, setHighlight] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (turns.length > 0) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length]);

  const run = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 3 || busy) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setQuestion("");
      setBusy(true);
      setHighlight(null);

      const priorTurns = turns.filter((t) => t.status === "done");
      const idx = turns.length;
      const patch = (next: Partial<Turn>) =>
        setTurns((prev) => prev.map((t, i) => (i === idx ? { ...t, ...next } : t)));

      setTurns((prev) => [
        ...prev,
        { question: trimmed, answer: "", papers: [], status: "searching" },
      ]);

      try {
        const context = priorTurns
          .slice(-2)
          .map((t) => t.question)
          .join(" ");
        const found = await search({
          data: { question: trimmed, ...(context ? { context } : {}) },
        });
        if (controller.signal.aborted) return;
        if (found.length === 0) {
          patch({
            status: "error",
            error: "No research papers with abstracts matched that question. Try rephrasing it.",
          });
          return;
        }
        patch({ papers: found, status: "synthesizing" });

        const res = await fetch("/api/synthesize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            question: trimmed,
            history: priorTurns.slice(-3).map((t) => ({
              question: t.question,
              answer: t.answer.slice(0, 4000),
            })),
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
          patch({ answer: text });
        }
        patch({ answer: text, status: "done" });

        if (signedIn && text.trim().length > 0) {
          try {
            const saved = await persistTurn({
              data: {
                conversationId,
                question: trimmed,
                answer: text,
                papers: found as unknown as Record<string, unknown>[],
              },
            });
            setConversationId(saved.conversationId);
            setReloadKey((k) => k + 1);
          } catch {
            /* saving is best-effort */
          }
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        patch({
          status: "error",
          error: e instanceof Error ? e.message : "Something went wrong.",
        });
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    },
    [busy, turns, search, signedIn, persistTurn, conversationId],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(question);
  };

  const onNew = useCallback(() => {
    abortRef.current?.abort();
    setTurns([]);
    setConversationId(null);
    setQuestion("");
    setBusy(false);
  }, []);

  const onSelect = useCallback(
    async (id: string) => {
      abortRef.current?.abort();
      setBusy(true);
      try {
        const conv = await loadConversation({ data: { id } });
        setConversationId(id);
        setTurns(
          conv.turns.map((t) => ({
            question: t.question,
            answer: t.answer,
            papers: t.papers ?? [],
            status: "done" as const,
          })),
        );
      } catch {
        /* ignore */
      } finally {
        setBusy(false);
      }
    },
    [loadConversation],
  );

  const onCite = (n: number) => {
    setHighlight(n);
    document.getElementById(`paper-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hasResults = turns.length > 0;

  return (
    <div className="min-h-screen bg-background lg:pl-72">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        signedIn={signedIn}
        email={session?.user.email ?? null}
        currentId={conversationId}
        reloadKey={reloadKey}
        onSelect={(id) => void onSelect(id)}
        onNew={onNew}
      />

      <div className="flex items-center justify-between border-b px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open history panel"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-serif text-base font-medium">Evidence</span>
        <span className="size-8" />
      </div>

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 sm:px-6">
        <header
          className={`flex flex-col items-center text-center transition-all duration-500 ${
            hasResults ? "pt-8 pb-6" : "pt-20 pb-10 sm:pt-28"
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
              Ask a question in plain language. We read the most relevant scientific papers and
              write an answer where every claim links back to its source. Then keep asking
              follow-ups.
            </p>
          )}
        </header>

        {hasResults && (
          <section className="space-y-10">
            {turns.map((turn, i) => (
              <article key={`${i}-${turn.question}`} className="space-y-5">
                <p className="font-serif text-xl text-foreground sm:text-2xl">“{turn.question}”</p>

                {turn.status === "searching" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Searching the literature…
                  </div>
                )}

                {turn.status === "error" && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {turn.error}
                  </div>
                )}

                {(turn.status === "synthesizing" || turn.status === "done") && (
                  <AnswerPanel
                    answer={turn.answer}
                    streaming={turn.status === "synthesizing"}
                    papers={turn.papers}
                    onCite={onCite}
                  />
                )}

                {turn.papers.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {turn.papers.length} sources
                    </h2>
                    <ul className="space-y-3">
                      {turn.papers.map((p) => (
                        <PaperCard key={p.id} paper={p} highlighted={highlight === p.index} />
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
            <div ref={bottomRef} />
          </section>
        )}

        <form onSubmit={onSubmit} className="sticky bottom-4 z-10 mt-8">
          <div className="paper-card flex items-center gap-2 p-2 pl-4 focus-within:ring-2 focus-within:ring-ring">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                hasResults ? "Ask a follow-up question…" : "Does caffeine improve memory?"
              }
              aria-label="Research question"
              maxLength={400}
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={busy || question.trim().length < 3}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              <span className="hidden sm:inline">{hasResults ? "Follow up" : "Ask"}</span>
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

        {!authLoading && !signedIn && (
          <p className="mt-10 rounded-lg border border-dashed px-4 py-3 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="font-medium text-primary hover:underline">
              Create a free account
            </Link>{" "}
            to save your questions, answers and sources.
          </p>
        )}

        <SiteFooter />
      </main>

      <CookieBanner />
    </div>
  );
}
