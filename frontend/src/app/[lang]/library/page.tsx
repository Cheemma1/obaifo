import { LibraryView } from "@/features/library/library-view";
import { getPageI18n, metaT } from "@/i18n/server";
import { Footer } from "@/shared/layout/footer";
import { PageHeader } from "@/shared/ui/primitives";
import { Rich } from "@/shared/ui/rich";

export const metadata = { title: metaT.library.metaTitle };

export default async function LibraryPage({ params }: PageProps<"/[lang]/library">) {
  const { t } = await getPageI18n(params);
  return (
    <>
      <main>
        <PageHeader title={<Rich parts={t.library.title} />}>
          {t.library.intro}
        </PageHeader>
        <LibraryView />
      </main>
      <Footer />
    </>
  );
}
