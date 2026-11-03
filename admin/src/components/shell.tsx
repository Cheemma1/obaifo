"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ApiError } from "@/lib/api";
import { num, SITE_URL } from "@/lib/format";
import { useLive, useLogout, useSession } from "@/lib/queries";
import { ReadingNow } from "./reading-now";
import { Button, cn } from "./ui";
import { UliMark, UliSnake } from "./uli";

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        refetchOnWindowFocus: true,
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(makeClient);
  return (
    <QueryClientProvider client={client}>
      <Gate>{children}</Gate>
    </QueryClientProvider>
  );
}

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/live", label: "Live readers" },
  { href: "/users", label: "Users" },
  { href: "/tales", label: "Tales" },
  { href: "/comments", label: "Comments" },
  { href: "/donations", label: "Donations" },
];

/** Everything except /login needs a signed-in admin. */
function Gate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading, error } = useSession();
  const logout = useLogout();
  const user = data?.user;
  const onLogin = pathname === "/login";

  useEffect(() => {
    if (!isLoading && !user && !onLogin) router.replace("/login");
  }, [isLoading, user, onLogin, router]);

  if (onLogin) return <>{children}</>;
  if (error) return <Centered title="The API can't be reached">Start the backend (npm run dev in backend/), then reload this page.</Centered>;
  if (isLoading || !user) return <Centered title="Loading…" />;
  if (!user.isAdmin) {
    return (
      <Centered title={`${user.email} isn't an admin`}>
        <p>
          An admin can grant access with <code className="text-nzu">npm run admin:grant -- {user.email}</code> in the backend.
        </p>
        <Button className="mt-5 bg-nzu text-char" onClick={() => logout.mutate()}>
          Sign out
        </Button>
      </Centered>
    );
  }

  // The live page already shows everyone, so it doesn't repeat the strip.
  const showStrip = pathname !== "/live";

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14.5rem_minmax(0,1fr)]">
      <Rail pathname={pathname} name={user.name} email={user.email} onSignOut={() => logout.mutate()} />
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8 xl:px-10">
        {showStrip && <LiveStrip />}
        {children}
      </main>
    </div>
  );
}

function Rail({ pathname, name, email, onSignOut }: { pathname: string; name: string; email: string; onSignOut: () => void }) {
  return (
    <aside className="on-char sticky top-0 z-20 bg-char text-nzu md:h-dvh">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 md:px-5 md:pt-6 md:pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <UliMark className="size-7 text-nzu" />
            <span className="narrow text-2xl leading-none font-extrabold">Ọbaifo</span>
            <span className="bg-nzu/12 px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wide text-nzu uppercase">Admin</span>
          </Link>
          <button onClick={onSignOut} className="text-xs font-semibold text-muted-dark underline underline-offset-2 hover:text-nzu md:hidden">
            Sign out
          </button>
        </div>

        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 md:py-2",
                  active ? "bg-ochre text-char" : "text-muted-dark hover:bg-nzu hover:text-char",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden px-5 pb-5 md:block">
          <UliSnake className="mb-4 h-4 w-full text-nzu/30" />
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-muted-dark">{email}</div>
          <div className="mt-3 flex gap-4 text-xs font-semibold">
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="text-muted-dark underline underline-offset-2 hover:text-nzu">
              Open site
            </a>
            <button onClick={onSignOut} className="text-muted-dark underline underline-offset-2 hover:text-nzu">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** A slim live count above every page; it opens in place to show who is reading. */
function LiveStrip() {
  const { data } = useLive();
  const [open, setOpen] = useState(false);
  return (
    <div className="-mt-2 mb-6 border-b-2 border-char">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 py-3 text-left text-sm transition-colors hover:text-earth-deep"
      >
        <span className="live-dot" aria-hidden />
        <span>
          <strong>{data ? num(data.online) : "–"}</strong> online · <strong>{data ? num(data.reading) : "–"}</strong> reading now
        </span>
        <span className="ml-auto text-xs font-semibold text-char-soft">{open ? "Hide" : "Show who"}</span>
        <svg viewBox="0 0 12 12" className={cn("size-3 transition-transform duration-200", open && "rotate-180")} aria-hidden>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" />
        </svg>
      </button>
      {open && (
        <div className="bg-nzu-deep px-4 py-5">
          <ReadingNow />
        </div>
      )}
    </div>
  );
}

function Centered({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-char px-4 text-center text-sm text-muted-dark">
      <UliMark className="mb-5 size-10 text-nzu" />
      <h1 className="narrow text-2xl font-extrabold text-nzu">{title}</h1>
      {children && <div className="mt-2 max-w-md leading-relaxed">{children}</div>}
    </div>
  );
}
