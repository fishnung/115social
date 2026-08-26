import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "臺灣登上國際舞臺｜臺灣時空探險隊",
  description: "探索大航海時代的航運、貿易、族群互動與文化影響，完成互動任務與單元挑戰。",
};

export default function Unit2Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
