CREATE TABLE public.saved_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  paper_id TEXT NOT NULL,
  title TEXT NOT NULL,
  paper_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, paper_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_papers TO authenticated;
GRANT ALL ON public.saved_papers TO service_role;
ALTER TABLE public.saved_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved papers" ON public.saved_papers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX saved_papers_user_created_idx ON public.saved_papers (user_id, created_at DESC);
CREATE TRIGGER update_saved_papers_updated_at BEFORE UPDATE ON public.saved_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collections" ON public.collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX collections_user_updated_idx ON public.collections (user_id, updated_at DESC);
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.collection_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  saved_paper_id UUID NOT NULL REFERENCES public.saved_papers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (collection_id, saved_paper_id)
);
GRANT SELECT, INSERT, DELETE ON public.collection_papers TO authenticated;
GRANT ALL ON public.collection_papers TO service_role;
ALTER TABLE public.collection_papers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own collection papers" ON public.collection_papers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX collection_papers_collection_idx ON public.collection_papers (collection_id, created_at DESC);