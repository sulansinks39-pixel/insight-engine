import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pt-12 sm:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Back to Evidence
      </Link>
      <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
      <div className="prose-answer mt-8 space-y-4 text-foreground/90 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
      <SiteFooter />
    </main>
  );
}
