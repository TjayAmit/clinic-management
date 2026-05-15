# Clinic Management — Project Status & Plan

*Created: 2026-05-15. This is the living basis for what is done, what is incomplete, and what still needs to be built.*

---

## What Is Built (Verified)

### Infrastructure & Auth
| Item | Status |
|---|---|
| Laravel 12 + Inertia + React + TypeScript | ✅ Done |
| Fortify auth (login, register, 2FA, password reset, email verify) | ✅ Done |
| User profile settings (profile update, password, appearance) | ✅ Done |
| Spatie RBAC — 3 roles: Admin, Doctor, Staff | ✅ Done |
| Permission seeder (full permission set defined) | ✅ Done |
| Repository / Service / DTO / Enum architecture | ✅ Done |
| Activity logging (Spatie, all write operations) | ✅ Done |
| Redis queue, mail via Mailpit | ✅ Done |
| Dev tools: user switcher, email preview routes | ✅ Done |
| Sidebar navigation (permission-gated per role) | ✅ Done |

### Core Modules
| Module | Backend | Frontend | Notes |
|---|---|---|---|
| **Dashboard** | ✅ Done | ✅ Done | Role-aware: Admin/Doctor/Staff each see relevant stats |
| **Doctors** | ✅ Done | ✅ Done | CRUD, specialization, license, active flag |
| **Doctor Schedules** | ✅ Done | ✅ Done | Weekly availability per doctor, managed from doctor profile |
| **Doctor Calendar** | ✅ Done | ✅ Done | Calendar view of a doctor's appointments |
| **Today's Schedule** | ✅ Done | ✅ Done | Single-action view; Doctor role auto-filters to own appointments |
| **Patients** | ✅ Done | ✅ Done | CRUD, demographics, dental history, toggle-regular flag |
| **Services** | ✅ Done | ✅ Done | CRUD, category enum, price, duration, active flag |
| **Appointments** | ✅ Done | ✅ Done | Full lifecycle: pending → confirmed → in_queue → in_progress → completed/needs_follow_up/cancelled/no_show |
| **Follow-up Series** | ✅ Done | ✅ Done | Follow-up appointments linked to parent, parent_appointment_id chain |
| **Queue Board** | ✅ Done | ✅ Done | Day/doctor filter, call/complete/no-show/reorder |
| **Patient Visits** | ✅ Done | ✅ Done | Index, show, check-in/check-out; no standalone create form |
| **Dental Records** | ✅ Done | ✅ Done | Full CRUD, linked to visit + patient |
| **Email Notifications** | ✅ Done | n/a | AppointmentBooked, Confirmed, Cancelled, Completed (queued) |
| **Users** | ✅ Done | ✅ Done | Basic CRUD; gaps noted below |
| **Roles & Permissions** | ✅ Done | ✅ Done | CRUD, permission assignment per role |
| **Activity Logs** | ✅ Done | ✅ Done | Index, show, delete |
| **Feature Flags** | ✅ Done | ✅ Done | CRUD, enable/disable toggle |

### Tests
| Suite | Status |
|---|---|
| Auth tests (login, register, 2FA, password reset, verify) | ✅ Done |
| Feature: Appointments, Patients, Queue, Services, Dashboard | ✅ Done |
| Workflow: Appointment lifecycle, follow-up series, patient intake, queue management | ✅ Done |
| Unit: DTOs (AppointmentData, QueueData), Enums, Services | ✅ Done |

---

## What Is Incomplete / Half-Baked

These features exist in some form but have known gaps that need to be closed.

### 1. Authorization Not Enforced in Backend
- **Gap**: Permissions are seeded and used for sidebar visibility in the frontend, but the backend controllers do not enforce them. There is no `can:` middleware on routes and no `$this->authorize()` in controllers.
- **Impact**: A Staff user who knows the URL can access admin-only actions. A Doctor can delete patients.
- **Fix needed**: Add `can:` middleware to route groups or `$this->authorize()` per controller action — matching the permissions already defined in the seeder.

### 2. UserController — No Role Assignment
- **Gap**: Users can be created/edited but there is no way to assign a role via the UI. The controller also uses inline `validate()` instead of the existing `UserRequest` form request.
- **Fix needed**: Add role selector to user create/edit forms; update controller to sync roles; wire up `UserRequest`.

### 3. Patient Visit — No Standalone Create Flow
- **Gap**: `PatientVisitController` has no `create` or `edit` methods. Visits can only be created from the appointment show page (which links to `/patient-visits/create?appointment_id=X`). Walk-in visits (no appointment) cannot be created.
- **Fix needed**: Implement `create` and `edit` in `PatientVisitController`; build the frontend forms. Walk-in flow should be accessible from the Patient Visits index.

