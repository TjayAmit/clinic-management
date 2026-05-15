# Planning

How this team plans work. The method is agile, and it is **discovery-first**:
we do not plan a solution until we understand the problem. Everyone here has
7+ years of experience — this document is the shared agreement on *process*, so
that planning conversations are short and consistent, not a re-litigation of
how to plan every time.

The single most important rule: **understand what the client needs and what
problem the solution must solve before producing a plan.** A confident plan for
a misunderstood problem is the most expensive thing this team can produce.

---

## Phase 0 — Discovery (before any plan exists)

Discovery is not a formality. It is the phase that decides whether everything
after it is worth doing. Do not skip it because the request "seems clear" —
requests that seem clear are exactly the ones that hide the wrong assumption.

### Questions discovery must answer

**The client and the goal**
- Who is the client, and who are the actual end users? They are often not the
  same person.
- What is the client *actually* trying to achieve — the business or personal
  outcome behind the request? Look past the literal feature ask to the goal.
- Why now? What changed that made this worth doing?

**The problem**
- What problem does this solve? State it as a problem, not as a feature.
  "Users abandon checkout because it takes six screens" is a problem. "Build a
  one-page checkout" is a pre-chosen solution.
- Who has this problem, how often, and what does it cost them today?
- How do they cope with it now? The current workaround tells you what the
  solution must beat.
- What happens if we do nothing? If the answer is "not much", that is worth
  knowing before investing.

**Success**
- What does success look like, concretely and observably? What can we measure
  or see that tells us it worked?
- What would make this a failure even if it ships?

**Constraints and context**
- Deadline and why. Budget or capacity limits.
- Existing system constraints — this stack is Laravel + Inertia + React +
  MySQL + Redis + Docker + Mailpit; what in the current codebase or data
  shapes what is feasible.
- Compliance, security, or contractual constraints.
- What is explicitly *out* of scope.

### How to run discovery

- Ask open questions first, then narrow. "Walk me through how this works
  today" surfaces more than "do you want feature X or Y".
- Separate the problem from the solution every time the client states a
  solution. Ask "what problem does that solve for you?" and keep pulling that
  thread until you reach the real need.
- Restate what you heard back to the client and get explicit confirmation.
  Misalignment found here costs a sentence; found in sprint review it costs a
  sprint.
- Write it down. The output of discovery is a short, shared **problem
  statement** — see below.

### Discovery output: the problem statement

Before planning begins, produce and confirm this. Keep it to one page.

```
## Problem Statement

**Client & users:** who asked, who actually uses it
**The goal:** the outcome the client wants (not the feature)
**The problem:** stated as a problem, with who has it and what it costs
**Current state:** how it is handled today, and why that is not good enough
**Success looks like:** concrete, observable outcomes
**Constraints:** deadline, budget, technical, compliance
**Out of scope:** what we are deliberately not doing
**Open questions:** anything still unresolved that affects the plan
```

If the open questions section contains anything that materially changes the
plan, discovery is not finished. Resolve it before Phase 1.

---

## Phase 1 — Shaping the solution

Now — and only now — design the solution to the confirmed problem.

- **Generate options.** For a non-trivial problem there is rarely one
  approach. Sketch two or three, including a deliberately minimal one.
- **Evaluate against the problem statement**, not against elegance. The
  question is "does this solve the confirmed problem within the confirmed
  constraints", not "is this the most interesting build".
- **Make the trade-offs explicit.** Effort, risk, time-to-value,
  maintainability, what each option forecloses. Recommend one, with reasoning a
  senior peer can challenge.
- **Find the smallest valuable slice.** What is the least we can build that
  delivers real value and validates the approach? That is usually where to
  start — it turns assumptions into evidence early.
- **Confirm the shaped solution** with the client before committing to a full
  plan.

---

## Phase 2 — The backlog

Translate the shaped solution into a backlog.

