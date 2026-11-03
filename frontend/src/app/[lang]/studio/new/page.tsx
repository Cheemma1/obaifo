import { NewWorkEditor } from "@/features/studio/work-editor";
import { metaT } from "@/i18n/server";

export const metadata = { title: metaT.studio.newMetaTitle };

export default function NewWorkPage() {
  return (
    <main>
      <NewWorkEditor />
    </main>
  );
}
