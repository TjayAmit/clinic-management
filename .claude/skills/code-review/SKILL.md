---
name: code-review
description: Review code changes for correctness, security, performance, and maintainability before merge. Use this skill whenever the user asks for a code review, wants feedback on a pull request or diff, asks "does this look right", "is this safe to merge", "review my changes", or shares Laravel/Inertia/React code and wants a quality assessment. Trigger this even when the user just pastes a diff or a file without the word "review" — if they are showing code and implicitly asking whether it is good, use this skill.
---

# Code Review

Review code the way a staff engineer reviews a teammate's PR: assume competence,
focus on what matters, and be specific. The author has 7+ years of experience —
do not lecture them on basics. Point at real problems, explain the consequence,
and propose a concrete fix.

## What to Review, In Priority Order

Review in this order and stop wasting the author's time on lower tiers if a
higher tier has blocking issues.

1. **Correctness** — does it do what it claims? Edge cases, off-by-one, null
   handling, wrong assumptions about data shape, race conditions.
2. **Security** — see the dedicated checks below. Security issues block merge.
3. **Data integrity** — migrations, transactions, cascade behavior, anything
   that can corrupt or lose data.
4. **Performance** — N+1 queries, missing indexes, unbounded loops, blocking
   work that belongs on a queue, oversized Inertia props.
5. **Maintainability** — naming, structure, duplication, dead code, tests.
6. **Style** — only if it genuinely impairs reading. Defer to the linter for
   the rest; do not hand-review formatting.

## Laravel-Specific Checks

- **Controllers stay thin.** Validation belongs in Form Requests; business logic
  belongs in Actions or Services. Flag fat controllers.
- **Eloquent N+1.** Any relation accessed in a loop without eager loading is a
  bug. Look for `->each`, Blade/React loops over collections, and accessors that
  touch relations.
- **Mass assignment.** Check `$fillable`/`$guarded` against what the request
  actually accepts. `Model::create($request->all())` is a red flag.
- **Authorization.** Every state-changing action needs a Policy check or
  `authorize()` call. "The route is behind auth middleware" is not enough.
- **Transactions.** Multi-write operations that must succeed together need
  `DB::transaction()`. Flag partial-write risk.
- **Queues.** Slow work (mail, exports, HTTP calls) inside a request cycle
  should be a queued job.
- **Migrations.** Reversible `down()`, indexes on foreign keys and on columns
  used in `where`/`order by`, no destructive change without a written plan.

## Inertia-Specific Checks

- **Props are the API.** Flag whole-model dumps, accidental over-fetching, and
  N+1s hidden inside prop construction. Props should be flat and intentional.
- **Shared data** (`HandleInertiaRequests`) should be small — it ships on every
  response. Heavy or per-page data does not belong there.
- **Validation errors and flash messages** should flow through Inertia's
  mechanisms, not be hand-rolled.

## React-Specific Checks

- **Hook rules** — no conditional hooks, complete dependency arrays, no missing
  cleanup in effects.
- **Keys** — stable, unique list keys; never array index when the list reorders.
- **State placement** — server state comes from Inertia props; only genuine
  local UI state belongs in `useState`. Flag duplicated server state in React.
- **Re-render cost** — obvious unnecessary re-renders, expensive work in render,
  but do not over-prescribe memoization.
- **Accessibility** — labels on inputs, keyboard reachability, semantic elements.

## Output Format

Structure every review like this:

```
## Summary
One or two sentences: what the change does and your overall verdict
(approve / approve-with-nits / needs-work / blocked).

## Blocking
Issues that must be fixed before merge. For each: file:line, the problem,
the consequence, and a concrete fix. If none, write "None."

## Should-fix
Real problems that are not strictly blocking. Same format.

## Nitpicks
Minor, optional. Keep this short — seniors do not need a long nit list.

## What's good
Briefly — what was done well. This is not filler; it tells the author what
to keep doing.
```

Be concrete. "This could be cleaner" is useless. "`UserController@store` builds
the welcome email inline (line 42) — move it to a queued `SendWelcomeEmail` job
so the request returns immediately" is a review.

If you cannot see the full context (the migration, the Form Request, the
Policy), say so and ask for it rather than guessing.
