# OpenAI Compatible Fortune Endpoint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Nuxt server endpoint compatible with `POST /v1/chat/completions` that does MySQL cache lookup first, then OpenAI fallback with Nayin-based prompt, and persists fallback results.

**Architecture:** Keep HTTP parsing/response formatting inside one route and split business logic into `service`, `repository`, `provider`, and `prompt` utilities. Repository handles MySQL `fortune_cache`; provider calls OpenAI Chat Completions API via `fetch`; service orchestrates lookup-hit/miss flow and returns a normalized payload for route formatting.

**Tech Stack:** Nuxt 4 server routes (Nitro/h3), Node.js, mysql2/promise, built-in fetch, existing Nayin utilities, node:test.

---

### Task 1: Add failing tests for cache flow and OpenAI-compatible response

**Files:**
- Create: `tests/fortune-service.test.mjs`
- Create: `tests/openai-shape.test.mjs`

**Step 1: Write the failing test**
- Add tests for:
  - cache hit should return DB response and not call OpenAI.
  - cache miss should call OpenAI and then persist.
  - completion formatter should return `id/object/created/model/choices/usage`.

**Step 2: Run test to verify it fails**

Run: `node --test tests/fortune-service.test.mjs tests/openai-shape.test.mjs`  
Expected: FAIL because service/formatter modules do not exist.

**Step 3: Write minimal implementation**
- Add service and formatter modules with minimal API to satisfy tests.

**Step 4: Run test to verify it passes**

Run: `node --test tests/fortune-service.test.mjs tests/openai-shape.test.mjs`  
Expected: PASS.

### Task 2: Implement MySQL repository, prompt builder, and OpenAI provider

**Files:**
- Create: `server/utils/fortune/repository.js`
- Create: `server/utils/fortune/prompt.js`
- Create: `server/utils/fortune/provider.js`
- Modify: `.env`

**Step 1: Write the failing test**
- Extend service tests to validate prompt input includes Nayin result and mode/year.

**Step 2: Run test to verify it fails**

Run: `node --test tests/fortune-service.test.mjs`  
Expected: FAIL on missing prompt/provider wiring.

**Step 3: Write minimal implementation**
- Repository methods: `findByCacheKey`, `saveCache`.
- Prompt builder: produces system + user messages with two-stage template fields.
- Provider: calls OpenAI API with `OPENAI_API_KEY` and configurable model.

**Step 4: Run test to verify it passes**

Run: `node --test tests/fortune-service.test.mjs`  
Expected: PASS.

### Task 3: Add API route and integrate runtime config

**Files:**
- Create: `server/api/v1/chat/completions.post.js`
- Modify: `nuxt.config.ts`
- Modify: `package.json`
- Modify: `tests/openai-shape.test.mjs`

**Step 1: Write the failing test**
- Add formatter/route input tests for missing messages, invalid mode, and success response shape.

**Step 2: Run test to verify it fails**

Run: `node --test tests/openai-shape.test.mjs`  
Expected: FAIL.

**Step 3: Write minimal implementation**
- Parse OpenAI-like request.
- Generate cache key.
- Execute cache-first flow.
- Return OpenAI-compatible chat completion response.

**Step 4: Run test to verify it passes**

Run: `node --test tests/openai-shape.test.mjs`  
Expected: PASS.

### Task 4: Verify full test suite

**Files:**
- Modify: none

**Step 1: Run targeted tests**

Run: `node --test tests/fortune-service.test.mjs tests/openai-shape.test.mjs`  
Expected: PASS.

**Step 2: Run project test suite**

Run: `npm test`  
Expected: PASS on all existing and new tests.
