# Completed Specifications Archive

This document summarizes the specifications that were previously archived in `specifications/archived/`. These represent completed or superseded work that has been integrated into the codebase.

**Project tags:** `[curb-map]`, `[quicken-web-app]`, `[infrastructure]` (shared tooling)

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
