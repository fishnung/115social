# 115 社會自主學習網

提供國小五年級社會自學課程的公開網站，包含知識卡、互動探究、證據挑戰、單元測驗、學習回饋與圖片證書。

## 學生網址

[https://fishnung.github.io/115social/](https://fishnung.github.io/115social/)

- 課程入口：網站首頁（`/courses/` 也可使用）
- 第一單元：`/unit1/`
- 第二單元：`/unit2/`
- 六年級：預留入口，課程尚未開始製作

## 自動發布方式

`main` 分支有新版本時，GitHub Actions 會自動建立並發布 GitHub Pages。日後修改網站，只要把完成的程式推送到這個儲存庫即可，不必再另外同步學生網站。

發布設定位於 `.github/workflows/pages.yml`，GitHub Pages 專用靜態入口位於 `github-pages/`。第一、二單元仍共用 `app/` 內的課程原始碼，因此不會形成兩套需要分別維護的教材。

## 本機指令

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run build:pages
```

- `pnpm run build`：檢查原本的 Sites 版本。
- `pnpm run build:pages`：建立 GitHub Pages 靜態版本到 `dist/pages`。

學生學習進度只儲存在使用者目前的瀏覽器裝置，不會上傳姓名、作答或其他個人資料。
