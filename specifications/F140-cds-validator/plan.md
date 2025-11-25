# F140: CDS Validator CLI

## Aim
CLI in `modules/cli-cds-validator` that validates CDS payload files (curbs/events/metrics) for a given spec version. Source OpenAPI definitions come from `openmobilityfoundation/cds-openapi` (or the mirrored Stoplight export), since the narrative `curb-data-specification` repo does not ship JSON Schemas directly.

## Validation Layers
- Schemas: Pin CDS OpenAPI (likely 1.1) from `openmobilityfoundation/cds-openapi`; generate JSON Schemas per API and cache them in repo.
- Structural validation: Use AJV with formats, strict mode off only where spec requires (e.g., defaults), report JSON Pointer paths.
- Profile rules: Add use-case profiles (e.g., curb occupancy, parking transactions, micromobility) that mark “optional” fields as required per profile; failure messages name the profile.
- Cross-field checks: Lightweight logic rules (time ordering, enum coherence, coordinate bounds) implemented as AJV custom keywords so one payload proves it is internally coherent.

## Scope Boundaries
- Validator only inspects the payload(s) supplied via file/STDIN. It does **not** call live CDS endpoints, reconcile against remote databases, or ensure referential consistency with already-published objects.
- The CLI’s job is to keep clients from emitting malformed/self-contradictory JSON. Hosted CDS APIs remain responsible for enforcing business rules that require knowledge of their own state.

## Fixtures Strategy
- Prefer real CDS samples if any city/pilot published (need to search OMF, city open data portals).
- If none, craft hand-authored realistic fixtures per profile; avoid random generation so errors stay meaningful.
- Store fixtures under `modules/cli-cds-validator/fixtures/<profile>/<valid|invalid>/`.

## Open Questions
- Which CDS version(s) must we support at launch (1.0 vs 1.1)? Allow `--spec-version` flag?
- Priority profiles: which use cases matter first? (parking occupancy, citations, mobility hubs?)
- Input shape: single JSON file vs NDJSON stream; max file size expectations?
- How to report: JSON output only vs human-readable summary?

## Tasks
- Task 1 (task1.md): Capture CDS source inputs and freeze schemas for validation.
- Task 2 (task2.md): Define profiles and rule tables for “optional-but-required” fields.
- Task 3 (task3.md): Assemble fixtures (real if available, handcrafted if not) per profile.
- Task 4 (task4.md): Shape CLI UX, flags, outputs, and validation engine boundaries.
- Task 5 (task5.md): Write TAP test plan covering schema, profile, and cross-field rules.
