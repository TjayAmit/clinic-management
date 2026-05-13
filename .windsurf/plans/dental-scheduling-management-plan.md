# Dental Clinic Management System — Project Plan

## Project Overview

- **Purpose**: A digital dental clinic management system that replaces the manual, paper-based operations of a dental clinic. The system handles patient records, dentist schedules, appointment booking, visit tracking, and dental record keeping in a single web application.
- **Business Goal**: Eliminate paper-based scheduling and physical patient history envelopes by digitizing the entire patient journey — from booking an appointment to recording the outcome of each dental visit — while giving the clinic owner full visibility into schedules, history, and workload. Enable dentists to efficiently view their daily patient list and manage their schedule.
- **Target Users**:
  - **Clinic Owner / Admin**: Full access to all modules; configures dentists, dental services, and manages the system
  - **Dentist**: Views own daily schedule and patient list; creates and edits dental records for their patients
  - **Front Desk / Receptionist**: Manages appointments, checks patients in and out, handles basic record lookup
- **Success Criteria**:
  - No more paper scheduling; all dental appointments booked and tracked digitally
  - Each patient has a complete digital dental history accessible instantly — replacing the physical envelope system
  - Dentist availability is enforced automatically; double-booking is prevented
  - Appointment conflicts are caught at booking time without manual checking
  - Dental records are tied to specific visits for full traceability
  - Dentists can easily view their daily patient list and schedule at a glance

---

## Problem Statement

### Current Pain Points

1. **Manual Paper Scheduling**
   The dental clinic owner/dentist manages all patient appointments by hand on paper. When a patient calls to book, the dentist must visually scan the schedule sheet to find a free slot. There is no automatic conflict detection — double-bookings happen, and time is wasted correcting them. Dentists cannot easily view their daily patient list.

2. **Physical Patient Envelopes**
   Each patient's dental history is stored inside a physical envelope. Finding a patient's past visits, diagnoses, or prescriptions requires locating the correct envelope from storage. This is slow, error-prone, and records can be lost or damaged. There is no cross-patient querying possible. The envelope system makes it difficult to track a patient's complete dental treatment history.

3. **No Visit Continuity Tracking**
   There is no reliable link between an appointment, the actual visit that took place, and the dental record produced. A patient may have had multiple visits for the same dental condition — understanding the progression requires reading through loose papers.

4. **No Availability Awareness**
   When scheduling, staff must remember each dentist's working days and hours without any system support. If a dentist is unavailable on a given day, there is nothing preventing an accidental booking on that day.

---

## Domain Model

### Core Entities

#### User
Role-based access. Clinic staff, dentists, and admins each have different permissions managed via Spatie roles.

#### Dentist
```
id, user_id, specialization, license_number, phone, bio, is_active
```
Linked to a User account. Has defined weekly schedules (`DoctorSchedule`). A dentist's availability is checked when booking appointments.

#### Patient
```
id, first_name, last_name, date_of_birth, gender, blood_type,
phone, email, address,
emergency_contact_name, emergency_contact_phone,
allergies, dental_history
```
The digital equivalent of the patient's physical envelope. All visits and records are queryable by patient.

#### Service
```
id, name, description, price, duration_minutes, is_active
```
Dental clinic services (e.g., Dental Cleaning, Tooth Extraction, Root Canal, Dental Filling, Teeth Whitening, Orthodontic Consultation). Duration is used to auto-calculate appointment end time.

#### DoctorSchedule
```
id, dentist_id, day_of_week, start_time, end_time, is_available
```
Defines when each dentist is available. Used to validate appointment time slots.

#### Appointment
```
id, patient_id, dentist_id, service_id,
appointment_date, start_time, end_time,
status [pending | confirmed | completed | cancelled | no_show],
notes, created_by
```
The booking record. Status transitions drive the workflow from booking through completion.

#### PatientVisit
```
id, patient_id, dentist_id, appointment_id,
visited_at, check_in_at, check_out_at,
blood_pressure, temperature, weight, heart_rate, notes
```
Created when a patient actually arrives. Linked to an Appointment (or standalone for walk-ins). Vitals are recorded here. Check-in / check-out timestamps are captured.

#### DentalRecord
```
id, patient_visit_id, patient_id, dentist_id,
chief_complaint, diagnosis, treatment, prescription, notes
```
Clinical output of a dental visit. One record per visit. Linked to the PatientVisit for full traceability: appointment → visit → record.

---

## Feature Inventory

### Implemented

