# CLAUDE.md

Project context for Claude Code. This file is auto-loaded every session. Keep it
accurate — it is the single source of truth for how this team builds software.

## Team

This is a senior team. Every engineer has 7+ years of experience. Communicate
accordingly: skip beginner explanations, lead with the decision and the
trade-off, assume fluency with the stack below. When something is ambiguous,
ask a sharp question rather than guessing — seniors prefer a clarifying question
over a confident wrong answer.

## Tech Stack

- **Backend**: Laravel (PHP), monolith with Inertia as the view layer
- **Frontend**: React via Inertia.js — no separate SPA, no standalone API client
  for first-party screens. Pages live in `resources/js/Pages`.
- **Database**: MySQL — migrations are the source of truth, never edit schema by hand
- **Cache / Queue / Sessions**: Redis
- **Local environment**: Docker (Laravel Sail or a custom compose file)
- **Mail**: Mailpit for local SMTP capture — all mail in dev goes to Mailpit, never real inboxes
- **Testing**: Pest (or PHPUnit) for backend; Vitest + Testing Library for React where it earns its keep

## Architecture Conventions

- **Inertia is the contract.** Controllers return `Inertia::render('Page', $props)`.
  Props are the API. Keep them flat, typed, and minimal — do not dump whole
  Eloquent models with every relation loaded.
- **Form Requests** for all validation. Controllers stay thin. Business logic
  lives in Actions or Service classes, not in controllers and not in models.
- **Eloquent**: eager-load deliberately. An N+1 query is a bug, not a style choice.
- **Queues**: anything slow (mail, exports, third-party calls) goes on a Redis
  queue. Controllers do not block on slow work.
- **React**: functional components, hooks, TypeScript if the project has it.
  Shared UI in `resources/js/Components`. Page-specific UI stays with the page.
- **No browser storage** assumptions for first-party state — Inertia carries
  server state; React `useState`/`useReducer` carries local UI state.

## Local Commands

```bash
# Bring the environment up
./vendor/bin/sail up -d            # or: ./vendor/bin/sail up -d

# Backend
./vendor/bin/sail artisan migrate             # run migrations
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail artisan test                # run the test suite
./vendor/bin/sail artisan queue:work redis    # process queued jobs
./vendor/bin/sail artisan tinker

# Frontend
./vendor/bin/sail npm run dev                     # Vite dev server
./vendor/bin/sail npm run build                   # production build
./vendor/bin/sail npm run lint && ./vendor/bin/sail npm run types   # lint + typecheck

# Mail
# Mailpit UI is at http://localhost:8025 — check it for any mail-related work
```

## Definition of Done

A change is not done until: migrations run clean on a fresh DB, the test suite
passes, `npm run lint` and typecheck pass, no N+1 queries were introduced, and
any mail/queue work was verified (Mailpit for mail, `queue:work` for jobs).

## How to Use the `.claude/` Directory

- **`.claude/agents/`** — specialized subagents. Delegate to them by role.
- **`.claude/skills/`** — skills that trigger on matching work (code review,
  security audit, frontend design, optimization, hotfix).
- **`.claude/commands/`** — slash commands for repeatable workflows.
- **`docs/`** — planning and workflow documentation: how we plan (agile,
  discovery-first), and how developers and support staff actually operate.

When in doubt about *process*, read `./claude/docs/`. When in doubt about *a specific
kind of task*, the matching skill in `.claude/skills/` will trigger.
