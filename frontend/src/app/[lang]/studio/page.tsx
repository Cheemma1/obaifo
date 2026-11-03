import { StudioDashboard } from "@/features/studio/studio-dashboard";
import { getPageI18n, metaT } from "@/i18n/server";
import { PageHeader } from "@/shared/ui/primitives";
import { Rich } from "@/shared/ui/rich";

export const metadata = { title: metaT.studio.metaTitle };

export default async function StudioPage({
  params,
}: PageProps<"/[lang]/studio">) {
  const { t } = await getPageI18n(params);
  return (
    <main>
      <PageHeader title={<Rich parts={t.studio.title} />} />
      <StudioDashboard />
    </main>
  );
}
