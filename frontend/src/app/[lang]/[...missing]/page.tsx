import { notFound } from "next/navigation";

/** Any unknown path under /ig or /en renders the localized 404. */
export default function Missing() {
  notFound();
}
