# Completed Specifications Archive

This document summarizes the specifications that were previously archived in `specifications/archived/`. These represent completed or superseded work that has been integrated into the codebase.

**Project tags:** `[curb-map]`, `[quicken-web-app]`, `[infrastructure]` (shared tooling)

## [quicken-web-app] Page Convention Violations Fix (2026-01-02)
**Purpose:** Refactor register pages to follow handler/selector/layer conventions

- Moved P/T/E cohesion groups to module level in InvestmentRegisterPage and TransactionRegisterPage
- Extracted `P.shouldInitializeDateRange` predicate and `T.toDefaultDateRange` transform
- Created `E.initDateRangeIfNeeded` effect composing predicate + transform + post
- Extracted `T.toRowIndex` from `dispatchHighlightChange` handlers
- Added `enrichedTransactions` selector for CategoryReportPage (transactions with category/account names)
- Added COMPLEXITY comments to selector barrel files (justified high export counts)
- Fixed React key warning in TabGroup (key passed directly, not via spread)

## [quicken-web-app] FilterBar Consolidation with Inline Chip Popovers (2025-12-22)
**Purpose:** Replace sidebar filters with top-aligned chip row where each chip opens its own dropdown

- Created individual chip components: DateFilterChip, CategoryFilterChip, AccountFilterChip, GroupByFilterChip, SearchFilterChip
- Each chip uses Radix Popover with inline options (no separate panel)
- FilterChipRow shows chips in columns with filter details below each (up to 3 lines, then "+N more")
- Wired groupBy to actually change report aggregation (category/account/payee/month hierarchies)
- Added filterByAccounts to filter chain (text → date → category → account)
- TransactionSubTable hides redundant column based on groupBy dimension
- Exported DATE_RANGES and calculateDateRange from design-system for chip reuse
- Deleted FilterBar wrapper, FilterChip, FilterPanel, TransactionFiltersCard (dead code)
- Both TransactionRegisterPage and CategoryReportPage use FilterChipRow directly

## [quicken-web-app] Table Layout Refactoring & SortOrder Type (2025-12-18)
**Purpose:** Multi-column sorting support and reusable table layout utilities

- Created SortOrder tagged type (`id`, `isDescending`) for proper sort state
- Changed TableLayout.sortOrder from `[String]` to `'{SortOrder:id}'` (LookupTable)
- Created `src/utils/table-layout.js` with pure functions: `initializeTableLayout`, `toDataTableProps`, `applySortingChange`, `applySizingChange`, `applyOrderChange`
- Created `src/utils/sort-transactions.js` for multi-column sorting
- Added `updateAll` and `updateWhere` methods to LookupTable (endomorphism operations)
- Updated hydration.js to convert old sortOrder format and nest single-use functions
- Added LookupTable ABOUTME listing key methods for quick API reference
- Updated `.claude/preferences.md` with LookupTable guidance
- Expanded `check-reread-flag.sh` to include CLAUDE.md and workflow.md
- Deferred: Transaction filter/search count bug (awaiting Reports architecture)

## [infrastructure] cli-type-generator Phase 4: Reorganize TaggedSum Output (2025-12-17)
**Purpose:** Improve readability of generated TaggedSum type files

- Reorganized output from per-variant to per-concern grouping
- Converted variant toString/toJSON to object literals with `// prettier-ignore` for alignment
- Grouped static methods by type (all .prototype together, then .is, then .toString, etc.)
- Added section headers for each static method group
- Created `codegen/variant.js` and `codegen/firestore-serialization.js` modules
- Deferred: Phase 5 (default values support)

## [infrastructure] Style Validator: Allow for..of with await (2025-12-16)
**Purpose:** Fix false positive in functional-patterns rule

- Added `containsAwait()` helper to detect await expressions in loop bodies
- `for..of` with `await` inside is now allowed (legitimate for sequential async)
- `for..of` without `await` still flagged as style violation

## [infrastructure] Style Validator Cleanup for quicken-web-app (2025-12-14)
**Purpose:** Fix all style violations in quicken-web-app JS/JSX files

- Validated and fixed 17 files in `modules/quicken-web-app/src/`
- Added ABOUTME comments to all files
- Extracted memoizeReduxState callbacks to named functions with @sig
- Replaced while loop with recursive `findMatches` in cell-renderers.jsx
- Used destructuring aliases for snake_case DB fields (`account_id: accountId`)
- Added Theme to design-system Radix re-exports (was missing)
- Exempted design-system from radix import rule (it IS the facade)
- Exempted cli-style-validator from self-validation (false positives on string literals)

## [quicken-web-app] Tab Groups & Account Navigation (2025-12-13)
**Purpose:** WebStorm-style tab groups for viewing multiple registers/reports side-by-side

