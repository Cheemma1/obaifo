import { AuthorsList } from "@/features/authors/authors-view";
import { getPageI18n, metaT } from "@/i18n/server";
import { Footer } from "@/shared/layout/footer";
import { PageHeader } from "@/shared/ui/primitives";
import { Rich } from "@/shared/ui/rich";

export const metadata = { title: metaT.authors.metaTitle };

export default async function AuthorsPage({ params }: PageProps<"/[lang]/authors">) {
  const { t } = await getPageI18n(params);
  return (
    <>
      <main>
        <PageHeader title={<Rich parts={t.authors.title} />}>
          {t.authors.intro}
        </PageHeader>
        <AuthorsList />
      </main>
      <Footer />
    </>
  );
}
