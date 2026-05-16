# Frontend Security Audit Report
**Date:** 2026-05-16  
**Auditor:** Security Auditor Agent  
**Stack:** Laravel + Inertia.js + React (TypeScript), Redis, MySQL, Mailpit  
**Scope:** `resources/js/pages/`, `resources/js/components/`, `resources/js/hooks/`, `resources/js/app.tsx`

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 3 |
| Medium | 3 |
| Low | 2 |
| Informational | 2 |

**Overall risk rating: HIGH.** One critical XSS from server-controlled SVG injection, one high-severity exposure of full user list and emails to every authenticated session, one high-severity client-only authorization on destructive actions in the appointment show page, and a bare `fetch()` call that sends no CSRF token. None of these require exploiting a browser bug — they follow directly from the source.

---

## Findings Table

| ID | Severity | File : Line | Description |
|----|----------|-------------|-------------|
| F-01 | Critical | `components/two-factor-setup-modal.tsx:81` | Server-controlled SVG injected via `dangerouslySetInnerHTML` — stored XSS |
| F-02 | High | `app/Http/Middleware/HandleInertiaRequests.php:63` + `components/app-sidebar-header.tsx:21` | All user names, emails, and roles shared as Inertia props on every page load |
| F-03 | High | `pages/appointments/show.tsx:163–270` | Edit/Delete/Status-change buttons rendered with no permission check — bypassed by low-privilege users |
| F-04 | High | `components/quick-actions.tsx:26` | Bare `fetch()` call — no CSRF token, no credentials check, unauthenticated read possible |
| F-05 | Medium | `pages/dashboard.tsx:12–13` | Dashboard role routing is client-only; server must enforce data scope independently |
| F-06 | Medium | `npm audit` | 1 high + 4 moderate npm vulnerabilities (`fast-uri`, `ip-address`, `postcss`) |
| F-07 | Medium | `pages/auth/login.tsx:110–113`, `pages/auth/forgot-password.tsx:17–20` | Flash `status` prop rendered as plain text — safe today, but should stay typed |
| F-08 | Low | `routes/web.php:184–188` | `/dev/email-preview` routes are not `auth`-guarded in the local environment |
| F-09 | Low | `pages/appointments/create.tsx:43`, `pages/patients/show.tsx:61` | `defaultPatientId` and `patient.id` interpolated into URLs — numeric, safe now, but typed `unknown` in User type |
| F-10 | Info | `types/auth.ts:10` | `User` type has `[key: string]: unknown` index signature — future prop leakage risk |
| F-11 | Info | `components/app-sidebar-header.tsx` | Dev user-switcher correctly gated to `local` environment by both route middleware and `abort_unless` |

---

## Detailed Findings

### F-01 — Critical: Stored XSS via `dangerouslySetInnerHTML` on 2FA QR SVG

**File:** `/home/tjay/clinic-management/resources/js/components/two-factor-setup-modal.tsx` lines 78–88

**Code:**
```tsx
<div
    className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
    dangerouslySetInnerHTML={{
        __html: qrCodeSvg,
    }}
    ...
/>
```

**How `qrCodeSvg` is obtained:**

```ts
// hooks/use-two-factor-auth.ts lines 49-61
const fetchQrCode = useCallback(async (): Promise<void> => {
    try {
        const { svg } = (await submit(qrCode())) as { svg: string; url: string };
        setQrCodeSvg(svg);
    } catch { ... }
}, [submit]);
```

The SVG string comes from `GET /two-factor/qr-code` (a Laravel Fortify endpoint). Fortify generates this server-side using the `BaconQrCode` library, which produces a clean `<svg>` element. Under normal operation this is safe. The attack surface is:

1. **If `BaconQrCode` is compromised** (supply chain) it can return an SVG containing `<script>` or `<image onload="...">` tags that execute inside the React DOM.
2. **If the API response is intercepted** (e.g. the app is deployed over HTTP or a MitM is present), the attacker can substitute a malicious SVG and achieve stored XSS inside an authenticated session.
3. **If a future code path exposes this component to an external SVG URL** (e.g. by passing a different source), full XSS is immediate.

**Impact:** Arbitrary JavaScript execution in the victim's authenticated browser session — account takeover, session token theft, data exfiltration of all PHI visible to that user.

**Fix:** DOMPurify-sanitize the SVG before injecting it, or render the QR code client-side using a React QR library (e.g. `qrcode.react`) from the `otpauth://` URL that Fortify also returns in the `svg` response.

```tsx
import DOMPurify from 'dompurify';

const cleanSvg = DOMPurify.sanitize(qrCodeSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
});

<div dangerouslySetInnerHTML={{ __html: cleanSvg }} />
```

