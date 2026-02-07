# Code Conventions

Rules live in these places:

| What | Where | Enforced by |
|------|-------|-------------|
| Formatting (indentation, quotes, line length) | eslint + prettier config | PostToolUse hook, pre-commit |
| Structure (cohesion groups, exports, ABOUTME, @sig) | cli-style-validator rules | Pre-commit hook |
| React restrictions (no render*, no cohesion in components) | cli-style-validator react rules | Pre-commit hook |
| React/Redux philosophy, handler patterns | `.claude/style-cards/react-component.md` | current-task.json `style_card` field |
| Selector rules, layer boundaries | `.claude/style-cards/selector.md` | current-task.json `style_card` field |
| Utility module patterns, naming | `.claude/style-cards/utility-module.md` | current-task.json `style_card` field |
| Test structure | `.claude/style-cards/test-file.md` | current-task.json `style_card` field |
| Architectural judgment calls | `.claude/preferences.md` | `[CHECKPOINT]` steps |
| Universal principles | `CLAUDE.md` (inline) | Always in context |
| Tactical patterns | `.claude/pattern-catalog/triggers.md` | Always in context (triggers) |
