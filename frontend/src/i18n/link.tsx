"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./provider";

/** Drop-in for next/link that keeps the visitor in their chosen language. */
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { href: localize } = useI18n();
  return (
    <NextLink
      href={typeof href === "string" ? localize(href) : href}
      {...props}
    />
  );
}

export default Link;
