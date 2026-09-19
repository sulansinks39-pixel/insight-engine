import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — Evidence" },
      {
        name: "description",
        content:
          "The rules for using Evidence: acceptable use, accounts, limits of the AI answers, and liability.",
      },
      { property: "og:title", content: "Terms of service — Evidence" },
      { property: "og:description", content: "The agreement between you and Evidence." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalPage title="Terms of service" updated="19 September 2026">
      <h2>Using Evidence</h2>
      <p>
        By using Evidence you agree to these terms. Evidence searches published research and uses AI
        to write a summary of what those papers say, with citations. You must be at least 16 years
        old, or have permission from a parent or guardian, to create an account.
      </p>

      <h2>Answers are summaries, not advice</h2>
      <p>
        Answers are generated automatically from paper abstracts and can be incomplete, out of date,
        or wrong. Always read the cited papers before relying on anything. Evidence is not medical,
        legal, financial, or professional advice, and must not be used as a substitute for a
        qualified professional.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for keeping your password safe and for activity under your account. Tell
        us immediately if you believe someone else has access to it. You may delete your account at
        any time.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use Evidence to break the law or to infringe anyone’s rights.</li>
        <li>Do not attempt to overload, scrape at scale, or reverse engineer the service.</li>
        <li>Do not present generated answers as peer-reviewed conclusions of your own.</li>
      </ul>

      <h2>Third-party content</h2>
      <p>
        Paper metadata and abstracts come from OpenAlex and the publishers it indexes, and remain
        the property of their respective rights holders. Links may take you to sites we do not
        control.
      </p>

      <h2>Availability and changes</h2>
      <p>
        The service is provided “as is”, without warranties, and may change or become unavailable at
        any time. To the maximum extent permitted by law, we are not liable for any indirect or
        consequential loss arising from your use of Evidence.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <strong>legal@evidence.example</strong>. Please replace
        this with your real contact address before going live.
      </p>
    </LegalPage>
  );
}