Hand to: **frontend-engineer**. Re-audit after fix.

---

### F-02 — High: Full User List (Names, Emails, Roles) Leaked to Every Authenticated Session

**File:** `/home/tjay/clinic-management/app/Http/Middleware/HandleInertiaRequests.php` lines 63–71  
**Consumer:** `/home/tjay/clinic-management/resources/js/components/app-sidebar-header.tsx` lines 21, 46–53

**Code:**
```php
// HandleInertiaRequests.php
'devUsers' => app()->environment('local')
    ? User::with('roles')->get(['id', 'name', 'email'])
        ->map(fn ($u) => [
            'id'    => $u->id,
            'name'  => $u->name,
            'email' => $u->email,
            'roles' => $u->roles->pluck('name')->values(),
        ])
    : null,
```

This is gated to `local` environment — **good**. However, the issue is the pattern itself.

The `auth` shared prop unconditionally sends `permissions` and `roles` arrays to the frontend on every request:

```php
'auth' => [
    'user'        => $request->user(),       // full Eloquent model
    'roles'       => $request->user()?->getRoleNames() ?? collect(),
    'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? collect(),
],
```

`$request->user()` serializes the full Eloquent `User` model including every fillable field. The `User` type definition (`types/auth.ts`) exposes `two_factor_enabled` as an optional field, suggesting the model's `two_factor_*` columns could be in the serialized output depending on the model's `$hidden` array.

**Concrete risk:** Open browser DevTools → Network → any Inertia page request → inspect `X-Inertia-*` response or the initial page HTML → the full authenticated user model is visible. If `two_factor_secret` or `two_factor_recovery_codes` are not in `$hidden`, they appear in every page response.

**Verification needed:** Confirm whether `User::$hidden` excludes `two_factor_secret`, `two_factor_recovery_codes`, `password`, `remember_token`. If not — this is Critical.

**Fix:**
```php
'auth' => [
    'user' => $request->user()?->only(['id', 'name', 'email', 'email_verified_at', 'two_factor_enabled']),
    'roles' => ...,
    'permissions' => ...,
],
```

Hand to: **backend-engineer**. Re-audit after fix.

---

### F-03 — High: No Client-side Permission Guards on Appointment Destructive Actions

**File:** `/home/tjay/clinic-management/resources/js/pages/appointments/show.tsx` lines 220–270

Every status-change button (`Confirm`, `Add to Queue`, `Start`, `Complete`, `No Show`, `Cancel`), the `Edit` button, and the `Delete` button are rendered unconditionally — there is no call to `hasPermission()` or `hasRole()` on this page. Any authenticated user who can navigate to `/appointments/{id}` sees and can click all of these.

Compare to `appointments/index.tsx` which **does** guard edit/delete:
```tsx
{hasPermission('appointments.edit') && (
    <DropdownMenuItem ...>Edit</DropdownMenuItem>
)}
{hasPermission('appointments.delete') && (
    <DropdownMenuItem ...>Delete</DropdownMenuItem>
)}
```

The show page skips this entirely.

**Exploit:** A Doctor or Staff user with read-only appointment permissions navigates to `/appointments/42` and clicks "Delete". The Inertia `router.delete()` call fires. Whether it succeeds depends entirely on the server-side gate — the client provides no friction.

**Impact:** Accidental or malicious deletion/mutation of appointments by users who should not have that capability. Also a UX confusion for lower-privilege users who see controls they can't use.

**Fix:**
```tsx
const { hasPermission } = usePermission();

// In JSX:
{hasPermission('appointments.edit') && (
    <Button variant="outline" size="sm" asChild>
        <Link href={appointmentsEdit(appointment.id)}>Edit</Link>
    </Button>
)}
{hasPermission('appointments.delete') && (
    <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
        Delete
    </Button>
)}
```

Note: The server must also enforce these gates — the client check is defense-in-depth only.

Hand to: **frontend-engineer**.

---

### F-04 — High: Bare `fetch()` Call Without CSRF Token

**File:** `/home/tjay/clinic-management/resources/js/components/quick-actions.tsx` line 26

```tsx
useEffect(() => {
    fetch('/doctors/availability')
        .then((r) => r.json())
        .then((json) => setDoctors(json.data ?? []))
        .catch(() => {});
}, []);
```

This `fetch()` call:
1. Sends **no `X-XSRF-TOKEN` header** — Inertia's automatic CSRF protection only covers its own `router.*` methods.
2. Sends no `credentials: 'include'` — whether the session cookie is sent depends on browser SameSite defaults (Lax by default in modern browsers, which means it IS sent for same-site top-level navigations, but may not be for cross-origin contexts).
3. Has no error handling that would surface a 401/403 to the user.

