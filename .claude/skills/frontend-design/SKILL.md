---
name: frontend-design
description: Design and build frontend interfaces — pages, components, layouts, and UI flows — in the Inertia + React stack. Use this skill whenever the user asks to build or style a screen, component, form, dashboard, table, modal, or any UI; asks to make something "look better", "more polished", or "production-ready"; or shares a design and wants it implemented. Trigger this for any work in resources/js, any new Inertia page, or any React component work, even if the user only describes the feature and not the visual design.
---

# Frontend Design (Inertia + React)

Build interfaces that feel designed, not assembled. The team is senior — the
code should reflect that: typed, composable, accessible, and free of the
generic "AI default" look. Every screen is an Inertia page backed by a Laravel
controller; treat the props as a contract you do not get to change unilaterally.

## Before Writing Any Component

1. **Know the data.** What props does the controller send? What is their shape?
   If you do not know, ask — do not invent prop names. The backend and frontend
   move together.
2. **Know the job.** What is the user trying to accomplish on this screen? The
   primary action should be the most obvious thing on the page.
3. **Pick a direction.** Commit to a clear visual language — spacing scale,
   type scale, color roles, density. Consistency reads as quality. Drift reads
   as AI slop.

## Inertia Page Structure

- Pages live in `resources/js/Pages`, mirroring the route/controller naming.
- A page receives server state as props and renders it. It does **not** re-fetch
  what the server already sent.
- Navigation uses Inertia's `<Link>` and `router` — never raw `<a>` for
  in-app routes, never `fetch` for first-party data.
- Forms use Inertia's `useForm` — it handles the request, validation errors,
  processing state, and dirty tracking. Do not hand-roll form submission.
- Validation errors come back through Inertia and bind to fields by name.
  Surface them inline, next to the field, not in a generic banner.
- Flash messages (success, error) flow through shared Inertia data — render
  them in the layout, not per page.

## Component Conventions

- **Functional components and hooks.** TypeScript if the project uses it —
  match the existing convention, do not introduce a second style.
- **Shared, reusable UI** → `resources/js/Components`. **Page-specific UI**
  stays with its page. Do not promote something to shared until it is reused.
- **Server state** comes from props. **Local UI state** (open/closed, hover,
  the current tab) is `useState`/`useReducer`. Never copy a prop into state
  just to read it — that creates two sources of truth.
- **Effects** are for synchronizing with something external. Most "I need an
  effect" instincts are actually derived values — compute them in render.
- **Keys** on lists are stable and unique. Array index is acceptable only for
  a list that never reorders, inserts, or deletes.

## Visual Quality Bar

- **Spacing** follows one scale (e.g. 4px base). Arbitrary one-off margins are
  the most common tell of unconsidered UI.
- **Type** has a clear hierarchy — a small set of sizes and weights, used
  consistently. Body text is readable: sane line-height, sane measure.
- **Color** is role-based: surface, text, border, primary action, danger,
  success. Do not scatter hex values through components.
- **States** are designed, not skipped: hover, focus-visible, active, disabled,
  loading, empty, and error. The empty state and the loading state are part of
  the design, not an afterthought.
- **Density** matches the use case — a data table for power users is dense; a
  marketing page breathes. Decide deliberately.
- **Responsive** by default. Test the layout narrow as well as wide.

## Accessibility (Non-Negotiable)

- Every input has an associated `<label>`. Placeholders are not labels.
- Everything interactive is reachable and operable by keyboard, with a visible
  focus state.
- Use semantic elements — `<button>` for actions, `<a>`/`<Link>` for
  navigation, real headings in order.
- Color is never the only signal. Pair it with text or an icon.
- Images have meaningful `alt`; decorative images have empty `alt`.

## Forms — The Most Common Screen

- One `useForm` per form. Show `processing` state on the submit control and
  disable it while in flight.
- Errors render inline, tied to the field by name, the moment they come back.
- Preserve user input on a failed submit — never clear the form on error.
- Confirm destructive actions. Make success obvious (flash message, redirect,
  or visible state change).

## Output

Write real, working code — not pseudocode, not "// implement here". Match the
project's existing patterns (check neighboring pages and components first). If
the design depends on props the controller does not yet send, say so explicitly
and describe the prop shape the backend needs to add — do not silently invent it.

Keep the component readable: a senior reviewer should understand it in one pass.
Long render functions with deep nesting get extracted into smaller components.
