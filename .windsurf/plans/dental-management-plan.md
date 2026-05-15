# Dental Management — Project Plan

*Created: 2026-05-15. Follows the discovery-first process in `.claude/docs/planning.md`.*

---

## Phase 0 — Problem Statement

**Client & users**
- Clinic owner / Admin — needs full daily visibility and long-term treatment oversight
- Front desk / Staff — operates daily patient flow (check-in, status updates, walk-ins)
- Dentist / Doctor — needs to see their own patient list for the day and record treatment progress

**The goal**
Replace the manual, paper-based daily scheduling with a digital system the owner and staff can rely on as a single source of truth — for today's patient flow and for long-running treatment series.

**The problem**
The clinic owner cannot tell at a glance who the patients are for the day, what status they're at, or whether walk-in patients are being served. Long-term treatments (braces, orthodontics, root canal series) require months of coordinated visits — these are currently tracked manually with no visibility into progress or upcoming sessions. There is no single screen that shows the full picture.

**Current state**
The system is partially built — appointments, queue, and patient records exist in code, but the day-to-day workflow view is not complete enough to replace paper. Staff and the owner still check manually or keep side notes. Doctors have no clear scoped view of their own patient list.

**Success looks like**
- Owner opens one screen and sees every patient for today — scheduled and walk-in — with their current status and assigned doctor. No cross-referencing multiple pages.
- Staff can move a patient through the flow (arrived → in chair → done) with a single click from the daily board.
- Long-term treatment series (e.g., 12 brace adjustment sessions over 12 months) are planned upfront and tracked as a unit. Staff and doctors can see "session 4 of 12, last visit May 15."
- Doctors see their own daily patient list immediately upon login.
- Walk-in patients appear on the same board as scheduled patients — no separate flow.

**Constraints**
- Stack: Laravel + Inertia + React + TypeScript + MySQL + Redis + Sail. No new stack additions.
- No hard deadline. Quality-first.
- The existing data models (Appointment, PatientVisit, DentalRecord, Queue) are the foundation. Migrations must be additive.

**Out of scope**
- Patient-facing portal or mobile app
- Billing / invoicing
- SMS notifications
- Offline/PWA mode
- Dental imaging / x-ray file uploads (can be planned separately later)
- Periodontal charting / odontogram (tooth chart) — separate clinical feature, not part of this plan

**Open questions (resolved)**
- Root cause: partial digitization + the daily-view UX is not consolidated enough → the daily board is the core deliverable
- Long-term treatments need a series model — `parent_appointment_id` already exists on the `Appointment` model, but no series creation UI or progress tracking exists

---

## Phase 1 — Shaped Solution

### The gap analysis

What the codebase already has that is relevant:
- `Appointment` model with full status enum (pending → confirmed → in_queue → in_progress → completed / needs_follow_up / cancelled / no_show)
- `parent_appointment_id` on Appointment for follow-up chains
- Queue board (`/queue`) — today's walk-in queue with call/complete/no-show
- Schedule page (`/schedule`) — today's appointments for the logged-in doctor (but not linked in the sidebar and is read-only)
- Dashboard — role-aware stats and today's appointment list (but not interactive)
- `is_walk_in` flag on Appointment

What is missing:
1. **Unified Daily Patient Board** — scheduled + walk-in patients in one interactive view with inline status transitions
2. **Treatment Series** — creating a sequence of appointments upfront (multi-visit), with session numbering and progress visibility
3. **Doctor's scoped patient list** — a clean daily view for the Doctor role, accessible on login
4. **Authorization enforcement** — permissions are seeded but not enforced on backend routes (prerequisite for the Doctor scope to be trustworthy)

### Recommended approach: three features in priority order

**Feature A — Unified Daily Patient Board (highest value, core problem)**
A single page that shows every patient expected for the day — both appointment-based and walk-in. Filterable by doctor. Inline status transitions (confirm, mark arrived, in progress, complete, no-show). Walk-ins can be added directly from this page. This is the primary tool for the owner and staff.

Trade-off vs. alternatives: We could enhance the existing Dashboard or Queue page, but neither is the right host — Dashboard is read-only stats, Queue is walk-in-only. A dedicated Daily Board is clearer and doesn't create friction for users of the existing pages.

