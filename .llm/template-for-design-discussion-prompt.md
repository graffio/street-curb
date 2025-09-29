Produce an ADR for the change described below. Keep to 1–2 pages and cite the prompt entry that triggered it.

- Trigger: reference the prompt entry or roadmap item that led to this ADR.
- Title: {{SHORT_TITLE}}
- Status: Proposed
- Context: {{PROBLEM}}, constraints: {{CONSTRAINTS}}, prior decisions: {{LINKS_TO_RELEVANT_ADRS}}
- Options considered: {{2–4 OPTIONS WITH PROS/CONS}}
- Decision: {{CHOSEN_OPTION}} with rationale aligned to `.llm/context-for-llm.md` guidance and A001 rules.
- Consequences: {{POSITIVE}}, {{NEGATIVE/RISKS}}, migration steps
- Test strategy: {{UNIT/CONTRACT/E2E IMPACT}} (include TAP updates or property tests needed)
- Observability: {{METRICS/LOGS/ALERTS}} (note transcripts, monitoring hooks, or follow-up checks)
- Rollback: {{HOW_TO_BACK_OUT OR FEATURE-FLAG}}

Before finalizing, run targeted TAP suites and note the commands inside the ADR.
