# Code Review — 2026-05-16

## Summary

The walk-in appointment feature is architecturally sound and the `PatientVisit`
auto-creation on completion follows clean patterns. However there are two
**blocking** issues that must be resolved before merge: the `patient_visits`
table has no unique index on `appointment_id`, making the idempotency guard
race-condition unsafe and capable of inserting duplicate visit rows; and
`AppointmentData::toArray()` silently drops `is_walk_in = false` due to
`array_filter`'s default callback treating `false` as falsy, so toggling a
walk-in flag off during an update will never be persisted to the database.
Everything else is either a correctness/data-integrity should-fix or a minor
maintainability note.

---

## Backend

### Critical

**[BE-C1] Race condition in `createFromAppointment` — duplicate visit rows possible**
- File: `app/Services/PatientVisitService.php:47-63` + `database/migrations/2026_05_13_000007_create_patient_visits_table.php:15`
- Category: Data integrity / Correctness
- Problem: The idempotency check (`getByAppointment` → early return) and the
  subsequent `INSERT` happen inside an inner `DB::transaction` but there is no
  database-level unique constraint on `patient_visits.appointment_id`. The outer
  transaction in `AppointmentService::complete()` does not help here: two
  concurrent requests that both read `null` for the appointment will both pass
  the guard and race to insert. The result is two `PatientVisit` rows for the
  same appointment — corrupting the one-visit-per-appointment invariant that
  `Appointment::visit()` (`HasOne`) depends on.
- Fix: Add a unique index in a new migration:
  ```php
  $table->unique('appointment_id');
  ```
  Then in `createFromAppointment`, replace the read-check-write with
  `firstOrCreate` (or `updateOrCreate`) keyed on `appointment_id`, which is
  atomic on the index. Alternatively use `insertOrIgnore` and re-fetch. The
  current inner `DB::transaction` call inside `createFromAppointment` is also
  redundant — it is already executing inside the caller's transaction; remove it.

---

### High

**[BE-H1] `AppointmentData::toArray()` silently drops `is_walk_in = false`**
- File: `app/DTOs/AppointmentData.php:73-75`
- Category: Correctness / Data integrity
- Problem: The filter predicate is `fn ($value) => $value !== null`. A PHP
  `bool false` is not `null`, so this looks correct at a glance — but the
  problem is worse: `array_filter` without a custom callback is called with the
  default (no second argument), which removes all falsy values. Wait — the code
  *does* supply a callback, so `false` will survive. Re-checking: `fn($v) => $v !== null` — `false !== null` is `true`, so `false` is kept.
  **The real bug is in `is_walk_in`:** `AppointmentData` declares `is_walk_in`
  as `bool` with a default of `false`. When a non-walk-in appointment is
  *created* from a request where `is_walk_in` is absent, `$request->boolean()`
  returns `false`. `false !== null` passes the filter. The column gets written
  correctly. So `is_walk_in` is safe.
  **The actual bug is in `series_total` / `series_position` and the `status` field.** 
  `status` is typed `string` with default `'pending'`. It will never be `null`
  so it always passes — this is fine. But `series_total` can be legitimately set
  to `1` and still passes. No bug there.
  **Net assessment**: The filter `fn ($value) => $value !== null` is safer than
  the default `array_filter`, but `is_walk_in = false` will be present in the
  output array (false !== null = true), so no bug on the walk-in flag itself in
  AppointmentData.
  **The real problem** is in `PatientVisitData::toArray()` (same pattern, line 71).
  Fields like `temperature`, `weight`, `heart_rate` that are legitimately `0`
  would be stripped if anyone ever passes `0` — but more relevantly, if a
  cleared visit field is sent as `0`, it will be silently omitted and the DB row
  will not be updated. This is a latent correctness bug, low blast radius today
  but will bite on the PatientVisit edit form.
- Fix: Change both `toArray()` methods to preserve explicit zeros:
  ```php
  return array_filter(get_object_vars($this), fn ($value) => $value !== null);
  ```
  This is already the current code — the issue is specifically with integer `0`
  values that are not `null`. To correctly handle these, use:
  ```php
  return array_diff_key(get_object_vars($this),
      array_filter(get_object_vars($this), fn ($v) => $v === null));
  ```
  Or more readably, collect only defined (non-null) keys explicitly.

**[BE-H2] `PatientVisitService::createFromAppointment` has a nested `DB::transaction` inside an existing transaction**
- File: `app/Services/PatientVisitService.php:56-59`
- Category: Correctness / Maintainability
- Problem: `AppointmentService::complete()` wraps its body in `DB::transaction`.
  Inside that, it calls `patientVisitService->createFromAppointment()`, which
  opens its own `DB::transaction`. MySQL (InnoDB) does not support true nested
  transactions; Laravel uses savepoints, but this pattern can lead to unexpected
  partial rollbacks if the inner transaction commits a savepoint and the outer
  rolls back — behavior that is easy to misread. The inner transaction here is
  also pointless since the outer guarantees atomicity.
