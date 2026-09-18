import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Paper } from "./research.types";

const Input = z.object({ question: z.string().trim().min(3).max(400) });

export const searchPapers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<Paper[]> => {
    const { fetchPapers } = await import("./papers.server");
    return fetchPapers(data.question, 12);
  });
