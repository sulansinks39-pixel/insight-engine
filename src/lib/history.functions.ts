import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Paper } from "./research.types";

export type ConversationSummary = { id: string; title: string; updated_at: string };
export type Turn = { question: string; answer: string; papers: Paper[] };

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConversationSummary[]> => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ title: string; turns: Turn[] }> => {
    const { data: conv, error: convError } = await context.supabase
      .from("conversations")
      .select("title")
      .eq("id", data.id)
      .maybeSingle();
    if (convError) throw new Error(convError.message);
    if (!conv) throw new Error("Conversation not found");

    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("role, content, papers, created_at")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const turns: Turn[] = [];
    for (const row of rows ?? []) {
      if (row.role === "user") {
        turns.push({ question: row.content, answer: "", papers: [] });
      } else if (turns.length > 0) {
        const last = turns[turns.length - 1]!;
        last.answer = row.content;
        last.papers = (row.papers as unknown as Paper[]) ?? [];
      }
    }
    return { title: conv.title, turns };
  });

const SaveInput = z.object({
  conversationId: z.string().uuid().nullable(),
  question: z.string().trim().min(3).max(400),
  answer: z.string().min(1),
  papers: z.array(z.record(z.string(), z.unknown())).max(30),
});

export const saveTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }): Promise<{ conversationId: string }> => {
    const { supabase, userId } = context;
    let conversationId = data.conversationId;

    if (!conversationId) {
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ user_id: userId, title: data.question.slice(0, 120) })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      conversationId = created.id;
    } else {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }

    const { error: insertError } = await supabase.from("messages").insert([
      { conversation_id: conversationId, user_id: userId, role: "user", content: data.question },
      {
        conversation_id: conversationId,
        user_id: userId,
        role: "assistant",
        content: data.answer,
        papers: data.papers as never,
      },
    ]);
    if (insertError) throw new Error(insertError.message);
    return { conversationId };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("conversations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? { display_name: null, avatar_url: null };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        display_name: z.string().trim().max(60).optional(),
        avatar_url: z.string().trim().url().max(500).or(z.literal("")).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: { display_name?: string; avatar_url?: string | null } = {};
    if (data.display_name !== undefined) patch.display_name = data.display_name;
    if (data.avatar_url !== undefined) patch.avatar_url = data.avatar_url || null;
    const { error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
