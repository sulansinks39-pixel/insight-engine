import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPES = ["Meta-analysis", "Systematic review", "RCT", "Observational"];
const SCOPES = ["All research", "Clinical trials", "Reviews", "Meta-analyses"];

export function SearchForm({ initial = "", busy = false, onSearch, compact = false }: { initial?: string; busy?: boolean; onSearch: (q: string) => void; compact?: boolean }) {
  const [q, setQ] = useState(initial);
  const [filters, setFilters] = useState(false);
  const [scope, setScope] = useState(SCOPES[0]);
  const submit = (e: FormEvent) => { e.preventDefault(); if (q.trim().length >= 3) onSearch(q.trim()); };

  return (
    <div className="w-full min-w-0">
      <form onSubmit={submit} role="search" className={cn("search-frame", compact && "search-frame-compact")}>
        <Search aria-hidden className="ml-2 size-5 shrink-0 text-ink-muted" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Research question"
          placeholder="Ask a research question…"
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0",
            compact ? "h-10 text-base" : "h-12 text-base md:text-lg",
          )}
        />
        <Button type="submit" disabled={busy || q.trim().length < 3} className={cn("shrink-0", compact ? "h-9 px-4" : "h-11 px-5")}>
          {busy ? "Searching…" : <><span className="hidden sm:inline">Search</span><ArrowRight /></>}
          {!busy && <span className="sr-only sm:hidden">Search</span>}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="toolbar" aria-label="Search filters">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Research scope">
          {SCOPES.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={scope === x}
              onClick={() => setScope(x)}
              className={cn("filter-chip", scope === x && "filter-chip-active")}
            >
              {x}
            </button>
          ))}
        </div>
        <span aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <button
          type="button"
          aria-expanded={filters}
          onClick={() => setFilters((v) => !v)}
          className={cn("filter-chip gap-1.5", filters && "filter-chip-active")}
        >
          <SlidersHorizontal className="size-3.5" />
          {filters ? "Hide filters" : "More filters"}
        </button>
      </div>

      {filters && (
        <div className="mt-3 grid gap-5 border bg-card p-5 md:grid-cols-3">
          <label className="text-sm">
            <span className="meta-label mb-2 block">Publication date</span>
            <select className="h-9 w-full rounded-md border bg-background px-2 focus-visible:outline-2 focus-visible:outline-ring">
              <option>Any time</option>
              <option>Since 2020</option>
              <option>Since 2015</option>
            </select>
          </label>
          <fieldset>
            <legend className="meta-label mb-2 block">Study type</legend>
            <div className="grid gap-2">
              {TYPES.map((t) => <label key={t} className="flex items-center gap-2 text-sm"><Checkbox />{t}</label>)}
            </div>
          </fieldset>
          <div className="grid gap-3">
            <label><span className="meta-label mb-2 block">Research field</span><Input placeholder="e.g. Neuroscience" /></label>
            <label><span className="meta-label mb-2 block">Population</span><Input placeholder="e.g. Older adults" /></label>
          </div>
        </div>
      )}
    </div>
  );
}
