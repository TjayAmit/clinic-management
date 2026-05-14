# Dental Clinic Management System — Testing Plan

## Overview

This document defines the test strategy for the dental clinic management system based on the workflows and business rules in `user-story.md`. Tests are written using **Pest PHP v4** with the Laravel plugin and target three layers: Unit (services/DTOs/enums), Feature (HTTP/controller), and Integration (full workflow).

---

## Test Environment

- Framework: Pest PHP v4.5 + pest-plugin-laravel v4.1
- Database: SQLite in-memory (`DB_DATABASE=testing`)
- Mail: Array driver (captures notifications without sending)
- Queue: Sync driver
- Auth: `actingAs()` with role-specific users

---

## Directory Structure

```
tests/
├── Pest.php                          # Global helpers, uses()
├── Unit/
│   ├── Enums/
│   │   ├── AppointmentStatusTest.php
│   │   ├── QueueStatusTest.php
│   │   └── ServiceCategoryTest.php
│   ├── DTOs/
│   │   ├── AppointmentDataTest.php
│   │   └── QueueDataTest.php
│   └── Services/
│       ├── AppointmentServiceTest.php
│       ├── QueueServiceTest.php
│       └── PatientServiceTest.php
└── Feature/
    ├── Auth/                         # (existing)
    ├── Workflow/
    │   ├── PatientIntakeTest.php
    │   ├── AppointmentLifecycleTest.php
    │   ├── QueueManagementTest.php
    │   └── FollowUpSeriesTest.php
    ├── PatientTest.php
    ├── AppointmentTest.php
    ├── QueueTest.php
    └── ServiceTest.php
```

---

## Unit Tests

### 1. Enums

**File:** `tests/Unit/Enums/AppointmentStatusTest.php`

| Test | Assertion |
|------|-----------|
| All cases resolve to correct string values | `AppointmentStatus::Pending->value === 'pending'` etc. |
| `getLabel()` returns human-readable label for every case | `getLabel()` maps each case to its display string |
| Casting from string works on Appointment model | `Appointment::factory()->make(['status' => 'confirmed'])->status instanceof AppointmentStatus` |

**File:** `tests/Unit/Enums/QueueStatusTest.php`

| Test | Assertion |
|------|-----------|
| All 4 cases (Waiting, InProgress, Completed, NoShow) resolve | Correct `->value` strings |
| `getLabel()` returns correct label per case | String match |

**File:** `tests/Unit/Enums/ServiceCategoryTest.php`

| Test | Assertion |
|------|-----------|
| `SingleVisit` resolves to `'single_visit'` | Value check |
| `LongTerm` resolves to `'long_term'` | Value check |
| `getLabel()` returns `'Single Visit'` and `'Long Term'` | String match |

---

### 2. DTOs

**File:** `tests/Unit/DTOs/AppointmentDataTest.php`

| Test | Assertion |
|------|-----------|
| `fromRequest()` maps all required fields | `toArray()` contains `patient_id`, `dentist_id`, `service_id`, `appointment_date`, `start_time`, `end_time` |
| `is_walk_in` defaults to `false` when absent | `toArray()['is_walk_in'] === false` |
| `teeth_involved` is cast to array | `is_array($data->toArray()['teeth_involved'])` |
| `parent_appointment_id` is nullable | `null` when not provided |

**File:** `tests/Unit/DTOs/QueueDataTest.php`

| Test | Assertion |
|------|-----------|
| `fromRequest()` maps `appointment_id`, `queue_date`, `position`, `status` | `toArray()` has all fields |
| Missing `queue_date` defaults to today | `toArray()['queue_date'] === today()` |

---

### 3. Services (mocked repository)

**File:** `tests/Unit/Services/AppointmentServiceTest.php`

