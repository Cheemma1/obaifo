import { Suspense } from "react";
import { AuthorProfile } from "@/features/authors/authors-view";
import { Footer } from "@/shared/layout/footer";

export default function AuthorPage() {
  return (
    <>
      <main>
        <Suspense fallback={<div className="min-h-svh" />}>
          <AuthorProfile />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
