# Backend Security Audit Report
**Date:** 2026-05-16
**Scope:** Laravel backend (app/, routes/, database/, config/)
**Auditor:** security-auditor agent

---

## Executive Summary

The application has a generally sound structural foundation — all routes are gated by `auth` + `verified` middleware, Eloquent models use scoped fillable attributes, no raw SQL interpolation was found, and the Docker image is properly hardened. However, four findings warrant immediate attention: (1) `FeatureFlagMiddleware` is implemented but never registered, making it completely inert — any authenticated user can access disabled-feature routes; (2) the `/dev/email-preview` routes are unauthenticated in `local` env, which becomes critical if `APP_ENV` is ever mistakenly `local` in production; (3) open user self-registration is enabled by default and creates a privilege-escalation vector for a clinic application; (4) full patient PHI (allergies, blood type, emergency contacts, etc.) is broadcast to every appointment create/edit page for all 500 patients regardless of which one is selected. The seeder passwords (`password`) are a low-effort concern if seeds are accidentally run against production.

---

## Findings

---

### HIGH — `FeatureFlagMiddleware` Is Registered Nowhere and Has No Effect

**File:** `app/Http/Middleware/FeatureFlagMiddleware.php`, `bootstrap/app.php`

**Description:**
The `FeatureFlagMiddleware` class exists and contains a complete route-to-feature-flag mapping for every module in the application. It is never added to `bootstrap/app.php`'s `withMiddleware()` call, never registered as a named middleware alias, and never applied to any route group. Every route runs with no feature-flag enforcement whatsoever, regardless of what the admin sets in the Features UI.

**Evidence:**

`bootstrap/app.php` only registers:
```php
$middleware->web(append: [
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
]);
```

`routes/web.php` has no reference to `FeatureFlagMiddleware`. The class at `app/Http/Middleware/FeatureFlagMiddleware.php` is unreachable dead code.

**Exploit:** An authenticated Staff user navigates to `/users` even though the `users_management` feature flag is disabled — the route succeeds because the middleware never fires. Feature flags give admins a false sense of control over access surfaces.

**Recommendation:**
Register the middleware globally on the web stack or as a named alias applied to the protected group:

```php
// bootstrap/app.php
$middleware->web(append: [
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
    \App\Http\Middleware\FeatureFlagMiddleware::class,
]);
```

---

### HIGH — Activity Log `destroy` Route Uses `view` Permission, Not a Delete Permission

**File:** `routes/web.php:176-178`

**Description:**
The DELETE route for activity logs checks `can:activity_logs.view` — the same permission required only to read logs. Any user who has view access (e.g., a Doctor role with `activity_logs.view`) can permanently delete audit trail entries. This subverts the audit log entirely — a user can cover their own tracks.

**Evidence:**
```php
Route::delete('activity-logs/{activityLog}', [ActivityLogController::class, 'destroy'])
    ->middleware('can:activity_logs.view')   // <-- should be activity_logs.delete
    ->name('activityLogs.destroy');
```

The seeder grants `activity_logs.view` to Admin only, so in this specific seeder configuration exploitation requires Admin. However the code is structurally wrong: it uses the wrong permission, meaning any future role granted `activity_logs.view` would implicitly gain delete capability. A dedicated `activity_logs.delete` permission does not exist in the seeder.

**Recommendation:**
Create a new permission `activity_logs.delete`, assign it only to Admin in the seeder, and update the route middleware:
```php
->middleware('can:activity_logs.delete')
```

---

### HIGH — Open Self-Registration Enabled in a Clinic Staff Application

**File:** `config/fortify.php:147`, `app/Actions/Fortify/CreateNewUser.php`

**Description:**
`Features::registration()` is active. Anyone who can reach the application can POST to `/register` and create a valid, authenticated user account. New accounts have no role assigned by default (zero permissions), so they cannot access most features. However, a self-registered account can: log into the dashboard; view any Inertia shared props including the full `permissions` and `roles` arrays; use any route whose feature flag middleware is not enforced (see finding above); and trigger the existing session and authentication flow. This is a clinic system — anonymous self-registration has no legitimate use case and creates an unnecessary attack surface.

