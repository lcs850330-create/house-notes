# 🏡 看房筆記 Pro

智能看房筆記工具，支援租屋 / 買屋雙模式。

## 功能

- 📋 **看房筆記** — 填寫物件資訊、星評、優缺點標籤、備忘
- ⚖️ **比較表格** — 最多同時比較 10 間物件，自動評分排名
- 🎯 **評分系統** — 分項進度條、雷達圖、加權評分、排行榜
- 🤖 **AI 智能分析** — 串接 Claude API，給出比價建議與出價策略
- 💾 **自動儲存** — 資料存於 localStorage，關閉不消失
- 📄 **匯出 PDF** — 一鍵生成完整看房報告

---

## 本地開發

```bash
npm install
npm run dev
```

開啟 http://localhost:5173

## 部署到 Vercel（免費，5 分鐘完成）

### 方法一：GitHub + Vercel（推薦）

1. 在 GitHub 建立新 repo，把這個資料夾推上去：
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git remote add origin https://github.com/你的帳號/house-notes.git
   git push -u origin main
   ```

2. 前往 https://vercel.com → Import Project → 選擇剛才的 repo

3. Framework Preset 選 **Vite** → Deploy

4. 幾秒後得到公開網址，例如 `https://house-notes.vercel.app`

### 方法二：Vercel CLI

```bash
npm install -g vercel
vercel
```

依照提示操作，完成後得到公開網址。

---

## AI 分析說明

AI 分析功能透過 Anthropic API 運作。部署後任何人開啟網址即可使用，API 費用由呼叫端承擔（即你的 Anthropic 帳號）。

若要限制使用或收費，可在 Vercel 環境變數加入 `VITE_REQUIRE_KEY=true` 並在前端加入 API Key 輸入欄位。

---

## 販售建議

- **Gumroad**：上傳此 ZIP，定價 NT$149–299
- **說明文案**：強調「不需安裝、開啟即用、AI 分析、自動儲存」
- **推廣**：PTT home-sale / rent 板、Dcard 租屋版、FB 買房社團
