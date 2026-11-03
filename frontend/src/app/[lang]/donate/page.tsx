import { DonateForm } from "@/features/donations/donate-form";
import { getPageI18n, metaT } from "@/i18n/server";
import { Footer } from "@/shared/layout/footer";
import { PageHeader } from "@/shared/ui/primitives";
import { Rich } from "@/shared/ui/rich";

export const metadata = { title: metaT.donate.metaTitle };

export default async function DonatePage({
  params,
}: PageProps<"/[lang]/donate">) {
  const { t } = await getPageI18n(params);
  return (
    <>
      <main>
        <PageHeader title={<Rich parts={t.donate.title} />}>
          {t.donate.intro}
        </PageHeader>
        <div className="px-5 pb-28 pt-12 md:px-10 md:pt-16">
          <div className="mx-auto max-w-[90rem]">
            <div className="max-w-md">
              <DonateForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
