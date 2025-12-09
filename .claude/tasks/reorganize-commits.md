# Reorganize Commits

Goal: Logical commits that are reviewable and revertible independently.

## Steps

1. **Read commit messages** - `git log --format="%H%n%s%n%b%n---" origin/main..HEAD`
2. **Assess quality** - Have Problem/Solution/Impact? If not, warn about token cost
3. **Group by theme** - Similar problems → same commit
4. **Propose regrouping** - Get Jeff's approval before executing
5. **Execute**:
   ```bash
   git reset --soft <base-commit-sha>
   git restore --staged .
   # Stage by theme, commit each using commit-changes.md
   ```
6. **Verify** - `git diff <old-tip> HEAD` should be empty

## Grouping Options

- **By feature**: One commit per complete feature + tests
- **By concern**: Separate commits for independent changes

## Rules

- Get approval before reorganizing
- Never rewrite history already pushed to shared branches
- Keep tests with their implementation
- Use `commit-changes.md` for each new commit
- Each commit must build/test cleanly