| Test | Assertion |
|------|-----------|
| `createFromRequest()` calls `repository->create()` once | Mock expectation |
| `createFromRequest()` sends `AppointmentBooked` to patient & dentist | `Notification::assertSentTo()` |
| `confirm()` calls `updateStatus('confirmed')` and sends `AppointmentConfirmed` | Mock + notification |
| `cancel()` sends `AppointmentCancelled` to patient and dentist | Notification assertion |
| `complete()` sends `AppointmentCompleted` to patient | Notification assertion |
| `createFollowUp()` sets `parent_appointment_id` from parent | Returned model has correct `parent_appointment_id` |
| `checkConflict()` delegates to repository | Mock returns `true` → service returns `true` |

**File:** `tests/Unit/Services/QueueServiceTest.php`

| Test | Assertion |
|------|-----------|
| `addToQueue()` calculates `position` as next available | `getNextPosition()` called with date |
| `addToQueue()` sets initial status to `QueueStatus::Waiting` | Persisted model has `waiting` status |
| `callNext()` sets `status = in_progress` and stamps `called_at` | Timestamps are set |
| `markCompleted()` sets `status = completed` and stamps `completed_at` | Timestamps are set |
| `markNoShow()` sets `status = no_show` without timestamps | No `called_at`/`completed_at` |
| `reorder()` wraps in transaction | Calls `repository->reorder()` with ordered IDs |

**File:** `tests/Unit/Services/PatientServiceTest.php`

| Test | Assertion |
|------|-----------|
| `createFromRequest()` calls `repository->create()` | Mock expectation |
| `search()` delegates term to repository | Mock called with term |
| `findWithHistory()` loads dental history eager load | Returns patient with history |
| `delete()` soft-deletes via repository | `repository->delete()` called |

---

## Feature Tests

### 4. Patient Management

**File:** `tests/Feature/PatientTest.php`

| Test | Method | Expected |
|------|--------|----------|
| Staff can list patients | `GET /patients` | 200, Inertia page `patients/index` |
| Staff can search patients by name | `GET /patients?search=John` | 200, filtered results |
| Staff can create a new patient | `POST /patients` with valid data | Redirect to patients list, DB has record |
| Validation fails without required fields | `POST /patients` missing `first_name` | 422, validation errors |
| Staff can update a patient | `PUT /patients/{id}` | Redirect, DB updated |
| Staff can delete a patient | `DELETE /patients/{id}` | Redirect, soft-deleted in DB |
| Doctor cannot create a patient | `POST /patients` as doctor | 403 |

---

### 5. Appointment Management

**File:** `tests/Feature/AppointmentTest.php`

| Test | Method | Expected |
|------|--------|----------|
| Staff can list appointments | `GET /appointments` | 200, Inertia `appointments/index` |
| Filter by date returns correct subset | `GET /appointments?date=2026-05-14` | Only that day's appointments |
| Filter by dentist returns correct subset | `GET /appointments?dentist_id={id}` | Only that doctor's appointments |
| Filter by status returns correct subset | `GET /appointments?status=confirmed` | Only confirmed |
| Filter walk-ins only | `GET /appointments?walk_in=1` | Only `is_walk_in=true` |
| Staff can create a scheduled appointment | `POST /appointments` with valid data | 302, redirects to index |
| Staff can create a walk-in appointment | `POST /appointments` with `is_walk_in=true` | 302, `is_walk_in` stored |
| Conflict detection blocks double-booking | `POST /appointments` conflicting time | Returns error on `start_time` |
| Staff can update appointment | `PUT /appointments/{id}` | Updated in DB |
| Staff can delete appointment | `DELETE /appointments/{id}` | Soft-deleted |
| Validation fails on missing required fields | `POST /appointments` missing data | 422 |

---

### 6. Appointment Status Lifecycle

**File:** `tests/Feature/Workflow/AppointmentLifecycleTest.php`

Tests the full status transition chain defined in business rules:

```
Pending → Confirmed → InQueue → InProgress → Completed
Pending → Cancelled
Pending → NoShow
InProgress → NeedsFollowUp → Scheduled (follow-up)
```