**Evidence:**
```php
// config/fortify.php
'features' => [
    Features::registration(),   // enables POST /register publicly
    ...
]
```

**Recommendation:**
Remove `Features::registration()` from the features array. User provisioning is already handled through the authenticated `UserController` (Admin-only). If registration is kept intentionally, add an invite-token mechanism or disable email verification bypass.

---

### MEDIUM — Email Preview Routes Are Unauthenticated in `local` Environment

**File:** `routes/web.php:188-192`

**Description:**
The `/dev/email-preview` and `/dev/email-preview/{key}` GET routes are conditionally registered when `app()->environment('local')`. They are inside the `if (app()->environment('local'))` block but outside the `Route::middleware('auth')` group that wraps the switch-user route. No authentication is required.

**Evidence:**
```php
if (app()->environment('local')) {
    Route::middleware('auth')->group(function () {
        Route::post('/dev/switch-user/{user}', ...);  // auth-protected
    });

    // Email previews — NO auth middleware
    Route::get('/dev/email-preview', [EmailPreviewController::class, 'index'])
        ->name('dev.email-preview.index');
    Route::get('/dev/email-preview/{key}', [EmailPreviewController::class, 'show'])
        ->name('dev.email-preview.show');
}
```

`EmailPreviewController::sampleAppointment()` queries a real `Appointment` record and loads patient, doctor, and service data before rendering the email HTML. In a local development environment shared on a network, or if `APP_ENV=local` is ever set on a staging server, any unauthenticated visitor can read rendered patient email content including appointment times, patient names, doctor names, and service names.

**Recommendation:**
Move the email preview routes inside the `auth` middleware group:
```php
if (app()->environment('local')) {
    Route::middleware('auth')->group(function () {
        Route::post('/dev/switch-user/{user}', ...);
        Route::get('/dev/email-preview', ...);
        Route::get('/dev/email-preview/{key}', ...);
    });
}
```

---

### MEDIUM — Bulk PHI Broadcast to Appointment Create/Edit Pages

**File:** `app/Http/Controllers/AppointmentController.php:59`, `app/Http/Controllers/AppointmentController.php:111`

**Description:**
Both `create()` and `edit()` pass up to 500 patient records as Inertia props, each including `allergies`, `blood_type`, `emergency_contact_name`, `emergency_contact_phone`, and `date_of_birth`. This data is serialized into the page's initial JSON payload and is readable in the browser's page source for any authenticated user with `appointments.create` or `appointments.edit` — including Staff, who should have no need to view blood types or allergy information during appointment scheduling.

**Evidence:**
```php
'patients' => Patient::orderBy('last_name')->limit(500)->get([
    'id', 'first_name', 'last_name', 'phone', 'email',
    'address', 'emergency_contact_name', 'emergency_contact_phone',
    'blood_type', 'allergies', 'date_of_birth'  // <-- PHI fields
]),
```

**Exploit:** A Staff user opens the browser DevTools Network tab on the appointment create page. The initial Inertia payload contains allergies and blood types for all 500 patients. The user can extract this data without ever visiting the patient profile.

**Recommendation:**
Serve only `id`, `first_name`, `last_name`, and `phone` in the initial list prop. Load the full patient detail via a separate server-side route when a specific patient is selected:
```php
'patients' => Patient::orderBy('last_name')->limit(500)->get(['id', 'first_name', 'last_name', 'phone']),
```

---

### MEDIUM — `QueueController::update()` Accepts Unvalidated Input

**File:** `app/Http/Controllers/QueueController.php:43-48`

**Description:**
`QueueController::update()` uses a plain `Request` with no Form Request and passes it directly to `QueueService::update()`, which then constructs a `QueueData` DTO from arbitrary request inputs including `status`, `called_at`, `completed_at`, and `position`. An authenticated user with `appointments.edit` can POST arbitrary values including past timestamps for `called_at` / `completed_at` and any `QueueStatus` enum value, bypassing any business-logic state machine.

**Evidence:**
```php
// QueueController.php
public function update(Request $request, Queue $queue)
{
    $this->service->update($queue->id, $request);  // no validation
    ...
}

// QueueData::fromRequest reads: status, called_at, completed_at, position
```

