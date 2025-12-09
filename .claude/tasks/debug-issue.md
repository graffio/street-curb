# Debug Issue

Find the root cause. No workarounds. No symptom fixes.

## Steps

1. **Reproduce** - Confirm you can trigger the issue reliably
2. **Read errors** - Don't skip past them; they often contain the answer
3. **Check recent changes** - `git diff`, recent commits
4. **Find working example** - Similar code in codebase that works
5. **Form one hypothesis** - State it clearly before changing anything
6. **Test minimally** - Smallest possible change to test hypothesis
7. **Evaluate** - Did it work? If no, new hypothesis. Don't pile on fixes.

## Rules

- One hypothesis at a time
- Test after each change
- Say "I don't understand X" rather than guessing
- If first fix fails, stop and re-analyze