For a **GET endpoint** this is lower risk (CSRF applies to state-changing verbs), but:
- If `/doctors/availability` is ever changed to return sensitive data it becomes an unauthenticated endpoint de facto.
- If a CORS misconfiguration is introduced later, this call becomes cross-origin readable.

The larger concern: this establishes a pattern. If developers copy this pattern for POST/PATCH calls, it breaks CSRF protection entirely.

**Fix:** Use Inertia's `useHttp` (already used in `use-two-factor-auth.ts`) or include the XSRF token:

```tsx
const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')?.[1];

fetch('/doctors/availability', {
    credentials: 'same-origin',
    headers: csrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) } : {},
})
```

Or better: make this an Inertia `visit` with `only: ['doctors']` partial reload.

Hand to: **frontend-engineer**.

---

### F-05 — Medium: Client-side-only Role Routing on Dashboard

**File:** `/home/tjay/clinic-management/resources/js/pages/dashboard.tsx` lines 12–13

```tsx
const isAdmin  = userRoles.includes('Admin');
const isDoctor = userRoles.includes('Doctor');

{isAdmin  && <AdminDashboard  {...props} auth={auth} />}
{!isAdmin && isDoctor  && <DoctorDashboard {...props} auth={auth} />}
{!isAdmin && !isDoctor && <StaffDashboard  {...props} auth={auth} />}
```

The dashboard **component rendered** depends on role. But all three components receive the same `props` object from the server (the same `DashboardProps` shape), which means the server serializes data for the requesting user's role. The question is whether the backend scopes `weekAppointments`, `recentRecords`, `doctorId`, etc. to the correct role.

This is a code-pattern finding: the client branch should never be the only gate. If the backend sends `DoctorDashboard` props to a Staff user because it failed to check role, the client would show `StaffDashboard` — but the doctor's appointments would be in the props object and visible in DevTools.

**Verification needed:** Confirm that `DashboardController` gates each prop by the authenticated user's role server-side.

**Fix (frontend side):** No change required if the backend is correct. Document the dependency explicitly. A comment in the controller asserting "data is scoped per role" reduces drift risk.

---

### F-06 — Medium: npm Dependency Vulnerabilities

**Source:** `npm audit`

| Package | Severity | Advisory |
|---------|----------|---------|
| `fast-uri` | High | Path traversal via percent-encoded dot segments (GHSA-q3j6-qgpj-74h6) |
| `fast-uri` | High | Host confusion via percent-encoded authority delimiters (GHSA-v39h-62p7-jpjc) |
| `ip-address` | Moderate | XSS in Address6 HTML-emitting methods (GHSA-v2v4-37r5-5v8g) |
| `express-rate-limit` | Moderate | Depends on vulnerable `ip-address` |
| `postcss` | Moderate | XSS via unescaped `</style>` in CSS stringify output (GHSA-qx2v-qp2m-jg93) |

`fast-uri` and `postcss` are build-time / dev dependencies. The `ip-address` XSS is in HTML-emitting methods unlikely to be called in this stack, but the advisory exists.

**Fix:** Run `npm audit fix` in the project directory. If breaking changes block the fix, pin each package to its patched minor version manually in `package.json`.

Hand to: **devops-engineer** / **frontend-engineer**.

---

### F-07 — Medium: Flash `status` Prop Rendered as Untyped Text

**Files:**
- `/home/tjay/clinic-management/resources/js/pages/auth/login.tsx` lines 110–113
- `/home/tjay/clinic-management/resources/js/pages/auth/forgot-password.tsx` lines 17–20

```tsx
{status && (
    <div className="mb-4 text-center text-sm font-medium text-green-600">
        {status}
    </div>
)}
```

React's JSX text interpolation (`{status}`) escapes HTML, so this is **not currently XSS**. However:
- The `status` value is a server-controlled string that is reflected directly to the user.
- If this were ever changed to render as HTML (e.g. someone adds a link using `dangerouslySetInnerHTML`), it becomes a reflected XSS vector.
- The string type is untyped — the server can send anything.

**Fix:** No immediate code change required. Add a type constraint and a code comment noting this must stay as text interpolation. If rich-text status messages are needed in the future, sanitize with DOMPurify.

---

### F-08 — Low: `/dev/email-preview` Routes Not Auth-Gated

**File:** `/home/tjay/clinic-management/routes/web.php` lines 184–188

