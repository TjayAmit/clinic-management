# Code Review — 2026-05-16 (updated)

## Summary

The walk-in registration feature and availability endpoints are functionally correct. The previously reported blocking issues (null crash, duplicate audit log, unique index, inner transaction, mass-assignment, follow-up walk-in copy) are all confirmed resolved. Two items carry over: the double-EXISTS schedule query (BE-L1/BE-L2) and the unbounded patient query — the latter now has a `limit(500)` cap which is acceptable for now. New code introduced three concrete bugs: a cross-cutting `dentist` vs `doctor` key mismatch in TypeScript that silently breaks doctor-name display site-wide, walk-in patient names showing as "Unknown patient" in the schedule view, and an N+1 in `DoctorService::getTodayAvailability`. One security gap exists: the dev email-preview routes are unauthenticated and render real patient data.

---

## Backend

### Critical
None.

### High

**[BE-H1]** `/home/tjay/clinic-management/routes/web.php:194–197` — **Unauthenticated dev email-preview routes expose real patient data.**

`/dev/email-preview` and `/dev/email-preview/{key}` are outside every middleware group. `EmailPreviewController::sampleAppointment()` fetches the latest real appointment with patient, doctor, and service data from the database and renders it into an email template. Anyone who can reach the server on localhost (shared Docker networks, CI containers, port-forwarded dev machines) can read patient PII without logging in.

Fix: move both routes inside the existing `auth` middleware group at line 187.

```php
Route::middleware('auth')->group(function () {
    Route::post('/dev/switch-user/{user}', ...);
    Route::get('/dev/email-preview', ...);
    Route::get('/dev/email-preview/{key}', ...);
});
```

### Medium

**[BE-M1]** `/home/tjay/clinic-management/app/Services/DoctorService.php:84` — **N+1 queries in `getTodayAvailability`.**

Doctors are fetched with `with(['user', 'schedules'])` at line 57, but inside the `foreach` loop at line 84, `$doctor->appointments()` fires one query per doctor. With 10 active doctors that is 11 queries; with 50 it is 51. The `AppointmentAvailabilityController` correctly bulk-loads appointments before the loop — apply the same pattern here.

Fix: before the loop, bulk-load today's appointments grouped by `doctor_id` (same pattern as `AppointmentAvailabilityController:47–51`), then replace `$doctor->appointments()->...->get()` with a collection lookup.

**[BE-M2]** `/home/tjay/clinic-management/app/Services/AppointmentService.php:73–80` — **Two sequential `EXISTS` queries per `assertDoctorAvailable` call (BE-L2, still unresolved).**

`$hasSchedule` and `$doctorHasAnySchedules` each fire a separate `EXISTS` query. Every `createFromRequest` and `updateFromRequest` call pays this cost.

Fix: fetch the day's schedules in a single `get(['is_available'])` call and derive both booleans from the collection — or collapse into one query using a conditional aggregate.

### Low

**[BE-L1]** `/home/tjay/clinic-management/app/Http/Controllers/AppointmentController.php:51,90` — **`Patient::orderBy('last_name')->limit(500)` is a soft cap, not a real solution.**

The `limit(500)` prevents an unbounded query but still dumps 500 rows of PII (name, phone, email, address, DOB, blood type, allergies, emergency contact) into every create/edit page load. This is disproportionate when the user only needs to select one patient.

Recommend: replace with a server-side autocomplete endpoint (`/patients/search?q=…`, returns ≤20 matches) and a `<Combobox>` on the frontend. This is a should-fix for any clinic with more than a few hundred patients.

---

## Frontend

### Critical
None.

### High

**[FE-H1]** `/home/tjay/clinic-management/resources/js/types/appointments.ts:28` — **`Appointment.dentist` key does not match the Eloquent relation name `doctor`; doctor names are silently missing site-wide.**

The `Appointment` model's relation is `doctor()`, so Eloquent/Inertia serializes it as `"doctor"`. The TypeScript type declares `dentist?` instead. Every page that reads `appt.dentist?.user?.name` (schedule index, appointments index, queue, dashboard, show, create follow-up) gets `undefined` at runtime — no TypeScript error because the key is optional. Doctor names disappear silently.

This file was modified in the current PR (new fields added to `PatientOption`). The `dentist` key is pre-existing but the type file is in scope for this review.

