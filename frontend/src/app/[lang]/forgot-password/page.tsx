import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/password-reset";
import { getPageI18n, metaT } from "@/i18n/server";

export const metadata = { title: metaT.auth.reset.forgotTitle, robots: { index: false } };

export default async function ForgotPasswordPage({ params }: PageProps<"/[lang]/forgot-password">) {
  const { t } = await getPageI18n(params);
  const r = t.auth.reset;
  return (
    <AuthShell title={r.forgotTitle} proverb={r.proverb} gloss={r.gloss}>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