**Recommendation:**
Apply the existing `QueueRequest` (or a new `QueueUpdateRequest`) to the `update()` action, and add explicit validation for the permitted status transitions. Alternatively, remove the generic update endpoint and use the purpose-built `call`, `complete`, and `noShow` actions exclusively.

---

### MEDIUM — Unbounded `per_page` Parameter Allows Resource Exhaustion

**File:** `app/Http/Controllers/AppointmentController.php:38`, and all other paginated controllers

**Description:**
The `per_page` parameter is read directly from the request with no maximum bound: `->paginate($request->integer('per_page', 10))`. An authenticated user can request `?per_page=100000` on any paginated endpoint, causing a full table scan and large result set to be loaded into memory and serialized.

**Evidence:**
```php
->paginate($request->integer('per_page', 10))
// same pattern in: PatientController, DoctorController, ServiceController,
// DentalRecordController, PatientVisitController, FeatureController,
// RoleController, ActivityLogController (uses $request->per_page ?? 10 directly)
```

**Recommendation:**
Clamp the value with a sensible maximum:
```php
->paginate(min($request->integer('per_page', 10), 100))
```

---

### MEDIUM — Hardcoded Default Credentials in Seeders Run by `DatabaseSeeder`

**File:** `database/seeders/AdminUserSeeder.php:18`, `database/seeders/UsersSeeder.php:18,38`

**Description:**
`DatabaseSeeder` calls both `AdminUserSeeder` and `UsersSeeder`, both of which create accounts with the password `password`. The `artisan migrate:fresh --seed` command used in CI (and presumably in onboarding instructions) would plant these credentials in any environment where seeds are run. The admin account (`admin@example.com` / `password`) has full permissions including user management.

**Evidence:**
```php
// AdminUserSeeder.php
User::create([
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
]);

// UsersSeeder.php — seeded and printed to console output
$this->command->info('  Doctor : doctor@clinic.test  (password: password)');
$this->command->info('  Staff  : staff@clinic.test   (password: password)');
```

**Recommendation:**
Use `App::isLocal()` / environment guards in `DatabaseSeeder` to prevent fixture seeders from running in non-local environments. Alternatively, split seeders: keep `RoleAndPermissionSeeder` safe for production and gate the user fixture seeders behind an environment check. For production bootstrapping, require the password to be passed via environment variable:
```php
if (!app()->isLocal()) {
    throw new \RuntimeException('UsersSeeder must not run in production.');
}
```

---

### LOW — `DoctorService::createFromRequest()` Generates Credentials Without Delivery

**File:** `app/Services/DoctorService.php:142-157`

**Description:**
When a Doctor user is created through `DoctorController`, the service generates a random 16-character password via `Str::random(16)` and immediately discards it after `bcrypt()`. There is a TODO comment acknowledging this. The new doctor user has no way to log in — they must rely on the "forgot password" flow. This is a process gap rather than an immediate vulnerability, but it also means the Doctor user creation path bypasses the `Password::defaults()` policy (which is only enforced in production for the standard registration flow).

**Evidence:**
```php
$password = $this->generateRandomPassword();
$user = User::create([
    'password' => bcrypt($password),  // discarded immediately — user cannot log in
]);
// TODO: In the future, implement proper password system and send credentials via email
```

**Recommendation:**
Send a password reset link to the new doctor's email immediately after account creation. Use `Password::sendResetLink(['email' => $user->email])` or queue a Fortify-compatible reset notification.

---

### LOW — User Self-Deletion Has No Protection Against Last Admin

**File:** `app/Http/Controllers/Settings/ProfileController.php:49-61`, `routes/settings.php:15`

**Description:**
Any authenticated user can delete their own account via `DELETE /settings/profile` (password confirmation is required, which is good). There is no check preventing the last Admin from deleting themselves, which would leave the application with no Admin-role user. Staff and Doctor users can also delete themselves, which may conflict with soft-deleted appointment and visit audit records.

**Recommendation:**
Before deletion, check if the user is the last Admin and abort:
```php
if ($user->hasRole('Admin') && User::role('Admin')->count() === 1) {
    return back()->withErrors(['password' => 'You are the last admin and cannot delete this account.']);
}
```

---

