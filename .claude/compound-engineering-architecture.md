# Compound Engineering Architecture

## Main Workflow Loop

```mermaid
flowchart TB
    subgraph Human
        H[Human]
    end

    subgraph Core["Core Commands"]
        plan["/workflows:plan"]
        work["/workflows:work"]
        review["/workflows:review"]
        compound["/workflows:compound"]
        triage["/triage"]
    end

    H -->|"1"| plan
    H -->|"2"| work
    H -->|"3"| review
    H -->|"4"| compound
    H --> triage

    subgraph Files["Persistent Files"]
        plans["docs/plans/*.md"]
        solutions["docs/solutions/**/*.md"]
        todos["todos/*.md"]
        conventions[".claude/conventions.md"]
    end

    plan -->|writes| plans
    work -->|reads| plans
    review -->|creates| todos
    triage -->|updates| todos
    compound -->|writes| solutions
    solutions -.->|"informs future"| plan
```

---

## Auxiliary Commands (Outside Main Loop)

These commands support the main workflow but aren't part of the core 4-phase loop:

```mermaid
flowchart TB
    subgraph PrePlan["Before Plan Phase"]
        brainstorm["/workflows:brainstorm"]
    end

    subgraph EnhancePlan["Enhance Plan Phase"]
        deepen["/deepen-plan"]
        plan_review["/plan_review"]
    end

    subgraph DuringWork["During Work Phase"]
        test_browser["/test-browser"]
        reproduce["/reproduce-bug"]
    end

    plan["/workflows:plan"]
    work["/workflows:work"]

    brainstorm -->|"explore before committing"| plan
    plan --> deepen
    deepen -->|"adds research depth"| plan
    plan --> plan_review
    plan_review -->|"validates approach"| work

    work --> test_browser
    work --> reproduce
    test_browser -->|"visual verification"| work
    reproduce -->|"confirms bug exists"| work
```

| Command | When | Why |
|---------|------|-----|
| `/workflows:brainstorm` | Before planning | Explore requirements when scope is unclear |
| `/deepen-plan` | After initial plan | Add research depth to each section via parallel agents |
| `/plan_review` | Before starting work | Validate plan with reviewer agents |
| `/test-browser` | During/after work | Visual regression testing with browser automation |
| `/reproduce-bug` | Before fixing | Confirm bug exists, capture reproduction steps |

---

## Skills: When They Load

Skills are instruction sets that load into context automatically when relevant. They don't run independently—they augment commands and agents.

```mermaid
flowchart LR
    subgraph Skills["Skills (loaded into context)"]
        todos_skill["file-todos"]
        docs_skill["compound-docs"]
        worktree_skill["git-worktree"]
        browser_skill["agent-browser"]
        brainstorm_skill["brainstorming"]
        native_skill["agent-native-architecture"]
    end

    subgraph Commands["Commands that load them"]
        review["/workflows:review"]
        compound["/workflows:compound"]
        work["/workflows:work"]
        brainstorm["/workflows:brainstorm"]
    end

    review -->|"structures findings"| todos_skill
    compound -->|"structures documentation"| docs_skill
    work -->|"isolated branches"| worktree_skill
    work -->|"UI screenshots"| browser_skill
    brainstorm -->|"exploration framework"| brainstorm_skill

    subgraph Agents["Agents that reference them"]
        native_reviewer["agent-native-reviewer"]
        practices["best-practices-researcher"]
    end

    native_reviewer -->|"design patterns"| native_skill
    practices -->|"checks skills first"| docs_skill
```

| Skill | Loaded by | Purpose |
|-------|-----------|---------|
| `file-todos` | `/workflows:review`, `/triage` | Template and conventions for todo files |
| `compound-docs` | `/workflows:compound` | Template for solution documentation |
| `git-worktree` | `/workflows:work` | Isolated branch workflows |
| `agent-browser` | `/workflows:work`, `/test-browser` | Browser automation CLI reference |
| `brainstorming` | `/workflows:brainstorm` | Structured exploration framework |
| `agent-native-architecture` | `agent-native-reviewer`, research agents | Agent-first design patterns |

---

## Workflow Agents (Not Reviewers)

These agents handle specific workflow tasks, not code review:

```mermaid
flowchart TB
    subgraph WorkflowAgents["Workflow Agents"]
        bug["bug-reproduction-validator"]
        spec["spec-flow-analyzer"]
        pr["pr-comment-resolver"]
    end

    subgraph Triggers["Triggered by"]
        reproduce_cmd["/reproduce-bug"]
        plan_cmd["/workflows:plan"]
        pr_comments["PR has comments"]
    end

    subgraph Outputs
        repro_steps["Reproduction steps"]
        flow_gaps["Missing user flows"]
        fixes["Code fixes"]
    end

    reproduce_cmd --> bug
    bug -->|"browser automation"| repro_steps

    plan_cmd --> spec
    spec -->|"analyzes spec"| flow_gaps

    pr_comments --> pr
    pr -->|"addresses each comment"| fixes
```

