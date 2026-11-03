import { Suspense } from "react";
import { EditWorkEditor } from "@/features/studio/work-editor";

export default function EditWorkPage() {
  return (
    <main>
      <Suspense fallback={<div className="min-h-svh" />}>
        <EditWorkEditor />
      </Suspense>
    </main>
  );
}