- Added TabGroup, TabLayout, View tagged types with LookupTable storage
- Created TabGroupContainer with horizontal flex layout and resize handles
- Implemented TabGroup component with tab bar, drag-and-drop, and View.match() content rendering
- Native HTML5 drag-and-drop for moving tabs between groups (no external library)
- Lazy hydration via getInitialState() in reducer (moved from preloaded state)
- Created dedicated hydration.js module for localStorage read logic
- Auto-resize remaining groups when empty group removed (closeView, moveView)
- Sidebar account click opens register tab (or brings existing to front)
- Max 4 groups enforced; layout persists in localStorage
- Deferred: TransactionRegisterPage style violations, hydration consolidation, rename groups→tabGroups

## [quicken-web-app] F129 - Redux Migration (2025-12-08)
**Purpose:** Migrate quicken-web-app Redux actions from string literals to Tagged types

- Defined Action type with SetTransactionFilter and ResetTransactionFilters variants
- Created post.js command layer to wrap Tagged actions for Redux dispatch
- Updated reducer to use action.payload.match() for exhaustive pattern matching
- Removed redundant actions.js—components call Action constructors directly via post()
- Added quicken-web-app to cli-type-generator type-mappings.js
- Also: custom eslint rule 'arrow-expression-body', lint-staged order fix, PostToolUse hook for auto-formatting

## [curb-map] F130 - Progressive Data Loading with Firestore Listeners (2025-11-20)
**Purpose:** Implement real-time data synchronization with progressive loading