**Feature B — Treatment Series (long-term treatment tracking)**
A "series" is a group of appointments sharing the same patient + doctor + service, planned together, with a fixed count and recurring interval. Built on top of the existing `parent_appointment_id` chain. Staff can create a series from the appointment form (e.g., "12 sessions, every 4 weeks, starting June 1"). The patient profile shows series progress. Each session in the series links to its visit and dental record.

Trade-off: We do not need a separate `TreatmentSeries` table — the appointment chain via `parent_appointment_id` is sufficient, with a `series_total` and `series_position` added to the Appointment table. This avoids a new entity while keeping the data queryable.

**Feature C — Doctor's Daily Patient List**
The Schedule page already exists but is not in the sidebar. The doctor role should see their patient list as the first thing after login. Enhancement: make the schedule page the doctor's dashboard entry point, add it to the sidebar, and add the ability for the doctor to view a patient's history directly from the list.

---

## Phase 2 — Backlog

### Epic 1: Authorization Foundation (prerequisite)

Must be done before the Doctor scope in Features B and C is trustworthy.

**Story 1.1 — Enforce backend permissions on routes**
As a security control, all authenticated routes enforce the permission set that is already seeded in the database, so a Staff user cannot call Doctor-only or Admin-only actions by knowing the URL.

Acceptance criteria:
- `can:` middleware applied to all resource routes, matching the seeded permissions
- A Staff user hitting a Doctor-only route gets 403, not silently allowed
- Existing Pest tests still pass

Story points: 3

---

### Epic 2: Unified Daily Patient Board

**Story 2.1 — Daily board page (backend)**
As the system, I expose a `/daily-board` endpoint that returns today's appointments (all statuses except cancelled/no-show) plus today's walk-in queue entries, merged and ordered by time, scoped to a given date and optionally a given doctor.

Acceptance criteria:
- `GET /daily-board?date=&doctor_id=` returns appointments + walk-ins merged
- Each row includes: patient name, doctor name, service name, appointment time, current status, is_walk_in flag
- No N+1 queries (eager-load patient, doctor.user, service)
- Date defaults to today

Story points: 3

**Story 2.2 — Daily board page (frontend)**
As an Admin or Staff user, I see a single page with every patient for today — scheduled appointments and walk-ins — showing name, time, doctor, and status. I can filter by doctor.

Acceptance criteria:
- Page at `/daily-board` in sidebar under "Clinic" section
- Columns: Patient, Time, Doctor, Service, Status, Actions
- Doctor filter (dropdown, defaults to all)
- Date picker (defaults to today)
- Empty state when no patients

Story points: 5

**Story 2.3 — Inline status transitions from daily board**
As a Staff user, I can transition an appointment's status (confirm, mark in-progress, complete, cancel, no-show) with a single click from the daily board row, without leaving the page.

Acceptance criteria:
- Each row shows only the valid next-state actions for its current status
- Action triggers the existing appointment status endpoints (no new backend code)
- Page updates in place after transition (Inertia preserveScroll)
- Success/error flash shown

Story points: 3

**Story 2.4 — Add walk-in from daily board**
As a Staff user, I can add a walk-in patient to today's board directly from the daily board page via a modal or sheet — without navigating to /appointments/create.

Acceptance criteria:
- "Add Walk-in" button on the daily board
- Modal/sheet: select existing patient (typeahead), select doctor, select service
- Creates an appointment with `is_walk_in = true` and adds to the queue
- New walk-in appears immediately on the board after submit

Story points: 5

---

### Epic 3: Treatment Series

**Story 3.1 — Series schema (migration + model)**
As the system, the Appointment table carries two new columns: `series_total` (nullable int — total sessions planned) and `series_position` (nullable int — which session this is, 1-indexed), so long-term treatment series can be queried and displayed.

Acceptance criteria:
- Migration adds `series_total` and `series_position` (both nullable, not breaking existing data)
- `Appointment` model casts both as nullable integer
- `migrate:fresh --seed` runs clean

Story points: 2

**Story 3.2 — Series creation from appointment form**
As a Staff user, when creating an appointment I can optionally set it as the start of a series (e.g., 12 sessions, every 4 weeks). The system creates all appointments in the series upfront, linked via `parent_appointment_id`.

