* It seems like Auth users *don't* always have the same UID as our userId
  * Even handleOrganizationCreated.syncUserAuthClaims is not working, but that's because of this, I think
  * Create an "auth wrapper" similar to fsContext that manages that we get all these things right in one place
* Only handleOrganizationCreated has handleOrganizationCreated.syncUserAuthClaims defined; the other functions are
  still trying to define it inline -- and they pass user not userId
* It's NOT possible to search for members.<user-id>.removedAt == null without *expressly* setting removedAt to null; we
  should do this

## Bugs

- When saving LookupTables to Firestore maps, there has to be an `order` field to reconstitute the order on fromFirestore
- Read Blockfaces at startup from Firestore
- Add toast for results of post (success and failure) 

## Ideas

- Refactor so that each Action has `flags` that control how  submitActionRequest works
- Too many errors when `post` fails 
- No logs on server when tenant failure happens

to/fromFirestore
- Timestamps: *always* recursively call toDate on object read rather than fromFirestore (is there a parallel for toFirestore?)
- Handling embedded LookupTable timestamps is very finicky; too easy to have *objects* in parent and not LookupTable

## Out of Scope
- Real-time sync (onSnapshot) - defer to separate feature
- Conflict resolution - single user per blockface assumed
- Scaling for thousands of blockfaces - optimize when needed
- Per-action event sourcing for segments - snapshot-based only
- **Deferred**: UI should check `Action.mayI()` before showing save-triggering actions to viewers