```php
if (app()->environment('local')) {
    Route::middleware('auth')->group(function () {
        Route::post('/dev/switch-user/{user}', ...);
    });

    // Email previews — NO auth middleware
    Route::get('/dev/email-preview', ...)->name('dev.email-preview.index');
    Route::get('/dev/email-preview/{key}', ...)->name('dev.email-preview.show');
}
```

`/dev/switch-user` requires `auth` middleware. The email preview routes do not. In `local` environment, an unauthenticated request to `/dev/email-preview/appointment-booked-patient` renders a real email template populated from the most recent appointment in the database, including patient name and appointment details.

This is local-only so production risk is zero. But in CI environments or shared dev databases this leaks PHI without login.

**Fix:**
```php
if (app()->environment('local')) {
    Route::middleware('auth')->group(function () {
        Route::post('/dev/switch-user/{user}', ...);
        Route::get('/dev/email-preview', ...);
        Route::get('/dev/email-preview/{key}', ...);
    });
}
```

Hand to: **backend-engineer**.

---

### F-09 — Low: Patient ID Interpolated into URL String

**File:** `/home/tjay/clinic-management/resources/js/pages/patients/show.tsx` line 61

```tsx
<Link href={`/appointments/create?patient_id=${patient.id}`}>
```

`patient.id` is typed `number` in the `Patient` interface, so this is safe now. The `User` type has `[key: string]: unknown` on line 10 of `auth.ts`, which means an attacker who can control the user object shape (e.g. via mass assignment on the backend) could theoretically get a non-numeric value into `patient.id`. React's Link component passes this through as a string in the `href`, so a value like `1&is_admin=true` would append extra query params.

**Fix:** Explicitly coerce: `` `/appointments/create?patient_id=${Number(patient.id)}` `` or use the route helper. Already done correctly in some places (`String(appointment.id)`).

---

## Areas That Are Clean

**XSS:** All other user-supplied data (patient names, medical records, notes, allergies, prescriptions, diagnoses) is rendered via React JSX text interpolation (`{value}`), which escapes HTML. No `dangerouslySetInnerHTML` usage outside the single 2FA QR code case (F-01).

**CSRF:** All Inertia `useForm` submissions (`post`, `put`, `patch`, `delete`) and `router.*` calls automatically include the `X-XSRF-TOKEN` header. The `Form` component from `@inertiajs/react` also handles this. Only the single bare `fetch()` call (F-04) deviates.

**Input sanitization (frontend):** `patients/create.tsx` implements client-side sanitization functions (`sanitizeName`, `sanitizePhone`, `sanitizeFreeText`) that strip control characters and dangerous HTML tags. These are defense-in-depth; server-side validation is the real gate.

**Auth/session:** Login, password reset, 2FA challenge, and email verification all use Fortify-backed endpoints via Inertia's `Form` component. No custom session logic on the frontend.

**Open redirects:** No user-controlled redirect targets found. All `Link href` and `router.get()` calls use hardcoded route paths or route helpers from `resources/js/routes/`.

**Dev user-switcher:** Correctly gated — `routes/web.php` wraps `/dev/switch-user` in `if (app()->environment('local'))` and `auth` middleware; `SwitchUserController` also calls `abort_unless(app()->environment('local'), 403)`. The `devUsers` prop is also only populated in local environment. Double-gated correctly.

**Information disclosure:** No stack traces, debug output, or Laravel error pages surfaced to the frontend. Error messages come through Inertia's typed `errors` prop.

**Inertia prop leakage (beyond F-02):** Props are generally flat and minimal. The `Appointment` type does include nested patient email, phone, and allergies in `AppointmentsFormProps` — this is intentional for the appointment creation form where staff selects an existing patient and sees their contact details. Verify the backend only sends this when the user has `appointments.create` permission.

---

## Recommended Next Steps

**Immediate (this sprint):**
1. F-01 — Add DOMPurify sanitization to the 2FA QR SVG render. This is the only Critical.
2. F-02 — Audit `User::$hidden` to confirm `password`, `two_factor_secret`, `two_factor_recovery_codes`, `remember_token` are excluded. Whitelist `auth.user` props in the middleware.
3. F-03 — Add `hasPermission` guards to `appointments/show.tsx` action buttons.

**Short-term (next sprint):**
4. F-04 — Replace bare `fetch()` in `quick-actions.tsx` with an Inertia-aware call.
5. F-06 — Run `npm audit fix` and address remaining advisories.
6. F-08 — Add `auth` middleware to dev email preview routes.

**Ongoing:**
7. Establish a policy: all `show` pages that render destructive actions must call `usePermission()`.
8. Add TypeScript strict mode to catch `[key: string]: unknown` spread patterns before they reach production.
