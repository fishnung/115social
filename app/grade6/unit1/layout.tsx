import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "消費選擇與理財規劃｜六年級社會自主學習",
  description: "從消費判斷、權益安全與環境責任，學習儲蓄規畫、理財工具及風險評估。",
};

export default function Grade6Unit1Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
