# Agents

Specialized subagents for Claude Code. Each file defines one agent with a
focused role, its own system prompt, and a constrained tool set. Delegate work
to the agent whose role matches the task — a focused agent with a tight prompt
outperforms a generalist trying to hold everything at once.

## Roster

| Agent | Use it for |
|---|---|
| `backend-engineer` | Laravel work — controllers, actions, models, migrations, jobs, the Inertia contract |
| `frontend-engineer` | Inertia pages and React components — UI, forms, client state |
| `code-reviewer` | Reviewing a diff or PR before merge |
| `security-auditor` | Security review of auth, input handling, config, dependencies |
| `qa-test-engineer` | Writing and strengthening the test suite; finding gaps |
| `devops-engineer` | Docker, CI/CD, environment config, deploys, Redis/queue/Mailpit setup |
| `database-engineer` | Schema design, migrations, query and index tuning |
| `tech-lead` | Breaking down features, sequencing work, design trade-offs, coordinating the others |

## How agent files are structured

Each file has YAML frontmatter and a system-prompt body:

```yaml
---
name: agent-name
description: When to delegate to this agent.
tools: Read, Edit, Bash, Grep, Glob   # the tools this agent may use
---
```

The body is the agent's operating instructions — its responsibilities, the
conventions it must follow (which point back to `CLAUDE.md`), and its handoff
expectations.

## Working agreement for all agents

- The stack is fixed: Laravel + Inertia + React + MySQL + Redis + Docker +
  Mailpit. Read `CLAUDE.md` for conventions; do not reinvent them.
- The team is senior — be direct, lead with the decision and the trade-off.
- Stay in your lane. If a task needs another role, say so and hand off rather
  than half-doing it.
- Done means done: migrations clean on a fresh DB, tests pass, lint and
  typecheck pass, no N+1 introduced, mail/queue work verified.