| Module | Features |
|---|---|
| **Users & Roles** | CRUD, role assignment (Spatie), activity log |
| **Dentists** | CRUD, profile with specialization/license/bio, active flag |
| **Patients** | CRUD, full demographic + dental history fields |
| **Services** | CRUD, dental services with price + duration, active flag |
| **Dentist Schedules** | CRUD, per-dentist weekly availability |
| **Appointments** | CRUD, status workflow, auto end-time from service duration |
| **Patient Visits** | Index + Show, check-in / check-out PATCH actions, vitals |
| **Dental Records** | Full CRUD, linked visit context, clinical fields |
| **Activity Log** | Spatie activity log viewer |
| **Feature Flags** | Toggle system features on/off |

### Planned / In Progress

#### Appointment Conflict Detection
- On booking (store) and update, validate that the selected dentist has no overlapping appointment for the given date + time range
- Also validate against `DoctorSchedule` — reject bookings outside the dentist's defined hours
- Return descriptive validation errors: "Dr. Santos is already booked 09:00–10:00 on May 15"

#### Walk-in Visit Flow
- Allow creating a `PatientVisit` directly without a linked `Appointment`
- Front desk needs a "New Walk-in Visit" flow from the Patient Visits page
- Backend: add `create` and `store` methods to `PatientVisitController`

#### Appointment → Visit Transition
- When an appointment is marked `completed`, prompt to create a PatientVisit (or auto-create one)
- Currently `appointments/show.tsx` links to `/patient-visits/create?appointment_id=X` — this 404s; the backend `create` method needs to be implemented

#### Patient History View
- A dedicated page on the Patient profile that shows: all appointments (past + upcoming), all visits, all dental records — in chronological order
- This is the digital equivalent of the patient envelope

#### Dashboard / Overview
- Today's appointments list
- Patients currently checked in
- Dentist availability summary for the day
- **Dentist Daily Patient List**: Each dentist can view their complete list of patients for the day with appointment times and status

#### Notifications
- Appointment reminders (email or SMS) to patients
- `notifications` migration already created; notification model/service TBD

#### Reporting
- Appointments per dentist per period
- Revenue summary by dental service
- Patient visit frequency

---

## Process Flows

### Booking an Appointment
1. Front desk selects patient, dentist, dental service, date, and start time
2. System auto-fills end time from service duration
3. On submit, backend validates:
   - Dentist is available on that day (DoctorSchedule)
   - No overlapping confirmed/pending appointment for that dentist in that time window
4. Appointment created with status `pending`
5. Staff confirms → status → `confirmed`

### Patient Visit Workflow
1. Patient arrives → front desk finds appointment → clicks "Check In"
2. `PatientVisit` record created (or existing one updated with `check_in_at`)
3. Dentist sees patient, records vitals on the Visit, creates a DentalRecord
4. Patient leaves → front desk clicks "Check Out" → `check_out_at` recorded
5. Appointment status set to `completed`

### Accessing Patient History
1. Open patient profile
2. View all linked PatientVisits sorted by `visited_at` desc
3. Each visit row links to its DentalRecord (if created)
4. Complete chronological picture — replaces the physical envelope

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.3 |
| Frontend | React 19, TypeScript, Inertia.js |
| UI | Shadcn/ui, Tailwind CSS v4 |
| Auth | Laravel Breeze (Inertia stack) |
| Permissions | Spatie Laravel Permission |
| Audit Log | Spatie Laravel Activity Log |
| Routes (typed) | Wayfinder |
| DB | MySQL |

---

## Directory Conventions

```
app/
  Models/          — Eloquent models
  Http/Controllers/— Inertia controllers (index/create/store/show/edit/update/destroy)
  Http/Requests/   — Form request validation classes
  Services/        — Business logic (e.g., AppointmentService for conflict checks)

resources/js/
  pages/           — Inertia page components (camelCase dirs for multi-word: patientVisits/)
  types/           — One TypeScript interface file per module; all re-exported from types/index.ts
  routes/          — Wayfinder typed route helpers (one file per resource)
  components/      — Shared UI components
  layouts/         — AppLayout with sidebar + breadcrumbs
```

---

## Migrations Created (2026-05-13)

- `create_doctors_table` (stores dentist profiles)
- `create_patients_table` (includes dental_history field)
- `create_services_table` (dental clinic services)
- `create_doctor_schedules_table` (dentist weekly availability, uses dentist_id)
- `create_appointments_table` (uses dentist_id)
- `create_patient_visits_table` (uses dentist_id)
- `create_dental_records_table` (renamed from medical_records, uses dentist_id, includes treatment field)
- `create_features_table` (system feature flags)
- `create_notifications_table`
