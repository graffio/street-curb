# Jeff's Preferences

Architectural and design preferences that require judgment, not mechanical enforcement.

## Tagged Types

Use `@graffio/functional` Tagged types liberally for type safety in JavaScript:
- All domain entities should be Tagged types (Account, Transaction, Category, etc.)
- Use Tagged types for any value that has semantic meaning beyond its primitive type
- When in doubt, make it a Tagged type

## Libraries vs Custom

Prefer rolling our own over importing libraries unless:
- The problem is genuinely complex (e.g., virtualization, drag-and-drop)
- The library is well-maintained and focused
- The abstraction matches our needs closely

When adopting a library:
- Wrap it in our own abstraction layer
- Don't leak library types into domain code
- Be prepared to replace it if it doesn't fit

## Decomposition

Before choosing how to decompose types, data, or modules:
- **Ask** - Don't assume a decomposition strategy; present options
- Consider what makes sense for the domain, not what's easiest to implement
- Prefer fewer, richer types over many small types

## Checkpoints

Stop and ask for approval when:
- Choosing between significantly different implementation approaches
- About to introduce a new library
- About to create a new type decomposition
- Unsure if your style matches mine

## LookupTable

LookupTable has a rich API. Read its ABOUTME before using it.

## Style Uncertainty

When you don't have explicit guidance:
- Ask rather than assume
- State your reasoning so I can correct it