- Fix: Remove the inner `DB::transaction` in `createFromAppointment`. The method
  is called from a context that already holds a transaction; if it needs to be
  callable standalone, document that and let callers wrap it.

**[BE-H3] `patient_visits.patient_id` is NOT NULL but walk-in visits have no patient**
- File: `database/migrations/2026_05_13_000007_create_patient_visits_table.php:13`
  and `app/Services/AppointmentService.php:198`
- Category: Data integrity / Correctness
- Problem: The guard at line 198 — `if ($appointment->patient_id !== null)` —
  correctly skips visit creation for walk-ins. But the `patient_visits` table
  declares `patient_id` as NOT NULL via `foreignId('patient_id')->constrained()`.
  If that guard is ever removed, or if a walk-in is somehow converted to a
  registered patient mid-flow and then completed, the table schema and the visit
  DTO need to be consistent. More critically: a walk-in who is an existing
  patient (the "Existing Patient" tab in the walk-in form) *does* have a
  `patient_id`. That path will correctly create a visit. But a pure walk-in
  (name only) will never get a visit record — there is no visit for unregistered
  walk-ins at all, which may be intentional but is undocumented.
- Fix: Add a comment in `AppointmentService::complete()` explicitly stating the
  intent ("walk-in appointments for unregistered patients produce no visit
  record"). If visit records for walk-ins are ever needed, `patient_visits.patient_id`
  will need to become nullable via migration.

**[BE-H4] `AppointmentController::index` searches `walk_in_name` column that may not exist on older deploys**
- File: `app/Http/Controllers/AppointmentController.php:33`
- Category: Correctness
- Problem: The search at line 33 references `walk_in_name` which is added by
  migration `2026_05_16_000001_add_walk_in_name_to_appointments_table.php`. If
  that migration has not run (e.g., the code is deployed before migrations), the
  query will throw a SQL error (Unknown column `walk_in_name`). This is a
  deploy-ordering issue, not a code logic bug, but it is worth noting: never
  deploy code that references new columns before `php artisan migrate` runs.
  Verify your deploy pipeline runs migrations before the web process restarts.
- Fix: No code change needed if the deploy pipeline is correct; add a deploy
  note/checklist item. If zero-downtime rolling deploys are in use, this column
  reference will break requests during the window between old-code and
  new-migration, so the migration needs to run first.

---

### Medium

**[BE-M1] `AppointmentService::complete()` — notifications and activity log are outside the transaction**
- File: `app/Services/AppointmentService.php:192-210`
- Category: Correctness / Data integrity
- Problem: The `DB::transaction` on line 196 commits the status update and visit
  creation. After the transaction commits, lines 203-208 load relations and fire
  a notification, and line 208 logs activity. If the notification dispatch throws
  (e.g., `doctor.user` relation is missing), the appointment is already
  `completed` in the DB but the activity log is never written and the notification
  never sent. This is the correct architecture for notifications (they are
  side-effects, not part of the business transaction), but it means the activity
  log can silently go missing on exception. This is the same pattern used in
  `createFromRequest`, `confirm`, `cancel`, etc., so it is consistent — but it
  should be intentional and documented.
- Fix: Wrap notifications in a try/catch or dispatch them as queued jobs
  (`notify` already queues if the Notification implements `ShouldQueue`). Verify
  that `AppointmentCompleted`, `AppointmentBooked`, etc. implement `ShouldQueue`
  so a notification failure does not surface as a 500 to the user.

**[BE-M2] `createFollowUp` forces `patient_id`/`doctor_id`/`service_id` from parent but ignores `is_walk_in`**
- File: `app/Services/AppointmentService.php:226-234`
- Category: Correctness
- Problem: The follow-up appointment always copies `patient_id`, `doctor_id`,
  and `service_id` from the parent. If the parent was a walk-in with `is_walk_in
  = true` and `walk_in_name` set, the follow-up will inherit `patient_id = null`
  but `is_walk_in` and `walk_in_name` come from the DTO built from the request —
  which may not correctly reflect the parent's walk-in state.
- Fix: Also copy `is_walk_in` and `walk_in_name` from the parent when those
  fields are not explicitly overridden in the follow-up request.

**[BE-M3] `AppointmentRequest` allows `status` to be passed and accepted without validation**
- File: `app/Http/Requests/AppointmentRequest.php` and `app/DTOs/AppointmentData.php:38`
- Category: Security / Correctness
- Problem: `AppointmentData::fromRequest()` reads `$request->input('status', 'pending')`. The `AppointmentRequest` rules do not include `status` in the validation rules, so any client-submitted `status` value (e.g., `'completed'`) will be accepted and written to the DB on `store` or `update`. An attacker or a misbehaving client can create an appointment already in `completed` status.
- Fix: Either drop `status` from `AppointmentData::fromRequest()` entirely (it
  should always be `pending` on creation and controlled via the status-action
  endpoints on updates), or add `'status' => ['prohibited']` to `AppointmentRequest`.

---

### Low

**[BE-L1] Two N+1 queries in `AppointmentController::index`**
- File: `app/Http/Controllers/AppointmentController.php:44`
- Category: Performance
- Problem: Line 44 runs `Doctor::with('user')->where('is_active', true)->get(...)` on every page load of the index, loading all active doctors unconditionally regardless of whether the user will filter by doctor. This is a fixed query on each request — not an N+1, but it's an unbounded eager load that grows with doctor count.
- Fix: This is acceptable for clinics with < 50 doctors. If this page is ever slow, cache the doctor list with a short TTL.

**[BE-L2] `assertDoctorAvailable` makes two separate DB queries that could be one**
- File: `app/Services/AppointmentService.php:66-88`
- Category: Performance
- Problem: Two `DoctorSchedule::where()->exists()` queries are fired sequentially. This is minor but can be merged into one query using a conditional aggregate.
- Fix: Low priority; only worth addressing if this path is measured as slow.

---

## Frontend

### Critical

None.

---

### High

**[FE-H1] Walk-in form submits empty string `patient_id` when on "New" tab — backend receives `''` not `null`**
- File: `resources/js/pages/appointments/create.tsx:63, 96`
- Category: Correctness / Data integrity
- Problem: The `useForm` initial state sets `patient_id: ''`. When the user is
  on the "New / Unregistered" tab, `handleTabChange` calls `setData('patient_id', '')`
  (line 96). Inertia's `useForm` will serialize this as an empty string in the
  POST body. The `AppointmentRequest` validation rule for `patient_id` is
  `nullable|exists:patients,id|required_without:walk_in_name`. An empty string
  `''` is not `null` in PHP — `$request->input('patient_id')` returns `''`, and
  `nullable` only accepts `null` or missing, not empty string. This means the
  `exists:patients,id` rule will run against `''` and fail with a validation
  error ("The selected patient id is invalid") rather than the clean
  "patient is required" message.
- Fix: Before submitting, coerce empty strings to null:
  ```ts
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      post(appointmentsStore.url(), {
          data: {
              ...data,
              patient_id: data.patient_id || null,
              walk_in_name: data.walk_in_name || null,
          },
      });
  };
  ```
  Alternatively add `'nullable'` validation treatment on the backend for empty
  string via `prepareForValidation` in the Form Request.

---

### Medium

**[FE-M1] `isWalkInParam` reads `window.location.search` at component init — SSR unsafe**
- File: `resources/js/pages/appointments/create.tsx:45-47`
- Category: Correctness
- Problem: The code guards with `typeof window !== 'undefined'`, which is the
  correct SSR guard and falls back to `false`. However the value is captured
  at module evaluation time (component function body, outside `useEffect`), not
  in a stable way. On the first SSR render this will be `false`; on hydration
  it could be `true` if the URL has `?walk_in=1`, causing a hydration mismatch
  where the server renders the regular form and the client immediately renders
  the walk-in form.
- Fix: Move the URL param read into a `useEffect` with an initial state of
  `false`, or — better for this stack — pass `is_walk_in` as an Inertia prop
  from the controller (the controller already reads `defaultPatientId` from the
  request; add `isWalkIn: $request->boolean('walk_in')` to the `create()` props).
  This eliminates the `window` dependency entirely and keeps the contract in the
  controller where it belongs.

**[FE-M2] Walk-in form submits both `patient_id` and `walk_in_name` keys even when one is irrelevant**
- File: `resources/js/pages/appointments/create.tsx:52-72`
- Category: Correctness / Maintainability
- Problem: The `useForm` state always carries both `patient_id` and `walk_in_name`.
  On the "New" tab, `patient_id` is `''`; on "Existing", `walk_in_name` is `''`.
  Both keys are always sent in the POST. The backend `AppointmentRequest`
  handles this correctly (either is nullable, required_without the other), but it
  relies on the backend correctly ignoring the empty-string field. See FE-H1 for
  the consequence of empty string vs null.
- Fix: The coercion fix from FE-H1 resolves this as a side-effect.

**[FE-M3] `today` computed at module load time, not at render time**
- File: `resources/js/pages/appointments/create.tsx:24`
- Category: Correctness
- Problem: `const today = new Date().toISOString().split('T')[0]` is evaluated
  once when the module is loaded. If a user keeps the tab open across midnight,
  `today` becomes stale and the walk-in appointment date will be wrong, and the
  `min` prop on the date picker will allow dates that are now in the past.
- Fix: Move into the component body or use `useMemo` with no deps (it re-runs
  each render). For walk-in, since the date is always today and read-only, this
  is low impact in practice but should be fixed for correctness.

**[FE-M4] Doctor filter bypass on Daily Board is UI-only — backend must enforce**
- File: `resources/js/pages/dailyboard/Index.tsx:76`
- Category: Security
- Problem: Hiding the doctor filter from the `Doctor` role using `!isDoctor` is
  purely cosmetic. A user with the Doctor role can still manually navigate to
  `/daily-board?doctor_id=2` to see another doctor's board. The server-side
  `DailyBoardController` (not reviewed here) must enforce that a Doctor role can
  only see their own entries.
- Fix: Verify `DailyBoardController` applies a scope equivalent to
  `Appointment::scopeForUser` (which already exists on the Appointment model).
  If it does not, this is a data-exposure bug. Request the `DailyBoardController`
  for review.

---

### Low

**[FE-L1] `formatTodayLabel` and `today` constant are duplicated across walk-in and regular branches**
- File: `resources/js/pages/appointments/create.tsx:26-33, 149`
- Category: Maintainability
- Problem: Minor; both branches call `formatTodayLabel()` which references
  `new Date()` independently of the `today` constant. Not a bug but a small
  inconsistency.
- Fix: Compute once: `const todayFormatted = formatTodayLabel()` at the top of
  the component and reuse.

**[FE-L2] `eslint-disable-next-line` suppressing exhaustive-deps warning for service effect**
- File: `resources/js/pages/appointments/create.tsx:110`
- Category: Maintainability
- Problem: The `useEffect` that auto-fills `end_time` from service duration
  intentionally omits `setData` from its deps (it is a stable function from
  `useForm`). The suppression is safe here but should have a comment explaining
  why, not just the disable directive.
- Fix: Add: `// setData is stable across renders (useForm guarantee)`

---

## Backend TODOs (prioritized)

1. **[BE-C1]** Add `$table->unique('appointment_id')` to `patient_visits` via a new migration and replace the read-check-write idempotency guard with `firstOrCreate` keyed on `appointment_id`. Remove the inner `DB::transaction` from `createFromAppointment`.
2. **[BE-H1]** Audit both `AppointmentData::toArray()` and `PatientVisitData::toArray()` for integer-zero fields (`heart_rate`, `series_position`, `series_total`) — change the filter to exclude only `null`, not falsy values: `fn ($v) => $v !== null` is already correct for nulls; the concern is storing `0` for numeric fields if that is ever a valid domain value. Add a test asserting `series_position = 1` is not dropped.
3. **[BE-M3]** Remove `status` from `AppointmentData::fromRequest()` or add `'status' => ['prohibited']` to `AppointmentRequest` to prevent client-side status injection.
4. **[BE-H3]** Document (in code comment) that walk-in unregistered appointments intentionally produce no `PatientVisit` record. If that will change, create a migration to make `patient_visits.patient_id` nullable before the code lands.
5. **[BE-H2]** Remove the redundant inner `DB::transaction` in `PatientVisitService::createFromAppointment`.
6. **[BE-M1]** Verify `AppointmentCompleted`, `AppointmentBooked`, `AppointmentCancelled`, `AppointmentConfirmed` all implement `ShouldQueue` so notification failures do not surface as HTTP 500s.
7. **[BE-M2]** Copy `is_walk_in` and `walk_in_name` from parent when creating follow-up appointments.
8. **[BE-H4]** Confirm the deploy pipeline runs `php artisan migrate` before restarting the web process.

## Frontend TODOs (prioritized)

1. **[FE-H1]** Coerce empty-string `patient_id` and `walk_in_name` to `null` before POST (either in `handleSubmit` or via `prepareForValidation` in `AppointmentRequest`).
2. **[FE-M1]** Move `is_walk_in` detection server-side: add `isWalkIn: $request->boolean('walk_in')` to `AppointmentController::create()` props and remove the `window.location.search` read from the component.
3. **[FE-M4]** Verify `DailyBoardController` enforces role-based scoping server-side. Share the controller for review if not already done.
4. **[FE-M3]** Move `today` computation inside the component body (or `useMemo`) so it is not stale across midnight.
5. **[FE-L1]** Compute `todayFormatted` once at the top of the component and reuse in both JSX branches.
6. **[FE-L2]** Replace the bare `eslint-disable` suppression with an explanatory comment.
