import ReactMarkdown from "react-markdown";
import { Fragment, type ReactNode } from "react";
import type { Paper } from "@/lib/research.types";

type Props = {
  answer: string;
  streaming: boolean;
  papers: Paper[];
  onCite: (index: number) => void;
};

const CITE_RE = /\[(\d{1,2})\](?:\[(\d{1,2})\])*/g;

function withCitations(text: string, papers: Paper[], onCite: (i: number) => void): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(/\[(\d{1,2})\]/g)) {
    const idx = match.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    const n = Number(match[1]);
    const paper = papers.find((p) => p.index === n);
    nodes.push(
      paper ? (
        <button
          key={`${idx}-${n}`}
          type="button"
          onClick={() => onCite(n)}
          className="citation-chip hover:scale-110 hover:bg-primary hover:text-primary-foreground"
          title={paper.title}
          aria-label={`Source ${n}: ${paper.title}`}
        >
          {n}
        </button>
      ) : (
        match[0]
      ),
    );
    last = idx + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

export function AnswerPanel({ answer, streaming, papers, onCite }: Props) {
  void CITE_RE;
  return (
    <article className="paper-card animate-rise p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block size-1.5 rounded-full bg-accent" />
        Evidence-based answer
        {streaming && <span className="animate-pulse-soft ml-2 normal-case tracking-normal">writing…</span>}
      </div>
      <div className="prose-answer text-foreground">
        {answer ? (
          <ReactMarkdown
            components={{
              text: ({ children }) =>
                typeof children === "string" ? <>{withCitations(children, papers, onCite)}</> : <>{children}</>,
              a: ({ children }) => <>{children}</>,
            }}
          >
            {answer}
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
