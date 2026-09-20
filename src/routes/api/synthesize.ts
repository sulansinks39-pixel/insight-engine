import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const PaperSchema = z.object({
  index: z.number().int().min(1).max(50),
  title: z.string().max(500),
  year: z.number().nullable(),
  authors: z.array(z.string().max(200)).max(10),
  venue: z.string().max(300).nullable(),
  citationCount: z.number(),
  abstract: z.string().max(2000),
});

const Body = z.object({
  question: z.string().trim().min(3).max(400),
  papers: z.array(PaperSchema).min(1).max(20),
  history: z
    .array(
      z.object({
        question: z.string().max(400),
        answer: z.string().max(4000),
      }),
    )
    .max(6)
    .optional(),
});

const SYSTEM = `You are a scientific research assistant, similar to Consensus.app.
You answer the user's question using ONLY the evidence in the supplied research papers.

Rules:
- Start with a one- or two-sentence bottom line in bold that directly answers the question, then explain the evidence.
- Cite evidence inline with bracketed paper numbers like [3] or [1][4]. Every factual claim needs at least one citation.
- Only cite papers from the supplied list. Never invent studies, statistics, or authors.
- Note disagreement, limitations, and quality of evidence (sample size, study type, review vs. single study) where the abstracts allow.
- If the papers do not answer the question, say so plainly and describe what they do cover.
- If earlier questions and answers from this conversation are supplied, treat the new question as a follow-up: resolve pronouns and implied topics from that history, but base every claim only on the newly supplied papers.
- Keep it under roughly 250 words. Use short paragraphs and an optional short bullet list. No headings, no closing summary of sources.`;

export const Route = createFileRoute("/api/synthesize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured.", { status: 500 });

        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch {
          return new Response("Invalid request.", { status: 400 });
        }

        const evidence = body.papers
          .map(
            (p) =>
              `[${p.index}] ${p.title} (${p.authors.slice(0, 3).join(", ")}${p.authors.length > 3 ? " et al." : ""}, ${p.year ?? "n.d."}, ${p.venue ?? "unknown venue"}, ${p.citationCount} citations)\nAbstract: ${p.abstract}`,
          )
          .join("\n\n");

        const priorTurns = (body.history ?? [])
          .map((t, i) => `Earlier question ${i + 1}: ${t.question}\nEarlier answer: ${t.answer}`)
          .join("\n\n");

        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: key,
          headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });

        try {
          const result = streamText({
            model: lovable.responses("openai/gpt-6-astra"),
            system: SYSTEM,
            prompt: `Question: ${body.question}\n\nResearch papers:\n\n${evidence}`,
            abortSignal: request.signal,
            providerOptions: {
              openai: {
                forceReasoning: true,
                reasoningEffort: "low",
                reasoningSummary: "auto",
                store: false,
                include: ["reasoning.encrypted_content"],
              },
            },
            onError: ({ error }) => console.error("synthesis stream error", error),
          });
          return result.toTextStreamResponse({
            headers: { "Cache-Control": "no-store" },
          });
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            return new Response(null, { status: 499 });
          }
          console.error("synthesis failed", error);
          return new Response("Synthesis failed. Please try again.", { status: 500 });
        }
      },
    },
  },
});
