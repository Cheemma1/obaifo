import { Suspense } from "react";
import { ReaderView } from "@/features/reader/reader-view";

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-[#f4eee2]" />}>
      <ReaderView />
    </Suspense>
  );
}
