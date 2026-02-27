# Nayin Five-Elements Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first Nuxt website that calculates year/month/day/hour pillars, Nayin, and five-elements totals with zh-Hant and zh-Hans locale support and two calculation modes.

**Architecture:** Keep all business rules in composables/utils: one layer normalizes user input, one layer calculates pillars from datetime and mode, one layer maps Ganzhi to Nayin and elements. UI remains a single page with a localized form and result cards. i18n strings and mapping tables are local static assets for deterministic behavior and easy maintenance.

**Tech Stack:** Nuxt 4, Vue 3, @nuxtjs/i18n, TypeScript, Vitest, lunar-javascript (for stem/branch and solar-term-aware calendar calculations)

---

### Task 1: Setup i18n and test tooling

**Files:**
- Modify: `package.json`
- Modify: `nuxt.config.ts`
- Create: `i18n/locales/zh-Hant.json`
- Create: `i18n/locales/zh-Hans.json`
- Create: `vitest.config.ts`

**Step 1: Write the failing test**

Create `tests/i18n-config.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import zhHant from '../i18n/locales/zh-Hant.json'
import zhHans from '../i18n/locales/zh-Hans.json'

describe('i18n locale files', () => {
  it('contain required top-level keys', () => {
    for (const locale of [zhHant, zhHans]) {
      expect(locale).toHaveProperty('app.title')
      expect(locale).toHaveProperty('form.mode.gregorian')
      expect(locale).toHaveProperty('result.pillars.year')
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/i18n-config.test.ts -r dot`
Expected: FAIL because test config/locales do not exist

**Step 3: Write minimal implementation**

- Add dependencies in `package.json`: `@nuxtjs/i18n`, `vitest`, `@vitest/coverage-v8`, `lunar-javascript`
- Update `nuxt.config.ts` to register i18n module and locale files
- Add minimal locale JSONs with required keys
- Add `vitest.config.ts` and basic Node environment

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/i18n-config.test.ts -r dot`
Expected: PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts vitest.config.ts i18n/locales/zh-Hant.json i18n/locales/zh-Hans.json tests/i18n-config.test.ts
git commit -m "chore: add i18n and test foundation"
```

### Task 2: Implement Nayin mapping and five-elements aggregation

**Files:**
- Create: `app/utils/nayin.ts`
- Create: `tests/nayin.test.ts`

**Step 1: Write the failing test**

Create `tests/nayin.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { elementCount, getNayinByGanzhi } from '../app/utils/nayin'

describe('nayin mapping', () => {
  it('maps 甲子 to 海中金 and metal', () => {
    const r = getNayinByGanzhi('甲子')
    expect(r.nameKey).toBe('nayin.haizhongjin')
    expect(r.element).toBe('metal')
  })

  it('counts five elements from pillars', () => {
    const stat = elementCount(['甲子', '丙寅', '戊辰', '庚午'])
    expect(stat.metal).toBeGreaterThanOrEqual(1)
    expect(stat.wood + stat.fire + stat.earth + stat.metal + stat.water).toBe(4)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/nayin.test.ts -r dot`
Expected: FAIL because `app/utils/nayin.ts` does not exist

**Step 3: Write minimal implementation**

- Add complete 60-jiazi mapping table in `app/utils/nayin.ts`
- Export:
  - `getNayinByGanzhi(gz: string)`
  - `elementCount(ganzhiPillars: string[])`
- Return i18n key + normalized element key (`wood|fire|earth|metal|water`)

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/nayin.test.ts -r dot`
Expected: PASS

**Step 5: Commit**

```bash
git add app/utils/nayin.ts tests/nayin.test.ts
git commit -m "feat: add 60-jiazi nayin mapping and element stats"
```

### Task 3: Implement pillar calculator with dual modes

**Files:**
- Create: `app/utils/pillars.ts`
- Create: `tests/pillars.test.ts`

**Step 1: Write the failing test**

Create `tests/pillars.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { calculatePillars } from '../app/utils/pillars'

