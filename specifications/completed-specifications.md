# Completed Specifications Archive

This document summarizes the specifications that were previously archived in `specifications/archived/`. These represent completed or superseded work that has been integrated into the codebase.

## F122 - Type Generator Enhancements (2025-01-04)
**Purpose:** Auto-generate Firestore serialization with LookupTable support

- Added LookupTable field syntax '{Type:idField}' for type-safe collection fields
- Generated toFirestore/fromFirestore methods with encode/decode timestamp parameters
- Implemented underscore primitive pattern for overridable generated functions
- LookupTables serialize to Firestore as object maps (key=ID, value=full object) for efficient lookups and atomic updates
- Automatic nested serialization for Date fields and Tagged types
- Updated facades to pass timestamp conversion functions to serialization methods
- Eliminated manual timestampFields arrays - type information embedded in generated code
- Fixed handlers to write full objects instead of scalar values to LookupTable fields

## F121 - Phone Authentication (2025-11-03)
**Purpose:** SMS-based passwordless authentication using Firebase Auth client SDK

- Implemented AuthenticationCompleted action type with email and displayName fields
- Created authentication handler for user creation/lookup and custom claims management
- Updated token validation to support first-time authentication without userId claim
- Firebase Auth handles passcode generation, SMS delivery, verification, and rate limiting
- Server handles User document creation, userId custom claim setting, and audit trail
- Client stores email/displayName in memory during SMS verification flow
- Updated security architecture documentation with correct Firebase Auth flow
- No PII storage (phoneNumber not persisted in User document)

## F122 - Type Generator Enhancements (2025-01-04)
**Purpose:** Auto-generate Firestore serialization with LookupTable support

- Added LookupTable field syntax '{Type:idField}' for type-safe collection fields
- Generated toFirestore/fromFirestore methods with encode/decode timestamp parameters
- Implemented underscore primitive pattern for overridable generated functions
- LookupTables serialize to Firestore as object maps (key=ID, value=full object) for efficient lookups and atomic updates
- Automatic nested serialization for Date fields and Tagged types
- Updated facades to pass timestamp conversion functions to serialization methods
- Eliminated manual timestampFields arrays - type information embedded in generated code
- Fixed handlers to write full objects instead of scalar values to LookupTable fields

## F110 - Multi-Tenant Data Model (2025-10-31)
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

## F124 - Permission Checking (2025-10-31)
**Purpose:** Role-based access control (RBAC) for multi-tenant authorization

- Implemented three-tier role hierarchy (admin > member > viewer)
- Created Action.mayI() for action-level permission checks
- Built checkRole() authorization validator in submit-action-request
- Organization-scoped permissions verified per action
- Self-modification pattern for UserUpdated/UserForgotten
- Last-admin protection for MemberRemoved/RoleChanged
- Integration tests for all RBAC scenarios
- Permission checking logic inline (extraction to reusable module deferred to backlog)

## F108 - Event Sourcing Core (2025-10-31)
**Purpose:** Implement core event sourcing infrastructure for CurbMap

- Created ActionRequest and Action tagged types with Firestore integration helpers
- Set up Firebase emulator integration testing infrastructure with namespaced isolation
- Created dedicated Firebase functions workspace with esbuild bundling
- Implemented queue processing function with trigger guards and structured logging
- Created actionRequests and completedActions collections with comprehensive security rules and composite indexes
- Implemented idempotency checking via completedActions audit trail
- Established write-once, immutable audit trail for SOC2 compliance
- Built foundation for authorization (F110.5) and domain handlers (F110)

## F107 - Firebase SOC2 Vanilla App (2025-01-29)
**Purpose:** Complete Firebase-based application with SOC2 compliance

- Implemented infrastructure foundation with orchestration system and migration framework
- Created comprehensive architecture documentation covering event sourcing, authentication, multi-tenancy, offline-first, and billing
- Extracted implementation phases into focused specifications: F108 (Event Sourcing Core), F109 (Authentication System), F110 (Multi-Tenant Data Model), F111 (Offline Action Request Architecture), F112 (Billing & Export)
- Established manual setup procedures, decision log, and testing strategies
- All implementation details now live in individual F### specifications; see `docs/architecture/` for preserved architectural guidance

## F115 - Redux Tagged Types (2025-08-26)
**Purpose:** Refactor Redux store architecture with tagged types

- Implemented tagged types for domain entities (Segment, Blockface)
- Created LookupTable storage pattern for blockfaces
- Improved file organization with flat structure
- Prepared for Firestore database integration
- Added runtime type validation with tagged types

## F114 - DividerLayer Pure JSX Migration (2025-08-21)
**Purpose:** Migrate DividerLayer to pure JSX implementation

- Converted DividerLayer from complex implementation to pure JSX
- Improved performance and maintainability
- Simplified component logic
- Better integration with React patterns

## F113 - Minimal Token Migration (2025-08-26)
**Purpose:** Minimal migration approach for SegmentedCurbEditor

