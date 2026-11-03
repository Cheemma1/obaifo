import { Suspense } from "react";
import { LoginForm } from "@/features/auth/auth-form";
import { AuthShell } from "@/features/auth/auth-shell";
import { getPageI18n, metaT } from "@/i18n/server";

export const metadata = { title: metaT.auth.login.metaTitle };

export default async function LoginPage({ params }: PageProps<"/[lang]/login">) {
  const { t } = await getPageI18n(params);
  return (
    <AuthShell title={t.auth.login.title} proverb={t.auth.login.proverb} gloss={t.auth.login.gloss}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
