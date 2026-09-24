import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { loadNonEssentialScripts, readConsent, writeConsent } from "@/lib/consent";

/**
 * Compact consent bar. Non-essential scripts stay blocked until the visitor
 * explicitly presses Accept.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const current = readConsent();
    if (current === null) setVisible(true);
    if (current === "granted") loadNonEssentialScripts();
  }, []);

  if (!visible) return null;

  const decide = (value: "granted" | "denied") => {
    writeConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs text-ink-secondary">
        <p>We use essential cookies only.</p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            to="/cookies"
            className="underline-offset-4 hover:text-ink hover:underline"
          >
            Preferences
          </Link>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="bg-primary px-3 py-1 font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