describe('pillar calculator', () => {
  it('returns four pillars in gregorian mode', () => {
    const r = calculatePillars({
      date: '1990-06-15',
      time: '12:30',
      timezone: 'Asia/Taipei',
      mode: 'gregorian'
    })
    expect(r.year).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/)
    expect(r.hour).toBeTruthy()
  })

  it('can shift day pillar near 23:00 in traditional mode', () => {
    const before = calculatePillars({ date: '1990-06-15', time: '22:59', timezone: 'Asia/Taipei', mode: 'traditional' })
    const after = calculatePillars({ date: '1990-06-15', time: '23:01', timezone: 'Asia/Taipei', mode: 'traditional' })
    expect(before.day).not.toBe(after.day)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/pillars.test.ts -r dot`
Expected: FAIL because calculator does not exist

**Step 3: Write minimal implementation**

- In `app/utils/pillars.ts`, define input type:
```ts
type CalcMode = 'gregorian' | 'traditional'
type PillarInput = {
  date: string
  time?: string
  timezone: string
  mode: CalcMode
}
```
- Use `lunar-javascript` APIs to compute stems/branches
- For `traditional`, apply 23:00 day-boundary shift before deriving day/hour pillar
- Return `{ year, month, day, hour, meta }`

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/pillars.test.ts -r dot`
Expected: PASS

**Step 5: Commit**

```bash
git add app/utils/pillars.ts tests/pillars.test.ts
git commit -m "feat: add dual-mode pillar calculator"
```

### Task 4: Build result assembler composable

**Files:**
- Create: `app/composables/useNayinCalculator.ts`
- Create: `tests/useNayinCalculator.test.ts`

**Step 1: Write the failing test**

Create `tests/useNayinCalculator.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { computeNayinResult } from '../app/composables/useNayinCalculator'

describe('computeNayinResult', () => {
  it('returns pillar + nayin + element + totals', () => {
    const result = computeNayinResult({
      date: '1990-06-15',
      time: '12:30',
      timezone: 'Asia/Taipei',
      mode: 'gregorian'
    })
    expect(result.pillars.year.ganzhi.length).toBe(2)
    expect(result.pillars.year.nayinKey).toMatch(/^nayin\./)
    expect(result.totals).toHaveProperty('wood')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/useNayinCalculator.test.ts -r dot`
Expected: FAIL because composable does not exist

**Step 3: Write minimal implementation**

- Compose `calculatePillars` + `getNayinByGanzhi` + `elementCount`
- Return normalized output used directly by UI

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/useNayinCalculator.test.ts -r dot`
Expected: PASS

**Step 5: Commit**

```bash
git add app/composables/useNayinCalculator.ts tests/useNayinCalculator.test.ts
git commit -m "feat: add result assembly composable"
```

### Task 5: Implement mobile-first localized UI page

**Files:**
- Modify: `app/app.vue`
- Create: `app/assets/main.css`
- Modify: `i18n/locales/zh-Hant.json`
- Modify: `i18n/locales/zh-Hans.json`

**Step 1: Write the failing test**

Create `tests/ui-smoke.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import zhHant from '../i18n/locales/zh-Hant.json'
import zhHans from '../i18n/locales/zh-Hans.json'

describe('ui translation coverage', () => {
  it('has identical keyset in both locales for form/result labels', () => {
    const keys = [
      'app.title',
      'form.birthDate',
      'form.birthTime',
      'form.timezone',
      'form.mode.title',
      'result.title'
    ]
    for (const k of keys) {
      expect(zhHant).toHaveProperty(k)
      expect(zhHans).toHaveProperty(k)
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest tests/ui-smoke.test.ts -r dot`
Expected: FAIL before UI locale keys are fully added

**Step 3: Write minimal implementation**

- Build single-page form + result cards in `app/app.vue`
- Add language toggle using i18n locale switch
- Add mode toggle, unknown-hour option, localized errors
- Add mobile-first CSS in `app/assets/main.css`

**Step 4: Run test to verify it passes**

Run: `npx vitest tests/ui-smoke.test.ts -r dot`
Expected: PASS

**Step 5: Commit**

```bash
git add app/app.vue app/assets/main.css i18n/locales/zh-Hant.json i18n/locales/zh-Hans.json tests/ui-smoke.test.ts
git commit -m "feat: add mobile-first localized nayin calculator UI"
```

### Task 6: Verification and regression test pass

**Files:**
- No new files required

**Step 1: Run full unit test suite**

Run: `npx vitest run`
Expected: all tests PASS

**Step 2: Build for production**

Run: `npm run build`
Expected: Nuxt build succeeds without type/runtime errors

**Step 3: Manual smoke run**

Run: `npm run dev`
Expected: page loads; language toggles; both modes produce results

**Step 4: Commit verification note**

```bash
git add -A
git commit -m "chore: verify nayin calculator build and tests"
```
