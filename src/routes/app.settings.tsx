import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, updateProfile } from "@/lib/history.functions";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Evidence" },
      { name: "description", content: "Manage your Evidence account, password, profile and research preferences." },
      { property: "og:title", content: "Settings — Evidence" },
      { property: "og:description", content: "Manage your Evidence account, password, profile and research preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const MIN_PASSWORD = 6;

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-8 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="font-serif text-xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="max-w-lg">{children}</div>
    </section>
  );
}

function SettingsPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const get = useServerFn(getProfile);
  const save = useServerFn(updateProfile);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!session) return;
    get({})
      .then((p) => {
        setName(p.display_name ?? "");
        setAvatar(p.avatar_url ?? "");
      })
      .catch(() => {});
  }, [get, session]);

  if (loading) return <div className="mx-auto max-w-3xl px-5 py-10 text-sm text-muted-foreground">Loading…</div>;

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="mt-4 text-muted-foreground">Sign in to manage your account.</p>
        <Button asChild className="mt-6">
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  const submitProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await save({ data: { display_name: name, avatar_url: avatar } });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setPasswordError(`Use at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setPasswordError("Passwords do not match.");
    setPasswordError("");
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Password updated successfully");
  };

  const signOutEverywhere = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out of all devices");
    void navigate({ to: "/sign-in", replace: true });
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <p className="meta-label text-primary">Account</p>
      <h1 className="mt-3 font-serif text-4xl">Settings</h1>

      <div className="mt-10">
        <Section title="Account" description="The email you sign in with.">
          <span className="meta-label mb-2 block">Email</span>
          <p className="border bg-surface-muted px-3 py-2 text-sm">{session.user.email}</p>
        </Section>

        <Section title="Change password" description={`At least ${MIN_PASSWORD} characters.`}>
          <form onSubmit={submitPassword} className="space-y-4">
            <label className="block">
              <span className="meta-label mb-2 block">New password</span>
              <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="block">
              <span className="meta-label mb-2 block">Confirm password</span>
              <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
            <Button disabled={savingPassword || !password}>{savingPassword ? "Updating…" : "Update password"}</Button>
          </form>
        </Section>

        <Section title="Profile & preferences">
          <form onSubmit={submitProfile} className="space-y-6">
            <label className="block">
              <span className="meta-label mb-2 block">Display name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="meta-label mb-2 block">Avatar image URL</span>
              <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
            </label>
            <div className="border-y py-5">
              <p className="font-medium">Research preferences</p>
              <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked />Prioritize peer-reviewed literature</label>
              <label className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" defaultChecked />Show exact evidence passages</label>
            </div>
            <Button disabled={savingProfile}>{savingProfile ? "Saving…" : "Save settings"}</Button>
          </form>
        </Section>

        <Section title="Danger zone" description="Ends every active session, including this one.">
          <Button type="button" variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/5" onClick={() => void signOutEverywhere()}>
            Sign out of all devices
          </Button>
        </Section>
      </div>
    </div>
  );
}
