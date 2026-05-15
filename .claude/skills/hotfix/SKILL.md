---
name: hotfix
description: Diagnose and ship an urgent fix for a production incident with minimal blast radius. Use this skill whenever the user reports something is "broken in production", "down", "urgent", "a fire", "customers are affected", needs a "hotfix" or "emergency fix", or describes a regression that needs to ship now. Trigger this when the framing is urgency plus production — the priority shifts from ideal solution to safe, fast, reversible fix.
---

# Hotfix

A hotfix is not a normal change. The goal is to stop the bleeding **safely and
fast**, with the smallest possible change, and to leave a clear trail back to a
proper fix. A senior team knows the temptation here is to either panic-patch
without understanding, or to over-engineer under pressure. Do neither.

## The Hotfix Mindset

- **Smallest change that resolves the incident.** Not the best refactor. Not
  the clean fix. The minimal, targeted, reversible change.
- **Reversible.** You must be able to roll it back instantly if it makes things
  worse. If a change cannot be cleanly reverted, that is itself a risk to weigh.
- **Understood.** Do not ship a fix you cannot explain. A change that
  coincidentally makes the error go away can be hiding a worse problem.
- **Traceable.** Every hotfix creates a follow-up for the real fix. The hotfix
  is a tourniquet, not surgery.

## Procedure

### 1. Triage — establish the facts

- What exactly is broken? Observable symptom, not assumed cause.
- Who and what is affected? Scale and severity.
- When did it start? What shipped or changed around then? Recent deploy,
  migration, config change, dependency bump, traffic spike, expired credential?
- Is there a mitigation that buys time *right now* — feature flag off, disable
  the route, roll back the last deploy — while the real fix is prepared? An
  instant mitigation often beats a fast patch.

### 2. Diagnose — find the actual cause

- Read the error: logs, stack trace, failed jobs, exception tracker.
- Reproduce it if at all possible. A fix for an unreproduced bug is a guess.
- Trace to root cause. In this stack, common production fires:
  - a migration that ran (or did not run) — schema mismatch
  - a queue backed up or workers dead — Redis, failed jobs piling up
  - cache serving stale or poisoned data
  - an N+1 or missing index tipping over under real load
  - a third-party dependency down or rate-limiting
  - an expired secret, token, or certificate
  - a config/env difference between environments
  - mail misrouted (e.g. production pointed at the wrong SMTP)
- Confirm the cause before writing the fix. State it explicitly.

### 3. Fix — minimal and targeted

- Change only what is needed to resolve *this* incident.
- Resist scope creep. Note the other things you see; do not fix them now.
- Add or adjust a test that proves the fix and guards the regression — if it
  can be done fast. If a full test is slow, at minimum verify the fix manually
  and write down exactly how you verified it.
- If the cause is a migration or data issue, plan the data correction
  carefully and reversibly — data fixes are the highest-risk hotfixes.

### 4. Verify before shipping

- Confirm the fix resolves the symptom — ideally against the reproduction.
- Check the blast radius: what else could this change touch? Did you break a
  neighboring path?
- For queue/mail/cache fixes, verify the actual mechanism (worker processing,
  Mailpit in dev, cache repopulating correctly).
- Have the rollback ready and known before you ship.

### 5. Ship and document

- Ship via the team's hotfix path (hotfix branch / expedited review — fast,
  not skipped; a second set of eyes still matters under pressure).
- Write the incident note: **symptom, root cause, what the hotfix does, how it
  was verified, how to roll back.**
- File the follow-up: the proper fix, the missing test, the missing
  monitoring/alert that would have caught this sooner. The incident is not
  closed until the follow-up exists.

## Output Format

```
## Incident
Symptom, scope, severity, and suspected trigger.

## Root cause
What is actually wrong, and the evidence for it. If still unconfirmed, say so
and say what is needed to confirm.

## Immediate mitigation
Any action that reduces impact right now (flag, rollback, disable) — or
"none available" with the reason.

## Hotfix
The minimal change. Code/migration/config. Why it is the smallest safe fix.

## Verification
How the fix was confirmed to work, and what blast radius was checked.

## Rollback
The exact steps to revert if it goes wrong.

## Follow-up
The proper fix, the test, and the monitoring to file as normal-priority work.
```

If urgency is pushing toward shipping a fix you do not understand, say so
plainly. "I can mitigate now by rolling back the last deploy while we diagnose
properly" is a better answer than a confident patch for an unconfirmed cause.