| Test | Endpoint | Pre-condition | Expected |
|------|----------|---------------|----------|
| Confirm a pending appointment | `PATCH /appointments/{id}/confirm` | status=pending | status=confirmed, `AppointmentConfirmed` sent |
| Move confirmed to in-queue | `PATCH /appointments/{id}/in-queue` | status=confirmed | status=in_queue |
| Mark in-progress | `PATCH /appointments/{id}/in-progress` | status=in_queue | status=in_progress |
| Complete an in-progress appointment | `PATCH /appointments/{id}/complete` | status=in_progress | status=completed, `AppointmentCompleted` sent |
| Cancel an appointment | `PATCH /appointments/{id}/cancel` | any status | status=cancelled, `AppointmentCancelled` sent |
| Mark no-show | `PATCH /appointments/{id}/no-show` | any status | status=no_show |
| Mark needs follow-up | `PATCH /appointments/{id}/needs-follow-up` | status=in_progress | status=needs_follow_up |
| Create follow-up from parent | `POST /appointments/{id}/follow-up` | parent exists | New appointment with `parent_appointment_id` set, same patient/doctor/service |

---

### 7. Queue Management

**File:** `tests/Feature/QueueTest.php`

| Test | Method | Expected |
|------|--------|----------|
| Staff can view today's queue | `GET /queue` | 200, Inertia `queue/index` |
| Filter queue by date | `GET /queue?date=2026-05-14` | Queue for that date |
| Filter queue by doctor | `GET /queue?doctor_id={id}` | Only that doctor's patients |
| Staff can add a patient to queue | `POST /queue` with valid `appointment_id` | 302, queue entry created with `waiting` status |
| Auto-assigns position as next in sequence | `POST /queue` x2 on same date | positions are 1, 2 |
| Staff can call next patient | `PATCH /queue/{id}/call` | status=in_progress, `called_at` set |
| Staff can complete queue entry | `PATCH /queue/{id}/complete` | status=completed, `completed_at` set |
| Staff can mark no-show | `PATCH /queue/{id}/no-show` | status=no_show |
| Staff can reorder queue | `POST /queue/reorder` with `ordered_ids` | Positions updated accordingly |
| Staff can remove patient from queue | `DELETE /queue/{id}` | Queue entry deleted |
| Cannot add appointment already in queue | `POST /queue` duplicate | Validation error |

**File:** `tests/Feature/Workflow/QueueManagementTest.php`

| Test | Assertion |
|------|-----------|
| Only one patient is `in_progress` per doctor at a time | After calling second patient for same doctor, no constraint violation expected (business rule: staff must manage this manually — assert that system does not auto-block) |
| Queue resets daily (no carryover) | `getToday()` returns only entries with today's `queue_date` |
| Walk-in patient added to queue appears in today's list | Create walk-in appointment → add to queue → appears in `getToday()` |

---

### 8. Patient Intake Workflows

**File:** `tests/Feature/Workflow/PatientIntakeTest.php`

Covers the two intake scenarios from Workflow 1.

#### Scenario A: Existing Patient — Walk-in

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Search for patient by name | `GET /patients?search=Jane` returns patient |
| 2 | Patient has no appointment today | `GET /appointments?date=today&patient_id={id}` empty |
| 3 | Create walk-in appointment | `POST /appointments` with `is_walk_in=true` | 302, created |
| 4 | Add to queue | `POST /queue` with new appointment id | 302, position=1 |
| 5 | Call patient | `PATCH /queue/{id}/call` | status=in_progress |
| 6 | Complete | `PATCH /queue/{id}/complete` + `PATCH /appointments/{id}/complete` | Both completed |

#### Scenario B: New Patient — Walk-in

