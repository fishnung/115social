import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

async function renderPath(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("公開首頁可回應且具有正式課程資訊", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /臺灣時空探險隊/);
  assert.match(html, /臺灣的位置/);
  assert.match(html, /史前/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
  assert.match(html, /lang="zh-Hant-TW"/);
});

test("課程結構包含必要任務、測驗與證書", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /海島導航站/);
  assert.match(page, /地下證據室/);
  assert.match(page, /山海共生議會/);
  assert.equal((page.match(/concept: "/g) ?? []).length, 15);
  assert.match(page, /quizBest >= 80/);
  assert.match(page, /application\/pdf/);
  assert.match(page, /localStorage/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /focus-visible/);
});

test("第二單元包含兩課、探究任務、測驗與證書", async () => {
  const response = await renderPath("/unit2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /臺灣登上國際舞臺/);
  assert.match(html, /東亞航海指揮所/);
  assert.match(html, /歷史足跡調查局/);
  const page = await readFile(new URL("../app/unit2/page.tsx", import.meta.url), "utf8");
  assert.equal((page.match(/concept: "/g) ?? []).length, 15);
  assert.match(page, /大肚王國/);
  assert.match(page, /quizBest>=80/);
  assert.match(page, /application\/pdf/);
  assert.match(page, /localStorage/);
});
