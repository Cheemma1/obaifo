"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type SubmitEvent } from "react";
import { Button, ErrorBox, Input } from "@/components/ui";
import { UliMark, UliSnake } from "@/components/uli";
import { useLogin, useLogout, useSession } from "@/lib/queries";

export default function LoginPage() {
  const router = useRouter();
  const { data } = useSession();
  const login = useLogin();
  const logout = useLogout();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const user = data?.user;

  useEffect(() => {
    if (user?.isAdmin) router.replace("/");
  }, [user, router]);

  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="on-char flex min-h-dvh flex-col items-center justify-center bg-char px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 text-nzu">
          <UliMark className="size-9" />
          <span className="narrow text-4xl leading-none font-extrabold">Ọbaifo</span>
        </div>
        <UliSnake className="mt-4 mb-6 h-4 w-full text-nzu/30" />

        <form onSubmit={submit} className="border-t-4 border-earth bg-nzu p-6 text-char sm:p-7">
          <h1 className="narrow text-2xl leading-none font-extrabold">Admin sign-in</h1>
          <p className="mt-2 text-sm text-char-soft">Use your normal Ọbaifo account. It has to be made an admin first.</p>

          {user && !user.isAdmin && (
            <div className="mt-5 border-2 border-earth bg-earth/10 px-4 py-3 text-sm text-earth-deep">
              {user.email} is signed in but isn&apos;t an admin.{" "}
              <button type="button" className="font-semibold underline" onClick={() => logout.mutate()}>
                Sign out
              </button>
            </div>
          )}

          <label className="mt-6 block text-sm font-semibold">
            Email
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full" />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Password
            <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full" />
          </label>
          {login.error && (
            <div className="mt-4">
              <ErrorBox error={login.error} />
            </div>
          )}
          <Button type="submit" className="mt-6 h-12 w-full md:h-12" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-muted-dark">
          To grant access, run <code className="text-nzu">npm run admin:grant -- you@example.com</code> in the backend folder.
        </p>
      </div>
    </div>
  );
}
