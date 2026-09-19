import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { loadNonEssentialScripts, readConsent, writeConsent } from "@/lib/consent";

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
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl"
    >
      <div className="paper-card animate-rise flex flex-col gap-3 p-4 shadow-lg sm:flex-row sm:items-center">
        <Cookie className="size-5 shrink-0 text-primary" />
        <p className="flex-1 text-sm text-foreground/85">
          We only use cookies needed to keep you signed in. Analytics and other non-essential
          scripts stay switched off unless you choose to allow them. See our{" "}
          <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-lg border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Allow all
          </button>
        </div>
      </div>
    </div>
  );
}
