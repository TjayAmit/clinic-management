# Workflows

How work actually moves through this team day to day. `docs/planning.md` covers
*what* we decide to build and *why*; this document covers *how* it gets built,
reviewed, shipped, and supported. It applies to developers and to the support
staff who work alongside them — QA, DevOps, and the people fielding client and
production issues.

Everyone here is senior (7+ years). These workflows exist so that coordination
is predictable, not so that anyone is told how to do their craft.

---

## 1. The standard feature workflow (developers)

This is the path a normal backlog story takes from "ready" to "done".

### 1.1 Pick up

- Pull the top-priority story that meets Definition of Ready (see
  `docs/planning.md`). Do not start work that is not Ready — unclear
  acceptance criteria mid-build is rework waiting to happen.
- Re-read the acceptance criteria. If anything is ambiguous *now*, resolve it
  *now* — with the tech lead or the client — before writing code.
- Move the story to In Progress. One primary in-progress story per person;
  finishing beats starting.

### 1.2 Branch

- Branch from the current mainline, named for the story
  (`feature/<id>-short-description`).
- Keep the branch short-lived. A branch open for two weeks is a merge conflict
  and a stale assumption. Small, frequent merges over big-bang ones.

### 1.3 Build

- Work in vertical slices. For a typical Inertia feature that means: migration
  and model → Form Request and Action/Service → controller and the Inertia
  prop contract → the React page and components → tests throughout.
- **The Inertia prop contract is the seam.** When backend and frontend are
  different people (or different agents), agree the prop shape explicitly and
  early. Most feature-level friction lives at this seam — make it a deliberate
  hand-off, not an assumption.
- Follow the conventions in `CLAUDE.md`. Let the matching skill guide
  specialized work — `frontend-design` for UI, `performance-optimization` when
  something is slow.
- Commit in small, coherent units with messages that explain *why*, not just
  *what*.
- Run it against the Docker environment as you go. Verify mail in Mailpit,
  jobs with a running `queue:work`. Do not leave verification to the end.

### 1.4 Self-review before asking for review

Before opening a PR, review your own diff as if it were someone else's:

- Acceptance criteria met and demonstrable.
- Migrations run clean on a fresh DB; `down()` works.
- Tests written and passing; no flaky tests added.
- `npm run lint` and typecheck pass.
- No N+1 introduced; no obvious performance regression.
- No debug code, no commented-out blocks, no secrets, no stray `dd()`.

A PR that fails self-review wastes a reviewer's time. Catch it yourself.

### 1.5 Pull request

- Open a PR with a description that gives the reviewer what they need: what
  changed, why, how to test it, and anything they should look at closely.
- Link the story. Keep the PR scoped to that story — unrelated changes get
  their own PR.
- CI runs: install, build, migrate against a test DB, full test suite, lint,
  typecheck. A red pipeline is the author's to fix before review, not the
  reviewer's to wade through.

### 1.6 Review

- At least one senior reviewer. Anything touching auth, user input, secrets, or
  sensitive data also gets a security review. (The `code-review` and
  `vulnerability-audit` skills, and the `code-reviewer` / `security-auditor`
  agents, define how those reviews are done.)
- Reviewer turnaround is fast — an open PR is blocked work and a decaying
  branch. Treat reviewing as real work, not an interruption.
- Author addresses feedback or pushes back with reasoning. Review is a
  conversation between peers, not a gate one side operates on the other.
- Blocking issues block. Nitpicks do not block — fix them or note them and move
  on.

### 1.7 Merge and verify

- Merge once approved and green.
- Verify on the integrated environment — the feature does not just compile, it
  works alongside everything else.
- Move the story to Done only against the full Definition of Done in
  `docs/planning.md`.

---

## 2. The hotfix workflow (production incident)

When something is broken in production, the standard workflow does not apply —
speed and safety do. This is the coordination wrapper; the `hotfix` skill
carries the diagnostic procedure.

1. **Declare it.** Say out loud, in the team channel, that there is an
   incident. Silent solo firefighting is how incidents get worse. One person
   owns the incident; others support.
2. **Assess impact.** Who and what is affected, how badly. This sets urgency.
3. **Mitigate first if you can.** A feature flag, a route disable, or a
   rollback of the last deploy that stops the bleeding *now* beats a fast patch
   later. Mitigation buys time to diagnose properly.
4. **Diagnose to root cause.** Use the `hotfix` skill. Confirm the cause —
   do not patch a symptom you do not understand.
5. **Smallest safe fix.** Minimal, targeted, reversible. Resist the urge to
   refactor while the building is on fire.
6. **Expedited review, not skipped review.** A second set of eyes still
   matters under pressure — it is fast, not absent.
7. **Verify and ship**, with the rollback path known before you ship.
8. **Write the incident note** — symptom, root cause, fix, verification,
   rollback.
9. **File the follow-up.** The proper fix, the missing test, and the missing
   alert go into the normal backlog. The incident is not closed until the
   follow-up exists. It enters the next planning cycle via `docs/planning.md`.

---

## 3. Support workflow (staff supporting developers)

Support staff — QA, DevOps, and whoever fields incoming client and production
issues — keep the development team focused by being the structured front door
for everything that is not a planned backlog story.

### 3.1 Intake and triage

Every incoming issue — bug report, client question, production alert, support
ticket — goes through one intake point, not straight into a developer's DMs.
For each item, establish:

