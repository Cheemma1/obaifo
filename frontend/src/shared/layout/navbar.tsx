"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLogout, useSession } from "@/features/auth/api";
import { stripLocale } from "@/i18n/config";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import Link from "@/i18n/link";
import { useI18n, useLocaleRouter } from "@/i18n/provider";
import { cn } from "../lib/cn";
import { Avatar, CloseIcon } from "../ui/primitives";
import { UliMark, UliSnake } from "../ui/uli";

/** The top band of the wall: always earth, always the same, out of the way while reading down. */
export function Navbar() {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const router = useLocaleRouter();
  const { t } = useI18n();
  const { data: session } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (path.startsWith("/read/")) return null;

  const user = session?.user;
  const links = [
    { href: "/stories", label: t.nav.tales },
    { href: "/stories?type=long", label: t.nav.longTales },
    { href: "/authors", label: t.nav.storytellers },
    { href: "/studio/new", label: t.nav.share },
  ];
  const menuLinks = user
    ? [
        ...links,
        { href: "/library", label: t.nav.shelf },
        { href: "/account", label: t.nav.profile },
      ]
    : links;
  const isActive = (href: string) => {
    const [p] = href.split("?");
    return href.includes("?") ? false : path === p || path.startsWith(`${p}/`);
  };

  return (
    <>
      <header
        className={cn(
          "tone-earth sticky top-0 z-50 border-b-4 border-char transition-transform duration-300 ease-[var(--ease-out)]",
          hidden && !open && "-translate-y-full",
        )}
      >
        <nav
          className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-6 px-5 md:px-10"
          aria-label={t.nav.primary}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={t.nav.home}
          >
            {/* <UliMark className="size-7" /> */}
            <span className="text-xl font-extrabold tracking-tight [font-stretch:85%]">
              Ọbaifo
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="block px-3 py-2 text-[0.95rem] font-medium transition-colors hover:bg-nzu hover:text-char aria-[current=page]:bg-ochre aria-[current=page]:text-char"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 text-[0.95rem] font-medium">
            <LanguageSwitcher />
            {user ? (
              <AccountMenu
                user={user}
                onSignOut={() =>
                  logout.mutate(undefined, {
                    onSuccess: () => router.push("/"),
                  })
                }
              />
            ) : (
              <Link
                href="/login"
                className="hidden px-3 py-2 hover:bg-nzu hover:text-char sm:block"
              >
                {t.nav.signIn}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex min-h-11 items-center gap-2 px-2 lg:hidden"
              aria-expanded={open}
              aria-controls="site-menu"
            >
              {open ? (
                <CloseIcon />
              ) : (
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                  <path
                    d="M3 7h18M3 12h18M3 17h12"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  />
                </svg>
              )}
              <span>{open ? t.nav.close : t.nav.menu}</span>
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          id="site-menu"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
          className="tone-earth fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto px-5 pb-10 pt-6 md:px-10 lg:hidden"
        >
          <ul>
            {menuLinks.map((link) => (
              <li key={link.href} className="border-b-2 border-rule">
                <Link
                  href={link.href}
                  className="display block py-4 text-[clamp(2.2rem,9vw,3.5rem)] decoration-4 underline-offset-8 hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-10">
            <UliSnake className="mb-8 h-6 w-full text-nzu/60" />
            <p lang="ig" className="tale text-2xl font-medium">
              “Egbe bere, ugo bere.”
            </p>
            {t.nav.proverbGloss && (
              <p className="mt-1 text-muted">{t.nav.proverbGloss}</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg font-medium">
              {user ? (
                <>
                  <Link href="/account" className="link">
                    {user.name}
                  </Link>
                  {user.role === "author" && (
                    <Link href="/studio" className="link">
                      {t.nav.studio}
                    </Link>
                  )}
                  <button
                    type="button"
                    className="link"
                    onClick={() =>
                      logout.mutate(undefined, {
                        onSuccess: () => {
                          setOpen(false);
                          router.push("/");
                        },
                      })
                    }
                  >
                    {t.nav.signOut}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="link">
                    {t.nav.signIn}
                  </Link>
                  <Link href="/register" className="link">
                    {t.nav.createAccount}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type MenuUser = { name: string; avatarHue: number; role: "reader" | "author" };

/** Desktop account menu: who you are, where your things live, and the way out. */
function AccountMenu({
  user,
  onSignOut,
}: {
  user: MenuUser;
  onSignOut: () => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "block w-full px-4 py-3 text-left font-medium transition-colors hover:bg-ochre";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="account-menu"
        aria-label={t.nav.account}
        className="flex min-h-11 items-center gap-2 px-1 hover:bg-nzu hover:text-char"
      >
        <Avatar
          name={user.name}
          hue={user.avatarHue}
          className="size-8 text-[0.7rem]"
        />
        <span className="max-w-[10rem] truncate">
          {user.name.split(/\s+/)[0]}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={cn("size-3 transition-transform", open && "rotate-180")}
          aria-hidden
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div
          id="account-menu"
          role="menu"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a,button")) setOpen(false);
          }}
          className="absolute right-0 top-full mt-2 w-60 border-4 border-char bg-nzu text-char shadow-[6px_6px_0_var(--color-char)]"
        >
          <p className="truncate border-b-2 border-rule px-4 py-3 text-sm text-char-soft">
            {user.name}
          </p>
          <Link role="menuitem" href="/account" className={item}>
            {t.nav.profile}
          </Link>
          <Link role="menuitem" href="/library" className={item}>
            {t.nav.shelf}
          </Link>
          {user.role === "author" && (
            <Link role="menuitem" href="/studio" className={item}>
              {t.nav.studio}
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={onSignOut}
            className={cn(item, "border-t-2 border-rule")}
          >
            {t.nav.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
