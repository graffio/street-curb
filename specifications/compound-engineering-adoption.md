# Compound Engineering Adoption Plan

## Goal

Gradually integrate compound engineering workflows into our development process without disrupting existing practices.

## Principle

**One new thing at a time.** Master each phase before adding the next.

---

## Phase 1: Compound Only (Start Here)

**Trigger:** After fixing any non-trivial bug or solving a tricky problem.

**What to do:**
```
/workflows:compound
```

**What it does:**
- Documents the problem, investigation, and solution
- Writes to `docs/solutions/{category}/{slug}.md`
- Creates searchable institutional knowledge

**Success criteria:**
- [ ] 5 solutions documented in `docs/solutions/`
- [ ] Comfortable with the documentation format
- [ ] Understand what's worth documenting vs. too trivial

**Integration with existing workflow:** None. This is additive — run it after you've already fixed something using your normal process.

**Duration:** 2-4 weeks or until success criteria met.

---

## Phase 2: Learnings Search

**Trigger:** Before starting any bug fix or investigation.

**What to do:**
Ask Claude: "Search docs/solutions/ for anything related to [problem description]"

Or the `learnings-researcher` agent will do this automatically during `/workflows:plan`.

**What it does:**
- Searches your documented solutions
- Surfaces relevant past fixes
- Prevents re-investigating solved problems

**Success criteria:**
- [ ] At least one instance where past documentation helped
- [ ] Habit of checking docs/solutions/ before deep investigation

**Integration with existing workflow:** Adds a "check past solutions" step before diving into a problem.

**Duration:** 2-4 weeks.

---

## Phase 3: Code Review Agents

**Trigger:** Before merging any PR.

**What to do:**
```
/workflows:review [PR number or branch]
```

**What it does:**
- Spawns 9 reviewer agents in parallel
- Each checks different concerns (security, performance, conventions, etc.)
- Creates prioritized findings in `todos/`
- You triage with `/triage`

**Success criteria:**
- [ ] Run `/workflows:review` on 3 PRs
- [ ] Comfortable with P1/P2/P3 triage decisions
- [ ] At least one issue caught that you would have missed

**Integration with existing workflow:**
- Replaces or supplements your manual review step
- `cli-style-validator` remains as mechanical gate (runs in pre-commit)
- Review agents catch what validators can't (architecture, performance, security patterns)

**Duration:** 2-4 weeks.

---

## Phase 4: Planning

**Trigger:** Before implementing any new feature.

**What to do:**
```
/workflows:plan [feature description or spec file]
```

**What it does:**
- Researches codebase and external best practices
- Searches `docs/solutions/` for relevant learnings
- Produces detailed implementation plan in `docs/plans/`
- Optionally enhance with `/deepen-plan`

**Success criteria:**
- [ ] 2 features planned with `/workflows:plan`
- [ ] Plans reference existing code patterns
- [ ] Plans incorporate learnings from `docs/solutions/`

**Integration with existing workflow:**
- Replaces or supplements your brainstorm → plan phase
- Output plan can become input to your `current-task.json`

**Duration:** 2-4 weeks.

---

## Phase 5: Full Loop

**Trigger:** Every feature, every bug fix.

**The loop:**
1. `/workflows:plan` — research and plan
2. `/workflows:work` — execute (or use your existing workflow.md)
3. `/workflows:review` — parallel code review
4. `/workflows:compound` — document learnings

**Success criteria:**
- [ ] Full loop feels natural, not forced
- [ ] `docs/solutions/` has 20+ documented learnings
- [ ] Noticeably faster at solving problems that resemble past ones

**Integration with existing workflow:**
- Decide whether to use `/workflows:work` or your existing `workflow.md` phases
- May want to consolidate into one system

---

## What Stays the Same

These are unaffected by compound engineering adoption:

| Component | Status |
|-----------|--------|
| `cli-style-validator` | Keeps running in pre-commit — mechanical enforcement |
| `conventions.md` | Still the source of truth for code style |
| `preferences.md` | Still guides architectural decisions |
| `workflow.md` phases | Can coexist or gradually merge with `/workflows:*` |
| `current-task.json` | Can be generated from `/workflows:plan` output |

---

## What Changes Over Time

| Phase | Added | Removed |
|-------|-------|---------|
| 1 | `docs/solutions/` | Nothing |
| 2 | Learnings search habit | Some redundant investigation |
| 3 | `todos/` for review findings | Some manual review effort |
| 4 | `docs/plans/` | Some manual planning effort |
| 5 | Full feedback loop | Redundant processes (TBD) |

---

## Current Status

