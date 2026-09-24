import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookMarked,
  ChevronsUpDown,
  Clock3,
  Compass,
  Cookie,
  FileText,
  FolderClosed,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Settings,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const sections = [
  { title: "History", items: [{ to: "/app/history", label: "History", icon: Clock3 }] },
  {
    title: "Library",
    items: [
      { to: "/app/library", label: "Saved papers", icon: BookMarked },
      { to: "/app/library", label: "Collections", icon: FolderClosed },
    ],
  },
  {
    title: "Discover",
    items: [
      { to: "/app/topics", label: "Topics", icon: Compass },
      { to: "/app/topics", label: "Research trends", icon: TrendingUp },
    ],
  },
] as const;

function Avatar({ email }: { email: string | null }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
      {(email ?? "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

/** Account dropdown: email, settings, legal links, log out. */
function AccountMenu({ variant, onNavigate }: { variant: "row" | "icon"; onNavigate?: (() => void) | undefined }) {
  const { session } = useAuth();
  const navigate = useNavigate();
  const email = session?.user.email ?? null;

  if (!session) {
    return variant === "row" ? (
      <Button asChild variant="outline" className="w-full">
        <Link to="/sign-in" onClick={onNavigate}>
          <LogIn />
          Sign in
        </Link>
      </Button>
    ) : (
      <Button asChild variant="ghost" size="sm">
        <Link to="/sign-in">Sign in</Link>
      </Button>
    );
  }

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    onNavigate?.();
    void navigate({ to: "/sign-in", replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "row" ? (
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-md p-2 text-left hover:bg-sidebar-accent"
          >
            <Avatar email={email} />
            <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
            <ChevronsUpDown className="size-4 text-muted-foreground" />
          </button>
        ) : (
          <button type="button" aria-label="Account menu" className="rounded-full">
            <Avatar email={email} />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "row" ? "start" : "end"} side={variant === "row" ? "top" : "bottom"} className="w-60">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/app/settings" onClick={onNavigate}>
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/privacy">
            <Shield />
            Privacy policy
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/terms">
            <FileText />
            Terms of service
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cookies">
            <Cookie />
            Cookie preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logOut()}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Sidebar({ close }: { close?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col bg-sidebar p-3">
      <Button asChild className="w-full justify-start">
        <Link to="/app" onClick={close}>
          <Plus />
          New search
        </Link>
      </Button>
      <nav className="mt-6 flex-1 space-y-5 overflow-y-auto" aria-label="Workspace">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="meta-label px-2 pb-1">{section.title}</p>
            {section.items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={close}
                className={cn("sidebar-link", path === item.to && "sidebar-link-active")}
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t pt-3">
        <AccountMenu variant="row" onNavigate={close} />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed inset-x-0 top-0 z-40 flex h-15 items-center gap-3 border-b bg-background px-4 lg:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open sidebar">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
            <Sidebar close={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link to="/app" className="font-serif text-xl font-semibold">
          Evidence
        </Link>
        <div className="ml-auto">
          <AccountMenu variant="icon" />
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 top-15 hidden w-60 border-r lg:block">
        <Sidebar />
      </aside>
      <main className="pt-15 lg:pl-60">{children}</main>
    </div>
  );
}
