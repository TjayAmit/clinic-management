---
name: performance-optimization
description: Diagnose and fix performance problems across the stack — slow Laravel endpoints, N+1 queries, missing indexes, slow page loads, large bundles, slow React renders, cache and queue tuning. Use this skill whenever the user says something is "slow", asks to "optimize", "speed up", "improve performance", mentions high response times, timeouts, slow queries, large payloads, or wants a performance review. Trigger this for both backend (Laravel/MySQL/Redis) and frontend (Inertia/React/Vite) performance work, even when the user only describes the symptom and not the cause.
---

# Performance Optimization (Full Stack)

Optimize by measurement, not by vibes. Find the actual bottleneck, fix the
biggest one, measure again. A senior team does not want a list of speculative
micro-optimizations — it wants the one change that matters, with evidence.

## Method — Always In This Order

1. **Measure first.** Get a real number: response time, query count, query
   time, payload size, bundle size, render time. Without a baseline you cannot
   know if you helped.
2. **Find the dominant cost.** Most slowness is one thing — an N+1, a missing
   index, an unindexed sort, a blocking external call, a 2 MB JS chunk. Find it.
3. **Fix the dominant cost.** Then re-measure.
4. **Repeat** until it is fast enough. Stop when it is fast enough — do not
   gold-plate.

## Backend: Laravel

- **N+1 queries** — the most common Laravel performance bug. Enable query
  logging or use a query counter. Any relation touched in a loop without
  `with()` / `load()` is the culprit. Eager-load deliberately; do not
  `with()` everything either — that is its own waste.
- **Select only what you need.** `select()` the columns in play instead of
  `SELECT *`, especially on wide tables and large result sets.
- **Pagination.** Unbounded `->get()` on a growing table is a time bomb.
  Paginate or chunk. For Inertia tables, paginate server-side and send one page.
- **Chunking.** Batch jobs over large tables use `chunkById()` / `lazy()` —
  never load the whole table into memory.
- **Queues.** Move mail, exports, image processing, third-party HTTP, and report
  generation off the request and onto a Redis queue. The request should return
  in milliseconds; the slow work happens in a worker.
- **Caching.** Cache expensive, stable computations in Redis with a sensible
  TTL and a clear invalidation story. Cache the result, not the slowness —
  fix the query first, then cache if still needed.
- **Avoid work in loops** — repeated queries, repeated config/container
  resolution, repeated serialization.

## Database: MySQL

- **Indexes.** Columns used in `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY` need
  indexes. Foreign keys need indexes. A filtered-then-sorted query may need a
  composite index in the right column order.
- **EXPLAIN** the slow query. `type: ALL` is a full table scan. `Using
  filesort` / `Using temporary` on a hot query is a flag. Look at rows examined
  vs rows returned.
- **Schema** — right-sized column types, avoid `SELECT *` on wide rows, watch
  for over-normalization causing join storms on hot paths.
- **Migrations** — add indexes via migration; on large tables, consider the
  locking implications of the change.

## Cache / Queue: Redis

- **Connection** — reuse connections; do not open per-request.
- **Key hygiene** — namespaced keys, TTLs on everything that should expire,
  no unbounded growth.
- **Cache stampede** — protect expensive recomputation (locks, staggered TTLs)
  on hot keys.
- **Queue health** — right number of workers, jobs idempotent and retry-safe,
  failed jobs monitored, slow jobs not blocking the whole queue (use separate
  queues / priorities).

## Frontend: Inertia + React + Vite

- **Inertia props are payload.** Oversized props slow every navigation. Send
  the page of data the screen needs — not whole models, not every relation,
  not all rows. Paginate server-side.
- **Shared Inertia data** ships on every response — keep it tiny.
- **Partial reloads** — use Inertia's partial reload (`only`) to refetch just
  the prop that changed instead of the whole page.
- **Bundle size** — analyze the Vite build. Code-split by route, lazy-load
  heavy components (editors, charts, maps), drop unused dependencies, prefer
  lighter libraries.
- **React render cost** — find needless re-renders (a profiler, not a guess).
  Lift or colocate state correctly, memoize *measured* hot paths — do not
  sprinkle `useMemo`/`memo` everywhere on principle.
- **Lists** — virtualize genuinely long lists. Stable keys.
- **Assets** — sized and compressed images, modern formats, lazy-loaded
  below-the-fold.

## Output Format

```
## Baseline
The measured starting point — the numbers, and how you got them.

## Bottleneck
The dominant cost, with evidence (query log, EXPLAIN output, profiler,
bundle report). One clear root cause, not a list of maybes.

## Fix
The specific change. Code or migration. Why it addresses the root cause.

## Expected / measured impact
The new number, or the expected improvement and how to verify it.

## Secondary findings
Smaller issues worth noting — clearly marked as lower priority, not mixed
in with the main fix.
```

If you do not have a measurement and cannot take one from what you were given,
say so and tell the user exactly what to capture (query log, `EXPLAIN`,
React profiler, `npm run build` output). Do not guess at a bottleneck and
present the guess as a finding.
