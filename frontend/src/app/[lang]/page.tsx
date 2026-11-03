import { Featured } from "@/features/home/featured";
import { ForAuthors } from "@/features/home/for-authors";
import { Hero } from "@/features/home/hero";
import { Kinds } from "@/features/home/kinds";
import { Mission } from "@/features/home/mission";
import { ShortReads } from "@/features/home/short-reads";
import { Footer } from "@/shared/layout/footer";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Kinds />
        <ShortReads />
        <Featured />
        <Mission />
        <ForAuthors />
      </main>
      <Footer />
    </>
  );
}
