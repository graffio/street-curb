---
name: refactor-commit-history
description: Reorganize messy branch history into logical commits with clear messages. Use when cleaning up commit history, reorganizing commits before PR, dealing with many WIP commits, or when branch history doesn't tell coherent story. Uses write-commit-message skill for each new commit.
---

# Refactor Commit History

**Goal:** Restructure into logical units that are reviewable and revertible independently

## Token Efficiency Strategy

**Work from commit messages, not code:**

1. Read all commit messages: `git log --format="%s%n%b%n---"`
2. Check if messages have Problem/Solution/Impact structure
3. **If adequate**: Group by themes from messages (~10K tokens total)
4. **If poor** ("WIP", "fix"): Warn about expensive code analysis (~50-100K tokens), offer to cancel
5. Synthesize new messages from grouped old message content

**This only works if original commits used write-commit-message skill!**

## Process

### 1. Analyze Commit Messages

```bash
# Read all commit messages with full bodies
git log --format="%H%n%s%n%b%n---" origin/main..HEAD
```

**Check message quality:**

- Do they have Problem/Solution/Impact structure?
- If yes: Proceed (cheap)
- If no: Warn user about token cost, offer to cancel

**Group by themes** found in message Problem statements:

- Similar problems → same commit
- Related solutions → same commit
- Independent concerns → separate commits

### 2. Propose Regrouping (get approval)

**Option A: By Feature** (recommended)

- One commit per complete feature (impl + tests)
- Each leaves system working

**Option B: By Concern** (for refactoring)

- Separate commits for independent concerns
- Example: "Add tests", "Refactor X", "Optimize Y"

**Check granularity:**

- ❌ Too large: >3 subsystems, >4 "Changes by purpose" items
- ❌ Too small: Multiple commits for one feature

**Synthesize new messages** from grouped old messages:

- Combine Problem statements from grouped commits
- Merge Solution descriptions
- Consolidate Impact statements
- Use write-commit-message skill to structure final message

### 3. Execute

```bash
# Find base
git log --oneline origin/main..HEAD

# Soft reset (keeps all changes staged)
git reset --soft <base-commit-sha>

# Unstage everything
git restore --staged .

# Stage by theme and commit
git add <files-for-theme-1>
git commit  # Use write-commit-message skill

git add <files-for-theme-2>
git commit  # Use write-commit-message skill
```

### 4. Verify

```bash
# Should be empty
git diff <old-branch-tip> HEAD

# Test each commit builds
git rebase -i --exec "yarn test" origin/main
```

## Guidelines

**Do:**

- ✓ Get user approval before reorganizing
- ✓ Group by logical feature/concern
- ✓ Include tests with implementation
- ✓ Use write-commit-message skill for each commit
- ✓ Ensure each commit builds/tests cleanly

**Don't:**

- ✗ Rewrite history already pushed to shared branches
- ✗ Split implementation from tests (usually)
- ✗ Merge unrelated changes
- ✗ Lose changes during reorganization

## Example

**Before (7 commits):**

```
a1b2c3d Add user authentication
c3b9f4e Fix typo in auth
a7e2d9c Add tests for auth
8f1c6b2 WIP password reset
2d4e9a3 Fix password reset bug
6c8f2e1 Add password reset tests
f3a7b8c Update docs
```

**Analysis:**

- Theme 1: Authentication (3 commits)
- Theme 2: Password reset (3 commits)
- Theme 3: Docs (1 commit)

**After (2 commits):**

```
a1b2c3d Add authentication system with login/logout/password-reset

Problem: App had no authentication. Users needed secure login and ability
to reset forgotten passwords.

Solution: Implement JWT-based authentication with Firebase Auth integration.
Login/logout flows with token management. Email-based password reset with
token expiration (24hr). Comprehensive test suite covering success paths
and error cases (expired tokens, invalid emails, etc).

Changes organized by purpose:
- src/auth/: Core authentication logic and password reset flow
- src/api/: Login/logout/reset endpoints
- test/auth/: Integration tests for all auth flows

Impact: Users can securely access their accounts. Password reset reduces
support burden. All auth flows have test coverage for future changes.

d4e5f6g Update authentication documentation

Problem: No setup instructions for Firebase Auth configuration.

Solution: Add setup guide, token lifecycle explanation, and troubleshooting
section. Include environment variable requirements and common issues.

Impact: Developers can set up auth locally without asking for help.
```

## When NOT to Refactor

- History already in PR under review (discuss with team first)
- Others working off this branch
- History already clean
- Time investment not worth it

**Alternative:** Just write good messages for existing commits
