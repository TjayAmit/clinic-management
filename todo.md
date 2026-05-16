# Dental Clinic Management System - Progress Plan

## Overview
This progress plan tracks implementation of the dental clinic management system based on the project plan and user story documents. Tasks follow the Laravel Architecture Standards: Branch → Data → Storage → Logic → UI → Test.

---

## Phase 1: Foundation

### Branch Setup
- [ ] Create feature branch off main (not master/staging)

---

## Phase 2: Data Layer (DTOs)

Using `@laravel-dto-repository` to define data shapes for all entities:

- [ ] Users & Roles: Create DTOs
- [ ] Dentists: Create DTOs
- [ ] Patients: Create DTOs
- [ ] Services: Create DTOs
- [ ] Doctor Schedules: Create DTOs
- [ ] Appointments: Create DTOs
- [ ] Patient Visits: Create DTOs
- [ ] Dental Records: Create DTOs
- [ ] Queues: Create DTOs (new entity from user-story)

---

## Phase 3: Storage Layer (Repositories)

Using `@laravel-query-repository` to create Interface/Repo and bind in RepositoryServiceProvider:

- [ ] Users & Roles: Create Interface/Repo
- [ ] Dentists: Create Interface/Repo
- [ ] Patients: Create Interface/Repo
- [ ] Services: Create Interface/Repo
- [ ] Doctor Schedules: Create Interface/Repo
- [ ] Appointments: Create Interface/Repo
- [ ] Patient Visits: Create Interface/Repo
- [ ] Dental Records: Create Interface/Repo
- [ ] Queues: Create Interface/Repo

---

## Phase 4: Logic Layer (Services)

Using `@laravel-service-layer` to create Services. Controllers will only relay to these Services:

- [ ] Users & Roles: Create Service
- [ ] Dentists: Create Service
- [ ] Patients: Create Service
- [ ] Services: Create Service
- [ ] Doctor Schedules: Create Service
- [ ] Appointments: Create Service (include conflict detection logic)
- [ ] Patient Visits: Create Service (include walk-in flow)
- [ ] Dental Records: Create Service
- [ ] Queues: Create Service

---

## Phase 5: UI Layer

Using `@laravel-inertia-react-builder` for React/Tailwind frontend:

- [ ] Users & Roles: Create UI
- [ ] Dentists: Create UI
- [ ] Patients: Create UI
- [ ] Services: Create UI
- [ ] Doctor Schedules: Create UI
- [ ] Appointments: Create UI
- [ ] Patient Visits: Create UI
- [ ] Dental Records: Create UI
- [ ] Queues: Create UI

---

## Phase 6: Core Features

High-priority features from the project plan:

- [ ] Appointment Conflict Detection - validate against overlapping appointments
- [ ] Walk-in Visit Flow - create PatientVisit without linked Appointment
- [ ] Appointment → Visit Transition - auto-create visit on appointment completion
- [ ] Patient History View - chronological appointments, visits, dental records
- [ ] Dashboard/Overview - today's appointments, checked-in patients, dentist availability, daily patient list
- [ ] Dentist Daily Patient List - each dentist views their complete daily schedule
- [ ] Service Classification - single_visit vs long_term categorization
- [ ] Status Transitions - implement full status workflow (scheduled→in_queue→in_progress→completed)

---

## Phase 7: Advanced Features

Medium-priority features:

- [ ] Appointment Series - recurring appointments for long-term services
- [ ] Notifications - appointment reminders (email/SMS)
- [ ] Reporting - appointments per dentist, revenue by service, patient visit frequency

---

## Phase 8: Testing

Using `@laravel-pest-tester` to reach 70% coverage:

- [ ] Users & Roles: Write tests
- [ ] Dentists: Write tests
- [ ] Patients: Write tests
- [ ] Services: Write tests
- [ ] Doctor Schedules: Write tests
- [ ] Appointments: Write tests
- [ ] Patient Visits: Write tests
- [ ] Dental Records: Write tests
- [ ] Queues: Write tests

---

## Implementation Notes

### Already Implemented (from project plan)
- Users & Roles: CRUD, role assignment (Spatie), activity log
- Dentists: CRUD, profile with specialization/license/bio, active flag
- Patients: CRUD, full demographic + dental history fields
- Services: CRUD, dental services with price + duration, active flag
- Dentist Schedules: CRUD, per-dentist weekly availability
- Appointments: CRUD, status workflow, auto end-time from service duration
- Patient Visits: Index + Show, check-in / check-out PATCH actions, vitals
- Dental Records: Full CRUD, linked visit context, clinical fields
- Activity Log: Spatie activity log viewer
- Feature Flags: Toggle system features on/off

### Database Migrations Created (2026-05-13)
- create_doctors_table
- create_patients_table
- create_services_table
- create_doctor_schedules_table
- create_appointments_table
- create_patient_visits_table
- create_dental_records_table
- create_features_table
- create_notifications_table

### New Entity from User Story
- Queues: Queue management for walk-in patients with status tracking (waiting, in_progress, completed, no_show)

---

## Git Commit Standards

Every commit must follow the 50/72 rule:
- Header: `<type>(<scope>): <summary>` (Max 50 chars, lowercase, imperative mood)
- Body: Explain the "Why" (72 chars per line)
- Footer: Reference Issue IDs

Allowed types: feat, fix, refactor, chore, docs, test

---

## Code Review Fixes (2026-05-16)

### Completed Backend Fixes
- **BE-C1**: Added unique index on `patient_visits.appointment_id` via migration and refactored `PatientVisitService::createFromAppointment` to use `firstOrCreate` for atomic idempotency
- **BE-H1**: Added tests for AppointmentData and PatientVisitData `toArray()` to verify integer-zero values (0, 0.0) are preserved
- **BE-M3**: Removed `status` from `AppointmentData::fromRequest()` and added `'status' => ['prohibited']` to `AppointmentRequest` to prevent client-side status injection
- **BE-H3**: Added code comment in `AppointmentService::complete()` documenting that walk-in unregistered appointments intentionally produce no PatientVisit record
- **BE-H2**: Removed redundant inner `DB::transaction` from `PatientVisitService::createFromAppointment` (already handled by caller's transaction)
- **BE-M1**: Verified all notifications (AppointmentBooked, AppointmentCancelled, AppointmentCompleted, AppointmentConfirmed) implement `ShouldQueue`
- **BE-M2**: Updated `AppointmentService::createFollowUp` to copy `is_walk_in` and `walk_in_name` from parent appointment when not explicitly overridden in request

### Deployment Note (BE-H4)
**Action Required**: Verify that the production deployment pipeline runs `php artisan migrate --force` before restarting the web process. The CI workflow runs migrations, but the Dockerfile does not include migration steps. For zero-downtime rolling deployments, migrations must run before the new code is deployed to prevent SQL errors from referencing new columns that don't exist yet.