### LOW — Session Cookie `secure` Flag Defaults to `null`

**File:** `config/session.php:172`

**Description:**
`'secure' => env('SESSION_SECURE_COOKIE')` defaults to `null` (falsy) if the environment variable is not set. In production, if the operator forgets to set `SESSION_SECURE_COOKIE=true`, session cookies will be sent over plain HTTP, making them susceptible to interception.

**Recommendation:**
Default to `true` and allow override only for non-HTTPS environments:
```php
'secure' => env('SESSION_SECURE_COOKIE', app()->isProduction()),
```

---

### LOW — `AppointmentRequest` Does Not Validate `parent_appointment_id` Ownership

**File:** `app/Http/Requests/AppointmentRequest.php:29`

**Description:**
`parent_appointment_id` is validated only as `exists:appointments,id`. An authenticated user can set any appointment as the parent of a new appointment, including appointments belonging to other doctors or patients. There is no check that the parent appointment belongs to the same doctor or patient as the new appointment.

**Recommendation:**
Add a custom validation rule that verifies the parent appointment's `patient_id` and `doctor_id` match the submitted values, or validate it in the service layer before persisting.

---

### INFO — Inertia Shared Props Include Full Permissions Array

**File:** `app/Http/Middleware/HandleInertiaRequests.php:59`

**Description:**
Every page render shares `getAllPermissions()->pluck('name')` for the authenticated user. This is a common pattern and does not expose permissions the user does not have, but it does enumerate the complete permission model of the application to anyone who can log in. In a clinic context this is low risk, but it provides an attacker with a roadmap of privilege levels.

**Recommendation:** Acceptable as-is for an Inertia RBAC pattern. Consider switching to `can()` checks per-action if the permission list grows.

---

### INFO — `sidebar_state` and `appearance` Cookies Are Excluded from Encryption

**File:** `bootstrap/app.php:17`

**Description:**
These cookies are explicitly excluded from Laravel's cookie encryption. They control only UI state (sidebar open/closed, dark/light mode) and contain no sensitive data — this is a correct and intentional exemption.

---

### INFO — Composer Audit: No Known Vulnerabilities

Running `composer audit` against the locked dependency set returned no advisories. All declared packages (`laravel/framework ^13.0`, `laravel/fortify ^1.34`, `spatie/laravel-permission ^7.4`, `spatie/laravel-activitylog ^5.0`, `inertiajs/inertia-laravel ^3.0`) are current and clean as of this audit date.

---

### INFO — Docker Image Is Well-Hardened

The multi-stage `Dockerfile` correctly: avoids baking `APP_KEY` or credentials into layers; sets `APP_DEBUG=false` and `APP_ENV=production` via `ENV`; runs PHP-FPM as `www-data`; removes `.env`, `tests/`, and `.github/` in the final stage; and uses `--no-dev` for the Composer install. No issues found.

---

## Risk Summary Table

| Severity | Count |
|----------|-------|
| Critical | 0     |
| High     | 3     |
| Medium   | 4     |
| Low      | 4     |
| Info     | 4     |

---

## Recommendations Priority Order

1. **Register `FeatureFlagMiddleware`** in `bootstrap/app.php`. This is a one-line fix that closes a systemic access-control gap affecting every feature-gated module.

2. **Fix the activity log destroy permission** from `activity_logs.view` to `activity_logs.delete` and add the missing permission to the seeder.

3. **Disable open self-registration** by removing `Features::registration()` from `config/fortify.php`. A clinic system has no use case for anonymous account creation.

4. **Strip PHI from the appointment patient list prop** — pass only `id`, `first_name`, `last_name`, `phone` and fetch extended details on demand.

5. **Validate `QueueController::update()`** input with a Form Request or by applying `QueueRequest`.

6. **Clamp `per_page`** to a maximum (e.g. 100) across all paginated controllers.

7. **Add environment guard to fixture seeders** so `AdminUserSeeder` and `UsersSeeder` cannot run in production.

8. **Add session secure cookie production default** so `SESSION_SECURE_COOKIE` defaults to `true` in production.

9. **Add `auth` middleware to email preview dev routes**.

10. **Implement last-admin protection** in `ProfileController::destroy()`.
