# Phase 0 Implementation Plan — Sprint 1

*Generated: 2026-05-16. Based on `dental-management-plan.md` (Phase 2 backlog, Sprint 1 scope) and the `.claude/docs/planning.md` process.*

---

## Scope

Sprint 1 covers **items 1–5 from the priority table** in `dental-management-plan.md`:

| # | Story | Epic | Points | Dependency |
|---|---|---|---|---|
| 1 | 1.1 Auth enforcement | Auth Foundation | 3 | — |
| 2 | 4.1 Schedule in sidebar | Doctor List | 1 | — |
| 3 | 2.1 Daily board backend | Daily Board | 3 | — |
| 4 | 2.2 Daily board frontend | Daily Board | 5 | 2.1 |
| 5 | 2.3 Inline status transitions | Daily Board | 3 | 2.2 |

**Total: 15 points.**

Stories 1 and 2 have no dependencies and run in parallel. Stories 3–5 are the main Daily Board thread and must be sequenced.

---

## Migration Status

No new migrations are required for Sprint 1. All schema columns needed by this sprint are already in place:

| Column | Migration | Status |
|---|---|---|
| `appointments.is_walk_in` | `2026_05_14_000002_add_walk_in_and_series_to_appointments_table.php` | ✓ exists |
| `appointments.parent_appointment_id` | `2026_05_14_000002_add_walk_in_and_series_to_appointments_table.php` | ✓ exists |
| `appointments.series_total` | `2026_05_15_000001_add_series_columns_to_appointments_table.php` | ✓ exists |
| `appointments.series_position` | `2026_05_15_000001_add_series_columns_to_appointments_table.php` | ✓ exists |
| Permission tables (spatie) | `2026_04_29_132926_create_permission_tables.php` | ✓ exists |
| `queues` table | `2026_05_14_000003_create_queues_table.php` | ✓ exists |

Sprint 2 (series creation form, Story 3.2) will need no additional migration work either — both series columns are already present. The schema is fully ready.

---

## Current State Audit

### Backend

