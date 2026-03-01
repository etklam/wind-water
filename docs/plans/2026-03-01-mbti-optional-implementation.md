# MBTI Optional Field Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an optional MBTI field (strict 16 types) to Step 2 AI fortune flow, include it in prompt variables when provided, and persist it in DB cache scope.

**Architecture:** Extend existing Step 2 form state and payload builder to carry `mbti`, then normalize and validate it in backend service. Persist MBTI in `fortune_cache` scope to ensure cache keys are segmented by personality type. Keep behavior backward compatible by defaulting MBTI to empty string.

**Tech Stack:** Nuxt 3, Vue 3 (`<script setup>`), Node.js test runner (`node:test`), MySQL (`mysql2/promise`)

---

### Task 1: Add frontend payload support for MBTI with strict filtering

**Files:**
- Modify: `app/utils/fortune-request.js`
- Test: `tests/fortune-request.test.mjs`

**Step 1: Write failing tests for MBTI payload behavior**

```js
test('buildFortuneRequestPayload includes valid mbti', () => {
  const payload = buildFortuneRequestPayload({
    totals: { wood: 1, fire: 2, earth: 0, metal: 1, water: 0 },
    gender: 'male',
    mbti: 'intj',
    fortuneType: 'life',
    focusAreas: ['overall']
  })

  assert.equal(payload.metadata.mbti, 'INTJ')
})

test('buildFortuneRequestPayload drops invalid mbti', () => {
  const payload = buildFortuneRequestPayload({
    totals: { wood: 1, fire: 0, earth: 1, metal: 0, water: 1 },
    gender: 'female',
    mbti: 'abcd',
    fortuneType: 'year',
    focusAreas: ['career']
  })

  assert.equal(payload.metadata.mbti, undefined)
})
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/fortune-request.test.mjs`
Expected: FAIL because `metadata.mbti` is not implemented.

**Step 3: Implement minimal payload logic**

```js
const allowedMbti = new Set([
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
])

function normalizeMbti(mbti) {
  const value = String(mbti || '').toUpperCase()
  return allowedMbti.has(value) ? value : ''
}

// inside buildFortuneRequestPayload
const normalizedMbti = normalizeMbti(mbti)
if (normalizedMbti) {
  metadata.mbti = normalizedMbti
}
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/fortune-request.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/fortune-request.test.mjs app/utils/fortune-request.js
git commit -m "feat: add mbti in fortune request payload"
```

### Task 2: Add Step 2 UI searchable MBTI dropdown and i18n copy

**Files:**
- Modify: `app/components/NayinHome.vue`
- Modify: `app/i18n/messages.js`

**Step 1: Write failing UI-oriented assertions via existing payload unit tests (integration by callsite)**

```js
// Add/extend payload test cases asserting mbti is passed from call input.
```

**Step 2: Run targeted tests to confirm expected failure before UI wiring**

Run: `node --test tests/fortune-request.test.mjs`
Expected: FAIL if callsite omits `mbti` argument.

**Step 3: Implement UI control and pass mbti to payload builder**

```vue
<script setup>
const mbti = ref('')
const mbtiOptions = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

// in onFortuneSubmit payload call
const payload = buildFortuneRequestPayload({
  totals: result.value.totals,
  gender: gender.value,
  mbti: mbti.value,
  fortuneType: fortuneType.value,
  focusAreas: [focusArea.value]
})
</script>

<template>
  <label>
    <span>{{ t('fortune.mbti') }}</span>
    <input
      v-model="mbti"
      type="text"
      list="mbti-options"
      :placeholder="t('fortune.mbtiPlaceholder')"
    >
    <datalist id="mbti-options">
      <option v-for="item in mbtiOptions" :key="item" :value="item" />
    </datalist>
  </label>
</template>
```

Add i18n keys:
```js
fortune: {
  mbti: 'MBTI（選填）',
  mbtiPlaceholder: '輸入或選擇 MBTI（如 INTJ）'
}
```

**Step 4: Run app-level checks**

Run: `npm run test:e2e`
Expected: PASS existing flows; no regression in Step 2 submission.

**Step 5: Commit**

```bash
git add app/components/NayinHome.vue app/i18n/messages.js
git commit -m "feat: add searchable optional mbti field in step2 ui"
```

### Task 3: Include MBTI in prompt template when provided

**Files:**
- Modify: `server/utils/fortune/prompt.js`
- Test: `tests/prompt-template.test.mjs`

**Step 1: Write failing tests for MBTI prompt condition**

```js
test('buildFortunePrompt includes mbti when provided', () => {
  const messages = buildFortunePrompt({
    mode: 'life',
    year: 2026,
    profile: { totals: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } },
    gender: 'male',
    mbti: 'INTJ',
    focusAreas: ['career'],
    userMessages: []
  })

  const text = messages.map((m) => m.content).join('\n')
  assert.match(text, /MBTI=INTJ/)
})

test('buildFortunePrompt omits mbti when absent', () => {
  const messages = buildFortunePrompt({
    mode: 'year',
    year: 2026,
    profile: { totals: { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 } },
    gender: 'female',
    focusAreas: ['overall'],
    userMessages: []
  })

  const text = messages.map((m) => m.content).join('\n')
  assert.equal(/MBTI=/.test(text), false)
})
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/prompt-template.test.mjs`
Expected: FAIL because prompt does not include MBTI.

