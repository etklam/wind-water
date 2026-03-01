# Nayin Guide Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated Nayin five-elements explanation page and link each computed pillar Nayin to its matching explanation section.

**Architecture:** Introduce a shared `nayin-guide` utility module as a single source of truth for Nayin explanation metadata (id/name/element/description). Render the new page from that data and reuse lookup helpers in the home result cards to generate deep links. Keep styling consistent with existing panel-based layout.

**Tech Stack:** Nuxt 4, Vue 3 SFC, Node.js built-in test runner (`node --test`)

---

### Task 1: Add guide data utility with TDD

**Files:**
- Create: `tests/nayin-guide.test.mjs`
- Create: `app/utils/nayin-guide.js`

1. Write failing tests for name-to-anchor lookup and five-element grouping.
2. Run `node --test tests/nayin-guide.test.mjs` and verify failure.
3. Implement minimal utility exports to satisfy tests.
4. Re-run `node --test tests/nayin-guide.test.mjs` and verify pass.

### Task 2: Add guide page and home deep-link integration

**Files:**
- Create: `app/pages/nayin-guide.vue`
- Modify: `app/components/NayinHome.vue`
- Modify: `app/i18n/messages.js`
- Modify: `app/assets/main.css`

1. Add topbar link to guide page in home.
2. Add per-pillar "view explanation" deep link in result cards.
3. Build `/nayin-guide` page from shared utility data with section anchors.
4. Add text keys and styles for guide layout + pillar link.

### Task 3: Verify full regression

**Files:**
- No code changes unless needed for fixes.

1. Run `npm test`.
2. Fix any regressions and rerun until green.