**`DailyBoardController`** — `app/Http/Controllers/DailyBoardController.php`
- EXISTS. Single `__invoke` method. Queries `Appointment::with(['patient', 'doctor.user', 'service'])` filtered by date and optional `doctor_id`.
- Returns flat shape: `id`, `patient_name`, `doctor_name`, `service_name`, `time`, `status`, `is_walk_in`, `type`.
- Renders to `DailyBoard/Index` (the Inertia page doesn't exist yet).
- **Gap 1**: Route has no `can:` middleware — any authenticated user can hit it.
- **Gap 2**: Does not call `scopeForUser()` — a Doctor role sees all doctors' patients on the board.
- Walk-ins are regular `Appointment` records with `is_walk_in = true`; they appear in the query already. No separate Queue-only entries need merging.

**`ScheduleController`** — `routes/web.php` line 51
- Route `GET /schedule` exists and renders `Pages/Schedule`.
- **Gap**: No `can:` middleware on the route.

**Routes with missing `can:` middleware** (from `routes/web.php`):
- `GET /schedule` — should require `appointments.view`
- `GET /daily-board` — should require `appointments.view`
- `POST|PUT|DELETE /queue/*` — should require `appointments.edit` (no dedicated queue permission exists in seeder; queue operations are appointment state changes)
- `GET /queue` — should require `appointments.view`
- `PATCH /patient-visits/{id}/check-in|check-out` — should require `appointments.edit`
- All `patient-visits` resource routes — no `can:` middleware at all
- All `roles` resource routes — no `can:` middleware at all
- `DELETE /activity-logs/{id}` — no `can:` middleware (index/show are gated)

**`AppointmentService`** — `app/Services/AppointmentService.php`
- Complete. All status transitions are implemented (`confirm`, `markInQueue`, `markInProgress`, `needsFollowUp`, `cancel`, `complete`, `noShow`). All wrap in `DB::transaction`. Fires notifications on each transition. No changes needed for Sprint 1.

**`Appointment` model** — `app/Models/Appointment.php`
- `scopeForUser` exists (line 77). Scopes to `doctor_id = auth()->user()->doctor->id` when role is Doctor; no-op for all other roles.
- Status enum: `AppointmentStatus` — 8 values: `pending`, `confirmed`, `in_queue`, `in_progress`, `completed`, `needs_follow_up`, `cancelled`, `no_show`.

**Permissions seeder** — `database/seeders/RoleAndPermissionSeeder.php`
- 35 permissions across three roles (Admin, Doctor, Staff). There is no `queue.*` or `patient_visits.*` permission slug — queue and patient-visit operations will map to `appointments.*` permissions since they are appointment state transitions.

### Frontend

**Sidebar** — `resources/js/components/app-sidebar.tsx`
- Nav groups: Overview (Dashboard), Clinic (Appointments, Queue, Patients, Patient Visits, Visit Records), Doctors (Doctors, Services), System (Users, Roles), Audit (Activity Logs).
- Role/permission gating via `usePermission` hook (`canAccess`, `hasRole`).
- **Gap**: "Today's Schedule" and "Daily Board" are both absent from the sidebar.

**Pages inventory:**
- `pages/appointments/` — index, create, edit, show — ✓ exists
- `pages/schedule/index.tsx` — ✓ exists, reachable only by direct URL (`/schedule`)
- `pages/queue/index.tsx` — ✓ exists
- `pages/DailyBoard/Index.tsx` — **MISSING** (backend renders to this path but no file)

**Status handling (two divergent implementations):**
- `pages/appointments/index.tsx` — inline `STATUS_STYLES` map using shadcn `Badge` with variant mapping.
- `pages/schedule/index.tsx` — separate inline `className` strings with raw Tailwind tokens.
- No shared `StatusBadge` component exists in `resources/js/components/`.

**Status transitions:**
- Exist in `pages/appointments/index.tsx` via `handleStatusAction` → `router.patch` to appointment status endpoints.
- Transitions exposed: confirm (pending only), complete (confirmed only), cancel (pending or confirmed only). Missing: `in_queue`, `in_progress`, `no_show`, `needs_follow_up`.
- No reusable transition component — logic is page-local.

**Walk-in flow:**
- No quick-add modal exists. Walk-ins go through the full `pages/appointments/create.tsx` form with an `is_walk_in` checkbox. Story 2.4 (add walk-in from board) is Sprint 2 work.

**TypeScript types:**
- Barrel at `resources/js/types/index.ts`.
- `AppointmentStatus` union type and `Appointment` interface exist in `types/appointments.ts`.
- `is_walk_in: boolean` and `parent_appointment_id` are already in the `Appointment` type.
- No `DailyBoardEntry` type exists yet — needs to be added.

---

## Story-by-Story Implementation Plan

### Story 1.1 — Enforce backend permissions on unprotected routes

**File**: `routes/web.php`

**What to do:**

1. Add `can:appointments.view` to the schedule and daily-board routes:
   ```php
   Route::get('schedule', ScheduleController::class)
       ->middleware('can:appointments.view')
       ->name('schedule');

   Route::get('daily-board', DailyBoardController::class)
       ->middleware('can:appointments.view')
       ->name('daily-board');
   ```

2. Wrap the queue routes in a `can:appointments.view` outer middleware and add write guards inline:
   ```php
   Route::prefix('queue')->name('queue.')->middleware('can:appointments.view')->group(function () {
       Route::get('/', [QueueController::class, 'index'])->name('index');
       Route::post('/', [QueueController::class, 'store'])->middleware('can:appointments.edit')->name('store');
       Route::put('{queue}', [QueueController::class, 'update'])->middleware('can:appointments.edit')->name('update');
       Route::delete('{queue}', [QueueController::class, 'destroy'])->middleware('can:appointments.edit')->name('destroy');
       Route::patch('{queue}/call', [QueueController::class, 'call'])->middleware('can:appointments.edit')->name('call');
       Route::patch('{queue}/complete', [QueueController::class, 'complete'])->middleware('can:appointments.edit')->name('complete');
       Route::patch('{queue}/no-show', [QueueController::class, 'noShow'])->middleware('can:appointments.edit')->name('no-show');
       Route::post('reorder', [QueueController::class, 'reorder'])->middleware('can:appointments.edit')->name('reorder');
   });
   ```

3. Gate patient-visit routes — read with `medical_records.view`, write with `medical_records.create`/`medical_records.edit`:
   ```php
   Route::resource('patient-visits', PatientVisitController::class)
       ->middlewareFor(['index', 'show'], 'can:medical_records.view')
       ->middlewareFor(['create', 'store'], 'can:medical_records.create')
       ->middlewareFor(['edit', 'update'], 'can:medical_records.edit')
       ->middlewareFor('destroy', 'can:medical_records.delete');
   Route::patch('patient-visits/{patientVisit}/check-in', [PatientVisitController::class, 'checkIn'])
       ->middleware('can:medical_records.edit')
       ->name('patient-visits.check-in');
   Route::patch('patient-visits/{patientVisit}/check-out', [PatientVisitController::class, 'checkOut'])
       ->middleware('can:medical_records.edit')
       ->name('patient-visits.check-out');
   ```

4. Gate roles routes — admin-only via `users.view` / `users.edit`:
   ```php
   Route::resource('roles', RoleController::class)
       ->middlewareFor(['index', 'show'], 'can:users.view')
       ->middlewareFor(['create', 'store'], 'can:users.create')
       ->middlewareFor(['edit', 'update'], 'can:users.edit')
       ->middlewareFor('destroy', 'can:users.delete');
   ```

5. Gate activity-log destroy:
   ```php
   Route::delete('activity-logs/{activityLog}', [ActivityLogController::class, 'destroy'])
       ->middleware('can:activity_logs.view')
       ->name('activityLogs.destroy');
   ```

**Acceptance criteria:**
- A Staff user hitting `/queue/reorder` (POST) returns 200 (Staff has `appointments.edit`).
- A Doctor user hitting `POST /queue` returns 403 (Doctor does not have `appointments.edit`).
- A Doctor user hitting `GET /daily-board` returns 200 (Doctor has `appointments.view`).
- An unauthenticated user hitting any of these routes redirects to login.
- All existing Pest tests pass.

**Agent**: backend-engineer

---

### Story 4.1 — Add Today's Schedule to sidebar

**File**: `resources/js/components/app-sidebar.tsx`

**What to do:**
- Add a "Today's Schedule" item to the Clinic nav group, between Queue and Patients (or at the end of the Clinic group — match the visual order the team prefers).
- Permission gate: `appointments.view` (consistent with how the route is gated in Story 1.1).
- Use the existing `<Link href={route('schedule')}>` pattern from neighboring items.
- Add a "Daily Board" item immediately above or below Schedule — same gate, route `daily-board`.

**Prop shape**: No backend change needed. The sidebar reads permissions from Inertia shared data.

**Acceptance criteria:**
- "Today's Schedule" appears in the sidebar for Admin, Doctor, and Staff (all have `appointments.view`).
- Clicking it navigates to `/schedule`.
- "Daily Board" also appears and navigates to `/daily-board`.
- Neither item appears if the user lacks `appointments.view`.

**Agent**: frontend-engineer

---

### Story 2.1 — Daily board backend (complete the controller)

**File**: `app/Http/Controllers/DailyBoardController.php`

The controller exists and its query shape is largely correct. Two gaps need fixing before the frontend can be built on top of it.

**What to do:**

1. **Apply `scopeForUser`** so a Doctor only sees their own patients:
   ```php
   $appointments = Appointment::with(['patient', 'doctor.user', 'service'])
       ->forUser(auth()->user())          // add this line
       ->whereDate('appointment_date', $date)
       ->whereNotIn('status', ['cancelled', 'no_show'])
       ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
       ->orderBy('start_time')
       ->get();
   ```

2. **Add `appointment_date` and status-transition metadata** to the entry shape so the frontend knows which transitions are valid:
   ```php
   'id'             => $appointment->id,
   'patient_name'   => $appointment->patient->full_name,
   'doctor_name'    => $appointment->doctor->user->name,
   'service_name'   => $appointment->service->name,
   'time'           => $appointment->start_time,
   'status'         => $appointment->status->value,
   'is_walk_in'     => $appointment->is_walk_in,
   'type'           => 'appointment',
   // add:
   'series_position' => $appointment->series_position,
   'series_total'    => $appointment->series_total,
   ```

3. **Route guard** is handled by Story 1.1 (`can:appointments.view` on the route).

**Inertia prop contract** (what `DailyBoard/Index` will receive):
```ts
{
  entries: {
    id: number
    patient_name: string
    doctor_name: string
    service_name: string
    time: string           // HH:MM:SS
    status: AppointmentStatus
    is_walk_in: boolean
    type: 'appointment'
    series_position: number | null
    series_total: number | null
  }[]
  doctors: { id: number; name: string }[]
  filters: { date: string; doctor_id: number | null }
}
```

**Acceptance criteria:**
- `GET /daily-board` with a Doctor session returns only that doctor's appointments.
- `GET /daily-board?doctor_id=X` with an Admin session returns only doctor X's appointments.
- `GET /daily-board?date=2026-05-01` returns appointments for that date only.
- `cancelled` and `no_show` appointments are excluded.
- No N+1 queries (the existing eager-load covers this).
- `series_position` and `series_total` appear in every entry (null if not a series).

**Agent**: backend-engineer (depends on Story 1.1 route guard being in place)

---

### Story 2.2 — Daily board frontend (new page)

**File to create**: `resources/js/Pages/DailyBoard/Index.tsx`
**Type to add**: `DailyBoardEntry` in `resources/js/types/` (or inline if one-off)

**What to build:**

A full-page table showing every patient on the board for the selected date.

Layout:
```
[Daily Board]                         [Date picker]  [Doctor filter]
─────────────────────────────────────────────────────────────────────
Patient          Time     Doctor       Service         Status    Actions
─────────────────────────────────────────────────────────────────────
John Doe         09:00    Dr. Santos   Cleaning        Confirmed  [▼]
Maria Cruz       09:30    Dr. Santos   Braces (2/12)   In Progress [▼]
Walk-in badge → is_walk_in = true rows get a subtle "Walk-in" tag in the Patient cell
```

Implementation notes:
- Receive props: `entries`, `doctors`, `filters` (exact shape from Story 2.1 above).
- Date picker: a `<input type="date">` wrapped in the project's Input component. On change, call `router.get(route('daily-board'), { date, doctor_id }, { preserveScroll: true })`.
- Doctor filter: shadcn `Select`, same pattern as `pages/appointments/index.tsx` doctor filter.
- Status display: **create a shared `StatusBadge` component** at `resources/js/components/status-badge.tsx` that takes an `AppointmentStatus` value and returns a styled `Badge`. Both this page and the existing Schedule/Appointments pages should use it — replace the two divergent inline implementations.
- Series progress: if `series_position` and `series_total` are non-null, render "(2/12)" inline next to the service name.
- Empty state: centered message "No patients scheduled for this date."
- Responsive: table scrolls horizontally on narrow viewports.
- Actions column: wired in Story 2.3.

**Acceptance criteria:**
- Page renders at `/daily-board` with the correct data for today by default.
- Date and doctor filters update the table without full-page reload.
- Walk-in rows display a badge.
- Series rows show session progress.
- Empty state renders when there are no entries.
- TypeScript and lint pass with no errors.

**Agent**: frontend-engineer (after Story 2.1 prop contract is confirmed)

---

### Story 2.3 — Inline status transitions from daily board

**Files**:
- `resources/js/components/appointment-status-actions.tsx` (new shared component)
- `resources/js/Pages/DailyBoard/Index.tsx` (wire it in)

**What to build:**

A `<AppointmentStatusActions>` dropdown component that renders the valid next-state actions for a given appointment status, calls the correct `router.patch` endpoint, and triggers an Inertia reload on success.

Valid transitions per status (from the existing `AppointmentController` endpoints):

| Current status | Available actions |
|---|---|
| `pending` | Confirm → `appointments.confirm`, Cancel → `appointments.cancel` |
| `confirmed` | Mark In Queue → `appointments.in-queue`, Cancel → `appointments.cancel` |
| `in_queue` | Mark In Progress → `appointments.in-progress` |
| `in_progress` | Complete → `appointments.complete`, Needs Follow-up → `appointments.needs-follow-up`, No Show → `appointments.no-show` |
| `completed` | — (no actions) |
| `needs_follow_up` | — (no actions) |
| `cancelled` | — (filtered out; won't appear on board) |
| `no_show` | — (filtered out; won't appear on board) |

Component API:
```tsx
<AppointmentStatusActions
  appointmentId={entry.id}
  status={entry.status}
  onSuccess={() => router.reload({ preserveScroll: true })}
/>
```

Implementation notes:
- Use shadcn `DropdownMenu` — same pattern as `pages/appointments/index.tsx`.
- Each action calls `router.patch(route('appointments.<action>', entry.id), {}, { preserveScroll: true })`.
- Show a loading spinner or disable the button while the request is in flight (`router.patch` processing state).
- Flash messages (success/error) are handled by the existing shared Inertia flash layout — no additional work needed.
- Once built, also **replace** the inline transition logic in `pages/appointments/index.tsx` with this component to remove duplication.

**Acceptance criteria:**
- Each status shows only its valid next-state actions — no invalid actions appear.
- Clicking an action calls the correct endpoint and the table row updates in place after reload.
- No full-page navigation occurs.
- Success flash message appears.
- A failed request (403, 422) shows an error flash.
- The Appointments index page's transition behavior is unchanged after the refactor.

**Agent**: frontend-engineer (after Story 2.2 page is scaffolded)

---

## Parallelism and Sequencing

```
Story 1.1 (auth routes)     ─────────────────────────────────► done
Story 4.1 (sidebar)         ────────────────► done

Story 2.1 (board backend)   ──────────────────────────────────► done
                                                                  │
Story 2.2 (board frontend)  ◄─ after 2.1 confirmed ─────────────► done
                                                                  │
Story 2.3 (transitions)     ◄─ after 2.2 scaffolded ────────────► done
```

Stories 1.1 and 4.1 are independent and can be done concurrently with the Daily Board thread. Stories 2.1 → 2.2 → 2.3 must be sequential (each depends on the prior being testable).

---

## Definition of Done (Sprint 1)

A story is done when:

- [ ] All acceptance criteria above are met and demonstrable.
- [ ] `./vendor/bin/sail artisan test` passes with no failures.
- [ ] `./vendor/bin/sail npm run lint && ./vendor/bin/sail npm run types` pass with zero errors.
- [ ] No N+1 queries introduced (verified with Debugbar or query log in dev).
- [ ] Auth enforcement verified: Staff gets 200 on allowed routes, 403 on forbidden routes.
- [ ] The Daily Board page is reachable at `/daily-board`, linked from the sidebar, and shows correct data.
- [ ] Status transitions on the daily board update in place without page reload.
- [ ] Code reviewed before merge.

---

## Out of Scope for Sprint 1

The following are confirmed Sprint 2+ work and must not be pulled in:

- Story 2.4 — Walk-in quick-add modal from the daily board
- Story 4.2 — Doctor-scoped appointment index (depends on Story 1.1 fully landed)
- Story 4.3 — Patient history slide-over
- Story 3.x — Treatment series (creation form, progress tracking)
- Real-time updates (WebSockets / Reverb)
- Periodontal charting, billing, patient portal
