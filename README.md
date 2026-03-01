# Wind Water (Nuxt 4)

納音五行計算工具，使用 Nuxt 4 + Vue 3。

## OpenAI-Compatible API（含第三方供應商）

已提供 `POST /v1/chat/completions` endpoint，流程為：
1. 先以「五行指紋」查 MySQL 快取
2. 命中則直接回傳
3. 未命中才呼叫 OpenAI-compatible 供應商
4. 回傳結果並寫回 MySQL

### 1. 環境變數（`.env`）

```bash
OPENAI_API_KEY=your_provider_key
OPENAI_BASE_URL=https://your-openai-compatible-provider/v1
OPENAI_MODEL=gpt-4.1-mini
OPENAI_FALLBACK_MODELS=model-b,model-c
DEBUG_FORTUNE=false
NUXT_PUBLIC_DEBUG_FORTUNE=false

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=wind_water
```

`OPENAI_BASE_URL` 可指向任何 OpenAI-compatible 第三方服務，不限定官方 OpenAI。
`OPENAI_FALLBACK_MODELS` 用逗號分隔，主模型 429 時會依序嘗試備援模型。若為空，代表不啟用 fallback。
`DEBUG_FORTUNE` 與 `NUXT_PUBLIC_DEBUG_FORTUNE` 設為 `true` 可開啟後端與前端 debug log。

### 2. 建立快取資料表（MySQL）

```bash
mysql -u <user> -p <database> < docs/sql/fortune_cache.sql
```

或手動執行 [docs/sql/fortune_cache.sql](docs/sql/fortune_cache.sql) 內容。

### 3. 請求範例

使用五行直接查（最省 token / 最容易命中）：

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model":"gpt-4.1-mini",
    "messages":[{"role":"user","content":"請幫我看今年事業與財運"}],
    "metadata":{
      "mode":"year",
      "year":2026,
      "five_elements":{"wood":1,"fire":0,"earth":2,"metal":1,"water":0}
    }
  }'
```

也可傳出生資料（系統先換算納音五行，再做同一套快取）：

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model":"gpt-4.1-mini",
    "messages":[{"role":"user","content":"請幫我看一生運程"}],
    "metadata":{
      "mode":"life",
      "birth":{"date":"1990-06-15","time":"12:00","timezone":"Asia/Taipei"}
    }
  }'
```

## 本機開發

安裝相依套件：

```bash
npm install
```

啟動開發伺服器（預設 `http://localhost:3000`）：

```bash
npm run dev
```

執行測試：

```bash
npm test
```

建置 production：

```bash
npm run build
```

本機預覽 production：

```bash
npm run preview
```

## Deploy 到 CapRover

下面是最穩定的方式：讓 CapRover 用 Dockerfile 建置並啟動 Nuxt Nitro server。

### 1. 先在專案根目錄新增 `captain-definition`

```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### 2. 新增 `Dockerfile`（多階段建置）

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV PORT=3000

COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 3. 在 CapRover Dashboard 建 App

1. 進 CapRover 後台，建立一個新 app（例如 `wind-water`）。
2. 到 app 設定確認 `Container HTTP Port` 是 `3000`。
3. 需要對外時，幫 app 綁網域並啟用 HTTPS。

### 4. 部署（推薦用 CapRover CLI）

安裝 CLI（一次即可）：

```bash
npm i -g caprover
```

登入：

```bash
caprover login
```

在專案根目錄部署：

```bash
caprover deploy
```

CLI 會詢問 `caprover URL / app name / branch`，照提示選你的 app 即可。

### 5. 環境變數建議

在 CapRover app 的 `App Configs -> Environmental Variables` 設定：

```bash
NODE_ENV=production
NITRO_HOST=0.0.0.0
NITRO_PORT=3000
TZ=Asia/Taipei
```

### 6. 常見問題

1. 開啟後 502：通常是 `Container HTTP Port` 不是 `3000`，或 app 沒有綁 `0.0.0.0`。
2. Build 失敗：先本機跑 `npm run build`，確認程式本身可建置。
3. 時區不對：在 CapRover 設 `TZ`（例如 `Asia/Taipei`）。
