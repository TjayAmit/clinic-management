# Backend Security Review — Clinic Management

**Reviewed:** 2026-05-14  
**Severity scale:** Critical → High → Medium → Low

---

## Critical

### 1. Zero authorization enforcement — RBAC is installed but never used
**Files:** All controllers, all `FormRequest` classes  
**Problem:** Every `FormRequest::authorize()` returns `true`. There are no `Gate`, `Policy`, `$this->authorize()`, or `can()` checks anywhere in any controller. `spatie/laravel-permission` is installed and roles/permissions exist in the database, but they are never checked server-side. Any authenticated user can:
- Create / delete users and assign them any role
- Create, modify, or delete roles and permissions
- Delete audit log entries
- Access and modify any patient's dental records

**Fix:** Add `authorize()` checks in each `FormRequest` (or controller) using Spatie's `can()` helper. Define a consistent permission set (e.g., `manage-users`, `manage-roles`, `delete-activity-logs`, `manage-dental-records`) and gate every write operation behind the appropriate permission. Suggested starting point:

```php
// In each FormRequest
public function authorize(): bool
{
    return $this->user()->can('manage-patients'); // example
}
```

---

### 2. `UserData::fromRequest` accepts `email_verified_at` and `two_factor_confirmed_at` from raw request input
**File:** `app/DTOs/UserData.php:24-26`  
**Problem:** The DTO reads `email_verified_at` and `two_factor_confirmed_at` directly from the HTTP request and passes them to `User::create()` / `User::update()`. Because `UserRepository::create()` calls `User::create($data)`, an attacker can POST these fields to instantly verify their email and/or mark 2FA as confirmed, bypassing both security mechanisms.

**Fix:** Remove these two fields from `UserData::fromRequest`. They must only be set server-side by the application logic (Fortify email verification, 2FA confirmation flow).

```php
// Remove these lines from fromRequest():
email_verified_at: $request->input('email_verified_at'),
two_factor_confirmed_at: $request->input('two_factor_confirmed_at'),
```

---

### 3. `AppointmentData::fromRequest` accepts unvalidated `status` from user input
**File:** `app/DTOs/AppointmentData.php:34`, `app/Http/Requests/AppointmentRequest.php`  
**Problem:** `AppointmentData::fromRequest` reads `status` from the request (`$request->input('status', 'pending')`), but `AppointmentRequest::rules()` has no `status` validation rule. Any authenticated user can create or update an appointment directly to `confirmed` or `completed`, bypassing the intended state machine (pending → confirmed → completed).

**Fix:** Remove `status` from `AppointmentData::fromRequest` so it is always set server-side. Use the hardcoded default `'pending'` on create and handle transitions only through the dedicated `confirm()`, `cancel()`, `complete()` service methods.

```php
// AppointmentData::fromRequest — remove this line:
status: $request->input('status', 'pending'),
// Instead, always default to 'pending' in the constructor and never read status from the request
```

---

## High

### 4. `UserController` double-hashes passwords — users created through it cannot log in
**File:** `app/Http/Controllers/UserController.php:43, 76`  
**Problem:** `UserController::store` and `update` manually call `bcrypt($validated['password'])` before passing the result to `User::create()` / `User::update()`. But the `User` model declares `'password' => 'hashed'` in its `casts()` method (line 38). Laravel's `hashed` cast always calls `Hash::make()` on any assigned value — it does **not** skip already-hashed strings. The result is a bcrypt hash of a bcrypt hash, which never matches during login.

**Fix:** Remove the `bcrypt()` call and let the `hashed` cast handle hashing, consistent with how `CreateNewUser` (Fortify) and `SecurityController` handle it.

```php
// store():
User::create([
    'name'     => $validated['name'],
    'email'    => $validated['email'],
    'password' => $validated['password'],  // hashed cast handles this
]);

// update():
if (! empty($validated['password'])) {
    $user->update(['password' => $validated['password']]);
}
```

---

### 5. Any authenticated user can delete audit log entries
**File:** `app/Http/Controllers/ActivityLogController.php:48-53`  
**Problem:** `ActivityLogController::destroy` has no permission check. The activity log is the only tamper-evidence mechanism in the system (especially important given dental health records). Any authenticated user can call `DELETE /activity-logs/{id}` and silently erase traces of their own actions.

**Fix:** Gate the destroy action (and ideally the index) behind an `admin` or `manage-activity-logs` permission. Consider making audit logs append-only and removing the destroy route entirely if deletion is not a business requirement.

---

### 6. Unbounded `per_page` parameter — memory exhaustion DoS
**Files:** `AppointmentController`, `PatientController`, `DoctorController`, `DentalRecordController`, `PatientVisitController`, `ServiceController`, `FeatureController`, `RoleController`, `ActivityLogController`  
**Problem:** Every listing endpoint accepts `per_page` from the request with no upper bound (e.g., `$request->integer('per_page', 10)`). Sending `?per_page=1000000` causes Laravel to attempt to load the entire table into memory in a single query. With a large dataset of patients, dental records, or appointments, this can crash the server or cause extreme slowdowns.

**Fix:** Cap the value in each controller before passing it to `paginate()`:

```php
$perPage = min($request->integer('per_page', 10), 100);
$query->paginate($perPage);
```

---

## Medium

### 7. `PatientData` / `Patient` model field name mismatch — dental history is silently lost
**Files:** `app/DTOs/PatientData.php:22,39`, `app/Models/Patient.php:17`, `database/migrations/..._create_patients_table.php`  
**Problem:** The database column and the `Patient` model's `#[Fillable]` list use `dental_history`. The `PatientData` DTO and `PatientRequest` use `medical_history`. When `PatientData::toArray()` returns `['medical_history' => ...]`, calling `Patient::create()` silently ignores it because `medical_history` is not in the fillable list. Patient dental history is never actually saved.

