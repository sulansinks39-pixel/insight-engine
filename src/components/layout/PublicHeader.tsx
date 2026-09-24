import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
const links = [{to:"/about",label:"About"}] as const;
export function PublicHeader() {
  const [open,setOpen]=useState(false);
  return <header className="border-b bg-background/95"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
    <Link to="/" className="font-serif text-2xl font-semibold">Evidence</Link>
    <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">{links.map(l=><Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground">{l.label}</Link>)}</nav>
    <div className="hidden items-center gap-2 md:flex"><Button asChild variant="ghost"><Link to="/sign-in">Sign in</Link></Button><Button asChild><Link to="/app">Get started</Link></Button></div>
    <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu/></Button></SheetTrigger><SheetContent side="right" className="w-72"><SheetTitle className="font-serif">Evidence</SheetTitle><nav className="mt-8 grid gap-1">{links.map(l=><Link key={l.to} to={l.to} onClick={()=>setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">{l.label}</Link>)}<Link to="/sign-in" onClick={()=>setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">Sign in</Link><Button asChild className="mt-3"><Link to="/app">Get started</Link></Button></nav></SheetContent></Sheet>
  </div></header>;
}
