import type { ImgHTMLAttributes } from "react";

const repoBase = "/115social";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  priority?: boolean;
};

export default function Image({ src, priority: _priority, ...props }: ImageProps) {
  const pageSrc = src.startsWith("/") && !src.startsWith(repoBase)
    ? `${repoBase}${src}`
    : src;
  return <img src={pageSrc} {...props} />;
}
