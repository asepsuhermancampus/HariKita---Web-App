# Task 2 Report: Couple Profile Domain Mapping and Validation

## Status

Implemented the pure couple identity mapping, display-name resolution, and canonical validator contract. Focused and full tests pass. TypeScript remains blocked by the intentionally deferred server-action consumer migration described under Concerns.

## Implementation

- Added `AccountOwnerRole = "GROOM" | "BRIDE"`.
- Added `mapCoupleProfileOwner()` for canonical-to-legacy persistence mapping.
- Added `resolveCoupleDisplayName()` with explicit, canonical, legacy, and `Klien` fallback precedence.
- Replaced validator identity fields `name` and `partnerName` with `accountOwnerRole`, `groomName`, `brideName`, and `coupleDisplayName`.
- Preserved existing email, event date, event location, district, theme preference, and notes behavior.
- Added focused mapping, display resolution, canonical validation, rejection, and non-identity regression tests.

## Files

- `src/lib/client-couple-profile.ts`
- `src/lib/validations/client-profile.ts`
- `tests/client-couple-profile.test.ts`
- `.superpowers/sdd/2026-09-26-client-couple-profile/task-2-report.md`

## TDD Evidence

### RED

Command:

```powershell
npx tsx --test tests/client-couple-profile.test.ts
```

Exact failure summary:

```text
Error: Cannot find module '../src/lib/client-couple-profile'
code: 'MODULE_NOT_FOUND'
tests 1
pass 0
fail 1
```

The failure matched the required missing pure domain module.

### GREEN

Command:

```powershell
npx tsx --test tests/client-couple-profile.test.ts
```

Exact output summary:

```text
tests 7
suites 0
pass 7
fail 0
cancelled 0
skipped 0
todo 0
```

Covered behaviors:

- GROOM owner mapping.
- BRIDE owner mapping.
- Display-name precedence and first-name projection.
- Canonical identity acceptance.
- Invalid role and 41-character display-name rejection.
- Existing non-identity validation rejection paths.

## Verification

Full suite, run once after implementation:

```powershell
npm test
```

```text
tests 333
suites 0
pass 333
fail 0
cancelled 0
skipped 0
todo 0
```

TypeScript:

```powershell
npm run typecheck
```

```text
src/server/actions/client-profile.ts(115,5): error TS2339: Property 'name' does not exist on type 'UpdateClientProfileInput'.
src/server/actions/client-profile.ts(117,5): error TS2339: Property 'partnerName' does not exist on type 'UpdateClientProfileInput'.
```

The initial local validator narrowing error was corrected. Both remaining errors are in the deferred server-action consumer, not Task 2 domain or validator code.

Diff validation:

```powershell
git diff --check
```

Exit code: `0`.

## Self-Review

- Scope limited to the requested pure domain module, validator contract, focused tests, and report.
- Mapping branches match the owner-role contract exactly.
- Display resolution trims values and follows required precedence.
- Validator trims canonical names and enforces role, 2-100 name lengths, and 2-40 display-name length.
- Validator output excludes legacy `name` and `partnerName`.
- Existing non-identity validation implementation remains unchanged; regression coverage verifies its principal rejection branches.
- Tests exercise real functions without mocks.
- Mutation review: swapping owner branches, changing precedence, accepting `OTHER`, permitting 41 characters, or removing existing field checks causes focused failures.
- No schema, database, UI, server action, dependency, push, or merge changes included.

## Concerns

- `npm run typecheck` cannot pass until the next integration task updates `src/server/actions/client-profile.ts` to consume canonical validator output and derive `name`/`partnerName` via `mapCoupleProfileOwner()`. Editing that server action here would violate the explicit pure-domain-only scope and overlap the documented Task 2 to Task 3 boundary.
- The full runtime test suite passes because no test currently typechecks the stale server-action destructuring contract.
