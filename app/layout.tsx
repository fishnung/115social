import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host");
  const protocol = incoming.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  const image = host ? `${protocol}://${host}/og.png` : undefined;
  const title = "臺灣時空探險隊｜五年級社會自學網站";
  const description = "從臺灣的位置、史前文化與原住民族生態智慧，完成互動任務與單元挑戰。";
  return {
    title, description, icons: { icon: "/favicon.svg" },
    openGraph: { title, description, type: "website", locale: "zh_TW", images: image ? [{ url: image, width: 1733, height: 909, alt: "臺灣時空探險隊" }] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant-TW"><body>{children}</body></html>;
}
