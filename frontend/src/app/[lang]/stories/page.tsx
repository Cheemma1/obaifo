import { Suspense } from "react";
import { BrowseView } from "@/features/works/browse-view";
import { getPageI18n, metaT } from "@/i18n/server";
import { Footer } from "@/shared/layout/footer";
import { PageHeader } from "@/shared/ui/primitives";
import { Rich } from "@/shared/ui/rich";

export const metadata = { title: metaT.browse.metaTitle };

export default async function StoriesPage({ params }: PageProps<"/[lang]/stories">) {
  const { t } = await getPageI18n(params);
  return (
    <>
      <main>
        <PageHeader title={<Rich parts={t.browse.title} />}>
          {t.browse.intro}
        </PageHeader>
        <Suspense fallback={<div className="h-[60vh]" />}>
          <BrowseView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
