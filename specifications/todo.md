## Bugs

- When saving LookupTables to Firestore maps, there has to be an `order` field to reconstitute the order on fromFirestore
- Read Blockfaces at startup from Firestore
  - Is "load-all at startup" a viable way to use Firestore?
  - Real-time sync (onSnapshot)
  - add listeners for remote changes
- Add toast for results of post (success and failure)
- Add toast in @execute-command rather than alert

## Ideas

- Refactor so that each Action has `flags` that control how  submitActionRequest works
- Too many errors when `post` fails
- No logs on server when tenant failure happens
- to/fromFirestore
    - Timestamps: *always* recursively call toDate on object read rather than fromFirestore (is there a parallel for toFirestore?)
    - Handling embedded LookupTable timestamps is very finicky; too easy to have *objects* in parent and not LookupTable

- 
## Firestore

- How do manage the `namespace` of a server? Maybe by startup time? Or just not at all?

## Requirements

- How we manage a user who has no organization? (By creating an organization presumably, but then who pays for it)
- Invitation has to include adding user <=> organization

## Channels
- what else should go in layoutChannel besides the title?
- 
## Out of Scope
- **Deferred**: UI should check `Action.mayI()` before showing save-triggering actions to viewers


