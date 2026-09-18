import { useState } from "react";
import { ExternalLink, Quote } from "lucide-react";
import type { Paper } from "@/lib/research.types";
import { cn } from "@/lib/utils";

export function PaperCard({ paper, highlighted }: { paper: Paper; highlighted: boolean }) {
  const [open, setOpen] = useState(false);
  const authors =
    paper.authors.length > 3 ? `${paper.authors.slice(0, 3).join(", ")} et al.` : paper.authors.join(", ");

  return (
    <li
      id={`paper-${paper.index}`}
      className={cn(
        "paper-card animate-rise p-4 transition-all duration-300 sm:p-5",
        highlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex gap-3">
        <span className="citation-chip mt-1 !align-baseline" aria-hidden>
          {paper.index}
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={paper.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-start gap-1.5 font-serif text-[1.05rem] leading-snug font-medium text-foreground hover:text-primary"
          >
            <span>{paper.title}</span>
            <ExternalLink className="mt-1 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-70" />
          </a>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {authors}
            {authors && " · "}
            {paper.year ?? "n.d."}
            {paper.venue && (
              <>
                {" · "}
                <span className="italic">{paper.venue}</span>
              </>
            )}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
              <Quote className="mr-1 inline size-3" />
              {paper.citationCount.toLocaleString()} citations
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 capitalize text-secondary-foreground">
              {paper.type}
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="ml-auto font-medium text-primary underline-offset-4 hover:underline"
            >
              {open ? "Hide abstract" : "Read abstract"}
            </button>
          </div>
          {open && (
            <p className="animate-rise mt-3 border-l-2 border-citation pl-3 text-sm leading-relaxed text-foreground/85">
              {paper.abstract}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
