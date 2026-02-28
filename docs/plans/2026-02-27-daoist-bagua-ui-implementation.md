# Daoist Bagua UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the full homepage UI into a Daoist-style, Bagua-centered interface while keeping current Nayin calculation behavior and i18n correctness.

**Architecture:** Keep all business logic in `app/composables/useNayinCalculator.js` unchanged, and perform UI-only refactor in `app/app.vue` + `app/assets/main.css`. Add lightweight view-model helpers for five-element node styling and preserve existing translation lookup path from `app/i18n/messages.js`.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, plain CSS, Node built-in test runner (`node --test`).

---

### Task 1: Add translation keys for new Bagua UI text

**Files:**
- Modify: `app/i18n/messages.js`
- Test: `tests/i18n-config.test.mjs`

**Step 1: Write the failing test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { messages } from '../app/i18n/messages.js'

test('bagua UI translation keys exist in all locales', () => {
  for (const locale of Object.keys(messages)) {
    assert.ok(messages[locale].bagua)
    assert.equal(typeof messages[locale].bagua.title, 'string')
    assert.equal(typeof messages[locale].bagua.center, 'string')
    assert.equal(typeof messages[locale].bagua.highlight, 'string')
  }
})
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/i18n-config.test.mjs`
Expected: FAIL with missing `bagua` keys.

**Step 3: Write minimal implementation**

Add `bagua` section in both `zh-Hant` and `zh-Hans`:

```js
bagua: {
  title: '八卦五行盤',
  center: '太極中樞',
  highlight: '旺行'
}
```

(Use simplified Chinese copy for `zh-Hans`.)

**Step 4: Run test to verify it passes**

Run: `node --test tests/i18n-config.test.mjs`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/i18n/messages.js tests/i18n-config.test.mjs
git commit -m "test(i18n): add bagua ui translation coverage"
```

### Task 2: Refactor homepage template into Bagua-centered layout

**Files:**
- Modify: `app/app.vue`
- Test: `tests/nayin.test.mjs`

**Step 1: Write the failing test**

Add a smoke-level structural assertion in `tests/nayin.test.mjs` to ensure element order remains complete and stable (this protects mapping used by the new UI):

```js
test('five element order remains canonical', () => {
  assert.deepEqual(['wood', 'fire', 'earth', 'metal', 'water'], ['wood', 'fire', 'earth', 'metal', 'water'])
})
```

Then replace with import-based assertion after extracting constant from `app/app.vue` into a shared module (step 3).

**Step 2: Run test to verify it fails**

Run: `node --test tests/nayin.test.mjs`
Expected: FAIL once assertion points to not-yet-created shared constant module.

**Step 3: Write minimal implementation**

- Create `app/utils/elements.js` with exported constants:

```js
export const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water']

export const elementCompass = {
  wood: 'east',
  fire: 'south',
  earth: 'center',
  metal: 'west',
  water: 'north'
}
```

- Update `app/app.vue` to:
1. Import `elementOrder` and `elementCompass` from new utility file.
2. Replace current flat result section with `bagua-stage` structure:
   - center Taiji node
   - static bagua ring labels
   - five positioned element nodes with dynamic classes and values
   - pillar cards below stage
3. Keep `onSubmit()` and existing calculation call unchanged.
4. Add computed `dominantElement` and helper class map for node intensity.
5. Ensure unknown hour still displays `-` for missing hour pillar data.

**Step 4: Run tests to verify it passes**

Run: `npm test`
Expected: PASS all existing test files.

**Step 5: Commit**

```bash
git add app/app.vue app/utils/elements.js tests/nayin.test.mjs
git commit -m "feat(ui): rebuild homepage with bagua-centered structure"
```

### Task 3: Rewrite stylesheet for Daoist visual system and responsive behavior

**Files:**
- Modify: `app/assets/main.css`
- Test: `npm test` (regression only) + manual UI smoke in dev server

**Step 1: Write the failing test**

Create a manual verification checklist in plan execution notes (no CSS unit harness exists):
1. Bagua stage visible at first viewport on desktop.
2. Mobile layout stacks form and stage without overlap.
3. Highest element node shows distinct highlight ring.

Treat unchecked checklist as fail.

**Step 2: Run test to verify it fails**

Run: `npm run dev` and inspect UI before CSS rewrite.
Expected: FAIL checklist (current UI has no bagua stage or highlight ring).

**Step 3: Write minimal implementation**

Replace stylesheet with:
1. Daoist tokenized theme variables (dark gradient, gold lines, cyan interaction, five-element colors).
2. Two-column layout at desktop and stacked layout on small screens.
3. Bagua stage geometry (ring, trigrams, center taiji, positioned element nodes).
4. Subtle animations:
   - initial stage fade-in delay
   - result pulse on calculate
   - hover/focus glow for interactive nodes/buttons
5. Accessibility styles for focus-visible and reduced-motion fallback.

**Step 4: Run verification to confirm pass**

Run:
- `npm test`
- `npm run dev` and execute manual checklist across desktop + mobile width

Expected:
- Automated tests PASS.
- Manual checklist all PASS.

**Step 5: Commit**

```bash
git add app/assets/main.css
git commit -m "feat(style): apply daoist bagua visual system"
```

### Task 4: Final regression pass and integration commit

**Files:**
- Verify: `app/app.vue`, `app/assets/main.css`, `app/i18n/messages.js`, `app/utils/elements.js`, `tests/*.test.mjs`

**Step 1: Run full verification**

Run:
- `npm test`
- `npm run build`

Expected:
- All tests pass.
- Nuxt production build succeeds.

**Step 2: Prepare changelog summary in commit body**

Include:
1. New bagua-centered layout
2. Daoist theme tokens + responsive behavior
3. i18n additions for new UI labels

**Step 3: Commit integration**

```bash
git add app/app.vue app/assets/main.css app/i18n/messages.js app/utils/elements.js tests/*.test.mjs
git commit -m "feat: redesign homepage with daoist bagua five-element experience"
```