| Agent | Triggered by | Purpose |
|-------|-------------|---------|
| `bug-reproduction-validator` | `/reproduce-bug` | Systematically reproduce reported bugs |
| `spec-flow-analyzer` | `/workflows:plan` (on specs) | Find missing user flows and edge cases |
| `pr-comment-resolver` | Manual or parallel resolve | Address PR review comments automatically |

---

## Meta Components (Self-Modification)

These exist to create new skills and agents—extending the system itself:

```mermaid
flowchart LR
    subgraph Meta["Meta Skills"]
        creator["skill-creator"]
        agent_skills["create-agent-skills"]
    end

    subgraph Creates["Creates new..."]
        new_skill[".claude/skills/*/SKILL.md"]
        new_agent[".claude/agents/*/*.md"]
    end

    creator --> new_skill
    agent_skills --> new_agent

    new_skill -.->|"available to"| future_commands["Future commands"]
    new_agent -.->|"spawnable by"| task_tool["Task tool"]
```

| Skill | Purpose |
|-------|---------|
| `skill-creator` | Guide for creating new skills |
| `create-agent-skills` | Templates and best practices for agent definitions |

**Why these exist:** The system is designed to be self-extending. When you encounter a repeated pattern, you can create a skill or agent to handle it, which then becomes available to future workflows.

---

## Complete Component Map

```mermaid
flowchart TB
    subgraph Human["Human (Decision Maker)"]
        H[Human]
    end

    subgraph CoreLoop["Core Loop (80% of work)"]
        plan["/workflows:plan"]
        work["/workflows:work"]
        review["/workflows:review"]
        compound["/workflows:compound"]
    end

    subgraph Auxiliary["Auxiliary Commands"]
        brainstorm["/workflows:brainstorm"]
        deepen["/deepen-plan"]
        plan_review["/plan_review"]
        test_browser["/test-browser"]
        reproduce["/reproduce-bug"]
        triage["/triage"]
    end

    subgraph ReviewAgents["Review Agents (parallel)"]
        jeff["jeff-js-reviewer"]
        security["security-sentinel"]
        perf["performance-oracle"]
        simple["code-simplicity"]
        arch["architecture-strategist"]
        data["data-integrity"]
        pattern["pattern-recognition"]
        native["agent-native"]
    end

    subgraph ResearchAgents["Research Agents"]
        practices["best-practices"]
        framework["framework-docs"]
        learnings["learnings"]
        repo["repo-research"]
        git["git-history"]
    end

    subgraph WorkflowAgents["Workflow Agents"]
        bug["bug-reproduction"]
        spec["spec-flow-analyzer"]
        pr["pr-comment-resolver"]
    end

    subgraph Skills["Skills (context)"]
        todos_skill["file-todos"]
        docs_skill["compound-docs"]
        worktree["git-worktree"]
        browser["agent-browser"]
        brainstorm_skill["brainstorming"]
        native_skill["agent-native-arch"]
    end

    subgraph MetaSkills["Meta Skills"]
        creator["skill-creator"]
        agent_creator["create-agent-skills"]
    end

    subgraph Files["Persistent Files"]
        plans["docs/plans/"]
        solutions["docs/solutions/"]
        todos["todos/"]
        conventions["conventions.md"]
    end

    H --> CoreLoop
    H --> Auxiliary

    plan --> ResearchAgents
    review --> ReviewAgents
    compound --> docs_skill
    work --> worktree
    work --> browser

    ReviewAgents --> todos
    ResearchAgents --> plans
    compound --> solutions
    solutions -.-> learnings
    learnings -.-> plan

    brainstorm --> brainstorm_skill
    reproduce --> bug
    triage --> todos_skill

    MetaSkills -.->|"creates new"| Skills
    MetaSkills -.->|"creates new"| ReviewAgents
```

---

## Component Types Summary

| Type | Count | Invocation | Persistence | Examples |
|------|-------|------------|-------------|----------|
| **Core Commands** | 5 | `/command` by human | — | `/workflows:plan`, `/workflows:review` |
| **Auxiliary Commands** | 5 | `/command` by human | — | `/deepen-plan`, `/test-browser` |
| **Review Agents** | 9 | `Task()` in parallel | — | `jeff-js-reviewer`, `security-sentinel` |
| **Research Agents** | 5 | `Task()` by plan phase | — | `learnings-researcher`, `framework-docs` |
| **Workflow Agents** | 3 | `Task()` by commands | — | `bug-reproduction-validator` |
| **Skills** | 8 | Auto-loaded by context | — | `file-todos`, `agent-browser` |
| **Meta Skills** | 2 | Manual for extension | — | `skill-creator` |
| **Files** | 4 types | Read/Write tools | ✓ Persistent | `todos/`, `docs/solutions/` |

---

## The Feedback Loop

```mermaid
flowchart LR
    A["Solve Problem"] --> B["Document via /compound"]
    B --> C["docs/solutions/*.md"]
    C --> D["learnings-researcher"]
    D --> E["Future /workflows:plan"]
    E --> F["Faster Solution"]
    F -.-> A

    style C fill:#FCE4EC
    style D fill:#E3F2FD
```

**Each solved problem makes the next occurrence easier.**
