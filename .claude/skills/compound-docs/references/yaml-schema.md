# Frontmatter Schema for docs/solutions/

## Required Fields

- **title** (string): Clear problem title
- **date** (string): YYYY-MM-DD
- **category** (enum): `architecture` | `runtime-errors` | `test-failures` | `integration-issues` | `workflow-issues`
- **module** (string): Module name or "System"
- **tags** (array): Searchable keywords, lowercase, hyphen-separated
- **symptoms** (array): 1-5 exact error messages or observable behaviors

## Example

```yaml
---
title: Exhaustive match missed in two-layer dispatch
date: 2026-02-02
category: runtime-errors
module: quicken-web-app
tags: [ tagged-sum, action-dispatch, exhaustive-matching ]
symptoms:
  - "Uncaught TypeError: Constructors given to match didn't include: ToggleAccountFilter"
---
```

## Category → Directory

| Category           | Directory                            |
|--------------------|--------------------------------------|
| architecture       | `docs/solutions/architecture/`       |
| runtime-errors     | `docs/solutions/runtime-errors/`     |
| test-failures      | `docs/solutions/test-failures/`      |
| integration-issues | `docs/solutions/integration-issues/` |
| workflow-issues    | `docs/solutions/workflow-issues/`    |
