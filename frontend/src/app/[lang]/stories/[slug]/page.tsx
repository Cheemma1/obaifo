import { Suspense } from "react";
import { WorkDetailView } from "@/features/works/work-detail";
import { Footer } from "@/shared/layout/footer";

export default function StoryPage() {
  return (
    <>
      <main>
        <Suspense fallback={<div className="min-h-svh" />}>
          <WorkDetailView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