### 4. Patient History / Profile Page
- **Gap**: The patient `show` page exists but does not aggregate the full patient timeline (all appointments → visits → dental records). This was the core promise of the system ("digital envelope").
- **Fix needed**: Patient show page should have tabs or a timeline section showing: upcoming appointments, past visits (with linked dental record), and a summary of all dental records.

### 5. Schedule Not in Sidebar
- **Gap**: The Today's Schedule route (`/schedule`) and page exist and work, but there is no sidebar link to it.
- **Fix needed**: Add "Today's Schedule" to the `Clinic` nav group in `app-sidebar.tsx`.

### 6. Doctor Schedule Validation in Appointment Booking
- **Gap**: Appointment creation checks for time conflicts with other appointments, but does NOT validate that the selected time slot falls within the doctor's defined schedule hours (`DoctorSchedule`). A booking can be made on a day the doctor doesn't work.
- **Fix needed**: In `AppointmentService::createFromRequest` and `updateFromRequest`, add a check against `DoctorSchedule` for the given `doctor_id` and `appointment_date` day-of-week.

### 7. Doctor Role Data Scoping
- **Gap**: When a Doctor logs in, `ScheduleController` correctly filters to their appointments, but `AppointmentController::index` shows all appointments regardless of role. Doctors should only see their own appointments.
- **Fix needed**: Add a role-based scope in `AppointmentController::index` — if the authenticated user has role `Doctor` and has a linked `Doctor` record, filter appointments by `doctor_id`.

---

## What Still Needs to Be Built

These are features either planned but not started, or missing entirely.

### P1 — Close the Core Gaps (above) First
The items in the "Incomplete" section above are P1 because they affect correctness and security.

### P2 — Reports Module
- **Permission already defined**: `reports.view` exists in the seeder and is assigned to Admin.
- **What's needed**: A `ReportsController`, a `/reports` route, a `reports/index.tsx` page.
- **Suggested reports**:
  - Appointments per doctor per period (daily/weekly/monthly)
  - Revenue summary by service
  - Patient visit frequency / regulars vs walk-ins
  - No-show rate
- Add "Reports" to the Admin sidebar group.

### P3 — In-App Notifications UI
- **Backend**: `notifications` DB table is created, email notifications are sent.
- **Gap**: There is no notification bell, dropdown, or notification center in the UI.
- **What's needed**: A notification bell icon in the app header; a dropdown that lists unread database notifications; a "mark all read" action. Optionally a `/notifications` page.

### P4 — Billing / Invoicing (Not Started)
- Not in any existing plan, but a common need in clinic management.
- Each completed visit could have a billable amount (service price × any adjustments).
- A simple invoice record linked to `PatientVisit` would cover basic use.
- **Decision needed**: Is this in scope? Confirm before starting.

### P5 — Appointment Reminders (Scheduled Notifications)
- **Backend foundation exists**: Queue is working, notifications are working.
- **What's needed**: A scheduled Laravel command (or queued job) that sends reminder emails to patients 24h before their appointment.
- Add to `app/Console/Kernel.php` or a scheduled job.

---

## Immediate Priority Order

1. **Add `Today's Schedule` to sidebar** — 5 min fix, high visibility gap.
2. **Enforce backend authorization** — security correctness; routes need `can:` middleware.
3. **User role assignment in CRUD** — without this, the RBAC system can't be used operationally.
4. **Doctor role data scoping** — Appointment index should scope to the logged-in doctor.
5. **DoctorSchedule validation at booking** — prevents booking doctors on days off.
6. **Patient Visit create/edit + walk-in flow** — closes the core patient intake workflow.
7. **Patient history / profile timeline** — the digital envelope, core value prop of the system.
8. **Reports module** — Admin analytics.
9. **In-app notifications UI** — notification bell.
10. **Appointment reminders** — scheduled notification job.

---

## Architecture Decisions (Stable, Do Not Change)

- **Repository → Service → Controller chain**: All business logic in Services. Controllers are thin.
- **DTOs for all writes**: `fromRequest()` static factory pattern. No raw array mutations in services.
- **Inertia props are the contract**: Keep them flat and typed. No dumping full Eloquent models with all relations.
- **Spatie for RBAC**: Roles = Admin, Doctor, Staff. Permissions are the granular gate. Never check roles directly in controllers.
- **Wayfinder for typed routes**: All frontend route calls go through `/resources/js/routes/` helpers.
- **Queued notifications**: No blocking mail in request lifecycle.
- **Soft deletes on Appointment**: `SoftDeletes` is on the model; archived data is recoverable.
