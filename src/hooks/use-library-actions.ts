import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ResearchPaper } from "@/lib/evidence-model";
import { addPaperToCollection, savePaper } from "@/lib/library.functions";

function toInput(paper: ResearchPaper) {
  return { paperId: paper.id, title: paper.title, paperData: paper as unknown as Record<string, unknown> };
}

/** Save / collect papers. Prompts for sign-in when there is no session. */
export function useLibraryActions() {
  const save = useServerFn(savePaper);
  const addToCollection = useServerFn(addPaperToCollection);
  const navigate = useNavigate();

  const requireSession = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return true;
    toast("Sign in to save papers", {
      description: "Your library and collections are stored with your account.",
      action: { label: "Sign in", onClick: () => void navigate({ to: "/sign-in" }) },
    });
    return false;
  };

  const report = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");

  return {
    savePaper: async (paper: ResearchPaper) => {
      if (!(await requireSession())) return;
      try {
        await save({ data: toInput(paper) });
        toast.success("Saved to your library");
      } catch (e) {
        report(e);
      }
    },
    addToCollection: async (paper: ResearchPaper) => {
      if (!(await requireSession())) return;
      const name = window.prompt("Add to which collection?", "Reading list")?.trim();
      if (!name) return;
      try {
        await addToCollection({ data: { ...toInput(paper), collectionName: name } });
        toast.success(`Added to “${name}”`);
      } catch (e) {
        report(e);
      }
    },
  };
}