- **What is the observable problem?** In the reporter's terms first, then
  reproduced and confirmed.
- **Severity.** Use a consistent scale:
  - **S1 — Critical:** production down or data at risk, customers broadly
    affected. Triggers the hotfix workflow immediately.
  - **S2 — High:** major feature broken, significant customer impact, no clean
    workaround. Jumps the queue but follows the standard workflow.
  - **S3 — Normal:** a real bug with a workaround, or a meaningful improvement.
    Enters the backlog and is prioritized normally.
  - **S4 — Low:** minor, cosmetic, or nice-to-have. Backlog, low priority.
- **Reproducibility.** Steps, environment, expected vs actual. An issue that
  cannot be reproduced gets reproduction attempted before it reaches a
  developer — an unreproduced bug report is a research task, and it should be
  labeled as one.

### 3.2 Routing

- **S1** → hotfix workflow, now. Pull in the owning developer and DevOps.
- **S2** → into the current sprint via the tech lead; it displaces lower work,
  visibly, not silently.
- **S3 / S4** → into the backlog with severity, reproduction steps, and
  context attached, for normal prioritization in planning.
- **Not actually a bug** (works as designed, user confusion, environment issue
  on the reporter's side) → answer the reporter directly and close it. Do not
  spend developer attention on it. If the same confusion recurs, that is a
  documentation or UX signal worth a backlog item.

### 3.3 Shielding deep work

The point of the intake function is that developers are not interrupt-driven.

- Batch non-urgent questions; do not forward each one the moment it arrives.
- Answer what can be answered from documentation, known issues, or past
  tickets without touching a developer at all.
- Only genuine S1 incidents justify breaking a developer's focus immediately.
  Everything else has a queue.
- Maintain a known-issues list so the same question is answered once, not
  twenty times.

### 3.4 Closing the loop

- When a fix ships, the reporter is told — by support, not left to discover it.
- Recurring issues are a pattern, not a series of tickets. Surface the pattern
  in retrospective; the fix is often one backlog item, not ten closed tickets.

---

## 4. QA workflow (staff supporting developers)

QA is embedded in the cadence, not a stage bolted on at the end.

- **At planning:** QA helps sharpen acceptance criteria into something testable.
  A criterion QA cannot verify is not finished being written.
- **During the sprint:** QA writes and strengthens tests alongside development
  (see the `qa-test-engineer` agent), focusing effort on risk — money, auth,
  data mutations, branching logic — not on chasing a coverage percentage.
- **On a PR:** automated tests run in CI. QA's exploratory testing targets the
  unhappy paths and the edges automation misses.
- **On a bug:** every confirmed bug gets a regression test that fails on the
  old code and passes on the fix. That is how a fixed bug stays fixed.
- **Flaky tests** are treated as defects — fixed or removed promptly. A test
  the team has learned to ignore is worse than no test.

---

## 5. DevOps workflow (staff supporting developers)

DevOps keeps the environment reproducible and deploys boring (see the
`devops-engineer` agent).

- **Environment:** one documented command brings up a working Docker
  environment — MySQL, Redis, queue workers, scheduler, Mailpit. Drift between
  environments is a defect to be closed.
- **CI/CD:** every PR runs install, build, migrate against a test DB, full
  test suite, lint, and typecheck. Red blocks merge.
- **Deploys:** sequenced and predictable — migrations ordered correctly
  relative to code, queue workers restarted to pick up new code, health checks
  green before it is called done. Every deploy has a known, tested rollback.
- **Observability:** logs, health checks, and alerts exist before they are
  needed. A dead worker or a backed-up queue pages someone — it is not
  discovered by a customer.
- **Incident support:** in an S1, DevOps is the rollback-and-mitigation hand
  while developers diagnose root cause.

---

## 6. Communication norms (everyone)

- **Asynchronous by default.** Most things do not need an interruption. Write
  it down where the relevant people will see it.
- **Synchronous when the loop is too slow.** A decision bouncing through five
  async messages should have been a five-minute call. Know the difference.
- **Blockers are loud and immediate.** A blocker raised at standup gets an
  owner that day. A blocker sat on quietly is a missed sprint goal.
- **Decisions are written down** where the people they affect will find them —
  not buried in a thread of one.
- **Status is visible on the board**, not reconstructed by asking people.
- **Push back with reasoning.** This is a senior team; "I disagree, here is
  why" is expected and welcome. Disagree, decide, commit.

---

## 7. How it all fits together

```
                  docs/planning.md
        (discovery → shaping → backlog → sprints)
                          |
                          v
   ┌──────────────  Ready story  ──────────────┐
   |                                            |
   |   §1 Standard feature workflow              |
   |   pick up → branch → build → self-review    |
   |   → PR → review → merge → verify → Done     |
   |                                            |
   └────────────────────────────────────────────┘
              ^                       ^
              |                       |
   §4 QA embedded in cadence   §5 DevOps: env, CI/CD,
   (testable criteria,         deploys, observability
    regression tests)
              ^
              |
   §3 Support intake & triage  ──S1──>  §2 Hotfix workflow
   (front door for everything           (mitigate → diagnose →
    unplanned; shields deep work)        smallest safe fix → ship
              |                          → incident note → follow-up)
              └──S2 into sprint / S3-S4 into backlog──> docs/planning.md
```

Planning decides what and why. These workflows decide how. Support and QA and
DevOps are not downstream of development — they run alongside it, and the team
is faster because of it.
