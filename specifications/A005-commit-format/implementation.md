# Git Commit Message Format

Standardized format for git commit messages to enable LLM tools and improve human readability.

## Format

```
<emoji><type>(<scope>): <description>

<body>

<footer>
```

## Header

**Required format:** `<emoji><type>(<scope>): <description>`

### Types
- `✨feat`: New feature for the user
- `🐛fix`: Bug fix for the user  
- `♻️refactor`: Code change that neither fixes a bug nor adds a feature
- `⚡perf`: Performance improvement
- `💄style`: Changes that do not affect code meaning (formatting, etc.)
- `✅test`: Adding missing tests or correcting existing tests
- `📝docs`: Documentation changes
- `📦build`: Changes affecting build system or dependencies
- `💚ci`: Changes to CI configuration
- `🏗️arch`: Architectural changes or design decisions

### Scope (optional)
- Module name: `functional`, `qif-parser`, `design-system`, `reports-app`
- Component name: `CategorySelector`, `TransactionRegister`
- System area: `types`, `validation`, `testing`

### Description
- Imperative mood: "add feature" not "added feature"
- Lowercase first letter
- No period at the end
- Maximum 50 characters

## Body (optional)

```
Explain the motivation for the change and contrast with previous behavior.

Files changed:
- filename.ext: description of changes [path/to/directory/]
- filename.ext: description of changes [path/to/directory/]

- Additional implementation details if needed
- Reference specific functions or components changed
```

## Footer (optional)

```
LLM-Context:
- Impact: local | module | system | breaking
- Decision-ID: reference to architectural decision
- Requirement-ID: reference to requirement
- Breaking-Change: true | false
- Performance-Impact: description
- Dependencies: [affected components]

Refs: #issue-number
Co-authored-by: Claude <noreply@anthropic.com>
```

## Examples

### Feature Addition
```
✨feat(design-system): add CategorySelector component

Add hierarchical category selection component for transaction filtering.
Supports parent/child category relationships and keyboard navigation.

Files changed:
- CategorySelector.jsx: create hierarchical category selection component [src/components/]
- CategorySelector.css.ts: add Vanilla Extract styling with theme support [src/components/]
- CategorySelector.stories.js: add Storybook documentation and examples [stories/]
- CategorySelector.test.js: add comprehensive Playwright tests [tests/]

LLM-Context:
- Impact: module
- Decision-ID: ARCH_001_CategorySelector
- Requirement-ID: CAT_001
- Breaking-Change: false
- Performance-Impact: +5ms initial render, O(log n) filtering
- Dependencies: [TransactionRegister, CategoryHierarchy]

Refs: #42
Co-authored-by: Claude <noreply@anthropic.com>
```

### Bug Fix
```
🐛fix(functional): correct type validation in taggedType constructor

Fix runtime type validation that was incorrectly rejecting valid Number types
when value was exactly 0.

Files changed:
- tagged-type.js: update NumberType.validate to handle falsy numbers correctly [src/tagged-types/]
- number-validation.test.js: add test cases for edge cases (0, NaN, Infinity) [tests/tagged-types/]

LLM-Context:
- Impact: local
- Breaking-Change: false
- Performance-Impact: negligible
- Dependencies: [Transaction, Account, Category]

Refs: #38
```

## Commit Grouping Rules

**RULE: Always separate commits when they have different commit types**
- Different type = different commit (✨feat vs 📝docs vs 🏗️arch)

**RULE: Group files into single commit when they serve the same purpose**
- Same goal, same type, same scope = one commit
- List each logical change with its affected files