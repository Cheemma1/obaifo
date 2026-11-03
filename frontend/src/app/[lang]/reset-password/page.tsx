import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { ResetPasswordForm } from "@/features/auth/password-reset";
import { getPageI18n, metaT } from "@/i18n/server";

export const metadata = { title: metaT.auth.reset.resetTitle, robots: { index: false } };

export default async function ResetPasswordPage({ params }: PageProps<"/[lang]/reset-password">) {
  const { t } = await getPageI18n(params);
  const r = t.auth.reset;
  return (
    <AuthShell title={r.resetTitle} proverb={r.proverb} gloss={r.gloss}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