| Step | Action | Assertion |
|------|--------|-----------|
| 1 | Register new patient | `POST /patients` with full data | Patient created, redirected |
| 2 | Create walk-in appointment for new patient | `POST /appointments` with `is_walk_in=true` | 302 |
| 3 | Verify `AppointmentBooked` notification sent | `Notification::assertSentTo($patient, AppointmentBooked::class)` |
| 4 | Add to queue | `POST /queue` | Queue entry with `waiting` status |
| 5 | Complete intake | Same as Scenario A steps 5–6 | Both completed |

---

### 9. Follow-up / Long-term Services

**File:** `tests/Feature/Workflow/FollowUpSeriesTest.php`

| Test | Assertion |
|------|-----------|
| Follow-up appointment inherits patient, dentist, service from parent | `followUp->patient_id === parent->patient_id` etc. |
| Follow-up has `parent_appointment_id` set | Not null |
| Parent can have multiple follow-ups | Two follow-ups created → `parent->followUps()->count() === 2` |
| Long-term service (category=long_term) can generate series | Service with `long_term` category creates chained appointments |
| `parent()` relation returns the parent appointment | `followUp->parent->id === parent->id` |
| `followUps()` relation returns all children | `parent->followUps` collection |

---

### 10. Service Management

**File:** `tests/Feature/ServiceTest.php`

| Test | Method | Expected |
|------|--------|----------|
| Staff can list services | `GET /services` | 200 |
| Staff can create single-visit service | `POST /services` with `category=single_visit` | 302, stored |
| Staff can create long-term service | `POST /services` with `category=long_term` | 302, stored |
| Staff can deactivate a service | `PUT /services/{id}` with `is_active=false` | Service inactive in DB |
| Inactive service not shown in appointment create | `GET /appointments/create` | Only active services in props |

---

## Test Factories

The following factories must be created or extended before running tests:

| Factory | Key States |
|---------|------------|
| `UserFactory` | `staff()`, `doctor()` roles |
| `PatientFactory` | Default with all required fields |
| `DoctorFactory` | Linked to a User; `is_active=true` |
| `ServiceFactory` | `singleVisit()`, `longTerm()` states |
| `AppointmentFactory` | `walkIn()`, `scheduled()`, `withStatus(AppointmentStatus $s)` states |
| `QueueFactory` | `waiting()`, `inProgress()`, `completed()` states |

---

## Shared Pest Helpers (Pest.php)

```php
// Authenticate as a staff user
function actingAsStaff(): TestCase { ... }

// Authenticate as a doctor
function actingAsDoctor(): TestCase { ... }

// Create a complete appointment with queue entry
function appointmentInQueue(): array { ... }
```

---

## Coverage Targets

| Layer | Target |
|-------|--------|
| Enums | 100% |
| DTOs | 100% |
| Service methods | ≥ 90% |
| Controller actions | ≥ 85% |
| Workflow scenarios | All 6 workflows from user-story.md covered |

---

## Execution Order

1. Run unit tests first: `php artisan test --testsuite=Unit`
2. Run feature tests: `php artisan test --testsuite=Feature`
3. Run full suite with coverage: `php artisan test --coverage --min=80`

---

## Business Rule Validation Checklist

Derived from `user-story.md` Business Rules — each must have at least one test:

- [ ] Every patient classified as existing or new upon arrival (PatientIntakeTest)
- [ ] Single-visit service → single appointment (AppointmentLifecycleTest)
- [ ] Long-term service → appointment series with parent_id chain (FollowUpSeriesTest)
- [ ] Walk-in patients added to same-day queue (QueueManagementTest)
- [ ] Scheduled patients have fixed time slots with conflict detection (AppointmentTest)
- [ ] Queue order managed by staff (reorder test in QueueTest)
- [ ] Queue resets daily (QueueManagementTest)
- [ ] Status transitions follow defined chain (AppointmentLifecycleTest)
- [ ] Notifications sent on: booked, confirmed, cancelled, completed (AppointmentServiceTest)
