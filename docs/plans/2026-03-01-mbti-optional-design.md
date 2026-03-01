# MBTI Optional Field Design (AI Fortune Step 2)

**Date:** 2026-03-01  
**Status:** Approved

## Background
The Step 2 AI fortune form currently supports gender and focus area but does not accept MBTI. We need an optional MBTI input that is:
- strict to the 16 MBTI types only,
- searchable in UI via dropdown list,
- passed to AI prompt template when provided,
- persisted in fortune cache scope in DB like gender/focus area.

## Goals
- Add optional `mbti` in Step 2 UI.
- Allow users to type for search while selecting from predefined options.
- Ensure backend accepts only valid MBTI values.
- Include MBTI in prompt variables only when present.
- Add DB column and cache scope dimension for MBTI.

## Non-Goals
- Free-text personality typing.
- Any MBTI scoring or inference logic.
- Changing core five-elements fingerprint hash behavior.

## UX Design
### Input behavior
- Location: Step 2 panel (`AI 算命`) below gender, before type/focus.
- Control: searchable dropdown using `input[list] + datalist`.
- Optional field; blank value is allowed.
- Valid options (fixed 16):
  - INTJ, INTP, ENTJ, ENTP
  - INFJ, INFP, ENFJ, ENFP
  - ISTJ, ISFJ, ESTJ, ESFJ
  - ISTP, ISFP, ESTP, ESFP
- Any non-listed input is ignored by backend normalization.

### i18n
- Add localized label + placeholder/hint keys under `fortune` in `app/i18n/messages.js`.

## Data Flow
1. User selects MBTI in Step 2 form.
2. Frontend `buildFortuneRequestPayload` includes `metadata.mbti` when valid.
3. API route reads `metadata.mbti` and passes to service.
4. Service normalizes MBTI to uppercase and validates against 16 types.
5. Prompt builder receives normalized MBTI; injects MBTI condition only when non-empty.
6. Repository read/write includes MBTI in query/upsert scope.

## Prompt Design
- Add optional variable in `buildFortunePrompt`.
- Existing system message currently includes gender/focus.
- Update to include MBTI only if provided, for example:
  - with MBTI: `使用者條件：性別=男；重點領域=事業；MBTI=INTJ。請在輸出中優先回應這些重點。`
  - without MBTI: keep original gender/focus format and omit MBTI part.

## Backend Validation Rules
- Normalize to uppercase string.
- Allowed set exactly 16 MBTI types.
- Invalid input => empty string (`''`) and treated as not provided.

## Database Design
### Schema change
`fortune_cache` add column:
- `mbti VARCHAR(16) NOT NULL DEFAULT ''` (after `gender`).

### Index scope update
Replace unique index with MBTI dimension:
- from: `(cache_key, mode, year, gender, focus_area)`
- to: `(cache_key, mode, year, gender, mbti, focus_area)`

### Migration compatibility
Use compatibility-safe checks in `ensureFortuneCacheSchema`:
- add column only if absent,
- drop old index if exists,
- create new index if absent.

## Testing Strategy
- Frontend payload tests:
  - includes `metadata.mbti` when valid,
  - excludes/empties when invalid or missing.
- Prompt template tests:
  - includes MBTI line when provided,
  - omits MBTI when absent.
- Service tests:
  - scope includes normalized MBTI,
  - persisted payload includes MBTI.
- Repository migration tests:
  - adds `mbti` column,
  - updates unique index definition.

## Risks and Mitigations
- Risk: Browser differences for `datalist` UX.
  - Mitigation: keep backend strict validation as source of truth.
- Risk: cache fragmentation after new dimension.
  - Mitigation: intentional behavior because MBTI should affect prompt/result.

## Rollout
- Backward compatible defaults (`mbti=''`) avoid breaking old rows.
- Existing requests without MBTI continue to work.
