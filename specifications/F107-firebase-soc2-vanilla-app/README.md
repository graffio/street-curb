# Firebase SOC2 Vanilla App Specifications

**Updated:** 2025.08.29

## Document Structure

### Active Documents
- **`decisions-needed-now.md`** - Critical blockers that must be decided before coding infrastructure
- **`implementation-details.md`** - Technical decisions with reasonable defaults for during implementation  
- **`future-considerations.md`** - Long-term architecture decisions (3-6 month timeline)
- **`offline-queue-architecture.md`** - Core architectural pattern for offline-capable user management
- **`infrastructure-as-code-strategy.md`** - Project creation, deployment, and security strategy

### Reference Documents
- **`business.md`** - Original business requirements
- **`implementation.md`** - Detailed implementation guide with code examples
- **`summary.md`** - High-level project overview

### Archive
- **`implementation-requirements-archive.yaml`** - Original comprehensive requirements (archived 2025.08.29)

## Decision Process

**Current Status**: All user questions extracted from archive YAML into focused documents

**Next Steps**:
1. Review `decisions-needed-now.md` and classify each item as:
   - 🚫 **True blocker** - Must decide now
   - ✅ **Defaultable** - Can use reasonable default, change later  
   - 🔄 **Move to implementation-details** - Technical decision for during coding

2. Make firm decisions on true blockers only
3. Begin infrastructure code development using defaults from `implementation-details.md`

**Goal**: Unblock infrastructure development while capturing all important considerations for future reference.