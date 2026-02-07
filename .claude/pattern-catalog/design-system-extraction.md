# Design System Extraction

**When:** Style objects or UI patterns repeated across components.

**Where:** `modules/design-system/`

**Signal:** Same style object in 2+ files, or same component structure (FilterChipRow + DataTable + container).

**Process:**

1. Identify repeated pattern
2. Create component in design-system with appropriate props
3. Replace usages with import from `@graffio/design-system`

**Key rules:**
- Import from `@graffio/design-system`, never `@radix-ui/themes` directly
- Style constants shared across components → design-system or module-level constants
- If you see the same layout structure in 2+ views, it's a candidate

**Reference:** `modules/design-system/src/`