**Step 3: Implement optional MBTI interpolation**

```js
const mbtiText = mbti ? `；MBTI=${mbti}` : ''
{ role: 'system', content: `使用者條件：性別=${genderText}；重點領域=${focusText}${mbtiText}。請在輸出中優先回應這些重點。` }
```

**Step 4: Run test to verify it passes**

Run: `node --test tests/prompt-template.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/prompt-template.test.mjs server/utils/fortune/prompt.js
git commit -m "feat: include optional mbti in fortune prompt conditions"
```

### Task 4: Normalize and propagate MBTI in route/service scope

**Files:**
- Modify: `server/routes/v1/chat/completions.post.js`
- Modify: `server/utils/fortune/service.js`
- Test: `tests/fortune-service.test.mjs`

**Step 1: Write failing tests for MBTI scope/persistence**

```js
// In runFortuneCompletion cache-hit test
assert.deepEqual(lookupArgs.scope, {
  mode: 'year',
  year: 2026,
  gender: 'male',
  mbti: 'INTJ',
  focusArea: 'career'
})

// In cache-miss persistence test
assert.equal(persisted.mbti, 'ENFP')
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/fortune-service.test.mjs`
Expected: FAIL because service scope has no MBTI.

**Step 3: Implement normalization and propagation**

```js
function normalizeMbti(mbti) {
  const allowed = new Set([/* 16 types */])
  const value = String(mbti || '').toUpperCase()
  return allowed.has(value) ? value : ''
}

function normalizeScope({ mode, year, gender, mbti, focusAreas }) {
  return {
    mode: normalizedMode,
    year: normalizedYear,
    gender: normalizeGender(gender),
    mbti: normalizeMbti(mbti),
    focusArea: normalizeFocusAreas(focusAreas).join(',')
  }
}

// pass mbti in buildFortunePrompt and repository.saveCache payload
```

In route handler, read and pass:
```js
const mbti = metadata.mbti || ''
...
const result = await runFortuneCompletion({ ..., gender, mbti, focusAreas, ... })
```

**Step 4: Run tests**

Run: `node --test tests/fortune-service.test.mjs tests/prompt-template.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add server/routes/v1/chat/completions.post.js server/utils/fortune/service.js tests/fortune-service.test.mjs
git commit -m "feat: normalize and propagate mbti through fortune service"
```

### Task 5: Add MBTI column and cache scope in repository + SQL doc

**Files:**
- Modify: `server/utils/fortune/repository.js`
- Modify: `docs/sql/fortune_cache.sql`
- Test: `tests/fortune-repository-migration.test.mjs`

**Step 1: Write failing migration/repository tests**

```js
assert.equal(
  executed.some((x) => x.sql.includes('ALTER TABLE fortune_cache ADD COLUMN `mbti`')),
  true
)
assert.equal(
  executed.some((x) => x.sql.includes('ux_fortune_cache_scope (cache_key, mode, year, gender, mbti, focus_area)')),
  true
)
```

Also add query expectation for `findByCacheKey`/`saveCache` SQL containing `mbti` predicates/columns.

**Step 2: Run tests to verify failure**

Run: `node --test tests/fortune-repository-migration.test.mjs`
Expected: FAIL because schema and index do not include MBTI.

**Step 3: Implement schema and SQL updates**

```sql
ALTER TABLE fortune_cache ADD COLUMN `mbti` VARCHAR(16) NOT NULL DEFAULT '' AFTER `gender`;
```

Update unique index to:
```sql
UNIQUE KEY ux_fortune_cache_scope (cache_key, mode, year, gender, mbti, focus_area)
```

Update repository query and upsert columns/params:
- `findByCacheKey`: add `AND mbti = ?`
- `INSERT`: include `mbti`
- `ON DUPLICATE KEY`: include `mbti`

**Step 4: Run tests**

Run: `node --test tests/fortune-repository-migration.test.mjs tests/fortune-service.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add server/utils/fortune/repository.js docs/sql/fortune_cache.sql tests/fortune-repository-migration.test.mjs
git commit -m "feat: add mbti to fortune cache schema and scope index"
```

### Task 6: Final regression verification

**Files:**
- Modify: none (verification only)

**Step 1: Run full targeted suite for touched areas**

Run: `node --test tests/fortune-request.test.mjs tests/prompt-template.test.mjs tests/fortune-service.test.mjs tests/fortune-repository-migration.test.mjs`
Expected: PASS.

**Step 2: Run broader project tests if available**

Run: `npm run test:e2e`
Expected: PASS (or document any unrelated existing failures).

**Step 3: Manual smoke check**

Run: `npm run dev`
Expected:
- Step 2 shows optional MBTI searchable input.
- Valid MBTI influences prompt output style/wording.
- Empty MBTI still works.

**Step 4: Commit verification evidence note (optional docs update)**

```bash
git status --short
```

Expected: clean working tree if all tasks committed.

