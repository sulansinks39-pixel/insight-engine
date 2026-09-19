import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";
import { writeConsent } from "@/lib/consent";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie policy — Evidence" },
      {
        name: "description",
        content:
          "Which cookies Evidence uses, why non-essential tracking stays off until you opt in, and how to change your choice.",
      },
      { property: "og:title", content: "Cookie policy — Evidence" },
      { property: "og:description", content: "Essential cookies only, unless you opt in." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <LegalPage title="Cookie policy" updated="19 September 2026">
      <h2>Essential only, by default</h2>
      <p>
        When you first arrive, no analytics, advertising, or other non-essential script is loaded.
        Nothing is switched on in advance and there is no pre-ticked box: tracking runs only after
        you actively choose “Allow all” in the cookie banner.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Sign-in session</strong> — keeps you logged in. Strictly necessary, so it cannot be
          turned off while you are signed in.
        </li>
        <li>
          <strong>Cookie choice</strong> — remembers whether you allowed non-essential scripts, so we
          do not ask again on every visit.
        </li>
        <li>
          <strong>Analytics (optional)</strong> — loaded only with your consent, to understand which
          features are used.
        </li>
      </ul>

      <h2>Changing your mind</h2>
      <p>
        You can withdraw consent at any time. Use the button below, or “Cookie preferences” in the
        footer, and the banner will reappear so you can choose again.
      </p>
      <p>
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        >
          Reset my cookie choice
        </button>
      </p>
    </LegalPage>
  );
}