- [x] Compound engineering components installed in `.claude/`
- [x] Rails-specific agents removed, `jeff-js-reviewer` created
- [x] Architecture documented in `.claude/compound-engineering-architecture.md`
- [ ] **Phase 1: Compound Only** ← Start here
- [ ] Phase 2: Learnings Search
- [ ] Phase 3: Code Review Agents
- [ ] Phase 4: Planning
- [ ] Phase 5: Full Loop

---

## The Integration Problem

Jeff's existing `workflow.md` defines subagent-based review steps (plan-reviewer, code-reviewer, complexity-reviewer, simplicity-reviewer) as **instructions to Claude** — text that says "spawn this subagent." Compound engineering's `/workflows:*` commands achieve similar goals through **mechanical enforcement** — the skill infrastructure launches subagents directly.

The conflict: when both systems are active, Claude sees two overlapping sets of instructions and optimizes for "just do the thing," skipping whichever steps feel redundant. This is a [known behavior pattern](https://github.com/anthropics/claude-code/issues/18454) — Claude prioritizes task completion over process compliance, especially when instructions are advisory rather than mechanical.

### The core principle

**If a step matters, it must be enforced mechanically (hooks, commands, required gates) — not as an instruction Claude interprets.**

Jeff's `cli-style-validator` in pre-commit hooks works reliably because Claude can't skip it. Jeff's "spawn code-reviewer subagent" instruction in `workflow.md` gets skipped because Claude can rationalize not doing it.

### Integration strategy

**Keep Jeff's domain knowledge. Use compound engineering's enforcement.**

| Jeff's System | Keep / Replace | Compound Engineering Equivalent |
|---------------|----------------|--------------------------------|
| `conventions.md` | **Keep** — domain-specific, no equivalent | Read by all agents automatically |
| `preferences.md` | **Keep** — architectural taste, no equivalent | Read by all agents automatically |
| `cli-style-validator` (pre-commit) | **Keep** — mechanical enforcement works | No conflict — additive |
| `workflow.md` Phase 1 (Brainstorm) | **Keep** — lightweight, no overlap | N/A |
| `workflow.md` Phase 2 (Plan) | **Replace with** `/workflows:plan` | Launches learnings-researcher + plan agents mechanically |
| `workflow.md` Phase 3 (Implement) subagent steps | **Replace with** `/workflows:work` or `/workflows:review` | Launches reviewer agents mechanically instead of trusting Claude to "spawn" them |
| `workflow.md` Phase 4 (Record) | **Replace with** `/workflows:compound` | Documents solutions with parallel subagents mechanically |
| `current-task.json` format | **Keep** — proven format | `/workflows:plan` output can feed into it |
| `[CHECKPOINT]` pattern | **Keep** — compound engineering doesn't have this | Add to plan output |
| Custom subagent specs (plan-reviewer, etc.) | **Merge into compound engineering agents** | Jeff's review criteria become inputs to compound engineering's reviewer agents |

### What to change in `workflow.md`

The goal is to remove instruction-based subagent spawning and replace with command invocations:

1. **Phase 2 (Plan):** Replace "Spawn plan-reviewer subagent" with "Run `/workflows:plan`" — this mechanically launches research and review agents
2. **Phase 3 (Implement):** Replace "Spawn code-reviewer subagent on staged changes" with "Run `/workflows:review` before merge" — this mechanically launches 9 reviewer agents in parallel
3. **Phase 4 (Record):** Replace with "Run `/workflows:compound`" — this mechanically launches documentation agents
4. **Keep** the subagent specs section as documentation of *what* reviewers check — these become inputs to compound engineering agent configuration, not instructions Claude interprets

### What NOT to change

- `conventions.md` and `preferences.md` — these are domain knowledge, not process. All agents read them.
- `cli-style-validator` — mechanical enforcement that works. Compound engineering adds to it, doesn't replace it.
- `[CHECKPOINT]` pattern — compound engineering doesn't have an equivalent. Keep it.
- `current-task.json` structure — proven format. `/workflows:plan` can generate it.
- The brainstorm phase — freeform discussion has no process to enforce.

### Migration order

1. **Now:** Use `/workflows:compound` after fixes (Phase 1 — already started)
2. **Next:** Replace `workflow.md` Phase 4 (Record) with `/workflows:compound` — lowest risk, already working
3. **Then:** Replace `workflow.md` Phase 3 review steps with `/workflows:review` — removes the most-skipped instructions
4. **Finally:** Replace `workflow.md` Phase 2 plan step with `/workflows:plan` — most disruptive, do last

Each step: update `workflow.md` to reference the command instead of the instruction, test it on a real feature, then move to the next.

---

## Notes

- Skip phases if they don't fit — this is a guide, not a mandate
- Each phase should feel helpful before moving to the next
- If a phase feels like overhead, stop and reassess
- Document what works and what doesn't in this file