- **Epics** — large bodies of work tied to the goal.
- **User stories** — `As a <user>, I want <capability>, so that <benefit>`.
  The "so that" must trace back to the problem statement. If it does not, the
  story does not belong in this backlog.
- **Acceptance criteria** — for each story, concrete and testable. Written
  before the story is picked up, ideally as Given/When/Then. "Done" is not a
  matter of opinion.
- **Slicing** — stories are vertical: a thin path through backend, the Inertia
  prop contract, and the React screen that delivers something usable. A story
  that delivers no user-visible value on its own is a task, not a story.
- **Definition of Ready** — a story is ready to be picked up only when it has
  clear acceptance criteria, no blocking unknowns, dependencies identified, and
  is small enough to finish within a sprint.

---

## Phase 3 — Estimation and prioritization

- **Estimate relatively.** Story points by complexity, uncertainty, and effort
  — not hours. The team estimates together; divergence in estimates is a signal
  to discuss, not to average away.
- **Prioritize by value and risk.** High-value and high-uncertainty work goes
  early — value because it matters, uncertainty because early learning is
  cheap and late learning is not. Foundational work that unblocks the rest
  comes early too.
- **Account for the unglamorous.** Testing, migrations, deploy work, and
  hardening are part of the estimate, not a tax discovered later.

---

## Phase 4 — Sprint planning and the cadence

The cadence is a standard agile loop. Sprint length is fixed (commonly two
weeks); pick one and keep it.

- **Sprint planning** — pull the top of the prioritized backlog into the
  sprint, only stories meeting Definition of Ready, only as much as past
  velocity supports. Each story has an owning agent/engineer and named
  hand-offs (the backend↔frontend Inertia contract especially).
- **Sprint goal** — one sentence stating what this sprint achieves toward the
  problem. If the sprint cannot be summarized in a sentence, it is not focused.
- **Daily standup** — progress, plan, blockers. Blockers get an owner the same
  day.
- **Sprint review** — demo working software against acceptance criteria, with
  the client. Feedback here feeds discovery for the next cycle.
- **Retrospective** — improve the process itself. One or two concrete changes,
  not a wish list.

---

## Phase 5 — Definition of Done

A story is done — across this stack — when:

- Acceptance criteria are met and demonstrable.
- Migrations run clean on a fresh database, with working `down()`.
- Automated tests cover the behavior and pass; no flaky tests introduced.
- `npm run lint` and typecheck pass.
- No N+1 queries and no obvious performance regressions introduced.
- Security basics hold: server-side authorization, validation in Form
  Requests, no sensitive data leaked into Inertia props.
- Mail-related work verified in Mailpit; queued-job work verified with a
  running worker.
- The change has been code-reviewed; security-sensitive changes have been
  security-reviewed.
- Relevant documentation updated.

"Done" is not "the code runs on my machine." It is the full list above.

---

## When the plan meets reality

Plans are revised by evidence, not abandoned at the first surprise.

- **New information** from a sprint review or a spike updates the backlog and
  priorities — that is the loop working, not the plan failing.
- **Scope change** from the client goes back through discovery: does it change
  the problem statement? Re-shape, re-estimate, re-prioritize. It does not get
  absorbed silently mid-sprint.
- **A blown estimate** is a signal — surface it at standup, do not absorb it
  with quiet overtime. Re-plan honestly.
- **A genuine emergency** is not planned through this document — it goes
  through the hotfix process (the `hotfix` skill and `docs/workflows.md`), and
  the proper fix re-enters this backlog afterward.

---

## The one-paragraph version

Understand the client's real goal and the actual problem before you plan
anything. Write a confirmed one-page problem statement. Shape two or three
solutions against it and pick one with explicit trade-offs. Slice it into
vertical user stories with testable acceptance criteria. Estimate relatively,
prioritize by value and risk, and run it through a steady sprint cadence with a
real Definition of Done. Revise the plan with evidence; route emergencies
through hotfix, not through here.
