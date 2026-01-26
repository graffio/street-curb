# Plugin Source Tracking

Components in `agents/`, `commands/`, and `skills/` were adapted from:

- **Source:** [compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
- **Version:** 2.28.0
- **Copied:** 2026-01-26
- **Commit:** 36e7f3a370c422977642aa50bc0ab12b4e96f131

## What was copied

### Agents (review)
- security-sentinel, performance-oracle, code-simplicity-reviewer
- architecture-strategist, pattern-recognition-specialist
- data-integrity-guardian, data-migration-expert, deployment-verification-agent
- agent-native-reviewer

### Agents (research)
- git-history-analyzer, best-practices-researcher
- framework-docs-researcher, repo-research-analyst, learnings-researcher

### Agents (workflow)
- bug-reproduction-validator, spec-flow-analyzer, pr-comment-resolver

### Commands
- workflows/plan, workflows/work, workflows/review, workflows/compound, workflows/brainstorm
- triage, deepen-plan, plan_review
- test-browser, reproduce-bug

### Skills
- file-todos, compound-docs, git-worktree, brainstorming
- agent-browser, agent-native-architecture, skill-creator

## What was NOT copied (removed)

- Rails/Ruby-specific: kieran-rails-reviewer, kieran-python-reviewer, dhh-rails-reviewer, julik-frontend-races-reviewer, dhh-rails-style, andrew-kane-gem-writer, dspy-ruby, ankane-readme-writer, lint
- Figma-specific: figma-design-sync, design-implementation-reviewer, design-iterator
- Not relevant: every-style-editor, gemini-imagegen, rclone, lfg, xcode-test, deploy-docs, release-docs, feature-video, agent-native-audit, heal-skill, report-bug

## Checking for updates

```bash
# Check latest version
curl -s https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/.claude-plugin/plugin.json | grep version

# View changelog
curl -s https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/CHANGELOG.md | head -100
```
