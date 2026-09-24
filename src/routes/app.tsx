import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Workspace — Evidence" },
      { name: "description", content: "Your Evidence research workspace: search, results, library, and history." },
      { property: "og:title", content: "Workspace — Evidence" },
      { property: "og:description", content: "Your Evidence research workspace." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <AppShell><Outlet /></AppShell> });
