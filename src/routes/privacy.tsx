import { createFileRoute } from "@tanstack/react-router";
import { PRIVACY_EMAIL } from "@/lib/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Evidence" },
      {
        name: "description",
        content:
          "How Evidence handles your account details, saved research history, and cookies, and the choices you have over them.",
      },
      { property: "og:title", content: "Privacy policy — Evidence" },
      { property: "og:description", content: "What we collect, why, and how to have it deleted." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="19 September 2026">
      <h2>What we collect</h2>
      <p>
        If you create an account we store your email address, the display name and avatar you
        choose, and the research questions and answers you ask while signed in. If you use Evidence
        without an account, your questions are sent to our search and answer services but are not
        saved to any history.
      </p>

      <h2>Why we collect it</h2>
      <ul>
        <li>To sign you in and keep you signed in.</li>
        <li>To show your past questions and answers so you can return to them.</li>
        <li>To find relevant published research and write a cited answer to your question.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        Your question and the abstracts of the papers we retrieve are sent to our AI provider to
        generate the answer. Paper searches are performed against OpenAlex, an open catalogue of
        scholarly works. We do not sell your data and we do not share it for advertising.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        We set only the cookies and local storage needed to keep you signed in and to remember your
        cookie choice. Analytics and other non-essential scripts are never loaded unless you give
        explicit consent in the cookie banner, and you can withdraw that consent at any time from
        the “Cookie preferences” link in the footer.
      </p>

      <h2>Keeping and deleting your data</h2>
      <p>
        You can delete any saved question from the history panel at any time. To delete your account
        and everything attached to it, contact us and we will remove it. Deleting your account
        removes your profile and your entire saved history.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export, or delete
        the personal data we hold about you, and to object to certain processing. Contact us to
        exercise any of these rights.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href={`mailto:${PRIVACY_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">{PRIVACY_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
