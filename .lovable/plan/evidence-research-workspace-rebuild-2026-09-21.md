# Evidence research workspace rebuild

## Goal
Rebuild Evidence as two clearly separated experiences: an editorial public site and a dense research workspace. Preserve the existing live literature search, AI synthesis, accounts, and saved history while making citations traceable from each claim to an exact passage and paper.

## Public website
- Replace `/` with the editorial homepage: public navigation, search-led hero, the requested educational sections, interactive citation/source demonstration, methodology teaser, and footer.
- Add `/how-it-works`, `/methodology`, `/topics`, `/about`, and `/sign-in`; retain `/privacy` and `/terms`, with `/auth` redirected or kept compatible.
- Use the supplied paper/ink/red token system, editorial serif only for display content, restrained surfaces, thin rules, minimal shadows, and a compact essential-cookie notice.
- Homepage search forwards the question into the research workspace.

## Research workspace
- Add an app-only shell with top navigation, persistent desktop sidebar, mobile drawer, account menu, and no footer.
- Build `/app` as the clean default search screen with staged advanced filters and pipeline-aware loading states.
- Build `/app/results/$id` with Overview, Papers, Evidence, Authors, and Topics tabs; evidence metrics, structured findings, evidence table, source list, methodology flow, and keyboard-accessible citations.
- Build `/app/paper/$id` with study metadata, abstract, findings, relevant passages, retrieval rationale, source actions, and prior-answer references.
- Build `/app/library`, `/app/history`, and `/app/settings`, plus useful Topics and Help destinations referenced by the app navigation.

## Evidence model and data layer
- Introduce frontend domain types for searches, papers, passages, claims, evidence links, answers, saved papers, and collections.
- Add a data-access layer so pages consume stable research objects rather than provider-specific responses.
- Adapt live OpenAlex retrieval into paper and passage records. Ensure every rendered claim cites evidence IDs, every evidence item resolves to a passage, and every passage resolves to a paper.
- Keep the current AI gateway integration, but change the synthesis contract from free-form citation text to structured claim/evidence output that can render deterministically.
- Use polished seeded research fixtures for screens or metadata that the current providers do not return, clearly avoiding invented quality scores or confidence percentages.

## Accounts and saved research
- Reuse the existing account and profile flow.
- Extend saved data for papers and collections, with owner-only access rules and complete create, rename, delete, save, and remove actions.
- Keep chronological search history and allow reopening prior work in the new results screen.

## Verification
- Add unique metadata for every content route.
- Verify the public-to-app search flow, live results, citations and source panel, paper navigation, sign-in, history, library actions, mobile drawer/bottom-sheet behavior, keyboard focus, and desktop/mobile layouts.
- Preserve legal compliance behavior: no non-essential scripts load before explicit consent.
