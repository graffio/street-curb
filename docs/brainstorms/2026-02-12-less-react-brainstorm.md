# Less React in React

**Date:** 2026-02-12 (updated 2026-02-17)
**Status:** Brainstorm — partially implemented, remaining work tracked here

**Trigger:** Components accumulate hooks that have nothing to do with presentation.

## The Principle

**React is a render layer.** Its job: current state → JSX. Period.

| Concern                        | Belongs in                                  | NOT in React              |
|--------------------------------|---------------------------------------------|---------------------------|
| Derived state                  | Selectors (memoizeReduxState)               | useMemo                   |
| Memoization                    | Selectors                                   | useCallback, useMemo      |
| State computation              | Reducers                                    | Event handler callbacks   |
| Side effects on state change   | Reducers (defaults/init)                    | useEffect                 |
| Cross-component coordination   | Redux (shared state)                        | useRef bridges            |
| Imperative DOM (focus, scroll) | FocusRegistry (plain JS)                    | useRef + useEffect        |

## The Rule (codified in react-component style card)

**The only React hook allowed in app components is `useSelector`.** Zero exceptions.

**Exemption:** Design-system wrapper components (DataTable, KeyboardDateInput, SelectableListPopover) may use third-party library hooks.

## Completed

- FilterChipRow refactored to composition layout shell (no prop drilling)
- RegisterPageView inlined into individual register pages
- Page titles derived from routing layer (no SetPageTitle useEffect)
- Selectors-with-defaults pattern (tableLayoutOrDefault) — replaces init useEffects
- FocusRegistry ref callbacks — replaces useRef + useEffect for DOM
- Style card codified: no cohesion groups, aggressive subcomponent extraction, inline post() only
- No-prop-drilling rule documented

## Remaining COMPLEXITY: react-redux-separation Comments

14 original comments. 5 were dead exemptions (validator no longer flags). Status of the 9 real ones:

### Done
- FilterChipRow.jsx — useEffect for ActionRegistry (still present, tracked in separate brainstorm)
- RegisterPageView.jsx — eliminated (inlined into pages)
- DashboardPage.jsx — SetPageTitle (moved to routing)
- InvestmentReportPage.jsx — SetPageTitle (moved to routing)
- CategoryReportPage.jsx — useMemo → Transactions.tree memoized selector
- Dialog.jsx — useState/useEffect → F.createPortalContainer lazy singleton
- SearchChip.jsx — useState/useRef/useEffect → uncontrolled input + module-level state + clearSearch command

### Still needs work

| File | Hooks | What's needed |
|------|-------|---------------|
| FilterChips.jsx | 2 useEffect (ActionRegistry) | See `action-registration-outside-react` brainstorm |
| RootLayout.jsx | 4 useEffect | Init + keyboard lifecycle → move to non-React mechanism |

### Active exemptions (NOT dead — suppress real validator violations)
- selectors.js — selector line counts and method chaining
- KeymapDrawer.jsx — .map() in component body
- InvestmentReportColumns.jsx — conditional spread in cell renderers
- MainLayout.jsx — React.Children.find/filter for slot detection
- CellRenderers.jsx — .slice(), .includes(), spreads in cell renderers

## Patterns That Make This Work

### 1. Dispatch intent, not state
Handlers pass identifiers to `post()`. Reducers compute next state. No closures over Redux state = no useCallback. See `push-state-reads-to-reducers` brainstorm.

### 2. Selectors with defaults
Selectors return a default when state is empty. No mount-time effects.

### 3. FocusRegistry (plain JS)
Ref callbacks register DOM elements. Keyboard system calls `FocusRegistry.focus(id)`. No useRef/useEffect.

### 4. Persistent portal container
Create portal DOM node at app init. Dialog.jsx drops useState + useEffect.

### 5. SearchChip → uncontrolled input + module debounce
Input holds own display value (no useState). Module-level debounce dispatches to Redux.

## Kill @graffio/design-system

The design-system package adds no value:
- 25 Radix re-exports (0 logic)
- Thin wrappers (~356 lines)
- 3 real components: DataTable, KeyboardDateInput, SelectableListPopover (~1,212 lines)

Decision: Import Radix directly. Move 3 real components to quicken-web-app (exempt from useSelector-only rule).

## Open Questions

- **RootLayout useState** — file handle storage. Move to Redux or plain JS?
- **Migration ordering** — validator rule first, or proof-of-concept first?

## Related

- `action-registration-outside-react` brainstorm — ActionRegistry useEffect elimination
- `push-state-reads-to-reducers` brainstorm — currentStore().getState() in E groups
- `require-action-registry-rule` brainstorm — validator enforcement
