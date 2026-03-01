# Two-Step Fortune UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the home UI so users must calculate five elements first, then choose gender and fortune type (2026/year or life) and call AI fortune endpoint.

**Architecture:** Keep existing local Nayin calculation in step 1 and add a new step 2 panel in the same page component. Step 2 is enabled only when step 1 result exists. A small request-builder utility generates metadata payload for `/v1/chat/completions` and is covered by node tests.

**Tech Stack:** Vue 3 (Nuxt 4), existing app component structure, node:test.

---

### Task 1: Add failing tests for request payload builder

**Files:**
- Create: `app/utils/fortune-request.js`
- Create: `tests/fortune-request.test.mjs`

**Step 1:** Write tests for:
- `life` request payload includes `metadata.mode=life`
- `year` request payload includes `metadata.mode=year` and `metadata.year=2026`
- `five_elements` maps from totals keys.

**Step 2:** Run test and verify failure.

**Step 3:** Implement minimal builder and rerun tests to pass.

### Task 2: Add two-step UI in NayinHome

**Files:**
- Modify: `app/components/NayinHome.vue`
- Modify: `app/i18n/messages.js`
- Modify: `app/assets/main.css`

**Step 1:** Add step 2 state and UI:
- Gender input
- Fortune type switch (year/life)
- Disabled fortune button before five-elements result exists
- AI response and loading/error display

**Step 2:** Integrate call to `/v1/chat/completions` with payload builder.

**Step 3:** Verify existing tests pass.