Acceptance criteria:
- Appointment create/edit form has an optional "Series" toggle
- When enabled: enter total sessions + interval (weeks)
- On save, all sessions are created in a single transaction
- First session: `series_position = 1, series_total = N`. Subsequent: `series_position = 2..N`, each linked to the previous via `parent_appointment_id`
- If any appointment in the batch conflicts, the whole transaction rolls back with a clear error

Story points: 8

**Story 3.3 — Series progress on patient profile**
As an Admin, Staff, or Doctor, when viewing a patient's profile I can see their active treatment series — service name, total sessions, sessions completed (count of completed status in the chain), last visit date, next scheduled session date.

Acceptance criteria:
- Patient show page has a "Treatment Series" section
- Each active series shows: service, Nth of M sessions complete, last visit, next visit
- Completed series are collapsible / shown separately
- Clicking a session links to that appointment's show page

Story points: 5

---

### Epic 4: Doctor's Daily Patient List

**Story 4.1 — Add Today's Schedule to sidebar**
As a Doctor or Admin, I can navigate to Today's Schedule via the sidebar.

Acceptance criteria:
- "Today's Schedule" added to the Clinic nav group in `app-sidebar.tsx`
- Visible to roles with `appointments.view` permission

Story points: 1

**Story 4.2 — Doctor-scoped appointment list**
As a Doctor, the Appointments index page automatically filters to only my appointments, and I cannot see or access other doctors' appointments.

Acceptance criteria:
- When the authenticated user has role `Doctor` and has a linked `Doctor` record, `AppointmentController::index` scopes the query to `doctor_id = auth()->user()->doctor->id`
- Doctor cannot remove this filter from the URL
- Story 1.1 (auth enforcement) is a prerequisite

Story points: 3

**Story 4.3 — Doctor sees patient history from daily list**
As a Doctor viewing today's schedule, I can click a patient row and see that patient's previous visits and dental records without losing my place.

Acceptance criteria:
- Each appointment row on the schedule page has a "View Patient History" action
- Opens a slide-over / sheet showing the patient's past visits and dental records (read-only)
- Data loaded via the existing patient show / visit endpoints, no new backend needed

Story points: 5

---

## Phase 3 — Priority Order

| # | Story | Epic | Points | Dependency |
|---|---|---|---|---|
| 1 | 1.1 Auth enforcement | Auth | 3 | — |
| 2 | 4.1 Schedule in sidebar | Doctor list | 1 | — |
| 3 | 2.1 Daily board backend | Daily board | 3 | — |
| 4 | 2.2 Daily board frontend | Daily board | 5 | 2.1 |
| 5 | 2.3 Inline status transitions | Daily board | 3 | 2.2 |
| 6 | 4.2 Doctor-scoped appointments | Doctor list | 3 | 1.1 |
| 7 | 2.4 Add walk-in from board | Daily board | 5 | 2.2 |
| 8 | 3.1 Series schema | Series | 2 | — |
| 9 | 4.3 Patient history slide-over | Doctor list | 5 | — |
| 10 | 3.2 Series creation form | Series | 8 | 3.1 |
| 11 | 3.3 Series progress on profile | Series | 5 | 3.2 |

**Total: 43 points**

Start with items 1–5 as Sprint 1. The daily board is the core deliverable and it unblocks the owner's primary pain immediately. Auth enforcement runs in parallel as it has no UI work. Items 6–9 are Sprint 2. Items 10–11 (series) are Sprint 3 — they require the most schema work and the daily board must be working first so users can actually see the series appointments land correctly.

---

## Architecture Notes (for implementation)

- **Daily Board route**: `GET /daily-board` → new `DailyBoardController` (single-action). It queries `Appointment::with([...])` for today + the Queue for walk-in-only entries not tied to an appointment. Returns merged, sorted collection.
- **Series creation**: `AppointmentService::createSeries(Request $request): Collection` — bulk create within a DB transaction. The existing `createFromRequest` stays; series is a new flow.
- **Doctor scope**: Add a `scopeForUser(Builder $query, User $user)` method on the `Appointment` model, called from the controller. Keeps the scoping logic out of the controller and testable.
- **No real-time (yet)**: The daily board uses standard Inertia navigation (router.reload with preserveScroll) for status updates. WebSockets / Reverb is out of scope for now. If the team decides real-time is needed, it is its own story.
