import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(projectDir, "dist/pages");

export default defineConfig({
  root: path.join(projectDir, "github-pages"),
  base: "/115social/",
  publicDir: path.join(projectDir, "public"),
  resolve: {
    alias: {
      "next/image": path.join(projectDir, "github-pages/next-image.tsx"),
      "next/link": path.join(projectDir, "github-pages/next-link.tsx"),
    },
  },
  define: {
    "process.env.NEXT_PUBLIC_BASE_PATH": JSON.stringify("/115social"),
  },
  plugins: [
    react(),
    {
      name: "github-pages-route-copies",
      closeBundle() {
        const source = path.join(outputDir, "index.html");
        for (const route of ["courses", "unit1", "unit2", "grade6/unit1"]) {
          const routeDir = path.join(outputDir, route);
          mkdirSync(routeDir, { recursive: true });
          copyFileSync(source, path.join(routeDir, "index.html"));
        }
        copyFileSync(source, path.join(outputDir, "404.html"));
      },
    },
  ],
  build: {
    outDir: outputDir,
    emptyOutDir: true,
  },
});
