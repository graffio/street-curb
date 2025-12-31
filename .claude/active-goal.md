# E Cohesion Group + React Component Cohesion

**Goal:** Formalize side-effect handlers with E group, enforce cohesion patterns inside React components.

**Approach:**
- Add E (Effects) to existing cohesion patterns (small change to constants)
- Create new `react-component-cohesion.js` rule (avoid bloating existing 390-line file)
- Render functions must become actual components (no R group)

**Key decisions:**
- E patterns: `persist*`, `handle*`, `dispatch*`, `emit*`
- React components use same P/T/F/V/A/E internally, not separate ordering convention
