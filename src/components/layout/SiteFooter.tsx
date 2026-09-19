import { Link } from "@tanstack/react-router";
import { writeConsent } from "@/lib/consent";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t pt-8 pb-10 text-sm text-muted-foreground">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-lg text-foreground">Evidence</p>
          <p className="mt-1.5 leading-relaxed">
            Answers written from peer-reviewed research, with every claim cited to the paper it came
            from. Not medical, legal, or financial advice.
          </p>
        </div>

        <nav className="grid gap-2" aria-label="Compliance">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">
            Compliance
          </p>
          <Link to="/privacy" className="hover:text-primary">
            Privacy policy
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms of service
          </Link>
          <Link to="/cookies" className="hover:text-primary">
            Cookie policy
          </Link>
          <button
            type="button"
            onClick={() => writeConsent("denied")}
            className="text-left hover:text-primary"
          >
            Cookie preferences
          </button>
        </nav>

        <nav className="grid gap-2" aria-label="Sources">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">
            Sources
          </p>
          <a href="https://openalex.org" target="_blank" rel="noreferrer noopener" className="hover:text-primary">
            OpenAlex
          </a>
          <Link to="/" className="hover:text-primary">
            Ask a question
          </Link>
        </nav>
      </div>
      <p className="mt-8 text-xs">© {new Date().getFullYear()} Evidence. All rights reserved.</p>
    </footer>
  );
}
