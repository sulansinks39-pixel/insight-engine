import type { ReactNode } from "react";
import { CookieBanner } from "./CookieBanner";
import { PublicHeader } from "./PublicHeader";
import { SiteFooter } from "./SiteFooter";
export function PublicPage({eyebrow,title,intro,children}:{eyebrow:string;title:string;intro:string;children:ReactNode}){return <div className="min-h-screen"><PublicHeader/><main><header className="mx-auto max-w-5xl px-5 py-20 lg:px-8"><p className="meta-label text-primary">{eyebrow}</p><h1 className="mt-4 max-w-4xl font-serif text-5xl leading-tight sm:text-6xl">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p></header>{children}</main><SiteFooter/><CookieBanner/></div>}
