import { AccountView } from "@/features/account/account-view";
import { getPageI18n, metaT } from "@/i18n/server";
import { Footer } from "@/shared/layout/footer";
import { PageHeader } from "@/shared/ui/primitives";
import { Rich } from "@/shared/ui/rich";

export const metadata = { title: metaT.account.metaTitle };

export default async function AccountPage({ params }: PageProps<"/[lang]/account">) {
  const { t } = await getPageI18n(params);
  return (
    <>
      <main>
        <PageHeader title={<Rich parts={t.account.title} />}>{t.account.intro}</PageHeader>
        <AccountView />
      </main>
      <Footer />
    </>
  );
}