Fix: rename `dentist?` → `doctor?` in `Appointment` and update all call-sites. Pages affected (non-exhaustive): `schedule/index.tsx:314`, `appointments/index.tsx:200`, `appointments/show.tsx:148–149`, `dashboard.tsx:238,365`, `queue/index.tsx:230–231`. Note: `DentalRecord` and `PatientVisit` models DO have a `dentist` relation — those usages are correct and must not be changed.

### Medium

**[FE-M1]** `/home/tjay/clinic-management/resources/js/pages/schedule/index.tsx:270–271` — **Walk-in patient names render as "Unknown patient" in the Today's Schedule view.**

`AppointmentCard` builds `patientName` from `appt.patient?.full_name` with a fallback to `first_name + last_name`, but never reads `appt.walk_in_name`. The `walk_in_name` field is also absent from the `Appointment` TypeScript type (`/home/tjay/clinic-management/resources/js/types/appointments.ts`), so it cannot be referenced without a type change. The daily board avoids this by manually mapping on the server side; the schedule view does not.

Fix (two parts):
1. Add `walk_in_name?: string | null` to the `Appointment` interface.
2. In `AppointmentCard`, change the name derivation to:
   ```ts
   const patientName = appt.patient?.full_name
       ?? (appt.patient ? `${appt.patient.first_name} ${appt.patient.last_name}` : null)
       ?? appt.walk_in_name
       ?? 'Unknown patient';
   ```

**[FE-M2]** `/home/tjay/clinic-management/app/Http/Controllers/ScheduleController.php:18` + `/home/tjay/clinic-management/resources/js/pages/schedule/index.tsx:293` — **Queue position badge never renders because `queue` is not eager-loaded.**

`ScheduleController` loads `['patient', 'doctor.user', 'service']` but not `queue`. The `Appointment` type includes `queue?: { id: number; position: number; status: string } | null`, and the card renders a queue position badge when `appt.queue?.position != null` — but `queue` is always absent from the JSON, so the badge is dead code.

Fix: add `'queue'` to the `with([...])` call in `ScheduleController`.

### Low

**[FE-L1]** `/home/tjay/clinic-management/resources/js/pages/schedule/index.tsx:59` — **`fetch('/doctors/availability')` is a bare `fetch` call with no cookie/session forwarding guarantee in some environments.**

Laravel's session-auth works on cookies. A bare `fetch` will send cookies in same-origin requests, so this will work in practice. However, if the request fails with a 401 or 403 (e.g., session expired), the `.catch` swallows the error silently and the sidebar just stays empty. Consider checking `r.ok` before `.json()` to distinguish network failure from auth failure, and optionally use `router.reload()` if a 401 is returned.

---

## Backend TODOs (prioritized)

1. **[BE-H1]** Add `auth` middleware to `/dev/email-preview` routes — 5-minute fix, blocks PII exposure.
2. **[BE-M1]** Fix N+1 in `DoctorService::getTodayAvailability` — bulk-load appointments before the loop.
3. **[BE-M2]** Collapse the two `EXISTS` queries in `AppointmentService::assertDoctorAvailable` into one.
4. **[BE-L1]** Replace the `limit(500)` patient query with a server-side autocomplete endpoint.

## Frontend TODOs (prioritized)

1. **[FE-H1]** Rename `dentist?` → `doctor?` in the `Appointment` type and fix all call-sites — doctor names are currently invisible everywhere.
2. **[FE-M1]** Add `walk_in_name` to the `Appointment` type and update `AppointmentCard` name derivation in `schedule/index.tsx`.
3. **[FE-M2]** Add `'queue'` to `ScheduleController`'s eager-load list.
4. **[FE-L1]** Check `response.ok` in the `fetch('/doctors/availability')` call before calling `.json()`.

---

## What's good

- `AppointmentAvailabilityController` bulk-loads appointments before the doctor loop and merges overlapping intervals correctly — solid N+1 prevention and the interval math is clean.
- `AppointmentAvailabilityController` validates `doctor_id` with `exists:doctors,id` before using it in a query — no IDOR risk.
- Both new availability routes (`appointments.availability`, `doctors.availability`) are inside `auth + verified` and gated with `can:appointments.view`.
- The `wasRecentlyCreated` guard on the audit log is correct and the `firstOrCreate` idempotency pattern is solid.
- `AppointmentRequest` correctly prohibits `status` from user input and the `withValidator` after-hook for non-walk-in patient requirement is a clean pattern.
- Test coverage for `AppointmentAvailabilityController` is thorough — it covers the schedule-not-configured edge case, cancelled/no-show exclusion, interval merging, and permission denial.
