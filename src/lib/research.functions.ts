import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Paper } from "./research.types";

const Input = z.object({
  question: z.string().trim().min(3).max(400),
  /** Earlier questions in the same thread, so follow-ups keep their topic. */
  context: z.string().trim().max(600).optional(),
});

export const searchPapers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<Paper[]> => {
    const { fetchPapers } = await import("./papers.server");
    const query = data.context ? `${data.context} ${data.question}` : data.question;
    return fetchPapers(query, 12);
  });