**Fix:** Rename the DTO property, request rule, and all references from `medical_history` to `dental_history` to match the model and database column.

```php
// PatientData.php
public ?string $dental_history = null,

// PatientRequest.php
'dental_history' => ['nullable', 'string'],
```

---

### 8. `DoctorRequest` email uniqueness uses the doctor ID against the `users` table
**File:** `app/Http/Requests/DoctorRequest.php:22`  
**Problem:** `Rule::unique('users')->ignore($doctorId)` uses the doctor's primary key to ignore a row in the `users` table. Doctor IDs and User IDs are different auto-increment sequences. On update, the wrong user row is ignored (or none at all), so the rule incorrectly blocks updates on a doctor's unchanged email, reporting it as "already taken".

**Fix:** Resolve the linked user ID from the doctor route model:

```php
$doctorId = $this->route('doctor')?->id;
$userId   = $this->route('doctor')?->user_id;

'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
'license_number' => ['required', 'string', 'max:100', Rule::unique('doctors', 'license_number')->ignore($doctorId)],
```

---

### 9. Unvalidated `visit_id` query parameter in `DentalRecordController::create`
**File:** `app/Http/Controllers/DentalRecordController.php:46-48`  
**Problem:** `$request->input('visit_id')` is passed directly to `PatientVisit::find()` with no type coercion, no existence validation, and no ownership/access check. Any authenticated user can probe `?visit_id=1`, `?visit_id=2`, etc., to enumerate patient visits and read linked patient and dentist data.

**Fix:** Validate the input and add an ownership or permission check:

```php
$patientVisit = null;
if ($visitId = $request->input('visit_id')) {
    $patientVisit = PatientVisit::with('patient', 'dentist')
        ->findOrFail((int) $visitId);
    // optionally: abort_unless(auth()->user()->can('view', $patientVisit), 403);
}
```

---

### 10. `QueueController::update` uses untyped plain `Request` — no input validation
**File:** `app/Http/Controllers/QueueController.php:43-47`  
**Problem:** The `update` method accepts a plain `Request` with no validation, unlike `store` which uses `QueueRequest`. Any authenticated user can send arbitrary data to update a queue entry.

**Fix:** Change the type hint to `QueueRequest` (same as `store`) or add inline validation.

---

### 11. Free-text medical fields have no `max:` length constraint
**Files:** `AppointmentRequest` (`notes`), `DentalRecordRequest` (`chief_complaint`, `diagnosis`, `treatment`, `prescription`, `notes`), `PatientRequest` (`allergies`, `medical_history`, `address`)  
**Problem:** These fields accept unlimited strings. A malicious or accidental payload of several megabytes will be accepted, passed through the DTO, and written to the database. Combined with the missing `per_page` cap, large payloads can also be echoed back to all users viewing the record.

**Fix:** Add reasonable max lengths. For clinical notes, `max:5000` or `max:10000` is a sensible upper bound:

```php
'notes'          => ['nullable', 'string', 'max:5000'],
'diagnosis'      => ['nullable', 'string', 'max:5000'],
'treatment'      => ['nullable', 'string', 'max:5000'],
'chief_complaint' => ['required', 'string', 'max:1000'],
```

---

## Low / Informational

### 12. Settings profile `PATCH` does not require email verification (`verified` middleware missing)
**File:** `routes/settings.php:10-12`  
**Problem:** `PATCH /settings/profile` only requires `auth`, not `verified`. The `DELETE` on the same route does require `verified`. An unverified user can update their profile (including email) without having verified their original email.

**Fix:** Move the `PATCH` route into the `['auth', 'verified']` group, or apply the `verified` middleware to it individually.

---

### 13. `SwitchUserController` allows any authenticated local user to impersonate any account
**File:** `app/Http/Controllers/Dev/SwitchUserController.php`  
**Problem:** The controller is correctly gated to `local` environment only, but there is no check that the requesting user is an admin. In a shared local environment (e.g., a team dev database), any authenticated user could switch to a super-admin account.

**Fix:** Add an admin role check:

```php
abort_unless(app()->environment('local') && auth()->user()->hasRole('super-admin'), 403);
```

---

### 14. `UserController` is inconsistent — does not use `UserRequest` or `UserService`
**File:** `app/Http/Controllers/UserController.php`  
**Problem:** All other resource controllers use Form Requests and Services. `UserController` uses inline `$request->validate()` and calls `User::create()` directly. Beyond code consistency, this means the `UserService` activity logging and DTO protection are bypassed.

**Fix:** Swap inline validation for `UserRequest` and delegate to `UserService`, consistent with the rest of the codebase.

---

## Implementation Order

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | Fix double-hashing bug (#4) — functional breakage | XS |
| 2 | Remove sensitive fields from `UserData::fromRequest` (#2) | XS |
| 3 | Remove `status` from `AppointmentData::fromRequest` (#3) | XS |
| 4 | Fix `medical_history` → `dental_history` mismatch (#7) | XS |
| 5 | Fix `DoctorRequest` unique-ignore wrong ID (#8) | XS |
| 6 | Cap `per_page` in all controllers (#6) | S |
| 7 | Add `max:` to free-text fields (#11) | S |
| 8 | Validate `visit_id` in `DentalRecordController` (#9) | S |
| 9 | Add `QueueRequest` to `QueueController::update` (#10) | XS |
| 10 | Gate `ActivityLogController::destroy` (#5) | S |
| 11 | Add RBAC enforcement throughout (#1) | L |
| 12 | Fix profile `verified` middleware (#12) | XS |
| 13 | Add admin check to `SwitchUserController` (#13) | XS |
| 14 | Refactor `UserController` to use service/request (#14) | S |
