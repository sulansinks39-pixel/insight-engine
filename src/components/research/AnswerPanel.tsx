import ReactMarkdown from "react-markdown";
import type { Paper } from "@/lib/research.types";

type Props = {
  answer: string;
  streaming: boolean;
  papers: Paper[];
  onCite: (index: number) => void;
};

/** Turn `[3]` citations into markdown links so they can render as chips. */
function linkifyCitations(md: string) {
  return md.replace(/\[(\d{1,2})\](?!\()/g, (_, n) => `[${n}](#cite-${n})`);
}

export function AnswerPanel({ answer, streaming, papers, onCite }: Props) {
  return (
    <article className="paper-card animate-rise p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        Evidence-based answer
        {streaming && (
          <span className="animate-pulse-soft ml-2 normal-case tracking-normal">writing…</span>
        )}
      </div>
      <div className="prose-answer text-foreground">
        {answer ? (
          <ReactMarkdown
            components={{
              a: ({ href, children }) => {
                const m = href?.match(/^#cite-(\d+)$/);
                if (!m) return <>{children}</>;
                const n = Number(m[1]);
                const paper = papers.find((p) => p.index === n);
                if (!paper) return <>[{n}]</>;
                return (
                  <button
                    type="button"
                    onClick={() => onCite(n)}
                    className="citation-chip hover:scale-110 hover:bg-primary hover:text-primary-foreground"
                    title={paper.title}
                    aria-label={`Source ${n}: ${paper.title}`}
                  >
                    {n}
                  </button>
                );
              },
            }}
          >
            {linkifyCitations(answer)}
          </ReactMarkdown>
        ) : (
          <div className="space-y-3">
            <div className="animate-pulse-soft h-4 w-11/12 rounded bg-muted" />
            <div className="animate-pulse-soft h-4 w-full rounded bg-muted" />
            <div className="animate-pulse-soft h-4 w-8/12 rounded bg-muted" />
          </div>
        )}
      </div>
    </article>
  );
}