- Replaced `AllInitialDataLoaded` with progressive loading using three actions: `UserLoaded`, `OrganizationSynced`, `BlockfacesSynced`
- Added `projectDataLoading` state flag to track when project data is loading
- Created `firestore-listeners.js` module to manage listener lifecycle with flat functions
- App-level loading guard in `main.jsx` waits for user and organization before showing routes (eliminates per-route loading checks)
- Organization listener fires `OrganizationSynced`; only wipes project state when defaultProjectId changes (name changes don't trigger reload)
- Blockfaces listener provides real-time updates for all users
- Fixed Redux state pattern: removed redundant `currentOrganizationId`, derive IDs from objects via selectors
- Fixed Firestore rules: flattened nested structure for `organizations/{organizationId}/projects/{projectId}/blockfaces/{blockfaceId}`
- Fixed `descendant()` bug in firestore-client-facade.js that was duplicating collection names in paths
- Updated server-side handler to recognize renamed actions

## [curb-map] F128 - Improve Metadata Handling (2025-11-20)
**Purpose:** Clarify that organizationId is request metadata, not action payload data

- Removed organizationId field from 7 organization-scoped action variants (OrganizationCreated, OrganizationUpdated, OrganizationDeleted, OrganizationSuspended, MemberAdded, RoleChanged, MemberRemoved)
- Updated Action.getSubject() to accept organizationId as parameter instead of extracting from action
- All handlers extract organizationId from actionRequest (request metadata), not from action payloads
- Removed custom claims from Firebase Auth tokens (eliminates staleness issues)
- Implemented tenant validation by reading user.organizations from Firestore instead of token claims
- Server reads user document to validate organization/project access on every request
- Special handling for UserCreated (user doesn't exist yet) and OrganizationCreated (user creating first org)
- Pattern established: organizationId is ALWAYS request metadata, derived server-side from request context

## [curb-map] F127 - Blockfaces to Firestore (2025-11-18)
**Purpose:** Persist blockface edits to Firestore with debounced auto-save

- Added SaveBlockface action with snapshot-based persistence (not event sourcing)
- Implemented debounced auto-save (3 seconds after last edito that hte
- Added flush logic on blockface switch and page unload (beforeunload/visibilitychange handlers)
- Created Cloud Function handler for SaveBlockface
- Added Firestore rules for blockfaces collection at organizations/{orgId}/projects/{projectId}/blockfaces/{id}
- Updated Blockface type definition with organizationId, projectId, and LookupTable segments
- Implemented diff logic for change tracking in audit trail
- All segment actions (SegmentUseUpdated, SegmentLengthUpdated, etc.) trigger debounced save

## [curb-map] F126 - Application Routing (2025-11-13)
**Purpose:** Add TanStack Router with MainLayout shell and lazy-loaded route components

- Installed TanStack Router for client-side routing
- Created LoadingSpinner component in design-system for Suspense fallback
- Extracted MapPage component with MapComponent for map UI logic
- Created AdminUsersPage placeholder for user management route
- Configured router with root route wrapping MainLayout and Suspense
- Established route structure: `/` redirects to `/map`, `/map` for map interface, `/admin/users` for user management
- Integrated MainLayout as application shell with TopBar and Sidebar navigation
- Removed global CSS (index.css) in favor of Radix Themes styling
- Separated page components (route metadata) from UI components (rendering logic)
- Fixed layoutChannel API usage (setState instead of send)
- Extracted EditorPanel component with Radix Themes components (Box, Flex, Heading, Button, Checkbox, Separator)
- Removed unnecessary useCallback wrappers from event handlers
- Moved showCurbTable state into EditorPanel component where it belongs
- Always-mounted EditorPanel with isVisible controlling slide animation
- Deferred features: active route highlighting, route-level auth guards, breadcrumb navigation

## [curb-map] F125 - User Management UI (2025-11-13)
**Purpose:** User management interface for viewing and managing organization members with role-based access control

- Created generic sortable Table component in design-system wrapping Radix Themes Table
- Implemented LookupTable PropTypes validator with `.of(Type)` for type-specific validation
- Built AdminUsersTable component with role dropdown for admins and date formatting for removed users
- Created AdminUsersTabbedPanel with tabs (active/removed), search filter, role filter, and column sorting
- Added mock member data fixtures for testing
- Built comprehensive Storybook stories demonstrating all component states
- Established controlled component pattern with parent-managed sort state
- Fixed table layout with stable column widths using `table-layout: fixed`
- Dimmed sort indicators for sortable-but-inactive columns (UX affordance)
- Phase 2 features deferred: app routing, Firestore integration, toast notifications, error dialogs, invitation system

## [infrastructure] F122 - Type Generator Enhancements (2025-01-04)
**Purpose:** Auto-generate Firestore serialization with LookupTable support

- Added LookupTable field syntax '{Type:idField}' for type-safe collection fields
- Generated toFirestore/fromFirestore methods with encode/decode timestamp parameters
- Implemented underscore primitive pattern for overridable generated functions
- LookupTables serialize to Firestore as object maps (key=ID, value=full object) for efficient lookups and atomic updates
- Automatic nested serialization for Date fields and Tagged types
- Updated facades to pass timestamp conversion functions to serialization methods
- Eliminated manual timestampFields arrays - type information embedded in generated code
- Fixed handlers to write full objects instead of scalar values to LookupTable fields

## [curb-map] F121 - Phone Authentication (2025-11-03)
**Purpose:** SMS-based passwordless authentication using Firebase Auth client SDK

- Implemented AuthenticationCompleted action type with email and displayName fields
- Created authentication handler for user creation/lookup and custom claims management
- Updated token validation to support first-time authentication without userId claim
- Firebase Auth handles passcode generation, SMS delivery, verification, and rate limiting
- Server handles User document creation, userId custom claim setting, and audit trail
- Client stores email/displayName in memory during SMS verification flow
- Updated security architecture documentation with correct Firebase Auth flow
- No PII storage (phoneNumber not persisted in User document)

## [curb-map] F110 - Multi-Tenant Data Model (2025-10-31)
**Purpose:** Core multi-tenant infrastructure with organizations, users, and RBAC

- Implemented 10 Action types (OrganizationCreated/Updated/Suspended/Deleted, UserCreated/Updated/Forgotten, MemberAdded/Removed, RoleChanged)
- Built event handlers for all organization and user operations
- HTTP action submission endpoint with validation and idempotency
- Transaction-based atomic operations across multiple collections
- Organization members map with soft-delete audit trail
- Firebase Auth token verification and userId claim management
- Firestore security rules for multi-tenant data isolation
- RBAC with three-tier role hierarchy (admin > member > viewer)
- Self-modification authorization for UserUpdated/UserForgotten
- Last-admin protection for MemberRemoved/RoleChanged
- Comprehensive integration test coverage for all handlers and RBAC scenarios

## [curb-map] F124 - Permission Checking (2025-10-31)
**Purpose:** Role-based access control (RBAC) for multi-tenant authorization

- Implemented three-tier role hierarchy (admin > member > viewer)
- Created Action.mayI() for action-level permission checks
- Built checkRole() authorization validator in submit-action-request
- Organization-scoped permissions verified per action
- Self-modification pattern for UserUpdated/UserForgotten
- Last-admin protection for MemberRemoved/RoleChanged
- Integration tests for all RBAC scenarios
- Permission checking logic inline (extraction to reusable module deferred to backlog)

## [curb-map] F108 - Event Sourcing Core (2025-10-31)
**Purpose:** Implement core event sourcing infrastructure for CurbMap

- Created ActionRequest and Action tagged types with Firestore integration helpers
- Set up Firebase emulator integration testing infrastructure with namespaced isolation
- Created dedicated Firebase functions workspace with esbuild bundling
- Implemented queue processing function with trigger guards and structured logging
- Created actionRequests and completedActions collections with comprehensive security rules and composite indexes
- Implemented idempotency checking via completedActions audit trail
- Established write-once, immutable audit trail for SOC2 compliance
- Built foundation for authorization (F110.5) and domain handlers (F110)

## [curb-map] F107 - Firebase SOC2 Vanilla App (2025-01-29)
**Purpose:** Complete Firebase-based application with SOC2 compliance

- Implemented infrastructure foundation with orchestration system and migration framework
- Created comprehensive architecture documentation covering event sourcing, authentication, multi-tenancy, offline-first, and billing
- Extracted implementation phases into focused specifications: F108 (Event Sourcing Core), F109 (Authentication System), F110 (Multi-Tenant Data Model), F111 (Offline Action Request Architecture), F112 (Billing & Export)
- Established manual setup procedures, decision log, and testing strategies
- All implementation details now live in individual F### specifications; see `docs/architecture/` for preserved architectural guidance

## [curb-map] F115 - Redux Tagged Types (2025-08-26)
**Purpose:** Refactor Redux store architecture with tagged types

- Implemented tagged types for domain entities (Segment, Blockface)
- Created LookupTable storage pattern for blockfaces
- Improved file organization with flat structure
- Prepared for Firestore database integration
- Added runtime type validation with tagged types

## [curb-map] F114 - DividerLayer Pure JSX Migration (2025-08-21)
**Purpose:** Migrate DividerLayer to pure JSX implementation

- Converted DividerLayer from complex implementation to pure JSX
- Improved performance and maintainability
- Simplified component logic
- Better integration with React patterns

## [curb-map] F113 - Minimal Token Migration (2025-08-26)
**Purpose:** Minimal migration approach for SegmentedCurbEditor

- Simplified migration approach compared to F110
- Focused on essential changes only
- Reduced risk and complexity
- Superseded F110 with more practical approach

## [curb-map] F112 - Simplify Segment Editor (2025-08-26)
**Purpose:** Simplify segment editor implementation

- Reduced complexity of segment editing logic
- Improved user experience with streamlined interface
- Enhanced performance through simplified algorithms
- Better integration with overall architecture

## [curb-map] F110 - SegmentedCurbEditor Migration (2025-08-25)
**Purpose:** Migrate SegmentedCurbEditor to new architecture

- Migrated SegmentedCurbEditor to use tagged types
- Integrated with new Redux architecture
- Improved component maintainability
- Superseded by F113 minimal token migration

## [curb-map] F109 - Component Design System Migration (2025-08-20)
**Purpose:** Migrate components to use design system with Radix Themes

- Migrated right-of-way-editor components to design system
- Integrated Radix Themes and Vanilla Extract CSS-in-JS
- Created reusable Table and Select components
- Built Storybook stories comparing original vs migrated components
- Used developer subagent for complex CurbTable migration

## [infrastructure] F108 - Infrastructure Testing Strategy (2025-08-15)
**Purpose:** Define testing strategy for infrastructure components

- Created comprehensive testing approach for infrastructure modules
- Defined unit, integration, and end-to-end testing patterns
- Established testing standards for CLI tools and utilities
- Improved reliability of infrastructure components

## [infrastructure] F108 - Function Declaration Ordering (2025-08-01)
**Purpose:** Implement coding standard for function declaration ordering

- Implemented AST-based rule for function declaration ordering
- Required all inner functions defined at top of containing block
- Integrated with existing coding standards checker
- Improved code readability and consistency

## [curb-map] F106 - Label Positioning Simplification (2025-07-30)
**Purpose:** Simplify complex label positioning logic

- Removed complex conditional positioning logic
- Simplified label placement algorithms
- Improved performance by reducing DOM calculations
- Enhanced maintainability of UI components

## [curb-map] F105 - Event Handling Unification (2025-07-29)
**Purpose:** Standardize event handling patterns across components

- Unified event handling approaches across the application
- Created consistent patterns for user interactions
- Improved code consistency and maintainability
- Reduced cognitive overhead for developers

## [curb-map] F104 - Component Decomposition (2025-07-28)
**Purpose:** Break down large components into smaller, focused components

- Identified components that exceeded complexity thresholds
- Created smaller, focused components with single responsibilities
- Improved maintainability and testability
- Reduced cognitive load for developers

## [infrastructure] F103 - Coding Standards Checker (2025-07-28)
**Purpose:** Simple CLI tool to detect and report coding standards violations

- Built minimal CLI tool using acorn AST parser
- Created single file input with JSON output optimized for LLM processing
- Implemented comprehensive reporting of all violations
- Designed testable API with core checking logic separate from CLI interface
- Integrated with existing coding standards checker infrastructure

## [curb-map] F102 - UI Business Separation (2025-07-27)
**Purpose:** Extract business logic utilities from UI components

- Separated business logic from UI presentation concerns
- Created utility functions for segment management operations
- Improved testability by isolating business logic
- Maintained clean separation between data operations and UI rendering

## [curb-map] F101 - UI Simplification (2025-07-27)
**Purpose:** Remove Unknown label complexity from segment management UI

- Removed complex positioning logic for Unknown floating label
- Added fixed "Add Segment" buttons in component headers
- Preserved all segment lozenges, Redux state, and mathematical invariant
- Eliminated z-index conflicts and conditional positioning
- Created clear empty state handling with prominent add buttons

## [curb-map] F100 - Segment Management (2025-07-24)
**Purpose:** Essential decisions for segment management refactor

- Defined Unknown space as system state, not segment data
- Established mathematical invariant: `sum(segments.length) + unknownRemaining = blockfaceLength`
- Created universal `adjustSegmentBoundary` operation for all interaction modes
- Defined three interaction modes: Field Collection, Precision Correction, Visual Adjustment
- Established Unknown space lifecycle (starts at blockface length, shrinks during collection, disappears at 0)

## [curb-map] NumberPad Component (2025-07-22)
**Purpose:** Mobile-optimized number input component for CurbTable

- Designed custom number pad with 3x4 button layout (0-9, ".", backspace, enter, cancel)
- Implemented decimal precision with maximum 1 decimal place
- Added validation for positive numbers with configurable min/max limits
- Created modal overlay positioned near bottom of screen
- Integrated with CurbTable for length/start position editing
- Built mobile touch optimization with accessibility considerations

## [curb-map] CurbTable Component (2025-07-22)
**Purpose:** Mobile-friendly table-based curb editor for field data collection

- Created table interface optimized for one-handed phone use
- Implemented Type/Length/Start columns with dropdown selection
- Added space management with Unknown segment pool
- Built mobile-first design with 44px touch targets
- Integrated with Redux store for state management
- Created comprehensive Storybook stories for testing

## [infrastructure] A004 - Claude Onboarding (2025-07-29)
**Purpose:** Onboarding documentation for Claude AI assistant

- Created comprehensive onboarding guide for Claude
- Documented project structure and coding standards
- Established workflow patterns and best practices
- Superseded by CLAUDE.md consolidated project guide

## [infrastructure] Enhanced @sig Documentation Validation (2025-12-13)
**Purpose:** Enforce @sig comment placement and require paired @sig + description

- Added rule: @sig must be last substantive line in comment block (backlog item 8)
- Added rule: @sig requires accompanying description comment (backlog item 3)
- Excluded test files (*.tap.js, *.integration-test.js) from @sig and single-level-indentation rules
- Fixed function ordering violations in single-level-indentation.js uncovered by pre-commit hook
- 96 total validator tests passing

## [infrastructure] Function Spacing Validation (2025-12-13)
**Purpose:** Enforce visual separation between multiline functions (backlog item 5)

- New function-spacing rule: multiline functions require blank line above
- Single-line functions can group together without blank lines
- Rule checks nested functions inside function bodies, not just top-level
- Fixed @sig validator to recognize indented continuation lines as part of type definition block
- Applied fixes to TransactionRegisterPage.jsx (@sig ordering, function spacing)
- 106 total validator tests passing
- Deferred: fixing all existing function-spacing violations across codebase (item 6)

## [infrastructure] Type Generator Style Compliance (2025-12-15)
**Purpose:** Make cli-type-generator produce style-compliant code (backlog item 10)

- Fixed chain-extraction rule to exclude assignment targets (can't destructure LHS)
- Added AST-aware prettier-ignore support to line-length rule (function-level)
- Updated type generator to emit @sig documentation on Firestore functions
- Added destructuring in generated code when 2+ fields to avoid chain-extraction violations
- Split long toString lines and parameterized generateIsMethod for compliance
- Regenerated all 41 type files with updated generator
- Fixed test assertions to match updated message formats
- 127 style validator tests passing

## [infrastructure] Type Generator IR Rewrite Phase 1 (2025-12-15)
**Purpose:** Create FieldTypeIR foundation and fix optional FieldTypes validation bug

- Created `src/ir/field-type-ir.js` with unified parsing for all field type inputs
- FieldTypeIR.fromAny normalizes strings, regexes, and objects to IR schema
- IR schema: `{ baseType, optional, arrayDepth, taggedType, idField, regex, fieldTypesReference }`
- Functional style: `createIR(overrides)` takes optional fields with defaults
- Integrated FieldTypeIR into `tagged-type-function-generators.js` for validation codegen
- Fixed optional FieldTypes bug: `{ pattern: FieldTypes.X, optional: true }` now generates `true` for optional parameter
- Standardized on `isFieldTypesReference` marker (replaced `__fieldTypesReference`)
- Fixed style violations in `parse-type-definition-file.js` and `prettier-code.js`
- Added integration test for optional FieldTypes syntax
- Deferred: Phase 2-6 (ImportIR, TypeDefinitionIR, FunctionIR, testing infrastructure, integration)

## [infrastructure] Type Generator Phases 2-3 Complete (2025-12-17)
**Purpose:** Separate parsing from code generation for easier maintenance and future features

- Phase 2: Created TypeDescriptor and FieldDescriptor in `src/descriptors/`
- Phase 3: Extracted 6 codegen modules to `src/codegen/`:
  - `to-string.js`, `to-json.js`, `serialization.js`, `is-method.js`, `imports.js`, `constructor-sig.js`
- `tagged-type-generator.js` reduced from ~790 to ~540 lines (orchestration only)
- Added `FieldDescriptor.toSyntax()` for concise comment format in generated files
- Deleted obsolete `tagged-field-type.js`
- Phases 4 (reorganize TaggedSum output) and 5 (default values) now enabled
- All 487 tests pass

## [quicken-web-app] Transaction Drill-Down in Category Report (2025-12-21)
**Purpose:** Expand leaf categories to show individual transactions using TanStack's renderSubComponent

- Added `renderSubComponent` and `getRowCanExpand` props to DataTable component
- Created TransactionSubTable component showing Date, Account, Payee, Memo, Amount columns
- Fixed TanStack Table behavior: `getRowCanExpand` replaces default sub-rows check, not extends it
  - Solution: return `hasChildren || hasTransactions` to support both tree and sub-component expansion
- Updated CategoryReportPage with `enrichTransactions` to add both categoryName and accountName
- Tree hierarchy expansion and leaf transaction drill-down now work together seamlessly

## [quicken-web-app] FilterBar Consolidation (2025-12-22)
**Purpose:** Consolidate filter UI into reusable top-aligned FilterBar for both register and report pages

- Created FilterChip component (reusable chip with label, value, optional clear button)
- Created FilterChipRow component (horizontal row of chips with expand toggle)
- Created FilterPanel component (expanded filter controls with conditional sections)
- Created FilterBar component (manages expanded state, renders chip row + panel)
- Added `groupBy` and `selectedAccounts` fields to TransactionFilter type and selectors
- Updated TransactionRegisterPage to use FilterBar (showSearch=true)
- Updated CategoryReportPage to use FilterBar (showGroupBy=true, showAccounts=true)
- Deleted TransactionFiltersCard component (sidebar filter UI)
- Deferred: Wiring groupBy to change aggregation dimension (currently always category)
- Deferred: Rename CategoryReportPage to TransactionReportPage (after groupBy is functional)
- Deferred: Filter persistence to storage (user wants to decide storage strategy later)

## [quicken-web-app] Investment Transaction Register (2025-12-24)
**Purpose:** Display investment account transactions with security/action filtering and running cash balance

- Created InvestmentRegisterPage with investment-specific filter chain (account → securities → actions)
- Created SecurityFilterChip and ActionFilterChip with multi-select popovers
- Created mock-investment-generator.js with realistic investment data (stocks, ETFs, mutual funds, options)
- Added running cash balance calculation (amount field only, not shares/prices)
- Unified filter chip styling: red chips when active, red background when filtering, "(filtered from X)" indicator
- Filter summary details below each chip (date range, security names, action labels with "+N more" truncation)
- Added clear button (×) to DateFilterChip across all pages
- Shortened date range labels ("Quarter to date" not "This Quarter to date")
- Transaction count row at top of filter area, aligned with Date chip
- Fixed $NaN bug in category report (investment transactions have optional amount)
- Added Action column to TransactionSubTable with human-readable labels
- Made TransactionSubTable header sticky and body resizable
- Deferred: Phase 2 (Portfolio Value Report with holdings and gain/loss)

## [quicken-web-app] Investment Holdings Report (2025-12-27)
**Purpose:** Display portfolio holdings as of a specific date with market values and gain/loss

- Created InvestmentReportPage showing holdings computed from lots as of selected date
- Lots and lotAllocations loaded as LookupTables (not arrays) with proper id fields
- Holdings computed by selector from lots: `purchaseDate <= asOfDate AND (closedDate IS NULL OR closedDate > asOfDate)`
- Cost basis calculated with FIFO lot allocation tracking via lotAllocations table
- Created AsOfDateChip for single-date filter (vs range filter on other pages)
- Added priceAsOf lookup for historical pricing (most recent price ≤ asOfDate)
- Hierarchical tree display: Account → Security Type → Security with expand/collapse
- Shows quantity, cost basis, market value, unrealized gain/loss, day change
- Added memoizeReduxStatePerKey export to @graffio/functional for per-view selector caching
- Fixed stale type-mappings.js reference to deleted view-row.type.js

## [quicken-web-app] IndexedDB Persistence + File Reopen (2025-12-31)
**Purpose:** Unify persistence to IndexedDB and add "reopen last file" feature

- Replaced localStorage with IndexedDB via new `storage.js` module (get/set with JSON, getRaw/setRaw with structured cloning)
- Async store initialization: `initializeStore()` hydrates from IndexedDB before render
- FileSystemFileHandle stored via `setRaw()` for file reopen (can't be JSON serialized)
- Modal dialog on startup offers "Reopen Last" or "Open New..." when previous file exists
- Added router and storage context types to complexity-budget validator rule
- Updated cohesion-structure rule to respect COMPLEXITY comments for vague prefix exceptions
- Deferred: Reviewing all COMPLEXITY comments for validity, adding E (Effects) cohesion group

## [infrastructure] Style Validator P/T/F/V/A Refactoring (2025-12-29)
**Purpose:** Bring all cli-style-validator rules into P/T/F/V/A cohesion group compliance

- Refactored 11 rule files to P/T/F/V/A cohesion structure (Predicates, Transformers, Factories, Validators, Aggregators)
- Created shared modules: predicates.js (PS namespace) and aggregators.js (AS namespace)
- Extracted common utilities: isPascalCase, isMultilineNode, getFunctionName, countFunctions, countFunctionLines
- Added cohesion-structure.js rule checks: P→T→F→V→A ordering, functions defined inside objects (not referenced externally)
- Added description comments above all @sig annotations per convention
- Documented extraction rules in conventions.md (when to extract to shared modules)
- All 12 rule files now compliant; 154 tests passing
- Some files exceed 150-line budget but justified by COMPLEXITY comments or genuine complexity

## [infrastructure] E Cohesion Group + React Component Cohesion (2025-12-31)
**Purpose:** Add E (Effects) cohesion group and enforce cohesion patterns inside React components

- Added E group to conventions.md with patterns: persist*, handle*, dispatch*, emit*, send*
- Created react-component-cohesion.js rule: detects P/T/F/V/A/E inside components (should be at module level), flags render* functions (should be extracted to components)
- Updated conventions.md with React component file structure: cohesion groups at module level, exported component last, useCallback handlers stay inside (need state)
- Added PS.isComplexFunction predicate: excludes single-line anonymous callbacks from function counts (filter/map callbacks reduce complexity, not increase it)
- Refactored InvestmentReportPage.jsx: moved P/T to module level, extracted HoldingRow/HoldingsSubTable as sibling components
- Added commit-msg hook (bash/commit-msg-validate.sh) to enforce Problem/Solution/Impact message format

## [infrastructure] AST/DSL Reorganization Phases 1-4 (2026-01-03)
**Purpose:** Reorganize cli-style-validator DSL code for clarity, add Tagged types for type safety

- **Phase 1:** Reorganized into `src/lib/dsl/` (ast.js, source.js) and `src/lib/shared/` (predicates.js, aggregators.js, factories.js)
- **Phase 2:** Added no-abbreviations naming convention (declaration not decl, reference not ref)
- **Phase 3:** Renamed wrapper types - Query→Nodes, merged Source/SourceQuery/LineQuery→Lines
- **Phase 4:** Added Tagged types (NamedLocation, FunctionInfo, Violation) via cli-type-generator
- Created README.md documenting DSL API with examples and data flow diagrams
- Specification at `specifications/F-ast-dsl-reorganization/plan.md`
- **Deferred:** Phase 5 (ASTNode TaggedSum with .match() pattern matching)

## [infrastructure] createSelector + Style Validator Curried Function Support (2026-01-01)
**Purpose:** Auto-currying createSelector for Redux and fix style validator false positives on curried functions

**createSelector:**
- TDD implementation in @graffio/functional: works curried `S.foo(arg)(state)` and uncurried `S.foo(state, arg)`
- Arity-based detection: 2+ args = uncurried call, 1 arg = returns curried selector
- Adopted YAGNI: only wrap selectors that actually need currying

**Style validator curried function fixes:**
- Fixed sig-documentation false positive: inner functions like `foo: a => b => ...` no longer flagged
- Added `isInnerCurriedFunction` predicate to PS (checks if parent is ArrowFunctionExpression)
- Extracted to shared PS: `isNonCommentLine`, `toCommentContent`, `isDirectiveComment`
- Consolidated duplicates in function-declaration-ordering.js using PS predicates
- Restructured sig-documentation.js: predicates in P, transformers in T, only `findSigLineIndex` in A

**DataTable keyboard navigation:**
- Moved keyboard nav from both register pages into DataTable component
- Props: `onHighlightChange`, `focusableIds` for arrow key navigation
- Simplified InvestmentRegisterPage and TransactionRegisterPage (now under complexity budgets)

**User cleanup (post-session):**
- Simplified traverseAST signature (removed parent parameter)
- Removed COMPLEXITY comments from aggregators.js and sig-documentation.js after simplification

## [infrastructure] @graffio/ast Module Extraction (2026-01-04)
**Purpose:** Create reusable AST module that completely hides ESTree structure from consumers

- Created `modules/ast/` with TaggedSum ASTNode type (30+ variants for ESTree node types)
- Added prototype getters via `ast-node-methods.js` for natural property access (`node.line` not `AST.line(node)`)
- API hides ESTree: consumers use semantic names (`node.base` not `node.esTree.object`)
- Entry points: `AST.from()`, `AST.topLevelStatements()`, `AST.descendants()`, `AST.children()`
- Helpers: `AST.isTopLevel()`, `AST.associatedCommentLine()`, `AST.bodyContainsAwait()`
- Lines DSL for source code queries: `Lines.from(code).before(line).takeUntil(predicate)`
- Pattern detection: `isStyleObject()`, `countStyleObjects()`, `STYLE_PROPERTIES`
- Migrated cli-style-validator: all 11 rule files use new ASTNode property API
- All 247 tests pass (31 ast module + 216 cli-style-validator)
- Deferred: ASTNode.match() pattern matching for exhaustive type handling

**Cleanup (2026-01-04):**
- Created `transformers.js` for COMPLEXITY comment parsing (extracted from predicates.js)
- Removed unused shared functions: collectNodes, traverseAST, getChildNodes, findBase, isValidNode
- Deleted redundant function-nesting rule (covered by single-level-indentation)
- Refactored chain-extraction.js to functional style using AST.descendants() + filter chains
- Fixed patterns.js to use P cohesion group for isStyleObject helper

## [quicken-web-app] Account List Redesign (2026-01-06)
**Purpose:** Scrollable sidebar account list with sort modes, collapsible sections, and investment balances

- Added SortMode, EnrichedAccount, AccountSection tagged types for type-safe organization
- Created account-organization.js business module for section-building logic
- Implemented accounts.js selector using enrichedHoldingsAsOf for investment balances
- Added Redux state for sortMode and collapsedSections with IndexedDB persistence
- AccountList component: ScrollArea wrapper, sort dropdown, collapsible section headers
- Always segregate $0 accounts into separate section (nested by type in ByType mode)
- Removed Default sort mode; ByType is now default (Cash, Credit, Investments, Other Assets, Other Liabilities)
- Investment accounts show market value (shares × price) and day change
- Memoized collectOrganized selector to prevent unnecessary rerenders
- Fixed multiple crash bugs: null guards for lots, prices, transactionFilters during initial load

## [quicken-web-app] Keymap Module Integration (2026-01-07)
**Purpose:** Keyboard shortcuts (j/k navigation) via priority-based keymap resolution

- Created @graffio/keymap module: Intent/Keymap tagged types, normalizeKey, Keymap.resolve()
- Added Redux state for keymaps with RegisterKeymap/UnregisterKeymap actions
- Created keymap-routing.js service for global keyboard handling
- Created file-handling.js service (extracted from router.jsx)
- Extracted RootLayout.jsx, MainSidebar.jsx, FileOpenDialog.jsx from router.jsx
- Router.jsx simplified to route configuration only (~30 lines)
- TransactionRegisterPage registers j/k keymap on mount, unregisters on unmount
- Key translations forward to existing DataTable handlers (no component changes needed)
- Fixed COMPLEXITY comment syntax: separate `// COMPLEXITY: rule — reason` per rule with em-dash

## [quicken-web-app] DataTable Keymap & KeymapDrawer (2026-01-08)
**Purpose:** DataTable registers keyboard shortcuts visible in KeymapDrawer

- DataTable accepts `keymapId`, `keymapName`, `onRegisterKeymap`, `onUnregisterKeymap` props
- DataTable creates its own keymap with ArrowUp/Down/Escape intents
- Register pages keep j/k keymap (dispatches synthetic ArrowDown/ArrowUp events)
- Added `name` field to Keymap type for display in KeymapDrawer
- Created KeymapDrawer component (bottom drawer showing shortcuts grouped by source)
- Added `Keymap.collectAvailable()` to aggregate intents from active keymaps
- Fixed `normalizeKey` to not add shift for symbol keys (? vs Shift+/)
- Fixed duplicate keymap IDs causing j/k to overwrite DataTable shortcuts
- Fixed CSS height chain (MainLayout Box→Flex, TabGroupContainer height→flex) for virtualizer
- Added keymap integration to InvestmentRegisterPage (matched TransactionRegisterPage)

## [infrastructure] Precompute Running Cash Balances (2026-01-08)
**Purpose:** Store running cash balance per transaction in SQLite at import time

- Added `runningBalance` column to transactions table schema
- Created `updateRunningBalances()` using SQL window function with `ORDER BY date, rowid`
- Removed amount-sign preprocessing that was incorrectly reordering transactions
- Investment transactions use cash impact logic (Buy/Sell/Div affect cash; ReinvDiv/ShrsIn/StkSplit don't)
- Web app reads stored balance directly instead of computing client-side
- Refactored cli.js and database-service.js with proper P/T/F/A/E cohesion groups
- Added COMPLEXITY-TODO for pre-existing style debt in transactions.js, index.js, cli.js
- Deferred: Splitting transactions.js into smaller modules (288 lines, 24 functions)

## [infrastructure] F-stable-qif-import Phase 1.5: Style Compliance (2026-01-10)
**Purpose:** Make cli-qif-to-sqlite QIF parsing files style-compliant by extracting nested functions and eliminating module-level mutable state

- Extracted all nested functions in `line-group-to-entry.js` to module-level cohesion groups (T, F, V)
- `lineGroupToEntry` reduced from ~250-line function with nested definitions to ~20-line dispatch
- Extracted all nested functions in `parse-qif-data.js` to T and V cohesion groups
- Eliminated module-level mutable state (`currentContext`, `currentAccount`, `options`) with explicit state passing via reduce
- State transformers use destructuring to avoid `state.xxx` pattern (ESLint rule)
- Added COMPLEXITY-TODO (expires 2026-01-13) for count-based violations pending rule revision
- All 17 tests pass
