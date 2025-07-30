# LLM Loader for A006 – Specification Format Standard

This specification defines the format, file structure, roles, and behavioral expectations for all specifications used in this system.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines the structure and meaning of all supported spec files
3. `tests.yaml`: Optional validation cases to test conformance of other specs

All LLMs using spec-based workflows should begin by loading and validating against this format.
