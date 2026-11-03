import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/auth-form";
import { AuthShell } from "@/features/auth/auth-shell";
import { getPageI18n, metaT } from "@/i18n/server";

export const metadata = { title: metaT.auth.register.metaTitle };

export default async function RegisterPage({ params }: PageProps<"/[lang]/register">) {
  const { t } = await getPageI18n(params);
  return (
    <AuthShell title={t.auth.register.title} proverb={t.auth.register.proverb} gloss={t.auth.register.gloss}>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
