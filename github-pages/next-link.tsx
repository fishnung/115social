import type { AnchorHTMLAttributes, ReactNode } from "react";

const repoBase = "/115social";

function pageHref(href: string) {
  if (!href.startsWith("/") || href.startsWith(repoBase)) return href;
  return href === "/" ? `${repoBase}/unit1/` : `${repoBase}${href}/`;
}

export default function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return <a href={pageHref(href)} {...props}>{children}</a>;
}
