import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, History, Loader2, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteConversation,
  getProfile,
  listConversations,
  updateProfile,
  type ConversationSummary,
} from "@/lib/history.functions";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  email: string | null;
  currentId: string | null;
  reloadKey: number;
  onSelect: (id: string) => void;
  onNew: () => void;
};

export function AppSidebar({
  open,
  onClose,
  signedIn,
  email,
  currentId,
  reloadKey,
  onSelect,
  onNew,
}: Props) {
  const navigate = useNavigate();
  const fetchList = useServerFn(listConversations);
  const fetchProfile = useServerFn(getProfile);
  const saveProfile = useServerFn(updateProfile);
  const removeConversation = useServerFn(deleteConversation);

  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null }>(
    { display_name: null, avatar_url: null },
  );
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatar, setDraftAvatar] = useState("");

  const load = useCallback(async () => {
    if (!signedIn) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const [list, prof] = await Promise.all([fetchList({}), fetchProfile({})]);
      setItems(list);
      setProfile(prof);
    } catch {
      /* stays empty */
    } finally {
      setLoading(false);
    }
  }, [signedIn, fetchList, fetchProfile]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  const onDelete = async (id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id));
    try {
      await removeConversation({ data: { id } });
    } catch {
      void load();
    }
    if (currentId === id) onNew();
  };

  const onSaveProfile = async () => {
    const next = { display_name: draftName.trim(), avatar_url: draftAvatar.trim() };
    setProfile({ display_name: next.display_name, avatar_url: next.avatar_url || null });
    setEditing(false);
    try {
      await saveProfile({ data: next });
    } catch {
      void load();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    onNew();
    void navigate({ to: "/auth", replace: true });
  };

  const initials = (profile.display_name ?? email ?? "?").trim().slice(0, 1).toUpperCase();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close history panel"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/" className="font-serif text-lg font-medium text-foreground">
            Evidence
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={() => {
              onNew();
              onClose();
            }}
            className="inline-flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" /> New question
          </button>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
          <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <History className="size-3.5" /> History
          </p>

          {!signedIn ? (
            <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
              <Link to="/auth" className="font-medium text-primary hover:underline">
                Create a free account
              </Link>{" "}
              to save your questions and answers.
            </p>
          ) : loading ? (
            <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-1 text-sm text-muted-foreground">No saved questions yet.</p>
          ) : (
            <ul className="-mr-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
              {items.map((c) => (
                <li key={c.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(c.id);
                      onClose();
                    }}
                    className={cn(
                      "min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                      currentId === c.id && "bg-secondary font-medium text-foreground",
                    )}
                    title={c.title}
                  >
                    {c.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(c.id)}
                    aria-label={`Delete ${c.title}`}
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t p-3">
          {!signedIn ? (
            <Link
              to="/auth"
              className="inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Sign in
            </Link>
          ) : editing ? (
            <div className="space-y-2">
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Display name"
                className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={draftAvatar}
                onChange={(e) => setDraftAvatar(e.target.value)}
                placeholder="Avatar image URL"
                className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void onSaveProfile()}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-1.5 text-sm font-medium text-primary-foreground"
                >
                  <Check className="size-3.5" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border px-2.5 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="size-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-medium text-primary-foreground">
                  {initials}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {profile.display_name ?? "Your account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
              <button
                type="button"
                aria-label="Edit profile"
                onClick={() => {
                  setDraftName(profile.display_name ?? "");
                  setDraftAvatar(profile.avatar_url ?? "");
                  setEditing(true);
                }}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Sign out"
                onClick={() => void signOut()}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