- Simplified migration approach compared to F110
- Focused on essential changes only
- Reduced risk and complexity
- Superseded F110 with more practical approach

## F112 - Simplify Segment Editor (2025-08-26)
**Purpose:** Simplify segment editor implementation

- Reduced complexity of segment editing logic
- Improved user experience with streamlined interface
- Enhanced performance through simplified algorithms
- Better integration with overall architecture

## F110 - SegmentedCurbEditor Migration (2025-08-25)
**Purpose:** Migrate SegmentedCurbEditor to new architecture

- Migrated SegmentedCurbEditor to use tagged types
- Integrated with new Redux architecture
- Improved component maintainability
- Superseded by F113 minimal token migration

## F109 - Component Design System Migration (2025-08-20)
**Purpose:** Migrate components to use design system with Radix Themes

- Migrated right-of-way-editor components to design system
- Integrated Radix Themes and Vanilla Extract CSS-in-JS
- Created reusable Table and Select components
- Built Storybook stories comparing original vs migrated components
- Used developer subagent for complex CurbTable migration

## F108 - Infrastructure Testing Strategy (2025-08-15)
**Purpose:** Define testing strategy for infrastructure components

- Created comprehensive testing approach for infrastructure modules
- Defined unit, integration, and end-to-end testing patterns
- Established testing standards for CLI tools and utilities
- Improved reliability of infrastructure components

## F108 - Function Declaration Ordering (2025-08-01)
**Purpose:** Implement coding standard for function declaration ordering

- Implemented AST-based rule for function declaration ordering
- Required all inner functions defined at top of containing block
- Integrated with existing coding standards checker
- Improved code readability and consistency

## F106 - Label Positioning Simplification (2025-07-30)
**Purpose:** Simplify complex label positioning logic

- Removed complex conditional positioning logic
- Simplified label placement algorithms
- Improved performance by reducing DOM calculations
- Enhanced maintainability of UI components

## F105 - Event Handling Unification (2025-07-29)
**Purpose:** Standardize event handling patterns across components

- Unified event handling approaches across the application
- Created consistent patterns for user interactions
- Improved code consistency and maintainability
- Reduced cognitive overhead for developers

## F104 - Component Decomposition (2025-07-28)
**Purpose:** Break down large components into smaller, focused components

- Identified components that exceeded complexity thresholds
- Created smaller, focused components with single responsibilities
- Improved maintainability and testability
- Reduced cognitive load for developers

## F103 - Coding Standards Checker (2025-07-28)
**Purpose:** Simple CLI tool to detect and report coding standards violations

- Built minimal CLI tool using acorn AST parser
- Created single file input with JSON output optimized for LLM processing
- Implemented comprehensive reporting of all violations
- Designed testable API with core checking logic separate from CLI interface
- Integrated with existing coding standards checker infrastructure

## F102 - UI Business Separation (2025-07-27)
**Purpose:** Extract business logic utilities from UI components

- Separated business logic from UI presentation concerns
- Created utility functions for segment management operations
- Improved testability by isolating business logic
- Maintained clean separation between data operations and UI rendering

## F101 - UI Simplification (2025-07-27)
**Purpose:** Remove Unknown label complexity from segment management UI

- Removed complex positioning logic for Unknown floating label
- Added fixed "Add Segment" buttons in component headers
- Preserved all segment lozenges, Redux state, and mathematical invariant
- Eliminated z-index conflicts and conditional positioning
- Created clear empty state handling with prominent add buttons

## F100 - Segment Management (2025-07-24)
**Purpose:** Essential decisions for segment management refactor

- Defined Unknown space as system state, not segment data
- Established mathematical invariant: `sum(segments.length) + unknownRemaining = blockfaceLength`
- Created universal `adjustSegmentBoundary` operation for all interaction modes
- Defined three interaction modes: Field Collection, Precision Correction, Visual Adjustment
- Established Unknown space lifecycle (starts at blockface length, shrinks during collection, disappears at 0)

## NumberPad Component (2025-07-22)
**Purpose:** Mobile-optimized number input component for CurbTable

- Designed custom number pad with 3x4 button layout (0-9, ".", backspace, enter, cancel)
- Implemented decimal precision with maximum 1 decimal place
- Added validation for positive numbers with configurable min/max limits
- Created modal overlay positioned near bottom of screen
- Integrated with CurbTable for length/start position editing
- Built mobile touch optimization with accessibility considerations

## CurbTable Component (2025-07-22)
**Purpose:** Mobile-friendly table-based curb editor for field data collection

- Created table interface optimized for one-handed phone use
- Implemented Type/Length/Start columns with dropdown selection
- Added space management with Unknown segment pool
- Built mobile-first design with 44px touch targets
- Integrated with Redux store for state management
- Created comprehensive Storybook stories for testing

## A004 - Claude Onboarding (2025-07-29)
**Purpose:** Onboarding documentation for Claude AI assistant

- Created comprehensive onboarding guide for Claude
- Documented project structure and coding standards
- Established workflow patterns and best practices
- Superseded by CLAUDE.md consolidated project guide
